# Mushaf reader (المصحف الشريف)

> Status: Shipped · A 604-page mushaf reader with a surah/juz index, offline ayah search, page bookmarks and per-ayah tafsir.

## What it does

- Shows the Quran page by page (604 pages, Uthmani text) inside an ornamental paper frame. Swipe or use the footer arrows to turn pages.
- Index modal «فهرس القرآن» with four tabs: surahs (searchable), ayah search, the 30 ajza', and full-surah recitation (see `docs/features/quran-audio.md`).
- Tapping an ayah opens a tafsir sheet with: the tafsir text, source/style/font-size switcher, and actions (save ayah, play ayah, share as image, copy, start tasmee from this ayah).
- Long-pressing an ayah plays it.
- Page bookmarks: toggled from the bookmark icon in the page header, listed in «العلامات المرجعية».
- Remembers the last page and logs every page turned by swipe into the daily stats.

## How the user reaches it

- Route: tab `TabQuran` (title «القرآن») in `src/presentation/navigation/AppNavigation.tsx`. 1 tap from the home screen: the «القرآن» tab, the «القرآن» tile in the home grid, or the wird card's read action.
- The tab is registered with `tabBarStyle: { display: 'none' }` and `GlassTabBar` returns `null` for it, so the bottom tab bar is hidden while the mushaf is open. The Home icon in the top bar (`navigate('TabHome')`) is the way back.
- A reminder alarm can also open it (`ReminderAlarm` navigates to `MainTabs` → `TabQuran`).

Top bar (`MushafToolbar`): six buttons, each with its label under the icon, in reading order:

| Label | Action |
|---|---|
| الرئيسية | Go to `TabHome` |
| الفهرس | Open the index modal |
| استمع / إيقاف / إيقاف مؤقت / بيحمّل | Play the current page; stop an ayah or page, pause a surah |
| سمّع | Open the tasmee setup sheet for this page |
| المحفوظات | Saved pages and ayahs |
| المزيد | `MushafMoreSheet`: text size (−/+ with a sample), «الختمات», «إعدادات المصحف» (Settings → المصحف والتفسير) |

Until it is dismissed, a hint under the bar (`MushafHint`, `settings.mushafHintSeen`) says that tapping an ayah opens tafsir, listening, saving and sharing, and that a long press plays it.

## How it works

1. **Paging.** `QuranScreen` renders a `PagerView` with exactly three slots: previous, current, next. On `onPageSelected` it dispatches `setCurrentPage` and `logQuranPage`, then after 50 ms snaps the pager back to the middle slot without animation. `layoutDirection="rtl"` is pinned so the swipe direction is right on first launch, before forced RTL takes effect.
2. **Loading a page.** `MushafPageContent` calls `useMushafPage(page)`. The hook reads `quran.peekPage()` synchronously (in-memory cache), otherwise calls `quran.getPage()` and then prefetches pages `page ± 1`. `QuranApiRepository.getPage` requests `GET /page/{n}/quran-uthmani`, de-duplicates in-flight requests, and rejects on an empty page. On failure the page shows an error with «إعادة المحاولة».
3. **Rendering.** Ayahs are grouped by surah. A surah's first ayah gets a title band and a basmala header (not for surah 9). `mushafAyahText` strips the basmala the API prefixes to each surah's first ayah, comparing letters only. All ayahs of a group are nested `Text` nodes inside one flowing `Text` (`textFlow`); the ayah-end marker is the plain character U+06DD plus Arabic-Indic digits.
4. **Index.** Surah list comes from `useSurahs()` (`GET /surah`, React Query, `staleTime: Infinity`). Surah search compares names without diacritics (`normalizeArabic`) and accepts Arabic-Indic digits for the surah number. Selecting a surah jumps to `SURAH_START_PAGE[n-1]`; selecting a juz jumps to `JUZ_PAGES[n-1]`.
5. **Ayah search.** Fully offline. `AyahSearchPanel` warms the index 350 ms after opening and searches 200 ms after typing stops, minimum 2 characters. `searchAyahs` scans 6236 normalized ayahs: whole-phrase matches first, then ayahs containing every word; at most 60 hits are shown, with the total count. Picking a hit opens its page, highlights the ayah and scrolls it into view (position is estimated from letter counts, because one flowing `Text` cannot be measured per ayah). The highlight is cleared when the page changes.
6. **Tafsir.** Tap → `getTafsir` → `useTafsir(tafsirId).load({ surah, ayah })` → `QuranComTafsirRepository.getTafsir` → `GET /tafsirs/{id}/by_ayah/{surah}:{ayah}`. Only the latest request may update state; closing the sheet cancels. Changing the source while the sheet is open reloads the same ayah. The HTML is parsed by `tafsirParser` and rendered by `TafsirBlocks` in one of three variants.

