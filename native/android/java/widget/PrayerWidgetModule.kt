package com.mohamewael66sorganization.owwab.widget

import android.content.Context
import android.content.Intent
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap

class PrayerWidgetModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "PrayerWidget"
    }

    @ReactMethod
    fun updateWidgetData(data: ReadableMap) {
        val prayerName = data.getString("prayerName")
        val prayerTime = data.getString("prayerTime")
        val targetTimeMillis = if (data.hasKey("targetTimeMillis")) data.getDouble("targetTimeMillis").toLong() else 0L
        
        val context = reactApplicationContext
        val prefs = context.getSharedPreferences("PrayerWidgetPrefs", Context.MODE_PRIVATE)
        val editor = prefs.edit()
        editor.putString("prayerName", prayerName)
        editor.putString("prayerTime", prayerTime)
        editor.putLong("targetTimeMillis", targetTimeMillis)
        if (data.hasKey("timings")) editor.putString("timings", data.getString("timings"))
        editor.apply()

        // Trigger widget update
        val intent = Intent(context, PrayerWidgetProvider::class.java)
        intent.action = "com.mohamewael66sorganization.owwab.ACTION_WIDGET_UPDATE"
        context.sendBroadcast(intent)
    }
}
