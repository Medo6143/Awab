# Adhan (الأذان)

> Status: Shipped · At each prayer time a native exact alarm starts a foreground service that plays the adhan on the alarm stream, lights the screen and opens a full-screen adhan page over the lock screen; it survives Doze and reboot.

## What it does

- Plays the adhan at the minute of each of the five prayers, even with the app closed and the phone on silent.
- Opens a full-screen adhan page: mosque artwork, the prayer name, the line of the adhan being called with what to say back, a verse about that prayer, and a stop button.
- After the adhan ends, shows the post-adhan dua for 90 seconds and then closes by itself.
- Posts an ongoing notification with an «إيقاف الأذان» action.
- Re-arms itself for the next day, and after a reboot, a time change or an app update.
- Shows a readiness checklist («جاهزية الأذان») with a fix button per missing permission.

## How the user reaches it

- The adhan page is not navigated to; it is a `Modal` mounted in `App.tsx` and opened by the alarm.
- Sound choice and readiness: Home → gear on the sky hero → «الصلاة والأذان» (2 taps). Route `الإعدادات` with `{ section: 'prayer' }`.
- The readiness card also appears on «تذكيراتي» (route `التذكيرات`) when an alarm-style reminder is enabled.

## How it works

Scheduling (JS → native):

1. `useNotifications` (mounted once in `App.tsx`) waits 1.5 s after any change to timings, prefs, azan settings, the master toggle, reminders or reciter, then calls `notifications.rescheduleAll(...)`. It skips when nothing changed since the last run, and when the current minute equals a prayer time and notifications already exist.
2. `ExpoNotificationCenter.rescheduleAll` cancels everything, waits 300 ms, then runs each scheduler.
3. `PrayerScheduler` (needs `prefs.prayers`): on Android with a sound type other than `none`, it calls `AzanModule.scheduleAzan(id, name, hour, minute, type)` per prayer. If the module is missing or rejects (exact-alarm permission), it falls back to a daily expo notification on the `azan` channel with `fullScreenIntent`.
4. `AzanModule.scheduleAzan` sets `setExactAndAllowWhileIdle(RTC_WAKEUP)` for the next occurrence of hour:minute (tomorrow if already passed) and saves `{id, name, type, time, hour, minute}` to SharedPreferences.

Firing (native):

1. `AzanReceiver` starts `AzanService` as a foreground service and immediately re-arms the same prayer for tomorrow at the same clock time (corrected when the app next opens with fresh times).
2. `AzanService` calls `startForeground` with a `CATEGORY_ALARM`, `PRIORITY_MAX`, full-screen-intent notification on channel `azan_channel_v2` (importance HIGH, silent, bypasses DND).
3. It wakes the screen with a 60 s bright wake lock, and, only if "draw over other apps" is granted, starts `MainActivity` directly with `isAzanTriggered=true`.
4. It plays the raw resource `azan` through `MediaPlayer` with `USAGE_ALARM` (alarm volume, ignores ringer/silent), a partial wake lock and transient audio focus. On completion or error the service stops itself.

Showing the page (native → JS):

1. The plugin patches `MainActivity`: for an `isAzanTriggered` intent it sets show-when-locked, turn-screen-on and keep-screen-on, stores the prayer name with `AzanModule.setPendingAzan`, and emits `onAzanTriggered` through `ReactHost.currentReactContext` (bridgeless-safe).
2. `NativeAzanAlarms.onTriggered` (app running) and `getPending()` (cold start) feed `useNotifications`, which dispatches `showAzanModal(name)`. Names starting with `reminder:` open the reminder alarm instead.
3. `AzanVideoModal` polls every 400 ms: native position (`getAzanPositionMs`), else the in-app player's position, else time since opening. `adhanLineAt` maps seconds to one of the 12 lines in `src/domain/entities/adhan.ts`. `done` is set when the player that was heard stops, or after 133.5 s.
4. Closing calls `azanAlarms.stop()` (service `STOP_AZAN`), stops the in-app sound and `releaseLockScreen()` clears the lock-screen flags.

In-app path: for the expo fallback notification, a tapped prayer notification, or a launch within 3 minutes of a prayer with no notification response, `useNotifications` plays `assets/audio/azan.mp3` through expo-av (`azanSound.play`) and opens the modal.

## Code map

| Layer | File | Role |
|---|---|---|
| UI | `src/presentation/components/azan/AzanVideoModal.tsx` | Full-screen adhan page and post-adhan dua |
| UI | `src/presentation/components/settings/AzanReadinessCard.tsx` | Checklist; re-checks when the app returns to foreground |
| UI | `src/presentation/components/settings/AzanConstants.ts` | `AZAN_TYPES` chips; `MUEZZINS` (unused) |
| UI | `src/presentation/components/settings/SettingsComponents.tsx` | `AzanSelector` |
| Hook | `src/presentation/hooks/useNotifications.ts` | Reschedule cycle, listeners, opens the modal, boot-failure alert |
| Hook | `src/shared/hooks/useAzanPermissions.ts` | `getReadiness()` and permission checks |
| Data | `src/data/notifications/PrayerScheduler.ts` | Native alarm or expo fallback per prayer |
| Data | `src/data/services/NativeAzanAlarms.ts` | `AzanAlarms` over the native module |
| Data | `src/data/services/nativeModules.ts` | Typed access to `AzanModule` |
| Data | `src/data/services/AudioService.ts` | `ExpoAudioPlayer.play()`: in-app adhan via expo-av |
| Domain | `src/domain/services/AzanAlarms.ts` | Interface |
| Domain | `src/domain/entities/adhan.ts` | Line timings, `ADHAN_END`, post-adhan dua |
| Native | `native/android/java/AzanModule.java` | Schedule, cancel, permission checks, stop, pending name, boot flag |
| Native | `native/android/java/AzanReceiver.java` | Alarm receiver, re-arm for tomorrow |
| Native | `native/android/java/AzanService.java` | Foreground service: notification, wake, playback |
| Native | `native/android/java/BootReceiver.java` | Re-arms saved alarms after boot, update, time or zone change |
| Native | `native/android/java/OemBatteryModule.java` | Battery exemption, MIUI app-ops, maker settings pages |
| Build | `plugins/withOwwabNative.js` | Copies native code, manifest entries, `MainActivity` patch, R8 keep rules |
| Build | `native/android/res/raw/owwab_keep.xml` | Keeps `azan`, `takbir`, `sali_ala_nabii` from resource shrinking |

