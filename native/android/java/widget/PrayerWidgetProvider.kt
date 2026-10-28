package com.mohamewael66sorganization.owwab.widget

import android.app.AlarmManager
import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.Bundle
import android.os.SystemClock
import android.widget.RemoteViews
import com.mohamewael66sorganization.owwab.R
import org.json.JSONObject
import java.util.Calendar

/**
 * Home-screen widget: the living sky (see WidgetSky), the next prayer with its time and a
 * countdown ticking in seconds. It works out the next prayer itself from today's times, and
 * wakes at each prayer time and every 15 minutes to move on and redraw the sky.
 */
class PrayerWidgetProvider : AppWidgetProvider() {

    override fun onUpdate(context: Context, appWidgetManager: AppWidgetManager, appWidgetIds: IntArray) {
        for (id in appWidgetIds) updateAppWidget(context, appWidgetManager, id)
        scheduleRefresh(context)
    }

    override fun onAppWidgetOptionsChanged(context: Context, manager: AppWidgetManager, id: Int, newOptions: Bundle) {
        updateAppWidget(context, manager, id)
    }

    override fun onReceive(context: Context, intent: Intent) {
        super.onReceive(context, intent)
        if (intent.action == ACTION_UPDATE) {
            val manager = AppWidgetManager.getInstance(context)
            val ids = manager.getAppWidgetIds(ComponentName(context.packageName, PrayerWidgetProvider::class.java.name))
            for (id in ids) updateAppWidget(context, manager, id)
            if (ids.isNotEmpty()) scheduleRefresh(context)
        }
    }

    companion object {
        private const val ACTION_UPDATE = "com.mohamewael66sorganization.owwab.ACTION_WIDGET_UPDATE"
        private val ORDER = listOf("Fajr", "Dhuhr", "Asr", "Maghrib", "Isha")
        private val AR = mapOf("Fajr" to "الفجر", "Dhuhr" to "الظهر", "Asr" to "العصر", "Maghrib" to "المغرب", "Isha" to "العشاء")

        private fun minutesOf(v: String?): Int? {
            val m = Regex("(\\d{1,2}):(\\d{2})").find(v ?: return null) ?: return null
            return m.groupValues[1].toInt() * 60 + m.groupValues[2].toInt()
        }

        private fun arDigits(s: String) = s.map { if (it in '0'..'9') '٠' + (it - '0') else it }.joinToString("")

        /** Today's times as minutes, from the JSON the app saves. */
        private fun timings(context: Context): Map<String, Int> {
            val raw = context.getSharedPreferences("PrayerWidgetPrefs", Context.MODE_PRIVATE).getString("timings", null) ?: return emptyMap()
            return try {
                val o = JSONObject(raw)
                listOf("Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha").mapNotNull { k -> minutesOf(o.optString(k))?.let { k to it } }.toMap()
            } catch (e: Exception) { emptyMap() }
        }

        /** The next prayer after now and when it is (fajr tomorrow after isha). */
        private fun next(t: Map<String, Int>, cal: Calendar): Pair<String, Long>? {
            val now = cal.get(Calendar.HOUR_OF_DAY) * 60 + cal.get(Calendar.MINUTE)
            val key = ORDER.firstOrNull { (t[it] ?: -1) > now } ?: "Fajr"
            val m = t[key] ?: return null
            val at = (cal.clone() as Calendar).apply {
                set(Calendar.HOUR_OF_DAY, m / 60); set(Calendar.MINUTE, m % 60); set(Calendar.SECOND, 0); set(Calendar.MILLISECOND, 0)
                if (m <= now) add(Calendar.DAY_OF_YEAR, 1)
            }
            return key to at.timeInMillis
        }

        fun updateAppWidget(context: Context, manager: AppWidgetManager, id: Int) {
            val prefs = context.getSharedPreferences("PrayerWidgetPrefs", Context.MODE_PRIVATE)
            val t = timings(context)
            val cal = Calendar.getInstance()
            val now = cal.get(Calendar.HOUR_OF_DAY) * 60 + cal.get(Calendar.MINUTE)
            val nxt = next(t, cal)

            val views = RemoteViews(context.packageName, R.layout.prayer_widget_layout)
            val name = nxt?.first?.let { AR[it] } ?: prefs.getString("prayerName", "—")
            val time = nxt?.first?.let { k -> t[k]?.let { String.format("%02d:%02d", it / 60, it % 60) } } ?: prefs.getString("prayerTime", "--:--")
            val target = nxt?.second ?: prefs.getLong("targetTimeMillis", 0L)
            views.setTextViewText(R.id.widget_prayer_name, "باقي على $name")
            views.setTextViewText(R.id.widget_prayer_time, arDigits(time ?: ""))

            val remaining = target - System.currentTimeMillis()
            if (remaining > 0) {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) views.setChronometerCountDown(R.id.widget_countdown, true)
                views.setChronometer(R.id.widget_countdown, SystemClock.elapsedRealtime() + remaining, null, true)
            } else {
                views.setChronometer(R.id.widget_countdown, SystemClock.elapsedRealtime(), null, false)
            }

            // the sky at the widget's real size (options are in dp)
            val opts = manager.getAppWidgetOptions(id)
            val density = context.resources.displayMetrics.density
            val wDp = opts.getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_WIDTH, 320).takeIf { it > 0 } ?: 320
            val hDp = opts.getInt(AppWidgetManager.OPTION_APPWIDGET_MAX_HEIGHT, 180).takeIf { it > 0 } ?: 180
            val scale = (density.coerceAtMost(2f))
            try {
                views.setImageViewBitmap(R.id.widget_sky, WidgetSky.draw((wDp * scale).toInt(), (hDp * scale).toInt(), now, t, nxt?.first, 22 * scale, prefs.getString("dateLine", "") ?: ""))
            } catch (e: Exception) { /* keep the previous sky */ }

            val launch = context.packageManager.getLaunchIntentForPackage(context.packageName)
            views.setOnClickPendingIntent(R.id.widget_container, PendingIntent.getActivity(context, 0, launch,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE))
            manager.updateAppWidget(id, views)
        }

        /** Redraw at the next prayer (to move on) and at least every 15 minutes (the sun moves). */
        fun scheduleRefresh(context: Context) {
            val am = context.getSystemService(Context.ALARM_SERVICE) as? AlarmManager ?: return
            val intent = Intent(context, PrayerWidgetProvider::class.java).setAction(ACTION_UPDATE)
            val pi = PendingIntent.getBroadcast(context, 7311, intent, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
            val nextPrayer = next(timings(context), Calendar.getInstance())?.second
            val in15 = System.currentTimeMillis() + 15 * 60_000L
            val at = if (nextPrayer != null && nextPrayer < in15) nextPrayer + 1000 else in15
            // inexact is fine for the sky; the countdown itself ticks on the launcher
            am.set(AlarmManager.RTC, at, pi)
        }
    }
}
