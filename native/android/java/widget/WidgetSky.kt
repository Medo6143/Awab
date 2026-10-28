package com.mohamewael66sorganization.owwab.widget

import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.DashPathEffect
import android.graphics.LinearGradient
import android.graphics.Paint
import android.graphics.Path
import android.graphics.RadialGradient
import android.graphics.RectF
import android.graphics.Shader
import kotlin.math.abs
import kotlin.math.sin

/**
 * The app's living sky drawn into a bitmap for the widget: the colour of the hour, stars at
 * night, the five prayers on the sun's arc and the sun (or a crescent at night) where it is
 * now. Same phases and colours as SkyHero.tsx.
 */
object WidgetSky {
    private val SKY = mapOf(
        "night" to intArrayOf(0xFF05081A.toInt(), 0xFF0D1430.toInt(), 0xFF141433.toInt(), 0xFF0E0A07.toInt()),
        "dawn" to intArrayOf(0xFF1B2347.toInt(), 0xFF5B4470.toInt(), 0xFFC98466.toInt(), 0xFF0E0A07.toInt()),
        "morning" to intArrayOf(0xFF1D4F7C.toInt(), 0xFF3F7FB0.toInt(), 0xFF7FA9C6.toInt(), 0xFF0E0A07.toInt()),
        "noon" to intArrayOf(0xFF215784.toInt(), 0xFF5A8FB8.toInt(), 0xFFB9A888.toInt(), 0xFF0E0A07.toInt()),
        "golden" to intArrayOf(0xFF1D1631.toInt(), 0xFF5A3346.toInt(), 0xFFC06A3C.toInt(), 0xFF0E0A07.toInt()),
        "dusk" to intArrayOf(0xFF0F1430.toInt(), 0xFF2E2550.toInt(), 0xFF6A3A55.toInt(), 0xFF0E0A07.toInt()),
    )

    /** Minutes since midnight for each of Fajr, Sunrise, Dhuhr, Asr, Maghrib, Isha (null if unknown). */
    fun phase(now: Int, t: Map<String, Int>): String {
        val fajr = t["Fajr"]; val maghrib = t["Maghrib"]; val isha = t["Isha"]
        if (fajr == null || maghrib == null || isha == null) return if (now >= 18 * 60 || now < 5 * 60) "night" else "morning"
        return when {
            now < fajr || now >= maghrib -> "night"
            now < (t["Sunrise"] ?: (fajr + 80)) -> "dawn"
            now < (t["Dhuhr"] ?: (12 * 60)) -> "morning"
            now < (t["Asr"] ?: (15 * 60)) -> "noon"
            else -> "golden"
        }
    }