## Code map

| Layer | File | Role |
|---|---|---|
| Screen | `src/presentation/screens/QuranScreen.tsx` | Top bar, pager, footer, wiring of all modals |
| Component | `src/presentation/components/quran/MushafPageContent.tsx` | One page: header, bookmark toggle, flowing ayah text |
| Component | `src/presentation/components/quran/MushafOrnaments.tsx` | `GeometricFrame`, `MushafFrame` and `SurahHeader` (per design), `StarBadge` (page number) |
| Designs | `src/presentation/components/quran/mushafThemes.ts`, `src/presentation/components/settings/MushafThemeSelector.tsx` | The five page designs and their picker |
| Component | `src/presentation/components/quran/SurahPickerModal.tsx` | Index modal with the four tabs |
| Component | `src/presentation/components/quran/AyahSearchPanel.tsx` | Ayah search box and results |
| Component | `src/presentation/components/quran/BookmarksModal.tsx` | List of bookmarked pages |
| Component | `src/presentation/components/quran/TafsirBottomSheet.tsx` | Tafsir sheet and ayah actions |
| Component | `src/presentation/components/quran/TafsirSwitcher.tsx` | Source, style and font size inside the sheet |
| Component | `src/presentation/components/quran/TafsirBlocks.tsx`, `src/presentation/components/quran/tafsirParser.ts` | Tafsir HTML → blocks → UI |
| Styles | `src/presentation/components/quran/QuranStyles.ts`, `src/presentation/components/quran/QuranConstants.ts` | Styles; `TOTAL_PAGES`, `JUZ_PAGES`, `mushafAyahText` |
| Hook | `src/presentation/hooks/useQuran.ts` | `useSurahs`, `useMushafPage`, `useTafsir` |
| Domain | `src/domain/repositories/QuranRepository.ts`, `src/domain/entities/quran.ts`, `src/domain/entities/surahPages.ts` | Contracts, types, surah start pages |
| Data | `src/data/repositories/QuranApiRepository.ts`, `src/data/api/clients.ts` | alquran.cloud and quran.com clients (15 s timeout) |
| Data | `src/data/quran/ayahSearch.ts`, `src/data/quran/quranPlainText.ts` | Offline search index; bundled plain text (about 0.8 MB) |
| DI | `src/data/container.ts` | Registers `quran` and `tafsir` repositories |

## State and storage

Redux, persisted with redux-persist into AsyncStorage under the key `root_v6` (`src/presentation/store/index.ts`).

| Slice | Field | Use |
|---|---|---|
| `quran` | `currentPage` | Last open page (1–604); restored on launch |
| `quran` | `bookmarkedPages` | Page bookmarks |
| `quran` | `bookmarks` | Saved ayahs (global ayah numbers), toggled by «حفظ» in the tafsir sheet |
| `stats` | `dailyRecords[date].quranPages` | Unique pages read today |
| `settings` | `selectedTafsirId`, `tafsirStyle`, `tafsirFontSize` | Tafsir source (default 91), style (default `modern`), font size (default 18) |

Not persisted: page text and tafsir (memory only; lost when the app is killed), search index (rebuilt from the bundle).

## Native, notifications and permissions

- No notifications. Network access only.
- Sharing an ayah as an image goes through `ImageShareModal` (view-shot, expo-sharing, expo-media-library); saving to the gallery asks for the media-library permission at that moment.
- Native module used by the reader itself: `react-native-pager-view`.

