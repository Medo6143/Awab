# Tasmee, recitation check (التسميع)

> Status: Shipped · Recite from memory on a covered mushaf page, either checking yourself or letting an on-device speech model follow your voice word by word.

## What it does

- Shows the mushaf page with the ayahs to recite covered by paper-coloured strips.
- **Self-check («بنفسي»):** the user recites, uncovers each ayah («اكشف الآية»), and taps any word they got wrong.
- **Voice («بصوتي»):** the app listens through the microphone, uncovers words as they are said and marks skipped or wrong words in red. Two voice modes: «علّم الغلط بس» (mark and keep going) and «وقّفني وقولّي الكلمة» (stop, play the correct word, wait for the user to repeat it).
- Optional help: none, first word, or first letter of each word.
- Ends with a result screen: ayah count, mistakes with their words, minutes, and buttons to retry the mistakes or continue with the next pages.
- Results feed the memorization heart: a surah whose every ayah has passed is added to `memorizedSurahs` (see `docs/features/khatmat-heart-journey.md`).

## How the user reaches it

Route: stack screen `التسميع` (`TasmeeScreen`) in `src/presentation/navigation/AppNavigation.tsx`, with `TasmeeParams` (`fromPage`, `toPage`, `help`, `surah`, `startAyah`, `only`, `voice`, `voiceMode`).

| Entry | Path from the home screen | Taps |
|---|---|---|
| Mushaf top bar | «القرآن» tab → mic icon → setup sheet → «ابدأ التسميع» | 3 |
| Tafsir sheet | «القرآن» tab → tap ayah → «سمّع من الآية دي» → «ابدأ التسميع» | 4 |
| Heart Journey | «نور القلب» → «الحفظ» → surah → «سمّع السورة» | 4 |
| Heart Journey, custom range | … surah → «اختار المدى» → «ابدأ التسميع» | 5 |

The Heart Journey shortcut («سمّع السورة», «كمّل من آية», weak-ayah review) starts self-check directly with no setup sheet; voice mode is only selectable in `TasmeeSetupSheet`.

## How it works

**Session.** `TasmeeScreen` loads each page with `useMushafPage`. An ayah is in the session if it has text, matches `cfg.surah` (if set), is at or after `startAyah`, and is in `only` (if set). Pages with no session ayahs are skipped. Ayahs left with no marked word count as correct. `finish()` dispatches `recordTasmee` once per surah.

**Voice pipeline.**

1. **Microphone.** `RecitationListener.start()` opens `@fugood/react-native-audio-pcm-stream` at 16 kHz, mono, 16-bit, `audioSource: 6`, buffer 4096. Chunks arrive base64-encoded. Only the last 3 s (`WINDOW_SECONDS`) are kept. A simple level meter (RMS against a drifting noise floor) tracks how long the reciter has been quiet.
2. **Model.** `CtcEngine` runs a FastConformer CTC model (`mrmuminov/quran-fastconformer-ctc-ar`, CC-BY-4.0, int8, log-mel front-end fused into the ONNX graph) with `onnxruntime-react-native` (`xnnpack` then `cpu`, 4 threads). Input: raw float audio. Output: per-frame log-probabilities over 62 characters plus blank; `greedyDecode` collapses repeats and drops blanks. Nothing is transcribed if less than 0.6 s is buffered or less than 250 ms was voiced.
3. **Loop.** `useVoiceTasmee.run` transcribes again whenever 0.25 s (`STEP_SECONDS`) of new audio has arrived.
4. **Following.** `RecitationFollower.update(heard)` aligns the heard words against the expected words around a cursor (12 words back, 6 ahead) with a longest-common-subsequence under a fuzzy `same()`:
   - letters only, spelling-normalized (`normLetters`); sound-alike letters merged (ط/ت, ض/د, ص/س/ث, ق/ك, غ/خ, ح/ه, ذ/ظ/ز); leading «ال» optional;
   - one letter may differ (two in words of 7+ letters); two-letter words and «الله» must match exactly;
   - repeated phrases are collapsed; isti'adha and basmala are dropped at the start of a session or surah.
5. **Mistakes.** A word is a mistake when the reciter is heard past it, when 4 heard words match nothing, or when the reciter is silent for 1.5 s (`STUCK_MS`) on an unmatched word. The hook acts only if two consecutive listens report the same mistake.
6. **Reaction.** `mark` mode: mark the word(s) and continue. `correct` mode: pause the mic, play the word from `audio.qurancdn.com` (4 s timeout), then wait for the user to repeat; after 3 tries (`MAX_TRIES`) it moves on.
7. **Mapping back.** Matching uses the bundled plain text (`plainAyah`); `plainToMushaf` maps each plain word to the Uthmani word(s) shown on the page.

**What is judged and what is not.**

| Judged | Not judged |
|---|---|
| Whether each expected word was said, in order | Tajweed (madd, ghunna, makharij, etc.) |
| Skipped words and clearly different words | Vowel marks / i'rab (diacritics are stripped before matching) |
| | One-letter slips and sound-alike letters (deliberately tolerated) |
| | Anything in self-check mode (the user marks their own mistakes) |

