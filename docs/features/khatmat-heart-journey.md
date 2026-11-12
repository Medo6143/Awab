# Heart Journey and Khatmat (نور القلب / سجل الختمات)

> Status: Shipped · A heart drawn from 114 cells, one per surah, that fills as surahs are read or memorized, plus a dated log of finished khatmat.

## What it does

**Heart Journey** (screen title «نور القرآن في قلبك», home tile «نور القلب»)

- Draws an anatomical heart made of 114 cells; a completed surah's cell fills red. The header badge shows `n/١١٤`.
- Two separate hearts, switched by a segmented control: **reading** («القراءة») and **memorization** («الحفظ»).
- Reading mode: tapping a cell or a row in the surah checklist toggles the surah.
- Memorization mode: tapping a surah opens `HeartSurahSheet` with its tasmee progress (ayahs passed, last recital, ayahs needing review) and buttons to recite, choose a range, or mark it memorized without reciting.
- Bulk marking: «ختم جزء» (marks every surah a juz touches) and «تحديد سريع» (marks surah 1 up to the chosen one).
- Long-pressing a cell (400 ms) opens the mushaf at the surah's first page, also inside the full-screen heart (#29). The header says so.
- Heart tools: zoom out/in, full screen, save/share as image, reset («تصفير», with confirmation).
- When all 114 are marked, «إنهاء الختمة» appears: it logs the khatma, empties the heart and opens the log.

**Khatmat** (screen title «سجل الختمات»)

- Lists finished khatmat for the selected mode, newest first: ordinal title («الختمة الثالثة», «الختمة رقم ١١» after the tenth), start → end dates, and number of days.
- The mode switch shows the count per mode.
- Tapping a row opens a share card of that khatma's full heart.

## How the user reaches it

Routes in `src/presentation/navigation/AppNavigation.tsx`: stack screens `نور_القلب` (`HeartJourneyScreen`) and `الختمات` (`KhatmatScreen`, optional param `mode`).

| Destination | Path from the home screen | Taps |
|---|---|---|
| Heart Journey | Home grid tile «نور القلب» | 1 |
| Khatmat log | «نور القلب» → «السجل» badge | 2 |
| Khatmat log (automatic) | «نور القلب» → «إنهاء الختمة» when 114/114 | 2 |

`navigate('الختمات', …)` is called only from `HeartJourneyScreen.tsx` (lines 128 and 152). There is no link from the mushaf, the home screen or the stats screen.

## How it works

1. **Mode.** `HeartJourneyScreen` keeps `mode` in component state, starting at `reading` every time the screen opens. The selector reads `quran.completedSurahs` (reading) or `quran.memorizedSurahs` (hifz).
2. **Marking.** `toggleSurahCompleted({ mode, id })`, `setCompletedSurahs({ mode, ids })`. Each action is stamped with `now`; `markStarted` sets `khatmaStartedAt[mode]` when the list gets its first surah and deletes it when the list becomes empty.
3. **Juz marking.** `JUZ_SURAH_RANGES` gives the first and last surah each juz touches; ranges overlap on purpose (al-Baqara spans juz 1–3), so marking juz 1 marks surahs 1–2 whole.
4. **Memorization via tasmee.** `HeartSurahSheet` computes from `quran.tasmee[surah]`: passed count, weak ayahs, and the first ayah not yet passed. «سمّع السورة» / «كمّل من آية N» starts tasmee for the next 10 ayahs (`chunk = from + 9`); «راجع السورة» recites all of it; the weak-ayah row recites only those ayahs. `reciteAyahs` converts ayah numbers to mushaf pages with `ayahRef` and navigates to `التسميع` with `surah`, `startAyah` or `only`. When `recordTasmee` finds every ayah of the surah passed, the reducer adds it to `memorizedSurahs`.
5. **Finishing.** `finishKhatma(mode)` pushes `{ id, mode, number, startedAt, finishedAt }` to `quran.khatmat`, where `number = finishedCount + 1`; sets `khatmaCount` for reading; clears the mode's list and its start date. The button only renders at 114/114 and the handler re-checks.
6. **Counting.** `finishedCount(state, mode)`: for reading, `max(logged entries, khatmaCount)`, so khatmat counted before the log existed are still counted; for hifz, logged entries only. `KhatmatScreen` shows the difference as a footer note («N ختمات سابقة قبل بدء السجل، بدون تواريخ»).
7. **Drawing.** `AnatomicalHeart` renders `HEART_CELLS` (auto-generated SVG paths in a 400×539 viewBox) with react-native-svg; a done cell uses the blood gradient. The heart on the screen pulses (scale 1 → 1.05 loop); log rows and share cards use a static value.
8. **Sharing.** `HeartShareCard` is a 9:16 card: title «نور القرآن في قلبي», khatma title and mode, `n سورة من ١١٤` for an unfinished heart, the heart, start/end dates, app logo. `ImageShareModal` captures it with react-native-view-shot and shares or saves it.

## Code map

