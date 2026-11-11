# Home dashboard («الرئيسية»)

> Status: Shipped · The first tab: a sky header with the next prayer, today's Quran wird, three day counters, a grid of sections, and a random verse and hadith.

## What it does

Home is a single scrolling page made of five blocks, top to bottom:

1. **Sky hero** – greeting, weekday and Hijri date, the five prayers on an arc with a sun or moon at the current time, and a countdown to the next prayer. Two round buttons open Stats and Settings.
2. **Wird card («وردك اليوم»)** – today's reading goal in mushaf pages, pages read today, where to continue, and buttons to read, add pages for today («زوّد») or change the goal.
3. **Day stats** – three tiles: morning or evening athkar done, tasbeeh count today, prayers done out of 5.
4. **Sections grid («الأقسام»)** – eight shortcuts, with a «التقرير اليومي» action in the section title that opens the daily report.
5. **Message card («رسالة لك»)** – a random verse from the Quran messages plus a random hadith, with buttons to draw new ones.

Sections grid, in order (`GRID` in `src/presentation/components/home/HomeSections.tsx`):

| # | Label | Route | Screen |
|---|-------|-------|--------|
| 1 | القرآن | `TabQuran` | `QuranScreen` (tab) |
| 2 | القبلة | `القبلة` | `QiblaScreen` |
| 3 | الأدعية | `الأدعية` | `DuaScreen` |
| 4 | نور القلب | `نور_القلب` | `HeartJourneyScreen` |
| 5 | العبادات | `العبادات` | `IbadaTodoScreen` |
| 6 | الزكاة | `الزكاة` | `ZakatScreen` |
| 7 | رسائل القرآن | `رسائل_القرآن` | `QuranMessagesScreen` |
| 8 | الأحاديث | `الأحاديث` | `HadithLibraryScreen` |

Other taps on the page:

| Element | Goes to |
|---------|---------|
| Sky arc / countdown | `TabPrayer` |
| Stats button (sky header) | `الإحصائيات` |
| Settings button (sky header) | `الإعدادات` |
| Wird «كمّل القراءة» / «اقرأ أكتر» | `TabQuran` |
| Athkar tile | `TabAthkar` |
| Tasbeeh tile | `TabTasbeeh` |
| Prayers tile | `العبادات` |
| Verse in the message card | `رسائل_القرآن` with `{ mood }` |
| Hadith in the message card | `الحديث` with `{ id }` |

## How the user reaches it

Zero taps: `TabHome` is the first tab of `MainTabs`, the first stack route, so it is the launch screen once the animated splash fades. From elsewhere, tap «الرئيسية» in the bottom tab bar. Route name: `TabHome` (title «الرئيسية»).

## How it works

- **Greeting** (`getDynamicContent` in `HomeScreen.tsx`): picked from the Hijri date returned with the prayer times. Ramadan (month 9), Eid al-Fitr (1–3 Shawwal), Eid al-Adha (10–13 Dhul-Hijjah), Friday, otherwise «صباح الخير» before 12:00 and «مساء الخير» after. With no Hijri date yet it shows «أوّاب».
- **Sky phase** (`phaseAt` in `SkyHero.tsx`): night before Fajr and from Maghrib, dawn until sunrise, morning until Dhuhr, noon until Asr, golden until Maghrib. Without timings it falls back to night between 18:00 and 05:00, morning otherwise. The header re-evaluates every 60 s. Prayers marked done in the ibada list are drawn filled; the next prayer is lit.
- **Prayer times** come from `usePrayerTimes`: cached times render at once; a fresh fetch only happens when the cached day, method or Asr school differs. The same hook pushes the next prayer to the home-screen widget.
- **Wird**: the goal is `wirdGoal(wird, today)` from `src/domain/entities/wird.ts`. In `fixed` mode it is `wird.pages`; in `daily` mode it is null until the user picks a preset in the card, then that day's choice. `extra` pages for today are added on top. Pages read is the number of unique pages logged today (`stats.dailyRecords[today].quranPages`), which the mushaf logs on every page turn. Remaining time is estimated at 2 minutes per page. Presets: 1, 2, 5, 10 (hizb), 20 (juz); the stepper allows 1–60.
- **Continue point**: `quran.currentPage`; the surah name is the last surah whose start page is at or before it (`SURAH_START_PAGE` in `src/domain/entities/surahPages.ts`).
- **Day stats**: athkar switches from morning to evening at 15:00 and counts items whose completion count reached their target. Tasbeeh sums today's `dhikrDetails` but leaves out entries whose name is an athkar text. Prayers counts the five obligatory tasks completed in the ibada list.
- **Daily reset**: on mount Home dispatches `syncIbadaDailyReset`, which clears every task when the stored date is not today.
- **Message card**: one (mood, verse) pair is drawn at random on every mount, not once a day. Verse text is fetched through the Quran repository and falls back to the bundled plain text. The hadith is drawn 600 ms after mount so the ~2 MB local index does not delay first paint.
- **Daily report** (`DailyReportModal`): percentage of ibada tasks done, a title by band (100, ≥80, ≥50, below), today's tasbeeh total and pages read, a per-dhikr breakdown, the task list, and a plain-text share through the system share sheet.

## Code map

