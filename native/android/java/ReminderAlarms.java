package com.mohamewael66sorganization.owwab;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;
import android.util.Log;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Calendar;

/**
 * The user's own reminders shown as an alarm (قيام الليل, ورد القرآن, ...). Each reminder is
 * a JSON object: { id, title, body, hour, minute, days: [1..7 Calendar.DAY_OF_WEEK, empty =
 * every day], sound: "raw:<name>" | "system" | "urls:<url>|<url>" }.
 *
 * They ride the adhan pipeline: AzanReceiver gets the alarm and starts AzanService, which
 * plays the sound in a loop and opens MainActivity over the lock screen with
 * prayerName = "reminder:<id>" so the JS side shows the reminder screen, not the adhan.
 * Recitations are downloaded once when scheduled, so they play offline at 3 AM.
 */
final class ReminderAlarms {
    private static final String TAG = "ReminderAlarms";
    static final String KEY = "reminder_schedule";
    static final String EXTRA = "reminderJson";
    static final String PREFIX = "reminder:";

    private ReminderAlarms() {}

    static PendingIntent pendingIntent(Context context, JSONObject r, boolean snooze) {
        Intent intent = new Intent(context, AzanReceiver.class);
        intent.putExtra(EXTRA, r.toString());
        intent.putExtra("snooze", snooze);
        String code = PREFIX + r.optString("id") + (snooze ? ":snooze" : "");
        return PendingIntent.getBroadcast(context, code.hashCode(), intent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    }

    /** Next time at hour:minute on one of the given weekdays (any day when empty), after `after`. */
    static long nextTrigger(JSONObject r, long after) {
        JSONArray days = r.optJSONArray("days");
        Calendar cal = Calendar.getInstance();
        cal.setTimeInMillis(after);
        cal.set(Calendar.HOUR_OF_DAY, r.optInt("hour"));
        cal.set(Calendar.MINUTE, r.optInt("minute"));
        cal.set(Calendar.SECOND, 0);
        cal.set(Calendar.MILLISECOND, 0);
        for (int i = 0; i < 8; i++) {
            if (cal.getTimeInMillis() > after && onDay(days, cal.get(Calendar.DAY_OF_WEEK))) return cal.getTimeInMillis();
            cal.add(Calendar.DAY_OF_YEAR, 1);
        }
        return cal.getTimeInMillis();
    }

    private static boolean onDay(JSONArray days, int day) {
        if (days == null || days.length() == 0) return true;
        for (int i = 0; i < days.length(); i++) if (days.optInt(i) == day) return true;
        return false;
    }

    static boolean arm(Context context, JSONObject r, long at, boolean snooze) {
        AlarmManager am = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        if (am == null) return false;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S && !am.canScheduleExactAlarms()) return false;
        PendingIntent pi = pendingIntent(context, r, snooze);
        PendingIntent show = PendingIntent.getActivity(context, 0, new Intent(context, MainActivity.class),
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        // setAlarmClock: shown as the next alarm and never deferred by Doze, like a clock app
        am.setAlarmClock(new AlarmManager.AlarmClockInfo(at, show), pi);
        return true;
    }

    static void schedule(Context context, JSONObject r) {
        if (!arm(context, r, nextTrigger(r, System.currentTimeMillis()), false)) {
            Log.w(TAG, "Exact alarm permission missing; reminder " + r.optString("id") + " not armed");
        }
        save(context, r);
        prefetchAudio(context, r.optString("sound"));
    }

    static void snooze(Context context, JSONObject r, int minutes) {
        arm(context, r, System.currentTimeMillis() + minutes * 60_000L, true);
    }

    static void cancelAll(Context context) {
        AlarmManager am = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        JSONArray all = load(context);
        for (int i = 0; i < all.length(); i++) {
            JSONObject r = all.optJSONObject(i);
            if (r == null || am == null) continue;
            for (boolean snooze : new boolean[]{false, true}) {
                PendingIntent pi = pendingIntent(context, r, snooze);
                am.cancel(pi);
                pi.cancel();
            }
        }
        prefs(context).edit().putString(KEY, "[]").apply();
    }

    /** After a reboot, a time change or an alarm firing: arm every saved reminder again. */
    static void rearmAll(Context context) {
        JSONArray all = load(context);
        long now = System.currentTimeMillis();
        for (int i = 0; i < all.length(); i++) {
            JSONObject r = all.optJSONObject(i);
            if (r != null) arm(context, r, nextTrigger(r, now), false);
        }
    }

    static void rearm(Context context, JSONObject r) {
        arm(context, r, nextTrigger(r, System.currentTimeMillis() + 60_000L), false);
    }

    // ── persistence ──

    private static SharedPreferences prefs(Context context) {
        return context.getSharedPreferences(AzanModule.PREFS_NAME, Context.MODE_PRIVATE);
    }

    private static JSONArray load(Context context) {
        try { return new JSONArray(prefs(context).getString(KEY, "[]")); }
        catch (JSONException e) { return new JSONArray(); }
    }

    private static void save(Context context, JSONObject r) {
        JSONArray all = load(context), next = new JSONArray();
        for (int i = 0; i < all.length(); i++) {
            JSONObject o = all.optJSONObject(i);
            if (o != null && !o.optString("id").equals(r.optString("id"))) next.put(o);
        }
        next.put(r);
        prefs(context).edit().putString(KEY, next.toString()).apply();
    }

    // ── audio ──

    /** Where a downloaded recitation lives; the name is derived from the URL. */
    static File cached(Context context, String url) {
        File dir = new File(context.getFilesDir(), "reminder_audio");
        //noinspection ResultOfMethodCallIgnored
        dir.mkdirs();
        return new File(dir, Integer.toHexString(url.hashCode()) + ".mp3");
    }

    private static void prefetchAudio(final Context context, String sound) {
        if (sound == null || !sound.startsWith("urls:")) return;
        final String[] urls = sound.substring(5).split("\\|");
        new Thread(() -> {
            for (String u : urls) {
                File f = cached(context, u);
                if (f.exists() && f.length() > 0) continue;
                File tmp = new File(f.getPath() + ".part");
                try {
                    HttpURLConnection c = (HttpURLConnection) new URL(u).openConnection();
                    c.setConnectTimeout(15000);
                    c.setReadTimeout(30000);
                    try (InputStream in = c.getInputStream(); FileOutputStream out = new FileOutputStream(tmp)) {
                        byte[] buf = new byte[16384];
                        int n;
                        while ((n = in.read(buf)) > 0) out.write(buf, 0, n);
                    }
                    //noinspection ResultOfMethodCallIgnored
                    tmp.renameTo(f);
                } catch (Exception e) {
                    Log.w(TAG, "Could not download " + u, e);
                    //noinspection ResultOfMethodCallIgnored
                    tmp.delete();
                }
            }
        }, "reminder-audio").start();
    }
}