## External services

| Host | Sent | Returned |
|---|---|---|
| `api.alquran.cloud/v1` | `GET /page/{n}/quran-uthmani`, `GET /surah` (page or nothing; no user data) | Ayahs of the page with surah, juz, page; list of 114 surahs |
| `api.quran.com/api/v4` | `GET /tafsirs/{id}/by_ayah/{surah}:{ayah}` | Tafsir HTML |

## Settings that affect it

| Setting | Where | Effect |
|---|---|---|
| Tafsir source (`selectedTafsirId`) | Settings screen and the tafsir sheet | 91 السعدي, 14 ابن كثير, 15 الطبري, 90 القرطبي, 16 الميسر |
| Tafsir style (`tafsirStyle`) | Same | `simple` always loads tafsir 16 (Muyassar) whatever the source; `book`; `modern` |
| Tafsir font size (`tafsirFontSize`) | Same | Sheet buttons step by 2, clamped 12–32 |
| Page design (`mushafTheme`) | Settings → المصحف والتفسير → «شكل صفحة المصحف» | `classic` (default), `madani`, `night`, `green`, `simple`; see below |
| Theme (light/dark) | Settings | Screen chrome follows the theme; the page keeps its design's colours (`night` is the dark page) |

**Page designs** (`src/presentation/components/quran/mushafThemes.ts`, colours in `MUSHAF_PALETTES` in `tokens.ts`). Each sets the paper and ink, the frame (`MushafFrame`), the surah header (`SurahHeader`), the font and the alignment:

| Design | Frame | Surah header | Font, alignment | Other |
|---|---|---|---|---|
| الكلاسيكي | Geometric (rules and eight-point stars) | Ruled band | Amiri Bold, centred | The original look |
| المدني | Wide band between two rules, diamond corners | Cartouche: name, «ترتيبها» and «آياتها» | Amiri Quran, justified | The name of Allah and «الرحمن» in red (`isDivineName` in `src/domain/services/mushafText.ts`) |
| الليلي | Geometric, gold | Ruled band | Amiri Bold, centred | Dark page, cream text |
| الأخضر | Double rule | Filled green cartouche | Amiri Quran, centred | Green-tinted paper |
| البسيط | None | Name only | Amiri Bold, centred | White page |

The red colouring covers the forms of «الله» (لله، بالله، والله، تالله، اللهم، ءآلله) and «الرحمن» only; «رب» and pronouns are left alone because they do not always refer to Allah. The Madinah print's own font (King Fahd Complex) was not available to download, so Amiri Quran (Google Fonts, OFL) stands in.

**Text size** (`settings.mushafFontScale`, from «المزيد»): 85%, 100% (default), 115%, 130% or 145% of the design's own size (`fontSize: 23`, `lineHeight` 60–64), applied to the ayahs and the basmala.

## Edge cases and limitations

- **Online only for reading.** Pages are not bundled or cached on disk; without a connection a page that is not in memory shows the error state. Search still works offline but the page it opens may fail to load.
- Pages are text reflowed in a scroll view, not fixed-line mushaf pages; a page can be taller than the screen.
- Saved ayahs (`quran.bookmarks`) have no list: `BookmarksModal` only shows `bookmarkedPages`, and `MushafPageContent` receives `bookmarks` but does not draw them. A saved ayah is only visible as a filled star when its tafsir sheet is reopened.
- Ayah actions are hidden behind gestures: tap = tafsir, long-press = play. Nothing on screen says so.
- The top-bar bookmark icon is filled when any page is bookmarked, not when the current page is.
- Top-bar and footer icons use `colors.gold`, not the user's accent (`useAccent` is not used in `QuranScreen.tsx` or `QuranStyles.ts`), so the chosen accent colour does not apply here.
- Juz start pages are a fixed table (`JUZ_PAGES`: 1, 22, 42, … 582).
- Search result scrolling is an estimate and can land a little above or below the ayah.

## Open issues

None.
