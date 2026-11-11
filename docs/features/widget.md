# Home-screen prayer widget (باقي على الصلاة)

> Status: Shipped · An Android home-screen widget that draws the app's "living sky" with today's five prayers and counts down in seconds to the next one, working out the next prayer by itself between app launches.

## What it does

- Shows «باقي على <prayer>» and a live countdown to the next prayer.
- Draws a sky that matches the time of day (night, dawn, morning, noon, golden hour), with stars at night.
- Draws the sun's arc with a dot per prayer (the next one in gold), and the sun, or a crescent at night, at its current position.
- Shows the weekday and Hijri date at the top, the app name, and a bottom row with the five prayer times in 12-hour Arabic digits.
- Tapping anywhere opens the app.

## How the user reaches it

It is not inside the app. The user long-presses the Android home screen, opens Widgets, and adds the أوّاب widget (described there as «الصلاة القادمة والوقت المتبقي عليها»). There is no route in `src/presentation/navigation/AppNavigation.tsx` and no in-app screen that explains or installs it. The widget shows real data only after the app has been opened once with a location.

## How it works

App side:

1. `usePrayerTimes` (`src/presentation/hooks/usePrayerTimes.ts`) calls `updateWidget(next, timings, hijri)` in three situations: after reusing today's cached times, after a fresh fetch, and from its 60 s timer when the next prayer's name changes.
2. `updateWidget` calls `prayerWidget.update({ prayerName, prayerTime, targetTimeMillis, timings, dateLine })`. `targetTimeMillis` is now + remaining minutes; `timings` is the whole day's times as a JSON string; `dateLine` is weekday · Hijri day and month.
3. `NativePrayerWidget.update` forwards to the native module `PrayerWidget.updateWidgetData` on Android and does nothing elsewhere.

Native side:

1. `PrayerWidgetModule.updateWidgetData` writes the five values to SharedPreferences `PrayerWidgetPrefs` and broadcasts `ACTION_WIDGET_UPDATE` to the provider.
2. `PrayerWidgetProvider.updateAppWidget` parses the saved `timings`, finds the next of Fajr, Dhuhr, Asr, Maghrib, Isha after now (tomorrow's Fajr after Isha, using today's Fajr time), and fills the views. If timings are missing it falls back to the saved `prayerName`, `prayerTime` and `targetTimeMillis`.
3. The countdown is a `Chronometer` in count-down mode (Android 7+), so it ticks every second on the launcher without the app process.
4. `WidgetSky.draw` renders the background bitmap at the widget's actual size (width from `OPTION_APPWIDGET_MIN_WIDTH`, height from `OPTION_APPWIDGET_MAX_HEIGHT`, scaled by the screen density capped at 2). The phases and colours mirror `src/presentation/components/home/SkyHero.tsx`.
5. `scheduleRefresh` sets an inexact `AlarmManager.RTC` alarm for whichever is sooner: one second after the next prayer, or 15 minutes from now. Each refresh redraws and schedules the next one.

| Number | Value | Where |
|---|---|---|
| Self-refresh | every 15 min, or at the next prayer + 1 s | `native/android/java/widget/PrayerWidgetProvider.kt` |
| System update period | 30 min (`updatePeriodMillis=1800000`) | `native/android/res/xml/prayer_widget_info.xml` |
| Default size | 4 x 3 cells, min 300 x 200 dp, resizable down to 110 x 150 dp | `native/android/res/xml/prayer_widget_info.xml` |
| Stars | 46 at night, 14 at dawn | `native/android/java/widget/WidgetSky.kt` |
| Sky phases | night (before Fajr or from Maghrib), dawn (to sunrise), morning (to Dhuhr), noon (to Asr), golden (to Maghrib) | `native/android/java/widget/WidgetSky.kt` |

## Code map

| Layer | File | Role |
|---|---|---|
| Hook | `src/presentation/hooks/usePrayerTimes.ts` | Decides when to push data to the widget |
| Domain | `src/domain/services/PrayerWidget.ts` | `PrayerWidget.update(...)` interface |
| Data | `src/data/services/NativePrayerWidget.ts` | Bridge to the native module; no-op off Android |
| DI | `src/data/container.ts` | `prayerWidget: new NativePrayerWidget()` |
| Native | `native/android/java/widget/PrayerWidgetModule.kt` | React module `PrayerWidget`: saves data, broadcasts update |
| Native | `native/android/java/widget/PrayerWidgetPackage.kt` | Registers the module |
| Native | `native/android/java/widget/PrayerWidgetProvider.kt` | `AppWidgetProvider`: next prayer, views, refresh alarm |
| Native | `native/android/java/widget/WidgetSky.kt` | Draws the sky bitmap |
| Resource | `native/android/res/layout/prayer_widget_layout.xml` | Sky image, label, chronometer |
| Resource | `native/android/res/xml/prayer_widget_info.xml` | Widget metadata (size, update period, preview) |
| Resource | `native/android/res/drawable/widget_background.xml` | Rounded background |
| Resource | `native/android/res/drawable/mosque_bg.png` | Placeholder image before the first draw |
| Resource | `native/android/res/values/strings_owwab.xml` | Widget description string |
| Build | `plugins/withOwwabNative.js` | Copies sources and resources, declares the receiver, registers the package |

## State and storage

- SharedPreferences `PrayerWidgetPrefs`: `prayerName`, `prayerTime`, `targetTimeMillis`, `timings` (JSON string of the day's times), `dateLine`.
- Nothing widget-specific in Redux or AsyncStorage. The source data is `prayer.cachedData` (see `docs/features/prayer-times.md`).

## Native, notifications and permissions

- The receiver is declared by the plugin with the `APPWIDGET_UPDATE` action and a custom `ACTION_WIDGET_UPDATE` action, exported, with the prayer_widget_info XML as its metadata.
- No runtime permission. The refresh alarm is inexact (`AlarmManager.set`), so it needs no exact-alarm permission.
- No notifications.
- The Kotlin sources carry the package name literally; the plugin rewrites it at prebuild if the application id changes. The action string in `native/android/java/widget/PrayerWidgetModule.kt` and `native/android/java/widget/PrayerWidgetProvider.kt` is rewritten by the same replace.

## External services

None. The widget only reads what the app saved.

## Settings that affect it

Indirectly, anything that changes prayer times: calculation method and Asr school (Settings → «الصلاة والأذان»). The widget has no options of its own and does not follow the app's light/dark or accent theme.

## Edge cases and limitations

- The widget never fetches. If the app is not opened, it keeps using the last saved day's times and the last saved `dateLine`, so both the times and the Hijri date go stale after midnight.
- Tomorrow's Fajr is assumed to be at today's Fajr time.
- The app-side next prayer includes sunrise (`findNextPrayer` iterates six entries) while the widget skips it. Between Fajr and sunrise the app may send «الشروق» as `prayerName`, but the widget ignores it whenever `timings` is present.
- The hidden `widget_prayer_time` view is still filled but has `visibility="gone"`; the time is only visible in the bottom row of the bitmap.
- If drawing the sky throws, the previous bitmap is kept silently.
- The refresh alarm is inexact and non-wakeup, so in Doze the sky and the "next prayer" switch can lag; the chronometer then counts past zero until the next refresh.
- Before the first data arrives the widget shows the static layout: the mosque image and «باقي على الفجر» with an idle chronometer.
- Text inside the bitmap is drawn with the system font, not the app's Tajawal/Amiri fonts.
- Android only; `NativePrayerWidget` is inert on other platforms.

## Open issues

None.
