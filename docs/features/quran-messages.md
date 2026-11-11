# Quran messages («رسائل من القرآن»)

> Status: Shipped · The user picks what they are going through and gets a message: a comforting word, a verse with tafsir and audio, a verified hadith, a dua and practical steps.

## What it does

- Picker: ten states (sadness, distress, loss, debt, anxiety, depression, illness, loneliness, guilt, injustice) and a «فاجئني برسالة» button for a random one.
- Message: comfort text, «آية لك» (verse with al-Sa'di's tafsir, listen, share as image), «من هدي النبي ﷺ» (hadith), «ادعُ بهذا» (dua), «خطوات تعينك» (tips and, for the one state that defines it, a care note).
- «رسالة تانية» at the bottom replaces the verse, hadith and dua with the next ones.
- Each of the three cards can be liked (heart).
- Home shows a «رسالة لك» card with a random verse from these messages and a random hadith.

## How the user reaches it

| Destination | Path from launch | Taps |
|---|---|---|
| Picker (route `رسائل_القرآن`) | Home grid tile «رسائل القرآن» | 1 |
| A message | Picker → a state, or «فاجئني برسالة» | 2 |
| A message, directly | Home card «رسالة لك» → the verse (navigates with `{ mood }`) | 1 |

The route is declared in `src/presentation/navigation/AppNavigation.tsx`; the tile is in `src/presentation/components/home/HomeSections.tsx`. When opened with a `mood` param, back leaves the screen; when opened from the picker, back returns to the picker.

## How it works

**Content**

- `BASE_MESSAGES` in `src/domain/entities/quranMessages.ts` holds the ten states with their base verses, hadiths, duas, tips and optional `care` note (one state has it).
- `MORE_MESSAGE_VERSES` in `src/domain/entities/quranMessageVerses.ts` adds more verse references per state. `QURAN_MESSAGES` merges both and drops duplicates by `surah:from`.
- Verses are references only (`surah`, `from`, optional `to`, and `key` words). The text is always loaded from the Quran source, never typed.
- Hadiths and duas come from the shared verified set in `src/domain/entities/hadiths.ts`.

**Order of messages**

1. When a state is opened, the indexes of its verses, hadiths and duas are each shuffled once.
2. Message `n` shows item `n` of each shuffled list, wrapping with modulo, so nothing repeats until a list runs out.
3. The header shows «رسالة k من total» where `total = max(verses, hadiths, 1)`.

**Verse card**

- Text: `useVerseText` asks the Quran repository for the ayah range; on failure it falls back to the bundled plain text and the card says there is no connection.
- Tafsir: `useVerseTafsir` loads tafsir id 91 (al-Sa'di) for the first ayah, shows a 260-character excerpt and «اقرأ المزيد».
- Listen: one ayah uses `playAyah`; a range uses `playSequence` with every ayah in the range.
- Share: `AyahShare` with the verse text and the tafsir excerpt; hadith and dua use `DuaShare`.

**Likes**

- Key format: `<mood>:v:<surah>:<from>`, `<mood>:h:<source>`, `<mood>:d:<source>`, toggled in `favorites.messageCards`.

**Home card**

- A random `(state, verse)` pair on each app open; «رسالة تانية» redraws both verse and hadith, «آية» and «حديث» redraw one.

## Code map

| Layer | File | Role |
|---|---|---|
| Screen | `src/presentation/screens/QuranMessagesScreen.tsx` | Picker, message, ordering, likes, share |
| Components | `src/presentation/components/home/DailyMessageCard.tsx` | «رسالة لك» on Home |
| Components | `src/presentation/components/guidance/GuidanceBlocks.tsx` | `VerseCard`, `HadithCard`, `SupplicationCard` |
| Components | `src/presentation/components/share/StoryCard.tsx` | `AyahShare`, `DuaShare` |
| Components | `src/presentation/components/quran/tafsirParser.ts` | Tafsir HTML to blocks and excerpt |
| Hook | `src/presentation/hooks/useGuidance.ts` | `useVerseText`, `useVerseTafsir`, `SAADI_TAFSIR_ID` |
| Hook | `src/presentation/hooks/useAudio.ts` | `playAyah`, `playSequence` |
| Domain | `src/domain/entities/quranMessages.ts` | States and base content |
| Domain | `src/domain/entities/quranMessageVerses.ts` | Extra verse references |
| Domain | `src/domain/entities/guidance.ts` | `VerseRef`, `Hadith`, `Supplication` |
| Data | `src/data/quran/ayahSearch.ts` | `plainAyahs` offline fallback |
| Data | `src/data/quran/quranPlainText.ts` | Bundled plain Quran text |
| Store | `src/presentation/store/slices/favoritesSlice.ts` | `messageCards` |
| Script | `scripts/check-message-verses.js` | Verifies every extra verse reference |

## State and storage

| Where | Field | Content |
|---|---|---|
| Redux `favorites.messageCards` (persisted, `root_v6`, AsyncStorage) | `string[]` | Keys of liked cards |
| Component state | `mood`, `order`, `shared` | Current state, shuffled order and position, open share |

The shuffled order and the position are not persisted: reopening a state reshuffles. Verse text and tafsir are fetched on render; any caching is inside the repositories (Not verified here).

## Native, notifications and permissions

- Audio plays through the app's `quranPlayer` dependency and react-native-track-player state (see `docs/features/quran-audio.md`).
- Image share and save: see `docs/features/share-cards.md`.
- No notifications are scheduled by this feature.

## External services

| Host | Used for | Sent | Returned |
|---|---|---|---|
| `api.alquran.cloud` (`/v1`) | Verse text | Surah and ayah range | Uthmani text |
| `api.quran.com` (`/api/v4`) | Tafsir | Tafsir id 91, surah, ayah | Tafsir HTML |
| Recitation audio host | Listen | Not verified here (see `src/data/services/AudioService.ts`) | Audio stream |

## Settings that affect it

| Setting | Effect |
|---|---|
| `settings.selectedReciterId` | Reciter used by «استمع للآية» |
| `settings.shareCardStyle`, `settings.shareTextSize` | Look and text size of shared images |

The tafsir is always al-Sa'di here; `settings.selectedTafsirId` is not used.

## Edge cases and limitations

- Liked cards are stored but no screen lists them: `favorites.messageCards` is only read to fill the heart on the same card.
- For a verse range, the tafsir and the shared image's ayah number use the first ayah only, while the text covers the whole range.
- Offline: verse text falls back to the bundled plain text; the tafsir shows an error line; audio needs the network.
- `scripts/check-message-verses.js` checks only `src/domain/entities/quranMessageVerses.ts` (the `v(...)` calls). Base verses written inline in `src/domain/entities/quranMessages.ts` are not covered by it. It is not wired into an npm script; run it with node on `scripts/check-message-verses.js`.
- `useAudio` is also called once in `src/presentation/navigation/AppNavigation.tsx` to keep the global audio state in sync; this screen creates a second instance of the same hook.

## Open issues

None.
