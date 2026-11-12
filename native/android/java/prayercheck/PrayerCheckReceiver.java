package com.mohamewael66sorganization.owwab.prayercheck;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.util.Log;

import com.facebook.react.ReactApplication;
import com.facebook.react.ReactHost;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import org.json.JSONObject;

/** The question's alarm (and its follow-up) and the notification's two buttons. */
public class PrayerCheckReceiver extends BroadcastReceiver {
    private static final String TAG = "PrayerCheckReceiver";
    static final String EVENT_ANSWERED = "prayerCheckAnswered";

    @Override
    public void onReceive(Context context, Intent intent) {
        String action = intent.getAction();
        String prayerId = intent.getStringExtra(PrayerChecks.EXTRA_PRAYER);
        if (action == null || prayerId == null) return;
        JSONObject item = PrayerChecks.find(context, prayerId);

        switch (action) {
            case PrayerChecks.ACTION_FIRE:
                if (item == null) return; // cancelled since
                PrayerChecks.armTomorrow(context, item);
                if (!PrayerChecks.isDoneToday(context, prayerId)) PrayerChecks.post(context, item, false);
                break;
            case PrayerChecks.ACTION_FOLLOW_UP:
                if (item != null && !PrayerChecks.isDoneToday(context, prayerId)) PrayerChecks.post(context, item, true);
                break;
            case PrayerChecks.ACTION_PRAYED:
                PrayerChecks.recordPrayed(context, prayerId);
                PrayerChecks.dismiss(context, prayerId);
                PrayerChecks.cancelFollowUp(context, prayerId);
                notifyApp(context);
                break;
            case PrayerChecks.ACTION_LATER:
                PrayerChecks.dismiss(context, prayerId);
                if (item != null) PrayerChecks.armFollowUp(context, item);
                break;
            default:
                break;
        }
    }

    /** Lets the running app pick the answer up now (bridgeless: through the ReactHost). */
    private static void notifyApp(Context context) {
        try {
            Context app = context.getApplicationContext();
            if (!(app instanceof ReactApplication)) return;
            ReactHost host = ((ReactApplication) app).getReactHost();
            ReactContext rc = host != null ? host.getCurrentReactContext() : null;
            if (rc != null && rc.hasActiveReactInstance()) {
                rc.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit(EVENT_ANSWERED, null);
            }
        } catch (Throwable t) {
            Log.w(TAG, "Could not notify the app", t);
        }
    }
}
