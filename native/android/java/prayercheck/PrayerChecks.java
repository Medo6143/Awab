package com.mohamewael66sorganization.owwab.prayercheck;

import android.app.AlarmManager;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.SharedPreferences;
import android.os.Build;
import android.os.Handler;
import android.os.Looper;
import android.service.notification.StatusBarNotification;
import android.util.Log;

import androidx.core.app.NotificationCompat;
import androidx.core.content.ContextCompat;

import com.mohamewael66sorganization.owwab.R;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.Arrays;
import java.util.Calendar;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

/**
 * «صليت؟» after each adhan: the alarms, the notification and the answers, shared by the
 * module (JS calls) and the receiver (alarms and buttons, also while the app is closed).
 *
 * Timing does not need to be exact, so these are inexact alarms (setAndAllowWhileIdle) and do
 * not depend on the exact-alarm permission. Each question re-arms itself for the next day when
 * it fires; the app replaces them with fresh times whenever it reschedules.
 */
public final class PrayerChecks {
    private static final String TAG = "PrayerChecks";
    private static final String PREFS = "owwab_prayer_check";
    private static final String KEY_ITEMS = "items";
    private static final String KEY_DONE_DAY = "done_day";
    private static final String KEY_DONE_IDS = "done_ids";
    private static final String KEY_ANSWERS = "answers";
    private static final String KEY_LOOK = "look";
    /** The question that went to the notification because the phone was locked: {prayerId, followUp, at}. */
    private static final String KEY_WAITING = "waiting";
    /** A waiting question older than this is dropped rather than shown on unlock. */
    private static final long WAITING_MAX_MS = 3 * 60 * 60_000L;

    static final String ACTION_FIRE = "owwab.prayercheck.FIRE";
    static final String ACTION_FOLLOW_UP = "owwab.prayercheck.FOLLOW_UP";
    static final String ACTION_PRAYED = "owwab.prayercheck.PRAYED";
    static final String ACTION_LATER = "owwab.prayercheck.LATER";
    static final String EXTRA_PRAYER = "prayerId";

    private static final String CHANNEL = "prayer_check";
    private static final List<String> PRAYERS = Arrays.asList("Fajr", "Dhuhr", "Asr", "Maghrib", "Isha");
    private static final int BASE_FIRE = 7300, BASE_FOLLOW_UP = 7310, BASE_PRAYED = 7320, BASE_LATER = 7330, BASE_NOTIFICATION = 7340;

    private PrayerChecks() {}

    private static SharedPreferences prefs(Context c) {
        return c.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
    }

    /** The app's theme setting for the card: "light", "dark" or "system". */
    static void setLook(Context c, String mode) {
        prefs(c).edit().putString(KEY_LOOK, mode).apply();
    }

    static String look(Context c) {
        return prefs(c).getString(KEY_LOOK, "dark");
    }

    static String today() {
        Calendar c = Calendar.getInstance();
        return String.format(Locale.US, "%04d-%02d-%02d", c.get(Calendar.YEAR), c.get(Calendar.MONTH) + 1, c.get(Calendar.DAY_OF_MONTH));
    }

    // ── items ────────────────────────────────────────────────────────────────

    /** Replaces the armed questions with `items` (JSON array from JS). */
    static void schedule(Context c, JSONArray items) throws JSONException {
        cancelAll(c);
        prefs(c).edit().putString(KEY_ITEMS, items.toString()).apply();
        for (int i = 0; i < items.length(); i++) {
            JSONObject item = items.getJSONObject(i);
            arm(c, item.getString("prayerId"), nextOccurrence(item.getInt("hour"), item.getInt("minute"), false));
        }
    }

