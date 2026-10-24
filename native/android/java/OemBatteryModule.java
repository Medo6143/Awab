package com.mohamewael66sorganization.owwab;

import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.os.PowerManager;
import android.provider.Settings;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

public class OemBatteryModule extends ReactContextBaseJavaModule {

    public OemBatteryModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "OemBatteryModule";
    }

    @ReactMethod
    public void getManufacturer(Promise promise) {
        promise.resolve(Build.MANUFACTURER.toLowerCase());
    }

    @ReactMethod
    public void isIgnoringBatteryOptimizations(Promise promise) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            PowerManager pm = (PowerManager) getReactApplicationContext().getSystemService(Context.POWER_SERVICE);
            if (pm != null) {
                promise.resolve(pm.isIgnoringBatteryOptimizations(getReactApplicationContext().getPackageName()));
                return;
            }
        }
        promise.resolve(true); // Pre-M or no PM available
    }

    @ReactMethod
    public void requestIgnoreBatteryOptimizations(Promise promise) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            try {
                Intent intent = new Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS);
                intent.setData(Uri.parse("package:" + getReactApplicationContext().getPackageName()));
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                getReactApplicationContext().startActivity(intent);
                promise.resolve(true);
            } catch (Exception e) {
                promise.reject("BATTERY_INTENT_FAILED", e);
            }
        } else {
            promise.resolve(false);
        }
    }

    @ReactMethod
    public void openOemBatterySettings(Promise promise) {
        try {
            Intent intent = new Intent();
            String manufacturer = Build.MANUFACTURER.toLowerCase();
            
            if ("xiaomi".equals(manufacturer)) {
                intent.setComponent(new ComponentName(
                        "com.miui.securitycenter",
                        "com.miui.permcenter.autostart.AutoStartManagementActivity"));
            } else if ("huawei".equals(manufacturer) || "honor".equals(manufacturer)) {
                intent.setComponent(new ComponentName(
                        "com.huawei.systemmanager",
                        "com.huawei.systemmanager.startupmgr.ui.StartupNormalAppListActivity"));
            } else if ("oppo".equals(manufacturer)) {
                intent.setComponent(new ComponentName(
                        "com.coloros.safecenter",
                        "com.coloros.safecenter.permission.startup.StartupAppListActivity"));
            } else if ("vivo".equals(manufacturer)) {
                intent.setComponent(new ComponentName(
                        "com.vivo.permissionmanager",
                        "com.vivo.permissionmanager.activity.BgStartUpManagerActivity"));
            } else if ("samsung".equals(manufacturer)) {
                intent.setAction(Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
                intent.setData(Uri.parse("package:" + getReactApplicationContext().getPackageName()));
            } else {
                intent.setAction(Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
                intent.setData(Uri.parse("package:" + getReactApplicationContext().getPackageName()));
            }

            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            getReactApplicationContext().startActivity(intent);
            promise.resolve(true);
            
        } catch (Exception e) {
            // Fallback to standard app settings if OEM screen not found
            try {
                Intent fallback = new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
                fallback.setData(Uri.parse("package:" + getReactApplicationContext().getPackageName()));
                fallback.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                getReactApplicationContext().startActivity(fallback);
                promise.resolve(false); // Indicates fallback was used
            } catch (Exception ex) {
                promise.reject("ALL_INTENTS_FAILED", ex);
            }
        }
    }
}
