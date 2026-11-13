package com.mohamewael66sorganization.owwab.video;

import android.util.Log;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;


/**
 * JS entry for the ayah video (see AyahVideoEncoder). One video at a time; progress goes to
 * JS as `ayahVideoProgress` events: { fraction, durationMs? }.
 */
public class AyahVideoModule extends ReactContextBaseJavaModule {
    private volatile boolean busy;

    public AyahVideoModule(ReactApplicationContext context) {
        super(context);
    }

    @Override
    public String getName() {
        return "AyahVideo";
    }

    /**
     * `spec` is JSON: { video (MP4), shade, overlay, pages: [{ image, words: [{ x, y, w, h, ayah, weight }] }],
     * audios: [mp3 paths, one per ayah], out }. Images are 1080×1920; boxes are in their pixels.
     */
    @ReactMethod
    public void encode(String spec, Promise promise) {
        if (busy) {
            promise.reject("BUSY", "a video is already being made");
            return;
        }
        busy = true;
        new Thread(() -> {
            try {
                long durationMs = new AyahVideoEncoder().encode(spec, this::emitProgress);
                WritableMap result = Arguments.createMap();
                result.putDouble("durationMs", durationMs);
                promise.resolve(result);
            } catch (AyahVideoEncoder.EncodeException e) {
                Log.e(AyahVideoEncoder.TAG, "encode failed: " + e.code, e);
                promise.reject(e.code, e.getMessage(), e);
            } catch (Throwable e) {
                Log.e(AyahVideoEncoder.TAG, "encode crashed", e);
                promise.reject("ENCODE_FAILED", String.valueOf(e), e);
            } finally {
                busy = false;
            }
        }, "ayah-video").start();
    }

    private void emitProgress(double fraction, long durationMs) {
        try {
            WritableMap map = Arguments.createMap();
            map.putDouble("fraction", fraction);
            if (durationMs >= 0) map.putDouble("durationMs", durationMs);
            getReactApplicationContext()
                    .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                    .emit("ayahVideoProgress", map);
        } catch (Exception ignored) {
            // the JS side went away; the encode carries on and its promise still settles
        }
    }

    @ReactMethod
    public void addListener(String eventName) {}

    @ReactMethod
    public void removeListeners(Integer count) {}
}
