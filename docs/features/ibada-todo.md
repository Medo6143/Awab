# Daily worship checklist («العبادات» / «عبادات اليوم»)

> Status: Shipped · A daily to-do list of prayers, sunnah, athkar and good deeds that resets each day and feeds the statistics.

## What it does

- Three progress rings on top: obligatory prayers, sunnah, and "athkar and wird".
- The five prayers as squares; the next prayer has a gold edge; a prayer whose time has not come is dimmed and cannot be ticked.
- Rows for sunnah and for athkar/wird tasks, and chips for small good deeds («خير اليوم»).
- The user can add custom tasks (they appear as chips) and delete them with a long press.
- A shortcut «ذكّرني بيها» next to the sunnah heading opens the reminders screen.

## How the user reaches it

| Path from launch | Taps |
|---|---|
| Home grid tile «العبادات» | 1 |
| Home, day stats tile «الصلوات» | 1 |

Route name: `العبادات` in `src/presentation/navigation/AppNavigation.tsx`. The grid tile is in `src/presentation/components/home/HomeSections.tsx`.

## How it works

**Default tasks (15)**

| Category | Shown as | Task ids |
|---|---|---|
| `obligatory` (5) | Squares «الفرائض» | `fajr`, `dhuhr`, `asr`, `maghrib`, `isha` |
| `sunnah` (4) | Rows «السنن والنوافل» | `rawatib`, `duha`, `witr`, `qiyam_al_layl` |
| `daily` (3) | Rows «الأذكار والورد» | `athkar_morning`, `athkar_evening`, `quran_reading` |
| `voluntary` (3 + custom) | Chips «خير اليوم» | `fasting`, `sadaqah`, `silat_al_rahm`, `custom_<timestamp>` |

**Ticking a task** (`useToggleIbada`)

1. If the task is one of the five prayers and is being ticked, `prayerNotYet` compares the current clock time with today's time for that prayer from the cached timings. If the time has not come, a warning haptic and an alert «لم يدخل الوقت بعد» with the time are shown and nothing changes.
2. Otherwise: selection haptic, `toggleTask(id)` in the `ibada` slice, and `logPrayer({ prayerId: id, isCompleted })` in the `stats` slice.
3. Unticking is always allowed.

`logPrayer` is used for every task, not only prayers: the day's `prayers` array in stats holds the ids of all ticked tasks. For `qiyam_al_layl` ticked before 06:00, stats record it under the previous day.

**Daily reset**

- `syncIbadaDailyReset` runs when Home or this screen mounts. If `lastResetDate` is not today's local date, every task is unticked (custom tasks are kept) and the date is updated.

**Custom tasks**

- Added from the `+` in the header or the «مهمة» chip. Name is trimmed; empty names are ignored. Id `custom_<Date.now()>`, category always `voluntary`.
- Long press on a custom chip asks for confirmation, then `removeCustomTask`. Built-in tasks cannot be removed (the reducer only removes ids starting with `custom_`).

**Rings**

- `done / total` per category for `obligatory`, `sunnah` and `daily`. The `voluntary` chips have no ring.

**Prayer data** (`usePrayerTimes`)

- Supplies `timings` (for the lock), `nextPrayer` (gold edge) and `date.hijri` (header subtitle with the weekday).

## Code map

| Layer | File | Role |
|---|---|---|
| Screen | `src/presentation/screens/IbadaTodoScreen.tsx` | Layout, add and remove tasks |
| Components | `src/presentation/components/ibada/IbadaComponents.tsx` | `IbadaRings`, `PrayerSquares`, `TaskRow`, `DeedChips` |
| Components | `src/presentation/components/ibada/IbadaConstants.ts` | `IBADA_CATEGORIES` (not imported anywhere) |
| Components | `src/presentation/components/tasbeeh/TasbeehModals.tsx` | `InputModal` reused for "new task" |
| Hook | `src/presentation/hooks/useToggleIbada.ts` | `useToggleIbada`, `prayerNotYet` |
| Hook | `src/presentation/hooks/usePrayerTimes.ts` | Timings, next prayer, Hijri date |
| Store | `src/presentation/store/slices/ibadaSlice.ts` | Tasks and daily reset |
| Store | `src/presentation/store/slices/statsSlice.ts` | `logPrayer` |
| Other callers | `src/presentation/screens/PrayerTimesScreen.tsx`, `src/presentation/components/reminders/ReminderAlarm.tsx` | Also tick tasks through `useToggleIbada` |

## State and storage

Slice `ibada` (persisted via redux-persist, key `root_v6`, AsyncStorage):

| Field | Type | Meaning |
|---|---|---|
| `tasks` | `IbadaTask[]` (`id`, `name`, `category`, `isCompleted`) | Built-in and custom tasks with today's state |
| `lastResetDate` | `YYYY-MM-DD` (local) | Day the list was last reset |

History is not kept here. Past days live in `stats.dailyRecords[date].prayers` as arrays of task ids.

## Native, notifications and permissions

- None of its own. Haptics through `expo-haptics`.
- The reminders themselves are configured on the reminders screen (route `التذكيرات`, `src/presentation/screens/RemindersScreen.tsx`), which this screen only links to.

## External services

None directly. Prayer times come from the prayer feature's cache (`prayer.cachedData`), which is filled from the prayer times API elsewhere.

## Settings that affect it

- Prayer calculation settings (method, Asr method) change the timings and therefore when a prayer can be ticked.
- No setting of its own.

## Edge cases and limitations

- The time lock compares against today's times only. After midnight the list has reset, so last night's Isha can no longer be ticked for the previous day.
- If no timings are cached yet, `prayerNotYet` returns null and every prayer can be ticked at any time.
- `athkar_morning`, `athkar_evening` and `quran_reading` are manual checkboxes. They are not linked to progress on the Athkar screen or to pages read in the mushaf.
- The ring for sunnah counts `qiyam_al_layl` (4 tasks), although the default list declares it after the `daily` tasks.
- Custom tasks are always created as `voluntary`; the `category` parameter of `addCustomTask` is never given another value.
- The stats code also accepts the misspelled id `qiyan_al_layl`; no task with that id is created by the current code.
- If the app stays open across midnight, the reset happens only when Home or this screen mounts again.

## Open issues

- #13 — Zero is displayed as a diamond (◆) in counters (reported for the Home «الصلوات» tile that leads here; this screen's own rings were not listed)
- #18 — Qiyam al-layl is configured in two different places (related: qiyam is a task here and a reminder elsewhere)