| Layer | File | Role |
|-------|------|------|
| Screen | `src/presentation/screens/HomeScreen.tsx` | Composes the page, greeting, derived counters, navigation |
| Component | `src/presentation/components/home/SkyHero.tsx` | `SkyHero`, `SkyBackdrop`, `SkyButton`, `phaseAt` |
| Component | `src/presentation/components/home/WirdCard.tsx` | Wird card, «زوّد» sheet, goal sheet |
| Component | `src/presentation/components/home/DayCards.tsx` | `DayStats` tiles |
| Component | `src/presentation/components/home/HomeSections.tsx` | `HomeGrid` and the `GRID` list |
| Component | `src/presentation/components/home/DailyMessageCard.tsx` | Random verse and hadith |
| Component | `src/presentation/components/home/DailyReportModal.tsx` | Daily report sheet and share text |
| Styles | `src/presentation/components/home/HomeStyles.ts` | Grid styles |
| Hook | `src/presentation/hooks/usePrayerTimes.ts` | Timings, next prayer, widget update |
| Hook | `src/presentation/hooks/useGuidance.ts` | `useVerseText` for the message card |
| Domain | `src/domain/entities/wird.ts` | `WirdState`, presets, `wirdGoal`, `pagesLabel` |
| Domain | `src/domain/entities/surahPages.ts` | Start page of each surah |
| Store | `src/presentation/store/slices/quranSlice.ts` | `currentPage`, `wird` and its three actions |
| Store | `src/presentation/store/slices/statsSlice.ts` | `dailyRecords`, `getLocalToday` |
| Store | `src/presentation/store/slices/ibadaSlice.ts` | Task list and the daily reset |
| Data | `src/data/notifications/ReminderSchedulers.ts` | `DailyWardScheduler` (wird notification) |
| Data | `src/data/hadith/hadithLibrary.ts` | `randomHadith` |
| Navigation | `src/presentation/navigation/AppNavigation.tsx` | `TabHome` registration |

## State and storage

Everything is in the persisted Redux store (redux-persist, AsyncStorage key `persist:root_v6`). Home has no storage of its own.

| Slice field | Read | Written from Home |
|-------------|------|-------------------|
| `quran.currentPage` | continue point | no |
| `quran.wird` (`pages`, `mode`, `today`, `extra`) | goal | `setWirdGoal`, `setTodayWird`, `addWirdToday` |
| `stats.dailyRecords[YYYY-MM-DD]` (`quranPages`, `dhikrCount`, `dhikrDetails`) | counters, report | no |
| `ibada.tasks`, `ibada.lastResetDate` | prayers tile, arc, report | `syncIbadaDailyReset` |
| `athkar.completionCounts` | athkar tile | no |
| `prayer.cachedData` (via `usePrayerTimes`) | timings, Hijri date | `setPrayerData` on fetch |
| `settings.accentTheme` (via `useAccent`) | report colours | no |

The picked verse and hadith are component state only and are lost on unmount.

## Native, notifications and permissions

- `usePrayerTimes` asks for foreground location (through `useLocation`) and calls `prayerWidget.update` with the next prayer, today's timings and a date line.
- `DailyWardScheduler` schedules one daily local notification, id `spiritual-ward`, channel `spiritual`, sound `sali_ala_nabii.mp3`, at `notificationPrefs.dailyWardTime`. Its text is fixed; it does not read the wird goal or progress. Home does not handle a tap on it (`data.type` is `ward`, no listener routes it).
- Haptics on wird and message-card buttons (`expo-haptics`).

## External services

| Host | Sent | Returned |
|------|------|----------|
| `api.aladhan.com` (`/timings`) | latitude, longitude, method, Asr school | Today's timings and Gregorian/Hijri date |
| `api.alquran.cloud` | surah and ayah range of the picked verse | Verse text (bundled plain text is the fallback) |

The device geocoder (`reverseGeocodeAsync`) resolves the country code used for the automatic method. The hadith comes from the bundled index; no request.

## Settings that affect it

| Setting | Effect on Home |
|---------|----------------|
| `prayerMethod`, `asrMethod` | Timings on the arc and countdown |
| `theme` | Page palette; sky colours are fixed per phase |
| `accentTheme` | Grid icon tiles, section title action, wird button and progress bar, report colours (see Open issues) |
| `notificationPrefs.dailyWardEnabled`, `dailyWardTime` | Wird notification |
| Wird goal and mode | Set in the card itself, not in Settings |

## Edge cases and limitations

- Pages read counts pages *opened* in the mushaf today, not pages finished; flipping through pages completes the wird.
- The evening switch (15:00) and the greeting switch (12:00) are fixed clock hours, not tied to prayer times.
- The Hijri date is the one returned by the API for the fetch day; the weekday is computed locally.
- If Isha is not later than Fajr on the clock (after-midnight Isha), the arc is not drawn and only the countdown shows.
- Tasbeeh excludes a dhikr whose name exactly matches an athkar text, even if it was counted on the sebha.
- Greeting, athkar period and "today" are computed on render; the page does not re-render at midnight on its own (the sky header ticks every minute, the rest waits for a state change).
- In `daily` wird mode with no goal picked, the card shows presets only; the read button and progress bar are absent.

## Open issues

- #13 — Zero is displayed as a diamond (◆) in counters. `DayStats` renders `toAr(0)`, the Arabic-Indic zero «٠», in `Tajawal_800ExtraBold` at 22 px (`DayCards.tsx`). Root cause in the font: Not verified.
- #6 — Theme: selected accent color is not applied across the whole app. On Home, `DayCards.tsx` (bar fill), `WirdCard.tsx` (11 uses) and `DailyMessageCard.tsx` (12 uses) read `colors.gold*` directly; `SkyHero.tsx` hard-codes `#ffd27a` for the next prayer.
- #17 — Bottom tabs change position depending on the active tab. `GlassTabBar` shows the label only on the focused tab, so item widths shift.
