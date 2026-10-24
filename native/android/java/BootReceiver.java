package com.mohamewael66sorganization.owwab;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;
import android.util.Log;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.Calendar;

public class BootReceiver extends BroadcastReceiver {
    private static final String TAG = "BootReceiver";

    @Override
    public void onReceive(Context context, Intent intent) {
        String action = intent.getAction();
        Log.d(TAG, "Boot event received: " + action);

        if (Intent.ACTION_BOOT_COMPLETED.equals(action) ||
            "android.intent.action.QUICKBOOT_POWERON".equals(action) ||
            "com.htc.intent.action.QUICKBOOT_POWERON".equals(action) ||
            Intent.ACTION_MY_PACKAGE_REPLACED.equals(action) ||
            Intent.ACTION_TIME_CHANGED.equals(action) ||
            Intent.ACTION_TIMEZONE_CHANGED.equals(action)) {

            rescheduleAzans(context);
        }
    }

    private void rescheduleAzans(Context context) {
        SharedPreferences prefs = context.getSharedPreferences(AzanModule.PREFS_NAME, Context.MODE_PRIVATE);
        String jsonStr = prefs.getString(AzanModule.SCHEDULE_KEY, "[]");

        AlarmManager alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        if (alarmManager == null) return;

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S && !alarmManager.canScheduleExactAlarms()) {
            Log.e(TAG, "Missing exact alarm permission after boot. Cannot reschedule.");
            prefs.edit().putBoolean("boot_reschedule_failed", true).apply();
            return;
        }

        try {
            JSONArray array = new JSONArray(jsonStr);
            long now = System.currentTimeMillis();
            int count = 0;

            for (int i = 0; i < array.length(); i++) {
                JSONObject obj = array.getJSONObject(i);
                String id   = obj.getString("id");
                String name = obj.getString("name");
                String type = obj.getString("type");
                long triggerTime = obj.getLong("time");
                int hour   = obj.optInt("hour", -1);
                int minute = obj.optInt("minute", -1);

                // If the saved slot already passed while the phone was off, roll forward to the
                // next occurrence of the same wall-clock time instead of dropping the prayer.
                if (triggerTime <= now && hour >= 0 && minute >= 0) {
                    Calendar cal = Calendar.getInstance();
                    cal.set(Calendar.HOUR_OF_DAY, hour);
                    cal.set(Calendar.MINUTE, minute);
                    cal.set(Calendar.SECOND, 0);
                    cal.set(Calendar.MILLISECOND, 0);
                    while (cal.getTimeInMillis() <= now) cal.add(Calendar.DAY_OF_YEAR, 1);
                    triggerTime = cal.getTimeInMillis();
                }
                if (triggerTime <= now) continue;

                PendingIntent pendingIntent = AzanModule.buildAzanPendingIntent(context, id, name, type, hour, minute);
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                    alarmManager.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, triggerTime, pendingIntent);
                } else {
                    alarmManager.setExact(AlarmManager.RTC_WAKEUP, triggerTime, pendingIntent);
                }
                AzanModule.saveToPrefs(context, id, name, type, triggerTime, hour, minute);
                count++;
            }

            Log.d(TAG, "Successfully rescheduled " + count + " prayers after boot.");
            prefs.edit().putBoolean("boot_reschedule_failed", false).apply();

        } catch (JSONException e) {
            Log.e(TAG, "Failed to parse saved schedule json", e);
        }
    }
}
