package com.mohamewael66sorganization.owwab;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.util.Log;

import java.util.Calendar;

public class AzanReceiver extends BroadcastReceiver {
    private static final String TAG = "AzanReceiver";

    @Override
    public void onReceive(Context context, Intent intent) {
        String reminder = intent.getStringExtra(ReminderAlarms.EXTRA);
        if (reminder != null) {
            onReminder(context, reminder, intent.getBooleanExtra("snooze", false));
            return;
        }
        String prayerId   = intent.getStringExtra("prayerId");
        String prayerName = intent.getStringExtra("prayerName");
        String type       = intent.getStringExtra("type");
        Log.d(TAG, "Azan alarm received for: " + prayerName);

        Intent serviceIntent = new Intent(context, AzanService.class);
        serviceIntent.putExtra("prayerName", prayerName);
        serviceIntent.putExtra("type", type);

        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                context.startForegroundService(serviceIntent);
            } else {
                context.startService(serviceIntent);
            }
        } catch (Exception e) {
            Log.e(TAG, "Failed to start AzanService", e);
        }

        // Exact alarms are one-shot. Re-arm the same prayer for tomorrow so the adhan keeps
        // working even if the user never re-opens the app. The JS side re-schedules with the
        // exact next-day timing whenever the app is opened, which corrects the ~1 min drift.
        rearmForTomorrow(context, intent, prayerId, prayerName, type);
    }

    /** A user reminder: same service as the adhan, with the reminder's sound and screen. */
    private void onReminder(Context context, String json, boolean snooze) {
        Intent serviceIntent = new Intent(context, AzanService.class);
        serviceIntent.putExtra(ReminderAlarms.EXTRA, json);
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) context.startForegroundService(serviceIntent);
            else context.startService(serviceIntent);
        } catch (Exception e) {
            Log.e(TAG, "Failed to start reminder", e);
        }
        if (snooze) return; // the repeating alarm is still armed for its next day
        try {
            ReminderAlarms.rearm(context, new org.json.JSONObject(json));
        } catch (org.json.JSONException e) {
            Log.e(TAG, "Bad reminder json", e);
        }
    }

    private void rearmForTomorrow(Context context, Intent original, String prayerId, String prayerName, String type) {
        if (prayerId == null || "test".equals(prayerId)) return;
        int hour   = original.getIntExtra("hour", -1);
        int minute = original.getIntExtra("minute", -1);
        if (hour < 0 || minute < 0) return;

        AlarmManager alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        if (alarmManager == null) return;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S && !alarmManager.canScheduleExactAlarms()) {
            Log.w(TAG, "Cannot re-arm " + prayerId + ": exact alarm permission missing");
            return;
        }

        Calendar cal = Calendar.getInstance();
        cal.set(Calendar.HOUR_OF_DAY, hour);
        cal.set(Calendar.MINUTE, minute);
        cal.set(Calendar.SECOND, 0);
        cal.set(Calendar.MILLISECOND, 0);
        cal.add(Calendar.DAY_OF_YEAR, 1);
        long triggerTime = cal.getTimeInMillis();

        PendingIntent pendingIntent = AzanModule.buildAzanPendingIntent(context, prayerId, prayerName, type, hour, minute);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            alarmManager.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, triggerTime, pendingIntent);
        } else {
            alarmManager.setExact(AlarmManager.RTC_WAKEUP, triggerTime, pendingIntent);
        }
        AzanModule.saveToPrefs(context, prayerId, prayerName, type, triggerTime, hour, minute);
        Log.d(TAG, "Re-armed " + prayerId + " for tomorrow at " + hour + ":" + minute);
    }
}