## Code map

| Layer | File | Role |
|---|---|---|
| Screen | `src/presentation/screens/TasmeeScreen.tsx` | Session state, page flow, result, recording |
| Component | `src/presentation/components/tasmee/TasmeeSetupSheet.tsx` | Range, mode, help, model download |
| Component | `src/presentation/components/tasmee/TasmeePage.tsx` | Covered page, word tap targets |
| Component | `src/presentation/components/tasmee/TasmeeResult.tsx` | Result screen |
| Component | `src/presentation/components/tasmee/HeartSurahSheet.tsx` | Per-surah progress sheet in Heart Journey |
| Helper | `src/presentation/components/tasmee/tasmeeText.ts` | `splitWords`, `firstLetter`, Arabic count labels |
| Hook | `src/presentation/hooks/useVoiceTasmee.ts` | Listen → follow → react loop |
| Service | `src/data/services/RecitationListener.ts` | Mic capture, 3 s window, model download, mic permission |
| Service | `src/data/services/ctcEngine.ts`, `src/data/services/ctcModelData.ts` | ONNX session, greedy CTC decode, vocabulary |
| Service | `src/data/services/wordAudio.ts` | Word-by-word audio for corrections |
| Domain | `src/domain/services/recitationFollower.ts`, `src/domain/services/recitationMatch.ts` | Alignment and plain ↔ Uthmani mapping (pure TypeScript) |
| Data | `src/data/quran/ayahSearch.ts` | `plainAyah`, `ayahRef`, `surahPageRange` |

## State and storage

- Redux `quran.tasmee`: `surahId → ayah → { ok, at }`, the last result per ayah. Persisted (AsyncStorage key `root_v6`).
- Redux `quran.memorizedSurahs`: gains the surah when all its ayahs are `ok` (`recordTasmee` reducer).
- Session state (revealed ayahs, marked words) is component state. Leaving mid-session discards it after a confirmation alert; nothing is recorded.
- Model file: `{documentDirectory}asr/quran-ctc-int8.onnx` (downloaded to `.part`, then moved). Considered present if it exists and is at least 1 MB.
- Setup choices (voice, mode, help) are not remembered between sessions.

## Native, notifications and permissions

- `RECORD_AUDIO` is declared in `app.json` and requested at runtime by `requestMic()` when the user first presses «سمّع». If denied, the screen shows the `noMic` message and stays usable by hand.
- Native modules: `onnxruntime-react-native` (added to the package list and kept from ProGuard by `plugins/withOwwabNative.js`), `@fugood/react-native-audio-pcm-stream`, expo-av (correction audio, «الشيخ»), expo-file-system.
- No notifications. Listening runs only while the screen is open; no foreground service.

## External services

| Host | When | Sent | Returned |
|---|---|---|---|
| `github.com` (`Medo6143/Awab`, release `model-quran-ctc-v1`) | Once, when the user taps «نزّل ملف الصوت» | A plain file download request | `quran-ctc-int8.onnx`, about 157 MB (`MODEL_MB`) |
| `audio.qurancdn.com` | `correct` voice mode only | `GET /wbw/{SSS}_{AAA}_{WWW}.mp3` (which word) | The word's audio |
| `api.alquran.cloud` | Loading each page | Page number | Page text |
| `everyayah.com` | «الشيخ» in self-check | Reciter + ayah | Ayah audio |

**What stays on the device:** microphone audio and transcripts. Audio is held in memory (last 3 s), passed to the local model and discarded; it is never written to disk or uploaded. In `correct` mode the server learns which word was requested, not what the user said.

## Settings that affect it

- No entries in the Settings screen. All options are in `TasmeeSetupSheet`: page range (steppers; long-press steps by 10), presets («الصفحة دي», «صفحتين», «ربع حزب», «السورة كلها»), mode, voice mode, help level.
- `settings.selectedReciterId` selects the voice for «الشيخ».
- Accent colour applies to the controls (`useAccent`); the page keeps the mushaf's fixed colours.

## Edge cases and limitations

- Page text needs the network; voice recognition itself works offline once the model is downloaded.
- The download is not resumable across attempts (a failed download deletes the `.part` file). No Wi-Fi-only check; the sheet only recommends Wi-Fi.
- If the model is missing or fails to load, voice mode shows an error and the «سمّع» button is disabled.
- Uncovering an ayah without reciting it («اكشف الآية من غير تسميع», «اكشف الصفحة كلها») leaves it unmarked, so it counts as correct and can complete a surah.
- In `mark` mode a mis-marked word can be un-marked by tapping it after the ayah is revealed.
- The setup sheet's time estimate is a fixed 3 minutes per page.
- A debug line marked TEMPORARY logs every transcript to logcat (`useVoiceTasmee.ts` line 121).
- Recognition accuracy on different phones and voices: Not verified.

## Open issues

None