    /**
     * Stops every question and follow-up. A question already on screen stays: the app
     * reschedules (cancel, then schedule) whenever its settings or the day's times change,
     * and that must not wipe the notification the user is about to answer.
     */
    static void cancelAll(Context c) {
        AlarmManager am = (AlarmManager) c.getSystemService(Context.ALARM_SERVICE);
        for (String id : PRAYERS) {
            if (am != null) {
                am.cancel(alarmIntent(c, id, false));
                am.cancel(alarmIntent(c, id, true));
            }
        }
        prefs(c).edit().remove(KEY_ITEMS).apply();
    }

    static JSONObject find(Context c, String prayerId) {
        try {
            JSONArray items = new JSONArray(prefs(c).getString(KEY_ITEMS, "[]"));
            for (int i = 0; i < items.length(); i++) {
                JSONObject item = items.getJSONObject(i);
                if (prayerId.equals(item.optString("prayerId"))) return item;
            }
        } catch (JSONException e) {
            Log.e(TAG, "Bad items", e);
        }
        return null;
    }

    // ── alarms ───────────────────────────────────────────────────────────────

    private static long nextOccurrence(int hour, int minute, boolean tomorrow) {
        Calendar cal = Calendar.getInstance();
        cal.set(Calendar.HOUR_OF_DAY, hour);
        cal.set(Calendar.MINUTE, minute);
        cal.set(Calendar.SECOND, 0);
        cal.set(Calendar.MILLISECOND, 0);
        if (tomorrow || cal.getTimeInMillis() <= System.currentTimeMillis()) cal.add(Calendar.DAY_OF_YEAR, 1);
        return cal.getTimeInMillis();
    }

    /** The same question tomorrow, so it keeps working if the app is not opened. */
    static void armTomorrow(Context c, JSONObject item) {
        arm(c, item.optString("prayerId"), nextOccurrence(item.optInt("hour"), item.optInt("minute"), true));
    }

    /** «لسه»: the question once more, a few minutes from now. */
    static void armFollowUp(Context c, JSONObject item) {
        long at = System.currentTimeMillis() + item.optInt("followUpMinutes", 15) * 60_000L;
        set(c, at, alarmIntent(c, item.optString("prayerId"), true));
    }

    static void cancelFollowUp(Context c, String prayerId) {
        AlarmManager am = (AlarmManager) c.getSystemService(Context.ALARM_SERVICE);
        if (am != null) am.cancel(alarmIntent(c, prayerId, true));
    }

    private static void arm(Context c, String prayerId, long at) {
        set(c, at, alarmIntent(c, prayerId, false));
    }