| Layer | File | Role |
|---|---|---|
| Screen | `src/presentation/screens/HeartJourneyScreen.tsx` | Mode, marking, bulk actions, tasmee entry, finish |
| Screen | `src/presentation/screens/KhatmatScreen.tsx` | Log list and share |
| Component | `src/presentation/components/heart/HeartViewer.tsx` | Heart with zoom, full screen, save, reset tools |
| Component | `src/presentation/components/heart/AnatomicalHeart.tsx`, `src/presentation/components/heart/heartCells.ts` | SVG heart; 114 cell paths |
| Component | `src/presentation/components/heart/ZoomableHeart.tsx`, `src/presentation/components/heart/HeartZoomModal.tsx` | Pinch/zoom and full-screen view |
| Component | `src/presentation/components/heart/HeartJourneyHeader.tsx` | Header badge; `HeartNarrative` (titles, «السجل», bulk and finish buttons) |
| Component | `src/presentation/components/heart/ModeSwitch.tsx` | Reading / hifz switch |
| Component | `src/presentation/components/heart/SurahChecklist.tsx` | Searchable list of 114 surahs |
| Component | `src/presentation/components/heart/HeartModals.tsx` | `JuzSelectionModal`, `BulkMarkModal` |
| Helper | `src/presentation/components/heart/khatmaFormat.ts`, `src/presentation/components/heart/HeartJourneyConstants.ts`, `src/presentation/components/heart/HeartJourneyStyles.ts` | Titles, dates, day counts; juz ranges; styles |
| Component | `src/presentation/components/tasmee/HeartSurahSheet.tsx` | Hifz-mode surah sheet |
| Component | `src/presentation/components/tasmee/TasmeeSetupSheet.tsx` | Range picker bounded to the surah's pages |
| Share | `src/presentation/components/share/HeartShareCard.tsx`, `src/presentation/components/share/ImageShareModal.tsx` | Share card and capture/share modal |
| Store | `src/presentation/store/slices/quranSlice.ts` | All state and reducers; `finishedCount` |
| Data | `src/data/quran/ayahSearch.ts` | `ayahRef`, `surahPageRange` (ayah ↔ page) |

## State and storage

All in the `quran` slice, persisted by redux-persist to AsyncStorage under `root_v6`.

| Field | Meaning |
|---|---|
| `completedSurahs: number[]` | Surahs read in the current reading round |
| `memorizedSurahs: number[]` | Surahs memorized in the current hifz round |
| `khatmaStartedAt: { reading?, hifz? }` | ISO date the current round got its first surah |
| `khatmat: Khatma[]` | Log: `id` (ISO timestamp), `mode`, `number`, `startedAt` (may be `null`), `finishedAt` |
| `khatmaCount: number` | Reading khatmat finished, including ones from before the log existed |
| `tasmee: surah → ayah → { ok, at }` | Last recital result per ayah; drives the hifz sheet |

The selected mode and the zoom level are not persisted.

## Native, notifications and permissions

- No notifications and no background work.
- Haptics on every toggle and bulk action (expo-haptics).
- Saving a heart image to the gallery requests the media-library permission through `ImageShareModal` (expo-media-library); sharing uses expo-sharing.
- Starting tasmee from the hifz sheet may lead to the microphone permission; see `docs/features/tasmee.md`.

## External services

None. Both screens work fully offline (ayah ↔ page lookups use the bundled plain text). Tasmee, once started, needs the network for page text.

## Settings that affect it

- Light/dark theme: screen chrome follows it; the share card always uses the fixed `night` palette.
- No dedicated settings. Accent colour: these screens use `colors.gold` / `colors.goldText` directly; `HeartSurahSheet` and `TasmeeSetupSheet` use `useAccent`.

## Edge cases and limitations

- **Reading progress is manual.** Reading pages in the mushaf does not mark surahs; `toggleSurahCompleted` and `setCompletedSurahs` are dispatched only from `HeartJourneyScreen`. The mushaf's `currentPage` and the heart are unrelated.
- A juz cannot be marked on its own: marking a juz marks whole surahs, including parts outside that juz. «تحديد سريع» replaces the list with surahs 1..N, dropping any marked surah after N.
- In hifz mode the bulk tools and «علّمها محفوظة من غير تسميع» still mark surahs without any recital.
- Finishing or resetting the hifz heart clears `memorizedSurahs` but not `quran.tasmee`. In the next round the sheet still shows old ayah results, and one more passing recital of any ayah re-adds a surah whose ayahs all passed before.
- Un-toggling a surah after starting does not move `khatmaStartedAt` unless the list becomes empty.
- Days are counted inclusively (`daysBetween` + 1); dates are Gregorian with Arabic month names.
- Log entries cannot be edited or deleted.
- «اختار المدى» passes a from/to ayah pair but the screen uses only the start ayah's page for both bounds.
- The reset alert text always says "سورة" and "لا يمكن التراجع"; there is no undo.

## Open issues

- #19 — Khatmat is only reachable from Heart Journey, not from the mushaf
