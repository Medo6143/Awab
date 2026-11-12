# Notifications and schedulers (التنبيهات)

> Status: Shipped · One notification centre runs a list of schedulers (prayers, athkar, qiyam/duha, daily wird, encouragement, custom reminders); every change to times or settings cancels everything and schedules it again.

## What it does

- Announces the five prayers (native adhan alarm, or a notification), with an optional heads-up 10 minutes before each.
- Reminds about morning and evening athkar, qiyam al-layl, duha, and the daily Quran wird.
- Sends up to ten short encouragement messages a day.
- Schedules the user's own reminders (see `docs/features/reminders.md`).
- Lets each category be switched off, plus one master switch.

## How the user reaches it

Home → gear on the sky hero → «التنبيهات والتذكيرات» (2 taps). Route `الإعدادات` with `{ section: 'alerts' }`. The page has the «تذكيراتي» row, the master switch «التنبيهات العامة», and under it the per-category switches (`NotificationSettings`). There is no notification inbox screen in the app.

## How it works

1. `App.tsx` calls `appDependencies.notifications.init()` once, which sets the foreground handler: show banner, list and play sound; no badge.
2. `useNotifications` (mounted in `App.tsx`) reruns whenever prayer times, `notificationPrefs`, `azanSettings`, the master switch, the reminders list or the reciter change. It debounces 1.5 s, then:
   - skips if the serialized inputs equal the last scheduled state (kept in memory, so the first run after every launch always schedules);
   - skips if the current minute is a prayer time and notifications already exist (to avoid cancelling an adhan that is about to fire);
   - calls `notifications.request()` (creates channels, asks for permission). If permission is denied or the master switch is off: `cancelAll()` and stop;
   - calls `notifications.rescheduleAll({ prefs, azan, timings, reminders, reciterFolder })`.
3. `ExpoNotificationCenter.rescheduleAll`: `cancelAll()` (each scheduler's known ids, each scheduler's `cancelExtra()` for native alarms, then `cancelAllScheduledNotificationsAsync`), a 300 ms pause, then `schedule(ctx)` on each scheduler in registration order.
4. Schedulers are registered in `src/data/container.ts`: `PrayerScheduler`, `AthkarScheduler`, `SpiritualScheduler`, `DailyWardScheduler`, `EncouragementScheduler`, `CustomReminderScheduler`. Adding a kind means adding one class implementing `ReminderScheduler`.
5. `scheduleDaily` (`src/data/notifications/expo.ts`) creates an expo DAILY trigger at hour:minute on a channel. Titles and bodies are prefixed with a right-to-left mark (`rtl()`), so Android lays them out RTL.

Categories:

| Category | Scheduler → ids | When it fires | Sound | Setting that controls it |
|---|---|---|---|---|
| Prayer, native adhan | `PrayerScheduler` → `AzanModule.scheduleAzan` | Each prayer time, exact alarm | Bundled adhan through the alarm stream | `prayers` on and `azanSettings.type` not `none` (Android) |
| Prayer, notification | `PrayerScheduler` → `prayer-<Id>` | Each prayer time, daily | the bundled adhan file on channel `azan`; default sound on channel `default` when type is `none` | `prayers`; used when type is `none`, off Android, or as the fallback when the native alarm fails |
| Before prayer | `PrayerScheduler` → `pre-prayer-<Id>` | `prePrayerReminderOffset` minutes before each prayer (10) | Default sound, channel `default` | `prePrayerReminderEnabled` (and `prayers`, since the scheduler returns early without it) |
| Morning athkar | `AthkarScheduler` → `athkar-morning` | 07:00 daily | Channel `default` | `athkar` |
| Evening athkar | `AthkarScheduler` → `athkar-evening` | 17:00 daily | Channel `default` | `athkar` |
| Duha | `SpiritualScheduler` → `spiritual-duha` | 09:00 daily | the bundled salawat file, channel `spiritual` | `duha` |
| Daily wird | `DailyWardScheduler` → `spiritual-ward` | `dailyWardTime` daily (05:00) | the bundled salawat file, channel `spiritual` | `dailyWardEnabled`, `dailyWardTime` |
| Encouragement | `EncouragementScheduler` → `encouragement-0..9` | 10 slots from 08:00, `encouragementInterval` hours apart (3), wrapping past midnight | the bundled salawat file, channel `spiritual` | `encouragementEnabled`, `encouragementInterval` |
| Custom, notification style | `CustomReminderScheduler` → `custom-<id>` or `custom-<id>-<day>` | The reminder's time; daily or weekly per chosen day | the bundled salawat file, channel `spiritual` | The reminder's own switch |
| Custom, alarm style | `CustomReminderScheduler` → `AzanModule.scheduleReminder` | The reminder's time, `setAlarmClock` | The reminder's chosen sound, alarm stream | The reminder's own switch |

All categories also require the master switch `settings.notificationsEnabled` and the OS notification permission.

Channels (`initializeChannels`, Android only):

| Channel id | Importance | Sound | Notes |
|---|---|---|---|
| `azan` | MAX | the bundled adhan file | vibration, public on lock screen, full-screen intent |
| `spiritual` | HIGH | the bundled salawat file | vibration |
| `default` | DEFAULT | system default | |
| `azan_channel_v2` (created by `AzanService`) | HIGH | none (the service plays audio itself) | bypasses DND, no vibration |

