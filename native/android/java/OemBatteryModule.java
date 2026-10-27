package com.mohamewael66sorganization.owwab;

import android.app.AppOpsManager;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.os.PowerManager;
import android.provider.Settings;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.WritableMap;
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

    // MIUI-only app-ops. Without them MIUI silently blocks the adhan screen from opening
    // over the lock screen or from the background, even with the full-screen intent.
    private static final int MIUI_OP_SHOW_WHEN_LOCKED = 10020;
    private static final int MIUI_OP_BACKGROUND_START_ACTIVITY = 10021;

    private static boolean isXiaomi() {
        String m = Build.MANUFACTURER.toLowerCase();
        return m.equals("xiaomi") || m.equals("redmi") || m.equals("poco");
    }

    /** "ok" / "missing" for one MIUI op, or "unknown" when it cannot be read. */
    private String miuiOp(int op) {
        try {
            Context ctx = getReactApplicationContext();
            AppOpsManager ops = (AppOpsManager) ctx.getSystemService(Context.APP_OPS_SERVICE);
            java.lang.reflect.Method check = AppOpsManager.class.getMethod("checkOpNoThrow", int.class, int.class, String.class);
            int mode = (int) check.invoke(ops, op, android.os.Process.myUid(), ctx.getPackageName());
            return mode == AppOpsManager.MODE_ALLOWED ? "ok" : "missing";
        } catch (Throwable t) {
            return "unknown";
        }
    }

    /** On Xiaomi/Redmi/POCO: { showWhenLocked, backgroundStart } as ok/missing/unknown; null elsewhere. */
    @ReactMethod
    public void getMiuiLockScreenStatus(Promise promise) {
        if (!isXiaomi()) { promise.resolve(null); return; }
        WritableMap map = Arguments.createMap();
        map.putString("showWhenLocked", miuiOp(MIUI_OP_SHOW_WHEN_LOCKED));
        map.putString("backgroundStart", miuiOp(MIUI_OP_BACKGROUND_START_ACTIVITY));
        promise.resolve(map);
    }

    /**
     * The page where this maker hides "show on lock screen" / "pop-up from background":
     * MIUI's permission editor, Vivo's permission detail, otherwise the app's details page
     * (ColorOS, OneUI, EMUI keep those switches under the app's own settings).
     */
    @ReactMethod
    public void openLockScreenPermissions(Promise promise) {
        Context ctx = getReactApplicationContext();
        String pkg = ctx.getPackageName();
        String m = Build.MANUFACTURER.toLowerCase();
        Intent intent = null;
        if (isXiaomi()) {
            intent = new Intent("miui.intent.action.APP_PERM_EDITOR");
            intent.setClassName("com.miui.securitycenter", "com.miui.permcenter.permissions.PermissionsEditorActivity");
            intent.putExtra("extra_pkgname", pkg);
        } else if (m.equals("vivo")) {
            intent = new Intent();
            intent.setClassName("com.vivo.permissionmanager", "com.vivo.permissionmanager.activity.SoftPermissionDetailActivity");
            intent.putExtra("packagename", pkg);
        }
        try {
            if (intent == null) throw new IllegalStateException("no maker page");
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            ctx.startActivity(intent);
            promise.resolve(true);
        } catch (Exception e) {
            try {
                Intent details = new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
                details.setData(Uri.parse("package:" + pkg));
                details.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                ctx.startActivity(details);
                promise.resolve(false);
            } catch (Exception ex) {
                promise.reject("LOCK_SCREEN_PERMISSIONS_FAILED", ex);
            }
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
