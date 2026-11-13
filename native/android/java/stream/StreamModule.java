package com.mohamewael66sorganization.owwab.stream;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import java.net.HttpURLConnection;
import java.net.URL;

/**
 * Live radio relays (radiojar: the Cairo and Saudi Quran radios) answer their https address
 * with a redirect to an http one carrying a short-lived token. Android blocks http, and every
 * HTTP client follows the redirect before JS can see it. This reads the redirect target without
 * following it, over https, so the player can open the same address over https.
 */
public class StreamModule extends ReactContextBaseJavaModule {

    StreamModule(ReactApplicationContext context) {
        super(context);
    }

    @Override
    public String getName() {
        return "OwwabStream";
    }

    /** Follows up to five redirects by hand and resolves the final address (https forced), or the input. */
    @ReactMethod
    public void resolve(String url, Promise promise) {
        new Thread(() -> {
            String current = url;
            try {
                for (int i = 0; i < 5; i++) {
                    HttpURLConnection c = (HttpURLConnection) new URL(current).openConnection();
                    c.setInstanceFollowRedirects(false);
                    c.setConnectTimeout(6000);
                    c.setReadTimeout(6000);
                    c.setRequestProperty("Range", "bytes=0-0");
                    int code = c.getResponseCode();
                    String location = c.getHeaderField("Location");
                    c.disconnect();
                    if (code < 300 || code >= 400 || location == null) break;
                    current = new URL(new URL(current), location).toString().replaceFirst("^http://", "https://");
                }
                promise.resolve(current);
            } catch (Exception e) {
                promise.resolve(current);
            }
        }, "owwab-stream-resolve").start();
    }
}