## Code map

| Layer | File | Role |
|---|---|---|
| Hook | `src/presentation/hooks/useNotifications.ts` | When to reschedule; notification listeners; opens adhan and reminder screens |
| UI | `src/presentation/components/settings/SettingsComponents.tsx` | `NotificationSettings`: category switches, wird time, encouragement interval |
| UI | `src/presentation/screens/SettingsScreen.tsx` | Alerts section, master switch |
| Data | `src/data/notifications/ExpoNotificationCenter.ts` | Permissions, cancel-all, reschedule-all, scheduled count |
| Data | `src/data/notifications/expo.ts` | Lazy `expo-notifications` require, `scheduleDaily`, channels, `rtl` |
| Data | `src/data/notifications/PrayerScheduler.ts` | Prayers and pre-prayer reminders |
| Data | `src/data/notifications/ReminderSchedulers.ts` | `AthkarScheduler`, `SpiritualScheduler`, `DailyWardScheduler`, `EncouragementScheduler` |
| Data | `src/data/notifications/CustomReminderScheduler.ts` | The user's own reminders |
| Domain | `src/domain/services/Notifications.ts` | `NotificationCenter`, `ReminderScheduler`, `ScheduleContext` |
| Domain | `src/domain/entities/notifications.ts` | `NotificationPrefs`, defaults, `parseClock`, `minusMinutes`, `dailySlots` |
| Domain | `src/domain/entities/prayer.ts` | `prayerFromNotification`: tells an adhan notification from the others |
| DI | `src/data/container.ts` | Scheduler list |
| Store | `src/presentation/store/slices/settingsSlice.ts` | `notificationsEnabled`, `notificationPrefs`, `azanSettings` |

## State and storage

`settings.notificationPrefs` (persisted under `persist:root_v6`), defaults from `DEFAULT_NOTIFICATION_PREFS`:

| Field | Default | In the UI |
|---|---|---|
| `prayers`, `athkar`, `qiyam`, `duha` | true | switches |
| `prePrayerReminderEnabled` / `prePrayerReminderOffset` | true / 10 | switch only; the offset has a reducer but no control |
| `dailyWardEnabled` / `dailyWardTime` | true / `05:00` | switch + chips 01:00, 05:00, 10:00, 16:00, 21:00, 23:00 |
| `encouragementEnabled` / `encouragementInterval` | true / 3 | switch + chips 1, 2, 3, 4, 6, 8 hours |
| `dailyReminder` | true | switch «تذكير يومي منوّع», read by no scheduler |
| `ramadan` | true | no control, read by no scheduler |

Scheduled notifications themselves live in expo-notifications' own Android store; native alarms live in SharedPreferences `azan_prefs` (see `docs/features/adhan.md`).

## Native, notifications and permissions

- `POST_NOTIFICATIONS` (Android 13+), requested by `ExpoNotificationCenter.request()` during the first reschedule, about 1.5 s after prayer times first load.
- `expo-notifications` is always loaded lazily with `require` because importing it at module load binds JSI too early in this app.
- In Expo Go, `init()` and channel creation are skipped.
- R8 keep rules in `plugins/withOwwabNative.js` preserve `expo.modules.notifications` and Java-serialization members; without them scheduled notifications never fire in release builds.
- The sounds are bundled through the `expo-notifications` plugin entry in `app.json` (`assets/audio/azan.mp3`, `assets/audio/sali_ala_nabii.mp3`, `assets/audio/takbir.mp3`).

## External services

None. All notifications are local; there is no push server.

## Settings that affect it

Master switch, the category switches, wird time, encouragement interval, adhan sound type, prayer method and Asr school (they move prayer-based times), the reminders list, and the selected reciter (changes the recitation URLs of alarm reminders).

## Edge cases and limitations

- Encouragement slots collide. Ten slots at a 3-hour interval span 30 hours, so slots 8 and 9 land again on 08:00 and 11:00; with 6 or 8 hours, three or four messages fire at the same minute. Only the 1 and 2 hour settings give ten distinct times.
- Everything is rescheduled on each app launch and on any input change; there is no incremental update.
- Prayer-based notifications use the clock times of the day they were scheduled until the app is opened again.
- Qiyam (02:00), duha (09:00) and athkar (07:00, 17:00) times are fixed and not tied to prayer times.
- Channel names are English ("Azan Notifications", "Spiritual Reminders", "General Notifications") in an Arabic app. Channel settings cannot be changed after creation, so sound changes need a new channel id.
- The pre-prayer reminder asks for high priority but sits on the DEFAULT-importance channel, so it does not appear as a heads-up on Android 8+.
- `CustomReminderScheduler.ids` is empty; its expo notifications are removed only by the global cancel-all.
- Notification bodies contain emoji characters hard-coded in the scheduler strings.

## Open issues

- #11 — Adhan and reminder sounds are too quiet.
- #12 — Qiyam al-layl sound is cut off before it finishes.
- #14 — Adhan notification covers the full-screen adhan.
- Qiyam al-layl is no longer a switch here (#18, closed): it is only the «قيام الليل» reminder in «تذكيراتي». Store migration 7 turned an existing switch into that reminder (02:00, notification, salawat); `spiritual-qiyam` stays in `SpiritualScheduler.ids` only so a reschedule cancels the copy older versions armed.
