# Statistics and daily report («الإحصائيات» / «رحلتك»)

> Status: Shipped · A journey screen built from per-day records (ticked tasks, dhikr counts, Quran pages) with streaks, charts, a heatmap, a day-by-day ledger and a shareable report.

## What it does

- Two views: «اليوم» and «آخر ٣٠ يوم».
- Streak card (current and longest run of days with any record).
- Three numbers: obligatory prayers kept (%), Quran pages, tasbeeh count.
- Weekly bar chart of dhikr, a 12-week heatmap, a qiyam and fasting card, a dhikr breakdown, and a ledger of days grouped by month.
- A report modal for today, for any past day, or for the last 30 days, with a "share" button (plain text).

## How the user reaches it

| Destination | Path from launch | Taps |
|---|---|---|
| Stats screen (route `الإحصائيات`) | Home sky button «الإحصائيات» | 1 |
| Today's report | Home, «التقرير اليومي» next to the «الأقسام» heading | 1 |
| Report from Stats | Stats → streak card, or a day row in «دفتر العبادات» | 2 |

The route is in `src/presentation/navigation/AppNavigation.tsx`. The «التقرير اليومي» action is rendered by `HomeGrid` in `src/presentation/components/home/HomeSections.tsx`.

## How it works

**Where records come from** (`stats.dailyRecords[YYYY-MM-DD]`)

| Action | Writer | Field |
|---|---|---|
| Tick or untick any worship task | `logPrayer` via `useToggleIbada` | `prayers` (array of task ids) |
| Tap in tasbeeh, floating tasbeeh or athkar | `logDhikr` | `dhikrCount`, `dhikrDetails[name]` |
| Turn to a mushaf page | `logQuranPage` in the Quran screen | `quranPages` (unique page numbers) |

`qiyam_al_layl` ticked before 06:00 is stored under the previous day.

**Numbers on the screen**

| Element | Rule |
|---|---|
| Current streak | Consecutive days that have a record, counting back from today (or from yesterday if today has none); loop capped at 400 days |
| Longest streak | Longest run of consecutive dates among all records |
| «الصلوات» % | Obligatory prayer ids ticked over the last `n` calendar days ÷ (`n` × 5); `n` = 1 for today, 30 for the month, never more than days since the first record |
| Pages, tasbeeh | Today: today's record. Month: sum over the 30 most recent records |
| Weekly chart | `dhikrCount` for the last 7 calendar days; bar height relative to `max(values, 100)` |
| Heatmap | 12 weeks, Sunday to Saturday. Score = ticked tasks + 1 if any dhikr + 1 if any page. Level 3 at 6 or more, 2 at 3 or more, 1 above 0 |
| Qiyam and fasting | Today: whether `qiyam_al_layl` / `fasting` is in today's `prayers`. Month: nights with qiyam in the range |
| Ledger | Records grouped by month, newest first; the current month starts expanded |

Old records keyed by `Date.toDateString()` are folded onto `YYYY-MM-DD` for the ledger, heatmap, longest streak and prayer share.

**Report modal** (`DailyReportModal`)

- Day report: lists the current ibada tasks, marking each done if its id is in that day's `prayers`. Percentage = done ÷ total tasks.
- Feedback tiers for a day: 100% «مقام الإحسان», 80% or more «درجة المتقين», 50% or more «سبّاق بالخيرات», otherwise «بداية الرحلة».
- Month report: totals for the last 30 records; no task list.
- Share sends plain text through React Native `Share`: title, date, tasbeeh count, Quran pages, tasks done.
- From Home the modal gets the live ibada tasks and today's record.

## Code map

| Layer | File | Role |
|---|---|---|
| Screen | `src/presentation/screens/StatsScreen.tsx` | All calculations and layout |
| Components | `src/presentation/components/stats/StatsComponents.tsx` | `StatCard`, `WeeklyActivityChart`, `DhikrBreakdownChart`, `StatusRow`, `StreakCard`, `Heatmap` |
| Components | `src/presentation/components/stats/StatsStyles.ts` | Styles |
| Components | `src/presentation/components/home/DailyReportModal.tsx` | Report modal and text share |
| Components | `src/presentation/components/home/DayCards.tsx` | Home day stats tiles (read the same records) |
| Screen | `src/presentation/screens/HomeScreen.tsx` | Opens the daily report; today's tasbeeh number |
| Store | `src/presentation/store/slices/statsSlice.ts` | `dailyRecords`, `logPrayer`, `logDhikr`, `logQuranPage`, `getLocalToday` |
| Store | `src/presentation/store/slices/ibadaSlice.ts` | Task list used to render reports |
| Store | `src/presentation/store/slices/achievementsSlice.ts` | Registered but unused (see below) |

## State and storage

Slice `stats` (persisted via redux-persist, key `root_v6`, AsyncStorage):

| Field | Type |
|---|---|
| `dailyRecords` | `Record<string, DayStats>` keyed by local `YYYY-MM-DD` |
| `DayStats.prayers` | `string[]` of task ids |
| `DayStats.dhikrCount` | number |
| `DayStats.dhikrDetails` | `Record<string, number>` keyed by dhikr text |
| `DayStats.quranPages` | `number[]` |
| `DayStats.minutesSpent` | number, always 0 (never written) |

Records are never pruned. Selected tab, expanded months and the open report are component state.

**achievementsSlice (verified with Grep).** `src/presentation/store/index.ts` imports the reducer and registers it as `achievements`, so its initial state (four badges, `streak: 0`) is persisted. No other file in `src/` or `App.tsx` imports the slice, dispatches `updateAchievementProgress`, `incrementStreak` or `resetStreak`, or reads `state.achievements`. The badges never progress and are shown nowhere; the streak on this screen is computed from `dailyRecords`, not from that slice.

## Native, notifications and permissions

None. The report is shared as text through the system share sheet.

## External services

None.

## Settings that affect it

- The accent theme colours the chart bars and report highlights (`useAccent`).
- No setting of its own.

## Edge cases and limitations

- The month view's pages, tasbeeh and qiyam totals use the 30 most recent *records*, not the last 30 calendar days, while the prayer percentage uses calendar days. With gaps in usage the two cover different periods.
- Month report: `tasks` is empty, so the percentage is 0 and the feedback is always «محطة مراجعة للذات»; the 80% branch cannot be reached. The `year` report type has texts but no caller.
- A day counts for the streak as soon as a record exists, even if the only task was later unticked.
- Past-day reports use today's task list: a custom task added later appears as "not done" on older days, and a deleted one disappears from them.
- Athkar taps are logged as dhikr under their full text, so they are included in the tasbeeh totals and the breakdown here (Home excludes them from its own number).
- The current streak and the month totals read the raw records; only some parts fold legacy date keys.
- `setDailyRecord` (slice) and `colorsRef` (components) are exported but unused.

## Open issues

- #13 — Zero is displayed as a diamond (◆) in counters (reported for the Home day stats, which read these records)
