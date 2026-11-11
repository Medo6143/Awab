# Duas and virtues («الأدعية» / «الفضائل»)

> Status: Shipped · A searchable library of supplications with favourites and the user's own duas, plus two reading pages on the virtue of dua and of dhikr.

## What it does

**Duas screen**

- "Dua of the day" card on top, with «دعاء تاني» for another at random.
- Search box, category tiles with counts, then the list.
- Each dua can be favourited, copied, shared as an image, or (long press on share) shared as plain text.
- The user can add personal duas (text plus an optional source).

**Virtues screen**

- A read-only page for one of two topics: «لماذا ندعو؟» (dua) or «فضل الذكر» (dhikr).
- Each section has an intro, Quran verses with al-Sa'di's tafsir, verified hadiths with source and meaning, and for the dua topic three supplications for distress.

## How the user reaches it

| Destination | Route | Path from launch | Taps |
|---|---|---|---|
| Duas | `الأدعية` | Home grid tile «الأدعية» | 1 |
| Virtues of dua | `الفضائل` with `{ topic: 'dua' }` | Duas → banner «لماذا ندعو؟» | 2 |
| Virtues of dhikr | `الفضائل` with `{ topic: 'dhikr' }` | Tab «الأذكار» → banner «فضل الذكر» at the end of the list | 2 |

Routes are declared in `src/presentation/navigation/AppNavigation.tsx`; the grid tile is in `src/presentation/components/home/HomeSections.tsx`. Virtues has no entry of its own on Home.

## How it works

**Duas**

- Built-in data: 60 duas in `DUAS_DATA`.

| Category id | Arabic name | Count |
|---|---|---|
| `daily` | أدعية يومية | 9 |
| `anbiya` | أدعية الأنبياء | 20 |
| `quranic` | أدعية قرآنية | 10 |
| `prophetic` | أدعية نبوية | 10 |
| `relief` | الكرب والهم | 6 |
| `istighfar` | الاستغفار | 5 |
| `personal` | أدعيتي | user's own |

- Two extra tiles: «الكل» and «المفضلة».
- Dua of the day: index `dayNumber % DUAS_DATA.length`, where `dayNumber` is days since the Unix epoch for the local date. Same dua all day. «دعاء تاني» jumps to a different random index. Personal duas are never the dua of the day.
- Filter: category match AND (`text` or `ref` contains the query). The match is a plain substring test: diacritics and hamza forms are not normalized.
- While a query is typed, the day card and the virtues banner are hidden.
- Adding a dua: id is `Date.now()` as a string, source defaults to «دعاء شخصي», category `personal`.
- Copy puts only the dua text on the clipboard and shows a toast on Android.
- Share opens `ImageShareModal` with `DuaShare` and the style picker; see `docs/features/share-cards.md`.

**Virtues**

- Content is static in `src/domain/entities/virtues.ts`: topic `dua` has 2 sections (5 verse references, 6 hadiths, 3 duas), topic `dhikr` has 2 sections (4 verse references, 5 hadiths).
- Verses are stored as references (`surah`, `from`, `to`, `key`), never as typed text. `VerseCard` loads the text and the tafsir at render time (see External services).
- The tafsir shows a 260-character excerpt with «اقرأ المزيد» to expand.
- A missing or unknown `topic` falls back to `dua`.

## Code map

| Layer | File | Role |
|---|---|---|
| Screen | `src/presentation/screens/DuaScreen.tsx` | List, filter, favourites, share, add |
| Screen | `src/presentation/screens/VirtuesScreen.tsx` | Renders a topic's sections |
| Components | `src/presentation/components/dua/DuaComponents.tsx` | Header, search, day card, category tiles, dua card |
| Components | `src/presentation/components/dua/DuaConstants.tsx` | `DUA_CATEGORIES`, `DUAS_DATA` |
| Components | `src/presentation/components/dua/DuaModals.tsx` | `AddDuaModal` |
| Components | `src/presentation/components/dua/DuaStyles.ts` | Styles |
| Components | `src/presentation/components/guidance/GuidanceBlocks.tsx` | `VirtueBanner`, `SectionHeading`, `VerseCard`, `HadithCard`, `SupplicationCard` |
| Components | `src/presentation/components/share/StoryCard.tsx` | `DuaShare` |
| Components | `src/presentation/components/share/DuaShareCard.tsx` | Classic-style dua image |
| Hook | `src/presentation/hooks/useGuidance.ts` | `useVerseText`, `useVerseTafsir` |
| Domain | `src/domain/entities/virtues.ts` | `VIRTUES` content |
| Domain | `src/domain/entities/hadiths.ts` | Shared verified hadiths (`H`) and duas (`DUA`) |
| Domain | `src/domain/entities/guidance.ts` | `VerseRef`, `Hadith`, `Supplication` types |
| Domain | `src/domain/entities/types.ts` | `Dua` type |
| Store | `src/presentation/store/slices/duasSlice.ts` | Personal duas and favourites |

## State and storage

Slice `duas` (persisted via redux-persist, key `root_v6`, AsyncStorage):

| Field | Type | Meaning |
|---|---|---|
| `personalDuas` | `Dua[]` | The user's own duas |
| `favorites` | `string[]` | Ids of favourited duas (built-in or personal) |

Search text, selected category and the current "dua of the day" index are component state and are lost when the screen closes. The Virtues screen stores nothing.

## Native, notifications and permissions

- Clipboard through `expo-clipboard`; plain-text share through React Native `Share`.
- Image share and save: see `docs/features/share-cards.md` (gallery write permission is asked only on save). No notifications.

## External services

Duas: none. Virtues (through `VerseCard`):

| Host | Sent | Returned |
|---|---|---|
| `api.alquran.cloud` (`/v1`) | Surah and ayah range of the verse | Uthmani ayah text |
| `api.quran.com` (`/api/v4`) | Tafsir id 91 (al-Sa'di), surah and first ayah | Tafsir HTML |

If the verse request fails, the bundled plain text (no diacritics) is shown with a note; if the tafsir request fails, an error line is shown. The exact request shapes live in `src/data/repositories/QuranApiRepository.ts` (not re-verified here).

## Settings that affect it

`settings.shareCardStyle` and `settings.shareTextSize` set the look and text size of the shared dua image; they are changed from the picker inside the share modal.

## Edge cases and limitations

- `updatePersonalDua` and `deletePersonalDua` exist in the slice but no screen dispatches them: a personal dua cannot be edited or deleted from the UI.
- The plain-text share on long press is only on list cards, not on the day card.
- On the Virtues page verses have no listen or share buttons (those props are only passed by the Quran messages screen), and the tafsir is always al-Sa'di, regardless of the tafsir chosen in settings.
- The empty-state and toast texts are in Egyptian colloquial Arabic, unlike most of the screen.

## Open issues

None.