    fun draw(w: Int, h: Int, now: Int, t: Map<String, Int>, next: String?, radius: Float): Bitmap {
        val bmp = Bitmap.createBitmap(w.coerceAtLeast(1), h.coerceAtLeast(1), Bitmap.Config.ARGB_8888)
        val c = Canvas(bmp)
        val ph = phase(now, t)
        val night = ph == "night"
        val clip = Path().apply { addRoundRect(RectF(0f, 0f, w.toFloat(), h.toFloat()), radius, radius, Path.Direction.CW) }
        c.clipPath(clip)

        val sky = SKY[ph]!!
        c.drawRect(0f, 0f, w.toFloat(), h.toFloat(), Paint().apply {
            shader = LinearGradient(0f, 0f, 0f, h * 1.35f, sky, floatArrayOf(0f, 0.38f, 0.7f, 1f), Shader.TileMode.CLAMP)
        })

        if (ph == "night" || ph == "dusk" || ph == "dawn") {
            val star = Paint(Paint.ANTI_ALIAS_FLAG).apply { color = Color.WHITE }
            val count = if (night) 46 else 14
            for (i in 0 until count) {
                val rx = frac(sin(i * 12.9898 + 78.233) * 43758.5453)
                val ry = frac(sin(i * 4.1414 + 9.17) * 24634.6345)
                val big = frac(sin(i * 7.77) * 9999.0) > 0.85
                star.alpha = if (night) (110 + (i * 37) % 140) else 70
                c.drawCircle((rx * w).toFloat(), (ry * h * 0.9).toFloat(), if (big) 2.4f else 1.3f, star)
            }
        }

        // the arc: fajr on the right (east), isha on the left, like the app
        val fajr = t["Fajr"]; val isha = t["Isha"]
        if (fajr != null && isha != null && isha > fajr) {
            // the arc sits in the top half; the countdown is laid out under it like the app
            val pad = w * 0.09f; val base = h * 0.46f; val peak = h * 0.06f
            fun point(tt: Float): Pair<Float, Float> {
                val u = 1 - tt
                val x = u * u * (w - pad) + 2 * u * tt * (w / 2f) + tt * tt * pad
                val y = u * u * base + 2 * u * tt * peak + tt * tt * base
                return x to y
            }
            fun tOf(m: Int) = ((m - fajr).toFloat() / (isha - fajr)).coerceIn(0f, 1f)
            val path = Path().apply { moveTo(w - pad, base); quadTo(w / 2f, peak - (base - peak) * 0.0f, pad, base) }
            c.drawPath(path, Paint(Paint.ANTI_ALIAS_FLAG).apply {
                style = Paint.Style.STROKE; strokeWidth = 2f; color = Color.argb(90, 255, 255, 255)
                pathEffect = DashPathEffect(floatArrayOf(5f, 10f), 0f)
            })
            val dot = Paint(Paint.ANTI_ALIAS_FLAG)
            val label = Paint(Paint.ANTI_ALIAS_FLAG).apply { textAlign = Paint.Align.CENTER; textSize = h * 0.075f }
            val names = mapOf("Fajr" to "الفجر", "Dhuhr" to "الظهر", "Asr" to "العصر", "Maghrib" to "المغرب", "Isha" to "العشاء")
            for (k in listOf("Fajr", "Dhuhr", "Asr", "Maghrib", "Isha")) {
                val m = t[k] ?: continue
                val (x, y) = point(tOf(m))
                val isNext = k == next
                label.color = if (isNext) 0xFFFFD27A.toInt() else Color.argb(210, 255, 255, 255)
                label.isFakeBoldText = isNext
                val below = y > base - h * 0.1f
                c.drawText(names[k]!!, x, if (below) y + h * 0.11f else y - h * 0.05f, label)
                dot.style = if (isNext || m <= now) Paint.Style.FILL else Paint.Style.STROKE
                dot.strokeWidth = 2.5f
                dot.color = if (isNext) 0xFFFFD27A.toInt() else Color.argb(200, 255, 255, 255)
                c.drawCircle(x, y, if (isNext) 7f else 5f, dot)
            }

            val maghrib = t["Maghrib"] ?: isha
            val nightLen = 1440 - (maghrib - fajr)
            val into = ((now - maghrib) % 1440 + 1440) % 1440
            val (bx, by) = if (now in fajr until maghrib) point(tOf(now)) else point(1f - (into.toFloat() / nightLen).coerceAtMost(1f))
            val glowColor = if (night) 0xFFDFE6FF.toInt() else 0xFFFFD27A.toInt()
            c.drawCircle(bx, by, 34f, Paint(Paint.ANTI_ALIAS_FLAG).apply {
                shader = RadialGradient(bx, by, 34f, Color.argb(140, Color.red(glowColor), Color.green(glowColor), Color.blue(glowColor)), Color.TRANSPARENT, Shader.TileMode.CLAMP)
            })
            if (night) {
                c.drawCircle(bx, by, 13f, Paint(Paint.ANTI_ALIAS_FLAG).apply { color = 0xFFEEF2FF.toInt() })
                c.drawCircle(bx + 6f, by - 4f, 11f, Paint(Paint.ANTI_ALIAS_FLAG).apply { color = sky[1] })
            } else {
                c.drawCircle(bx, by, 12f, Paint(Paint.ANTI_ALIAS_FLAG).apply { color = 0xFFFFD27A.toInt() })
            }
        }

        // darken the bottom so the text reads on any phase
        c.drawRect(0f, 0f, w.toFloat(), h.toFloat(), Paint().apply {
            shader = LinearGradient(0f, h * 0.55f, 0f, h.toFloat(), Color.TRANSPARENT, Color.argb(120, 14, 10, 7), Shader.TileMode.CLAMP)
        })
        return bmp
    }

    private fun frac(x: Double) = abs(x) % 1.0
}