## State and storage

- Redux: `settings.azanSettings` `{ type: 'none' | 'takbir' | 'full', visualAzanEnabled }` (defaults `full`, `true`), persisted. `ui.azanModal` `{ visible, prayerName }` is blacklisted from persistence so the page does not reopen on launch.
- Native SharedPreferences `azan_prefs`: `azan_schedule` (JSON array of armed alarms) and `boot_reschedule_failed` (boolean).
- `pendingPrayerName` is a static field in `AzanModule`; it is cleared when read.

## Native, notifications and permissions

Declared in `app.json`: `USE_FULL_SCREEN_INTENT`, `SCHEDULE_EXACT_ALARM`, `USE_EXACT_ALARM`, `RECEIVE_BOOT_COMPLETED`, `WAKE_LOCK`, `FOREGROUND_SERVICE`, `FOREGROUND_SERVICE_MEDIA_PLAYBACK`, `REQUEST_IGNORE_BATTERY_OPTIMIZATIONS`, `SYSTEM_ALERT_WINDOW`, `POST_NOTIFICATIONS`. The service is declared with `foregroundServiceType="mediaPlayback"`.

Readiness checklist (`getReadiness`):

| Item | Check | Fix opens |
|---|---|---|
| الإشعارات | expo notification permission | permission prompt |
| المنبهات الدقيقة | `canScheduleExactAlarms` (Android 12+) | exact-alarm settings |
| شاشة الأذان فوق القفل | `canUseFullScreenIntent` (Android 14+) | full-screen-intent settings |
| استثناء من توفير البطارية | `isIgnoringBatteryOptimizations` | system exemption dialog |
| الظهور فوق التطبيقات | `Settings.canDrawOverlays` | overlay settings |
| MIUI: lock screen, background start | app-ops 10020 and 10021 (Xiaomi, Redmi, POCO) | MIUI permission editor |
| Other makers' lock-screen switch | not readable; shown as "unknown" for Oppo, Realme, OnePlus, Vivo, Huawei, Honor | maker page or app details |
| Maker autostart | "unknown" for 8 listed vendors | autostart page or app details |

Reboot: `BootReceiver` handles BOOT_COMPLETED, QUICKBOOT_POWERON, MY_PACKAGE_REPLACED, TIME_SET and TIMEZONE_CHANGED. Passed slots roll forward to the next occurrence. Without exact-alarm permission it sets `boot_reschedule_failed`, and the app shows «تنبيه: الأذان متوقف» on next launch.

## External services

None. The adhan audio is bundled (`assets/audio/azan.mp3`, copied to Android raw resources by the expo-notifications plugin's `sounds` list in `app.json`).

## Settings that affect it

- «صوت الأذان»: silent (`none`), takbir only, full adhan. `none` skips the native alarm and schedules a plain expo notification on the `default` channel.
- Notifications master toggle and «مواقيت الصلاة» category: turning either off cancels all alarms.
- Calculation method and Asr school change the times and trigger a reschedule.
- `visualAzanEnabled` gates the page, but there is no control for it in the settings UI.

## Edge cases and limitations

- "Takbir only" is not implemented in playback: `AzanService.playAzan()` always loads the raw resource `azan` and `ExpoAudioPlayer.play()` always loads `assets/audio/azan.mp3`; the `type` argument is only logged.
- Possible double audio (Not verified on a device): on a launch within 3 minutes of a prayer with no notification response, `useNotifications` starts the in-app adhan, including when the launch was caused by the native service that is already playing.
- Without the overlay permission the service does not start the activity itself and relies on the notification's full-screen intent, which Android only honours when the phone is locked or idle.
- The daily re-arm reuses yesterday's clock time until the app is opened and fetches new times.
- `rescheduleAll` runs on every app launch (the "unchanged" guard is in memory only), cancelling and re-arming all alarms.
- `AzanModule` exposes `testAzan` and `getScheduledAzans`, and `useAzanPermissions` exposes `scheduleAzanSafely`; none is called from JS.
- iOS has no native path; only the expo notification applies.

## Open issues

- #11 — Adhan and reminder sounds are too quiet. Relevant code: playback uses the alarm stream (`USAGE_ALARM`), so loudness follows the phone's alarm volume, and the service never raises the stream volume.
- #14 — Adhan notification covers the full-screen adhan. Relevant code: the service posts a `PRIORITY_MAX` notification on a HIGH-importance channel and also starts the activity, so the heads-up banner appears on top of the page.