    private static void set(Context c, long at, PendingIntent pi) {
        AlarmManager am = (AlarmManager) c.getSystemService(Context.ALARM_SERVICE);
        if (am == null) return;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) am.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, at, pi);
        else am.set(AlarmManager.RTC_WAKEUP, at, pi);
    }

    private static PendingIntent alarmIntent(Context c, String prayerId, boolean followUp) {
        Intent intent = new Intent(c, PrayerCheckReceiver.class)
                .setAction(followUp ? ACTION_FOLLOW_UP : ACTION_FIRE)
                .putExtra(EXTRA_PRAYER, prayerId);
        int code = (followUp ? BASE_FOLLOW_UP : BASE_FIRE) + PRAYERS.indexOf(prayerId);
        return PendingIntent.getBroadcast(c, code, intent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    }

    // ── done today / answers ─────────────────────────────────────────────────

    static void setDoneToday(Context c, Set<String> prayerIds) {
        prefs(c).edit().putString(KEY_DONE_DAY, today()).putString(KEY_DONE_IDS, String.join(",", prayerIds)).apply();
    }

    static boolean isDoneToday(Context c, String prayerId) {
        SharedPreferences p = prefs(c);
        if (!today().equals(p.getString(KEY_DONE_DAY, ""))) return false;
        return new HashSet<>(Arrays.asList(p.getString(KEY_DONE_IDS, "").split(","))).contains(prayerId);
    }

    /** «صليت» on the notification: kept until the app reads it, and the prayer counts as done. */
    static void recordPrayed(Context c, String prayerId) {
        SharedPreferences p = prefs(c);
        String day = today();
        try {
            JSONArray answers = new JSONArray(p.getString(KEY_ANSWERS, "[]"));
            boolean seen = false;
            for (int i = 0; i < answers.length(); i++) {
                JSONObject a = answers.getJSONObject(i);
                if (prayerId.equals(a.optString("prayerId")) && day.equals(a.optString("day"))) seen = true;
            }
            if (!seen) answers.put(new JSONObject().put("prayerId", prayerId).put("day", day));
            p.edit().putString(KEY_ANSWERS, answers.toString()).apply();
        } catch (JSONException e) {
            Log.e(TAG, "Bad answers", e);
        }
        Set<String> done = new HashSet<>();
        if (day.equals(p.getString(KEY_DONE_DAY, ""))) done.addAll(Arrays.asList(p.getString(KEY_DONE_IDS, "").split(",")));
        done.remove("");
        done.add(prayerId);
        setDoneToday(c, done);
    }

    /** The answers so far, then cleared: each is returned once. */
    static JSONArray takeAnswers(Context c) {
        SharedPreferences p = prefs(c);
        try {
            JSONArray answers = new JSONArray(p.getString(KEY_ANSWERS, "[]"));
            p.edit().remove(KEY_ANSWERS).apply();
            return answers;
        } catch (JSONException e) {
            p.edit().remove(KEY_ANSWERS).apply();
            return new JSONArray();
        }
    }

    // ── notification ─────────────────────────────────────────────────────────

    static int notificationId(String prayerId) {
        return BASE_NOTIFICATION + PRAYERS.indexOf(prayerId);
    }

    /**
     * Asks «صليت؟»: as a card at the top of the screen when the phone is in use and the app may
     * draw over other apps (PrayerCheckCard), else as a notification so the question still
     * reaches a locked phone.
     */
    static void post(Context c, JSONObject item, boolean followUp) {
        if (PrayerCheckCard.show(c, item, followUp)) {
            clearWaiting(c, null);
            return;
        }
        // the card waits for the phone to be unlocked (or the app opened); the notification is
        // there meanwhile, and on the lock screen
        try {
            prefs(c).edit().putString(KEY_WAITING, new JSONObject()
                    .put("prayerId", item.optString("prayerId"))
                    .put("followUp", followUp)
                    .put("at", System.currentTimeMillis()).toString()).apply();
        } catch (JSONException ignored) {}
        watchUnlock(c);
        NotificationManager nm = (NotificationManager) c.getSystemService(Context.NOTIFICATION_SERVICE);
        if (nm == null) return;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O && nm.getNotificationChannel(CHANNEL) == null) {
            NotificationChannel ch = new NotificationChannel(CHANNEL, "سؤال «صليت؟»", NotificationManager.IMPORTANCE_HIGH);
            ch.setDescription("سؤال بعد الأذان عشان تعلّم الصلاة من غير ما تفتح التطبيق");
            nm.createNotificationChannel(ch);
        }
        String prayerId = item.optString("prayerId");
        int idx = PRAYERS.indexOf(prayerId);

        Intent open = c.getPackageManager().getLaunchIntentForPackage(c.getPackageName());
        PendingIntent openPi = open == null ? null
                : PendingIntent.getActivity(c, BASE_NOTIFICATION + idx, open, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);

        NotificationCompat.Builder b = new NotificationCompat.Builder(c, CHANNEL)
                .setSmallIcon(R.drawable.notification_icon)
                .setContentTitle(item.optString(followUp ? "followUpTitle" : "title"))
                .setContentText(item.optString(followUp ? "followUpBody" : "body"))
                .setSubText(item.optString("kicker", null))
                .setPriority(NotificationCompat.PRIORITY_HIGH)
                .setCategory(NotificationCompat.CATEGORY_REMINDER)
                .setAutoCancel(true)
                .addAction(0, item.optString("prayedLabel", "صليت"), actionIntent(c, ACTION_PRAYED, BASE_PRAYED + idx, prayerId));
        if (!followUp) b.addAction(0, item.optString("laterLabel", "لسه"), actionIntent(c, ACTION_LATER, BASE_LATER + idx, prayerId));
        if (openPi != null) b.setContentIntent(openPi);

        try {
            nm.notify(notificationId(prayerId), b.build());
        } catch (SecurityException e) {
            Log.w(TAG, "Notifications not allowed", e);
        }
    }

    static void dismiss(Context c, String prayerId) {
        PrayerCheckCard.hide(prayerId);
        clearWaiting(c, prayerId);
        NotificationManager nm = (NotificationManager) c.getSystemService(Context.NOTIFICATION_SERVICE);
        if (nm != null) nm.cancel(notificationId(prayerId));
    }

    private static PendingIntent actionIntent(Context c, String action, int code, String prayerId) {
        Intent intent = new Intent(c, PrayerCheckReceiver.class).setAction(action).putExtra(EXTRA_PRAYER, prayerId);
        return PendingIntent.getBroadcast(c, code, intent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    }

    // ── the card after unlock ────────────────────────────────────────────────

    private static boolean watchingUnlock;

    /**
     * Shows the card when the phone is next unlocked. USER_PRESENT cannot be declared in the
     * manifest, so this lives as long as the app's process; opening the app covers the rest
     * (PrayerCheckModule calls showWaiting on resume).
     */
    private static synchronized void watchUnlock(Context context) {
        if (watchingUnlock) return;
        final Context app = context.getApplicationContext();
        try {
            ContextCompat.registerReceiver(app, new BroadcastReceiver() {
                @Override
                public void onReceive(Context c, Intent intent) {
                    // let the lock screen finish going away before the card slides in
                    new Handler(Looper.getMainLooper()).postDelayed(() -> showWaiting(app), 700);
                }
            }, new IntentFilter(Intent.ACTION_USER_PRESENT), ContextCompat.RECEIVER_NOT_EXPORTED);
            watchingUnlock = true;
        } catch (Exception e) {
            Log.w(TAG, "Could not watch for unlock", e);
        }
    }

    /**
     * The question that went to the notification while the phone was locked, as the card, now
     * that the user is here: unless it was answered or swiped away since, or is hours old.
     */
    static void showWaiting(Context c) {
        JSONObject waiting;
        try {
            String raw = prefs(c).getString(KEY_WAITING, null);
            if (raw == null) return;
            waiting = new JSONObject(raw);
        } catch (JSONException e) {
            clearWaiting(c, null);
            return;
        }
        String prayerId = waiting.optString("prayerId");
        boolean stale = System.currentTimeMillis() - waiting.optLong("at") > WAITING_MAX_MS;
        JSONObject item = find(c, prayerId);
        if (stale || item == null || isDoneToday(c, prayerId) || !notificationShowing(c, prayerId)) {
            clearWaiting(c, null);
            return;
        }
        if (PrayerCheckCard.show(c, item, waiting.optBoolean("followUp"))) clearWaiting(c, null);
    }

    private static boolean notificationShowing(Context c, String prayerId) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.M) return true;
        NotificationManager nm = (NotificationManager) c.getSystemService(Context.NOTIFICATION_SERVICE);
        if (nm == null) return false;
        int id = notificationId(prayerId);
        for (StatusBarNotification n : nm.getActiveNotifications()) if (n.getId() == id) return true;
        return false;
    }

    /** Forgets the waiting question (only if it is `prayerId`'s, when given). */
    private static void clearWaiting(Context c, String prayerId) {
        SharedPreferences p = prefs(c);
        String raw = p.getString(KEY_WAITING, null);
        if (raw == null) return;
        if (prayerId != null) {
            try {
                if (!prayerId.equals(new JSONObject(raw).optString("prayerId"))) return;
            } catch (JSONException ignored) {}
        }
        p.edit().remove(KEY_WAITING).apply();
    }
}
