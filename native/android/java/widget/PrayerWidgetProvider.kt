package com.mohamewael66sorganization.owwab.widget

import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.SharedPreferences
import android.os.Build
import android.os.SystemClock
import android.widget.RemoteViews
import com.mohamewael66sorganization.owwab.R

class PrayerWidgetProvider : AppWidgetProvider() {

    override fun onUpdate(context: Context, appWidgetManager: AppWidgetManager, appWidgetIds: IntArray) {
        for (appWidgetId in appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId)
        }
    }

    override fun onReceive(context: Context, intent: Intent) {
        super.onReceive(context, intent)
        if (intent.action == "com.mohamewael66sorganization.owwab.ACTION_WIDGET_UPDATE") {
            val appWidgetManager = AppWidgetManager.getInstance(context)
            val thisAppWidget = ComponentName(context.packageName, PrayerWidgetProvider::class.java.name)
            val appWidgetIds = appWidgetManager.getAppWidgetIds(thisAppWidget)
            for (appWidgetId in appWidgetIds) {
                updateAppWidget(context, appWidgetManager, appWidgetId)
            }
        }
    }

    companion object {
        fun updateAppWidget(context: Context, appWidgetManager: AppWidgetManager, appWidgetId: Int) {
            val prefs = context.getSharedPreferences("PrayerWidgetPrefs", Context.MODE_PRIVATE)
            val prayerName = prefs.getString("prayerName", "---")
            val prayerTime = prefs.getString("prayerTime", "--:--")
            val targetTimeMillis = prefs.getLong("targetTimeMillis", 0L)
            
            val views = RemoteViews(context.packageName, R.layout.prayer_widget_layout)
            views.setTextViewText(R.id.widget_prayer_name, prayerName)
            views.setTextViewText(R.id.widget_prayer_time, prayerTime)

            // Setup Countdown
            if (targetTimeMillis > System.currentTimeMillis()) {
                val remainingMillis = targetTimeMillis - System.currentTimeMillis()
                // Chronometer base is relative to SystemClock.elapsedRealtime()
                val baseTime = SystemClock.elapsedRealtime() + remainingMillis
                
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
                    views.setChronometerCountDown(R.id.widget_countdown, true)
                }
                views.setChronometer(R.id.widget_countdown, baseTime, null, true)
            } else {
                // If the prayer time has passed, show the target time or 00:00
                views.setChronometer(R.id.widget_countdown, SystemClock.elapsedRealtime(), null, false)
            }

            // Optional: Create an Intent to launch the app when clicked
            val intent = context.packageManager.getLaunchIntentForPackage(context.packageName)
            val pendingIntent = android.app.PendingIntent.getActivity(
                context, 0, intent, 
                android.app.PendingIntent.FLAG_UPDATE_CURRENT or android.app.PendingIntent.FLAG_IMMUTABLE
            )
            views.setOnClickPendingIntent(R.id.widget_container, pendingIntent)

            appWidgetManager.updateAppWidget(appWidgetId, views)
        }
    }
}
