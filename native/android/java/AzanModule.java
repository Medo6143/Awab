package com.mohamewael66sorganization.owwab;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.net.Uri;
import android.os.Build;
import android.provider.Settings;
import android.util.Log;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.Calendar;

public class AzanModule extends ReactContextBaseJavaModule {
    private static final String TAG = "AzanModule";
    static final String PREFS_NAME = "azan_prefs";
    static final String SCHEDULE_KEY = "azan_schedule";
    private static String pendingPrayerName = null;

    public AzanModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "AzanModule";
    }

    /**
     * Single source of truth for the alarm PendingIntent. AzanReceiver and BootReceiver
     * build the identical intent so cancel()/re-arm always hit the same alarm.
     */
    static PendingIntent buildAzanPendingIntent(Context context, String prayerId, String prayerName,
                                                String type, int hour, int minute) {
        Intent intent = new Intent(context, AzanReceiver.class);
        intent.putExtra("prayerId", prayerId);
        intent.putExtra("prayerName", prayerName);
        intent.putExtra("type", type);
        intent.putExtra("hour", hour);
        intent.putExtra("minute", minute);
        return PendingIntent.getBroadcast(
                context,
                prayerId.hashCode(),
                intent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
    }

    @ReactMethod
    public void scheduleAzan(String prayerId, String prayerName, int hour, int minute, String type, Promise promise) {
        Context context = getReactApplicationContext();
        AlarmManager alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);

        // API 31+ Guard: Cannot schedule exact alarms without permission
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            if (!alarmManager.canScheduleExactAlarms()) {
                promise.reject("PERMISSION_DENIED", "Exact alarm permission missing.");
                return;
            }
        }

        PendingIntent pendingIntent = buildAzanPendingIntent(context, prayerId, prayerName, type, hour, minute);

        Calendar calendar = Calendar.getInstance();
        calendar.set(Calendar.HOUR_OF_DAY, hour);
        calendar.set(Calendar.MINUTE, minute);
        calendar.set(Calendar.SECOND, 0);
        calendar.set(Calendar.MILLISECOND, 0);

        // If the time has already passed today, schedule for tomorrow
        if (calendar.getTimeInMillis() <= System.currentTimeMillis()) {
            calendar.add(Calendar.DAY_OF_YEAR, 1);
        }

        long triggerTime = calendar.getTimeInMillis();

        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                alarmManager.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, triggerTime, pendingIntent);
            } else {
                alarmManager.setExact(AlarmManager.RTC_WAKEUP, triggerTime, pendingIntent);
            }
        } catch (SecurityException e) {
            promise.reject("PERMISSION_DENIED", "Exact alarm permission missing.", e);
            return;
        }

        // Save to SharedPreferences so BootReceiver can revive it
        saveToPrefs(context, prayerId, prayerName, type, triggerTime, hour, minute);

        Log.d(TAG, "Scheduled Azan for " + prayerName + " at " + triggerTime);
        promise.resolve(true);
    }

    @ReactMethod
    public void cancelAzan(String prayerId) {
        Context context = getReactApplicationContext();
        AlarmManager alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);

        // Extras don't take part in PendingIntent equality, only requestCode + component.
        PendingIntent pendingIntent = buildAzanPendingIntent(context, prayerId, "", "", 0, 0);
        alarmManager.cancel(pendingIntent);
        pendingIntent.cancel();
        removeFromPrefs(prayerId);
        Log.d(TAG, "Cancelled Azan for " + prayerId);
    }

    // ──────────────────────────────────────────────────────────────
    // Persistence (for BootReceiver / AzanReceiver re-arm)
    // ──────────────────────────────────────────────────────────────

    static void saveToPrefs(Context context, String id, String name, String type, long triggerTime, int hour, int minute) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        String jsonStr = prefs.getString(SCHEDULE_KEY, "[]");
        try {
            JSONArray array = new JSONArray(jsonStr);
            JSONArray newArray = new JSONArray();
            for (int i = 0; i < array.length(); i++) {
                JSONObject obj = array.getJSONObject(i);
                if (!obj.getString("id").equals(id)) {
                    newArray.put(obj);
                }
            }

            JSONObject newObj = new JSONObject();
            newObj.put("id", id);
            newObj.put("name", name);
            newObj.put("type", type);
            newObj.put("time", triggerTime);
            newObj.put("hour", hour);
            newObj.put("minute", minute);
            newArray.put(newObj);

            prefs.edit().putString(SCHEDULE_KEY, newArray.toString()).apply();
        } catch (JSONException e) {
            Log.e(TAG, "Failed to parse schedule JSON", e);
        }
    }

    private void removeFromPrefs(String id) {
        SharedPreferences prefs = getReactApplicationContext().getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        String jsonStr = prefs.getString(SCHEDULE_KEY, "[]");
        try {
            JSONArray array = new JSONArray(jsonStr);
            JSONArray newArray = new JSONArray();
            for (int i = 0; i < array.length(); i++) {
                JSONObject obj = array.getJSONObject(i);
                if (!obj.getString("id").equals(id)) {
                    newArray.put(obj);
                }
            }
            prefs.edit().putString(SCHEDULE_KEY, newArray.toString()).apply();
        } catch (JSONException e) {
            Log.e(TAG, "Failed to parse schedule JSON", e);
        }
    }

    // ──────────────────────────────────────────────────────────────
    // Permissions & Utilities
    // ──────────────────────────────────────────────────────────────

    @ReactMethod
    public void canScheduleExactAlarms(Promise promise) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            AlarmManager alarmManager = (AlarmManager) getReactApplicationContext().getSystemService(Context.ALARM_SERVICE);
            promise.resolve(alarmManager.canScheduleExactAlarms());
        } else {
            promise.resolve(true);
        }
    }

    @ReactMethod
    public void openAlarmSettings() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            Intent intent = new Intent(Settings.ACTION_REQUEST_SCHEDULE_EXACT_ALARM);
            intent.setData(Uri.parse("package:" + getReactApplicationContext().getPackageName()));
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            getReactApplicationContext().startActivity(intent);
        }
    }

    /** Android 14+: full-screen intents must be granted by the user for non-alarm apps. */
    @ReactMethod
    public void canUseFullScreenIntent(Promise promise) {
        if (Build.VERSION.SDK_INT >= 34) {
            android.app.NotificationManager nm = (android.app.NotificationManager)
                    getReactApplicationContext().getSystemService(Context.NOTIFICATION_SERVICE);
            promise.resolve(nm != null && nm.canUseFullScreenIntent());
        } else {
            promise.resolve(true);
        }
    }

    @ReactMethod
    public void openFullScreenIntentSettings() {
        if (Build.VERSION.SDK_INT >= 34) {
            Intent intent = new Intent(Settings.ACTION_MANAGE_APP_USE_FULL_SCREEN_INTENT);
            intent.setData(Uri.parse("package:" + getReactApplicationContext().getPackageName()));
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            getReactApplicationContext().startActivity(intent);
        }
    }

    @ReactMethod
    public void checkOverlayPermission(Promise promise) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            promise.resolve(Settings.canDrawOverlays(getReactApplicationContext()));
        } else {
            promise.resolve(true);
        }
    }

    @ReactMethod
    public void requestOverlayPermission() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            Intent intent = new Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                    Uri.parse("package:" + getReactApplicationContext().getPackageName()));
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            getReactApplicationContext().startActivity(intent);
        }
    }

    @ReactMethod
    public void getAzanPositionMs(Promise promise) {
        promise.resolve(AzanService.currentPositionMs());
    }

    /**
     * The activity shows over the lock screen and wakes the screen only while an adhan is
     * on screen (MainActivity sets this for the adhan intent). Called when the azan screen
     * closes, so the app is not usable over the lock screen afterwards.
     */
    @ReactMethod
    public void releaseLockScreen() {
        final android.app.Activity activity = getCurrentActivity();
        if (activity == null) return;
        activity.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
                    activity.setShowWhenLocked(false);
                    activity.setTurnScreenOn(false);
                } else {
                    activity.getWindow().clearFlags(android.view.WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED
                            | android.view.WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON
                            | android.view.WindowManager.LayoutParams.FLAG_DISMISS_KEYGUARD);
                }
                activity.getWindow().clearFlags(android.view.WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
            }
        });
    }

    /** Stops the adhan the alarm service is playing, from the in-app azan screen. */
    @ReactMethod
    public void stopAzan() {
        if (!AzanService.isRunning()) return;
        Context context = getReactApplicationContext();
        Intent intent = new Intent(context, AzanService.class);
        intent.setAction(AzanService.ACTION_STOP);
        context.startService(intent);
    }

    @ReactMethod
    public void getPendingAzan(Promise promise) {
        promise.resolve(pendingPrayerName);
        pendingPrayerName = null;
    }

    public static void setPendingAzan(String prayerName) {
        pendingPrayerName = prayerName;
    }

    /** Returns the persisted schedule so JS can show "next adhan armed at …" diagnostics. */
    @ReactMethod
    public void getScheduledAzans(Promise promise) {
        SharedPreferences prefs = getReactApplicationContext().getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        promise.resolve(prefs.getString(SCHEDULE_KEY, "[]"));
    }

    @ReactMethod
    public void testAzan(int delaySeconds, Promise promise) {
        Context context = getReactApplicationContext();
        AlarmManager alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S && !alarmManager.canScheduleExactAlarms()) {
            promise.reject("PERMISSION_DENIED", "Exact alarm permission missing.");
            return;
        }

        Intent intent = new Intent(context, AzanReceiver.class);
        intent.putExtra("prayerId", "test");
        intent.putExtra("prayerName", "التجربة");
        intent.putExtra("type", "full");

        PendingIntent pendingIntent = PendingIntent.getBroadcast(
                context,
                9999,
                intent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        long triggerAtMillis = System.currentTimeMillis() + (delaySeconds * 1000L);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            alarmManager.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, triggerAtMillis, pendingIntent);
        } else {
            alarmManager.setExact(AlarmManager.RTC_WAKEUP, triggerAtMillis, pendingIntent);
        }

        Log.d(TAG, "Scheduled test in " + delaySeconds + "s");
        promise.resolve(true);
    }

    @ReactMethod
    public void didBootRescheduleFail(Promise promise) {
        SharedPreferences prefs = getReactApplicationContext().getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        promise.resolve(prefs.getBoolean("boot_reschedule_failed", false));
    }

    @ReactMethod
    public void clearBootRescheduleFailedFlag() {
        SharedPreferences prefs = getReactApplicationContext().getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        prefs.edit().putBoolean("boot_reschedule_failed", false).apply();
    }

    @ReactMethod
    public void addListener(String eventName) {}

    @ReactMethod
    public void removeListeners(Integer count) {}
}
