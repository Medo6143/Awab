# Custom reminders and alarms (تذكيراتي)

> Status: Shipped · The user's own reminders for any act of worship, at a clock time or relative to a prayer, on chosen weekdays, delivered either as a plain notification or as a full-screen alarm with its own sound, snooze and slide-to-confirm.

## What it does

- Six presets: qiyam al-layl, Quran wird, duha, Monday/Thursday fasting, Surat al-Kahf, and a free-form custom reminder.
- Each reminder has a title, a message, a time (fixed clock time, or minutes before/after one of the five prayers), weekdays, and a style.
- Style «إشعار»: a normal notification.
- Style «منبّه»: a full-screen alarm over the lock screen with a looping sound that rises in volume, a picture, a verse or hadith, snooze, and a slide-to-confirm "done".
- "Done" on a qiyam or duha alarm also ticks that task in the worship list; on a Quran or Kahf alarm it opens the mushaf.

## How the user reaches it

| Path | Taps to the editor | Route |
|---|---|---|
| Home → gear → «التنبيهات والتذكيرات» → «تذكيراتي» → + | 4 | `الإعدادات` (`section: 'alerts'`) → `التذكيرات` |
| Home → «العبادات» tile → «ذكّرني بيها» (next to «السنن والنوافل») → + | 3 | `العبادات` → `التذكيرات` |

With an empty list the screen shows one-tap preset buttons that add a reminder directly without opening the editor. Tapping an existing card opens the editor for it. The alarm screen itself is a `Modal` mounted in `App.tsx`, opened by the native alarm.

## How it works

Presets (`src/domain/entities/reminders.ts`):

| Kind | Default time | Days | Default style | Default sound |
|---|---|---|---|---|
| `qiyam` | 60 min before Fajr | every day | alarm | recitation, al-Muzzammil 1-4 |
| `quran` | 30 min after Isha | every day | alarm | recitation, al-Muzzammil 4 |
| `duha` | 09:00 | every day | notification | takbir |
| `fasting` | 60 min after Isha | Sunday, Wednesday (the evenings before) | notification | takbir |
| `kahf` | 10:00 | Friday | notification | takbir |
| `custom` | 08:00 | every day | notification | takbir |

Editor (`ReminderEditor`): time steppers move the hour by 1 and the minute by 5; prayer offsets are -60, -30, 0, +15, +30, +60 minutes; snooze is 5, 10 or 15 minutes (default 10); sounds are recitation, takbir, salawat, or the phone's alarm tone; three pictures. The play button previews a sound for 8 seconds through the native service. A custom reminder needs a title to be saved.

Scheduling: saving dispatches `saveReminder`; `useNotifications` sees `reminders.list` change and runs the full reschedule 1.5 s later. `CustomReminderScheduler` then, for each enabled reminder:

1. Resolves the time with `resolveReminderTime` against today's prayer times (a prayer-relative reminder with no times available is skipped).
2. Alarm style with the native module present: `AzanModule.scheduleReminder(json)`. The payload is `{ id, title, body, hour, minute, days (Calendar numbering, Sunday = 1), sound }`, where `sound` is `raw:takbir`, `raw:sali_ala_nabii`, `system`, or `urls:` followed by everyayah.com MP3 links for the chosen reciter.
3. Otherwise: expo notifications on the `spiritual` channel with the salawat sound; one DAILY trigger (`custom-<id>`) when no days are chosen, else one WEEKLY trigger per day (`custom-<id>-<day>`).

Native alarm (`native/android/java/ReminderAlarms.java`):

- `schedule` arms `AlarmManager.setAlarmClock` for the next matching day (never deferred by Doze; the system shows it as the next alarm), saves the JSON under `reminder_schedule`, and downloads recitation files in a background thread to the app's files directory so they play offline.
- When it fires, `AzanReceiver` starts `AzanService` and re-arms the reminder for its next day. `BootReceiver` re-arms all saved reminders after reboot, update, time or zone change.
- `AzanService.startReminder`: foreground notification with an «إيقاف» action and a full-screen intent, 60 s screen wake lock, opens `MainActivity` with `prayerName = "reminder:<id>"` when the overlay permission is granted, then plays the playlist in a loop with a 1.5 s pause between rounds. Volume starts at 25 % and rises linearly to 100 % over 30 s. The alarm stops by itself after 5 minutes.
- Missing sound (recitation not downloaded yet, unknown raw name) falls back to the bundled salawat.
- Snooze arms a separate one-shot alarm at now + N minutes; the repeating alarm stays armed.

Alarm screen (`ReminderAlarm`): `useNotifications` strips the `reminder:` prefix and dispatches `showReminderAlarm(id)`. The modal ignores the hardware back button. Stop and done call `stopAzan()` and `releaseLockScreen()`.

## Code map

