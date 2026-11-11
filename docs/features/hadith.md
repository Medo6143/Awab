# Hadith library («الأحاديث»)

> Status: Shipped · An offline index of 3,544 authentic hadiths with search and categories; the full text and explanation of each hadith are fetched once from HadeethEnc and then kept on the device.

## What it does

- Library screen: search box, "hadith of the day", a link to saved hadiths, and the category index.
- Category screen: sub-categories as chips, then the hadiths of that category.
- Detail screen: narrator intro, full text, grade and attribution chips, explanation, benefits, word meanings and references.
- A hadith can be saved (star), copied, or shared as an image.
- Home shows a random hadith inside the «رسالة لك» card, which opens the detail screen.

## How the user reaches it

| Destination | Route | Path from launch | Taps |
|---|---|---|---|
| Library | `الأحاديث` | Home grid tile «الأحاديث» | 1 |
| Category | `الأحاديث` with `{ categoryId }` | Library → category tile | 2 |
| Saved hadiths | `الأحاديث` with `{ favorites: true }` | Library → «الأحاديث المحفوظة» (shown only when at least one is saved) | 2 |
| Detail | `الحديث` with `{ id }` | Library → hadith of the day, or Home → hadith in «رسالة لك» | 1–2 |

Routes are in `src/presentation/navigation/AppNavigation.tsx`; the tile is in `src/presentation/components/home/HomeSections.tsx`. Each category level is pushed as a new screen, so back walks up the index.

## How it works

**Bundled index**

- `src/data/hadith/hadithIndex.ts` (about 2.4 MB) exports `HADITH_CATEGORIES` (493 categories, 7 roots) and `HADITH_INDEX_TEXT`, one line per hadith: `id|grade|attribution|categories|title|text`. The text is stored without diacritics and is used for search only.
- Only hadiths graded sahih or hasan (and accepted equivalents) are in the index: 3,544 lines.
- The file is loaded with `require` on first use and parsed once into memory. The library screen delays this by 30 ms so the screen opens first; the home card delays it by 600 ms.

**Search**

- Starts at 2 characters, debounced 200 ms.
- The query and the entries are normalized with `normalizeArabic` (diacritics and hamza forms).
- Whole-phrase matches come first, then entries containing every word. At most 80 hits are shown; the total is reported («N نتيجة، تظهر أول ٨٠»).

**Hadith of the day**

- `entries[(dayNumber * 7919) % entries.length]`, with `dayNumber` the days since the epoch for the local date. Same hadith all day.
- The home card instead uses `randomHadith`, a new random hadith on every app open and on «حديث».

**Detail**

1. The title from the index is shown immediately as a preview.
2. `HadeethEncRepository.getHadith(id)` looks in memory, then in AsyncStorage, then calls the API.
3. A fetched hadith is saved under its key and reads offline afterwards.
4. On failure an error state with a retry button is shown under the preview.

Copy puts `intro + text` and `[grade · attribution]` on the clipboard.

## Code map

| Layer | File | Role |
|---|---|---|
| Screen | `src/presentation/screens/HadithLibraryScreen.tsx` | Search, day card, categories, lists |
| Screen | `src/presentation/screens/HadithDetailScreen.tsx` | One hadith with explanation; save, copy, share |
| Components | `src/presentation/components/hadith/HadithRow.tsx` | `HadithRow`, `GradeChips` |
| Components | `src/presentation/components/home/DailyMessageCard.tsx` | Random hadith on Home |
| Components | `src/presentation/components/share/StoryCard.tsx` | `HadithShare` image |
| Data | `src/data/hadith/hadithIndex.ts` | Generated index (bundled) |
| Data | `src/data/hadith/hadithLibrary.ts` | Load, categories, search, hadith of the day, random |
| Data | `src/data/quran/ayahSearch.ts` | `normalizeArabic` |
| Data | `src/data/repositories/HadeethEncRepository.ts` | API call and device cache |
| Data | `src/data/api/clients.ts` | `hadithApi` axios client |
| Domain | `src/domain/entities/hadith.ts` | `HadithCategory`, `HadithIndexEntry`, `HadithDetail`, `HadithRepository` |
| Store | `src/presentation/store/slices/favoritesSlice.ts` | Saved hadith ids |

## State and storage

| Where | Key or field | Content |
|---|---|---|
| Redux `favorites.hadiths` (persisted, `root_v6`) | `number[]` | Ids of saved hadiths |
| AsyncStorage | `hadith:v1:<id>` | JSON of one `HadithDetail`, written after the first successful fetch |
| Memory | `Map` in the repository; parsed index in `src/data/hadith/hadithLibrary.ts` | Per app session |

Cached hadiths have no expiry and no size limit, and nothing in the app deletes them. Search text and results are component state.

## Native, notifications and permissions

- Network access only. Clipboard through `expo-clipboard`.
- Image share and save: see `docs/features/share-cards.md`.
- No notifications and no native module of the app's own.

## External services

| Host | Request | Sent | Returned |
|---|---|---|---|
| `hadeethenc.com` | `GET /api/v1/hadeeths/one/` (15 s timeout) | `language=ar`, `id` | `hadeeth`, `hadeeth_intro`, `attribution`, `grade`, `explanation`, `hints`, `words_meanings`, `reference` |

Nothing about the user is sent. The intro is stripped from the start of the text when the API repeats it.

## Settings that affect it

| Setting | Effect |
|---|---|
| `settings.shareCardStyle`, `settings.shareTextSize` | Look and text size of the shared hadith image; changed inside the share modal |

## Edge cases and limitations

- A hadith never opened before cannot be read offline: only its title line from the index is shown, with an error and retry.
- Saving a hadith stores its id only. A saved hadith that was never loaded still needs the network.
- The category tiles count only indexed hadiths (`indexed`), not the `count` field from the source, and categories with zero indexed hadiths are hidden.
- A comment in `src/data/hadith/hadithLibrary.ts` says "~3.5k hadiths" and one in `src/presentation/components/home/DailyMessageCard.tsx` says the index is "~2 MB"; the measured values are 3,544 hadiths and about 2.4 MB.
- The index is generated; the generator script is not in the repository (Not verified: no such script was found under `scripts/`).
- With the classic share style, a hadith is drawn with the dua card, so its label reads «دعاء» and the explanation is not included.

## Open issues

None.
