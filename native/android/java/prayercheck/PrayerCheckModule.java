package com.mohamewael66sorganization.owwab.prayercheck;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.LifecycleEventListener;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;

import org.json.JSONArray;
import org.json.JSONObject;

import java.util.HashSet;
import java.util.Set;

/** JS side of PrayerChecks («صليت؟» after each adhan). */
public class PrayerCheckModule extends ReactContextBaseJavaModule {

    PrayerCheckModule(ReactApplicationContext context) {
        super(context);
        // a question that came while the phone was locked shows as the card when the app opens
        context.addLifecycleEventListener(new LifecycleEventListener() {
            @Override public void onHostResume() { PrayerChecks.showWaiting(context); }
            @Override public void onHostPause() {}
            @Override public void onHostDestroy() {}
        });
    }

    @Override
    public String getName() {
        return "PrayerCheck";
    }

    /** `json`: [{ prayerId, hour, minute, title, body, followUpTitle, followUpBody, prayedLabel, laterLabel, followUpMinutes }]. */
    @ReactMethod
    public void schedule(String json, Promise promise) {
        try {
            PrayerChecks.schedule(getReactApplicationContext(), new JSONArray(json));
            promise.resolve(null);
        } catch (Exception e) {
            promise.reject("PRAYER_CHECK_SCHEDULE", e);
        }
    }

    @ReactMethod
    public void cancelAll(Promise promise) {
        PrayerChecks.cancelAll(getReactApplicationContext());
        promise.resolve(null);
    }

    /** 'light' | 'dark' | 'system': the card follows the app's theme setting. */
    @ReactMethod
    public void setLook(String mode) {
        PrayerChecks.setLook(getReactApplicationContext(), mode);
    }

    @ReactMethod
    public void setDoneToday(ReadableArray prayerIds) {
        Set<String> ids = new HashSet<>();
        for (int i = 0; i < prayerIds.size(); i++) ids.add(prayerIds.getString(i));
        PrayerChecks.setDoneToday(getReactApplicationContext(), ids);
    }

    @ReactMethod
    public void takeAnswers(Promise promise) {
        JSONArray answers = PrayerChecks.takeAnswers(getReactApplicationContext());
        WritableArray out = Arguments.createArray();
        for (int i = 0; i < answers.length(); i++) {
            JSONObject a = answers.optJSONObject(i);
            if (a == null) continue;
            WritableMap m = Arguments.createMap();
            m.putString("prayerId", a.optString("prayerId"));
            m.putString("day", a.optString("day"));
            out.pushMap(m);
        }
        promise.resolve(out);
    }

    /** The «صليت؟» card once, now, from settings: answering it records nothing. */
    @ReactMethod
    public void preview(String json, Promise promise) {
        try {
            JSONObject item = new JSONObject(json).put("prayerId", PrayerCheckCard.PREVIEW);
            promise.resolve(PrayerCheckCard.show(getReactApplicationContext(), item, false));
        } catch (Exception e) {
            promise.resolve(false);
        }
    }

    // required by NativeEventEmitter on the JS side
    @ReactMethod
    public void addListener(String eventName) {}

    @ReactMethod
    public void removeListeners(double count) {}
}