| Layer | File | Role |
|---|---|---|
| Screen | `src/presentation/screens/RemindersScreen.tsx` | List, toggles, empty-state presets, readiness card when an alarm is enabled |
| Component | `src/presentation/components/reminders/ReminderEditor.tsx` | Add/edit sheet, sound preview |
| Component | `src/presentation/components/reminders/ReminderAlarm.tsx` | Full-screen alarm, slide-to-confirm, snooze |
| Component | `src/presentation/components/reminders/art.ts` | Picture lookup for the three artworks |
| Screen | `src/presentation/screens/IbadaTodoScreen.tsx` | «ذكّرني بيها» shortcut |
| Screen | `src/presentation/screens/SettingsScreen.tsx` | «تذكيراتي» row in the alerts section |
| Hook | `src/presentation/hooks/useNotifications.ts` | Reschedule trigger; opens the alarm from the native event |
| Data | `src/data/notifications/CustomReminderScheduler.ts` | `reminderSoundSpec`, `reminderPayload`, native or expo scheduling |
| Data | `src/data/services/nativeModules.ts` | `scheduleReminder`, `cancelAllReminders`, `snoozeReminder`, `getRingingReminder`, `previewReminderSound` |
| Domain | `src/domain/entities/reminders.ts` | Types, presets, `resolveReminderTime`, `newReminder` |
| Store | `src/presentation/store/slices/remindersSlice.ts` | `saveReminder`, `removeReminder`, `toggleReminder` |
| Store | `src/presentation/store/slices/uiSlice.ts` | `ringingReminder` |
| Native | `native/android/java/ReminderAlarms.java` | Arm, snooze, cancel, persist, audio prefetch |
| Native | `native/android/java/AzanService.java` | Reminder playback, ramp, 5-minute cap, preview |
| Native | `native/android/java/AzanReceiver.java` | Receives the alarm, re-arms |
| Native | `native/android/java/AzanModule.java` | JS bridge methods |

## State and storage

- Redux `reminders.list: Reminder[]` (`id, kind, title, message, time, days, style, sound, art, snoozeMinutes, enabled`), persisted under `persist:root_v6`.
- Redux `ui.ringingReminder` (id or null), not persisted.
- Native SharedPreferences `azan_prefs`, key `reminder_schedule`: JSON array of armed alarm payloads. It is wiped and rebuilt on every reschedule.
- Downloaded recitations: a `reminder_audio` folder in the app's files directory, one file per URL; never cleaned up.

## Native, notifications and permissions

- Same permissions as the adhan: exact alarms, full-screen intent, overlay, battery exemption, notifications. `RemindersScreen` shows `AzanReadinessCard` under «عشان المنبّه يشتغل» when at least one enabled reminder is an alarm.
- Without exact-alarm permission `ReminderAlarms.arm` returns false and only logs; the reminder is saved but does not ring, and JS is not told.
- Notification-style reminders use the `spiritual` channel (importance HIGH, salawat sound). Alarm-style ones use the service channel `azan_channel_v2`.

## External services

| Host | Sent | Returned |
|---|---|---|
| `everyayah.com` | GET for each ayah file of the preset's recitation, in the selected reciter's folder (default Alafasy 128 kbps) | MP3 files, cached on the phone |

No reminder content leaves the phone.

## Settings that affect it

- The notifications master toggle («التنبيهات العامة»): when off, every reminder, including native alarms, is cancelled.
- The selected reciter (Settings → «المصحف والتفسير») chooses the recitation voice.
- Prayer calculation method and Asr school move prayer-relative reminders.
- Qiyam al-layl lives only here (#18). The older «تنبيه قيام الليل» switch was removed; store migration 7 (`src/presentation/store/migrations.ts`) gave whoever had it on a «قيام الليل» reminder at 02:00 (notification, salawat sound), id `qiyam-from-settings`. «تنبيه صلاة الضحى» is still a separate switch in the notification settings.

## Edge cases and limitations

- A prayer-relative reminder is converted to a fixed clock time when scheduled. It follows the prayer only as often as the app is opened and reschedules.
- Scheduling a recitation alarm while offline leaves no audio file, so it rings with the salawat until a later reschedule downloads it.
- A playback error on one file is swallowed (`setOnErrorListener` returns true without advancing), which stops the loop silently.
- Every reschedule cancels pending snoozes along with the alarms (`cancelAll` cancels both intents), so a snooze can be lost if the app restarts before it fires.
- The snooze fallback payload in `ReminderAlarm` omits the reciter folder and so uses the default reciter.
- With the native module missing, alarm-style reminders silently become notifications.
- Tapping a notification-style reminder only opens the app; it does not open any screen for that reminder.
- The editor always starts a new reminder from the qiyam preset.

## Open issues

- #9 — UX: reminders are buried inside Settings.
- #11 — Adhan and reminder sounds are too quiet. Relevant code: the ramp starts at 25 % and playback follows the alarm-stream volume.
- #12 — Qiyam al-layl sound is cut off before it finishes. Cause Not verified; candidates in code are the 5-minute cap, the swallowed player error, and the older fixed 02:00 qiyam notification whose sound is a short channel sound.
- #18 (closed) — Qiyam al-layl was configured in two places: the «تنبيه قيام الليل» toggle (fixed 02:00 notification from `SpiritualScheduler`) and the `qiyam` preset here.
