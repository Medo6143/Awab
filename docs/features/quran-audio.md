# Quran audio (التلاوة)

> Status: Shipped, with known bugs · Ayah, page and full-surah recitation by four reciters; full-surah playback has media controls, ayah/page playback has a broken stop/pause button.

## What it does

- **Ayah playback:** long-press an ayah on the mushaf page, or «الصوت» in the tafsir sheet, or «الشيخ» in self-check tasmee.
- **Page playback:** the play button in the mushaf top bar plays every ayah of the open page in order.
- **Full-surah recitation:** the «تلاوة كاملة» tab of the index modal plays a whole surah as one file, with a media notification and lock-screen controls.
- **Reciters:** four, shared by all three modes.

## How the user reaches it

There is no audio screen and no route of its own; everything lives inside the mushaf (tab `TabQuran` in `src/presentation/navigation/AppNavigation.tsx`).

| Action | Path from the home screen | Taps |
|---|---|---|
| Play the page | «القرآن» tab → play icon | 2 |
| Play one ayah | «القرآن» tab → long-press the ayah | 1 + long-press |
| Play one ayah (visible button) | «القرآن» tab → tap ayah → «الصوت» | 3 |
| Full surah | «القرآن» tab → index icon → «تلاوة كاملة» → surah row | 4 |
| Change reciter | … «تلاوة كاملة» → «تغيير القارئ» → reciter; or Settings → Quran section | 5 |

## How it works

Two audio engines sit behind one class, `ExpoAudioPlayer` in `src/data/services/AudioService.ts`, registered in the container as `quranPlayer` (and as `azanSound`: they share one expo-av `Sound`).

| Mode | Hook call | Engine | URL | Notification |
|---|---|---|---|---|
| Full surah | `playSurah` | react-native-track-player | `https://server{serverNum}.mp3quran.net/{server}/{SSS}.mp3` | Yes |
| One ayah | `playAyah` | expo-av | `https://everyayah.com/data/{folder}/{SSS}{AAA}.mp3` | No |
| Page | `playSequence` | expo-av, one ayah after another | Same as ayah | No |

- **Full surah.** `playSurah` unloads any expo-av sound, calls `initializeTrackPlayer()` once (`setupPlayer` + `updateOptions`), then `TrackPlayer.reset()`, `add()` (title = surah name, artist = reciter, artwork = `assets/images/mosque_bg.png`) and `play()`. Capabilities: play, pause, stop, jump forward/backward 15 s, seek. Remote events are handled by `TrackPlayerService`, registered in `index.ts` with `TrackPlayer.registerPlaybackService`.
- **Ayah / page.** `playAyahInternal` first calls `TrackPlayer.reset()` (to remove the notification), then `Audio.Sound.createAsync({ uri }, { shouldPlay: true })`. On `didJustFinish`, `handleAyahFinish` plays the next item of the sequence or calls the `onFinish` callback. The page's ayah list comes from `quran.peekPage(currentPage)`, i.e. the page must already be loaded.
- **State sync.** `useAudio` is mounted once in `AppNavigation` and in each screen that plays audio. It copies TrackPlayer's `usePlaybackState()` / `useProgress()` into the `audio` slice: `isPlaying = playbackState === State.Playing`, `isBuffering = Buffering || Loading`. Before each play call the hook also sets `isBuffering: true` by hand.
- **Reciter.** `useAudio` calls `player.setReciter(selectedReciterId)` whenever the setting changes. A change applies to the next play call, not to audio already playing.

### Known bug: the page play button cannot stop playback (#5)

Verified in code:

1. `QuranScreen.tsx` lines 193–207: the button calls `togglePlayback()` only `if (isPlaying)`, otherwise it starts `playSequence` for the page.
2. `useAudio.ts` lines 26–36: `isPlaying` is derived only from TrackPlayer (`playbackState === State.Playing`).
3. `AudioService.ts` lines 71–102 and 103–110: ayah and page playback use expo-av (the "No Notification" path, log line at 81) and reset TrackPlayer first, so TrackPlayer is never in `State.Playing`.

Result: during ayah or page playback `isPlaying` stays `false`, the icon never becomes Pause, and a second tap runs `playSequence` again, restarting the page from its first ayah. Nothing in the UI can stop it: `stopPlayback` exists in `useAudio` but no screen calls it. Even if `togglePlayback` were reached, it checks `state.isPlaying` again and would call `resume()`, not `pause()`.

Related, from reading the code (not verified on a device): `playAyah` and `playSequence` set `isBuffering: true` manually; it is only cleared by the next TrackPlayer state/progress change or, for a page, by the `onFinish` callback. A single ayah has no finish callback, so the top-bar button may keep showing the spinner.

## Code map

| Layer | File | Role |
|---|---|---|
| Hook | `src/presentation/hooks/useAudio.ts` | Play calls, reciter sync, TrackPlayer → Redux sync |
| Service | `src/data/services/AudioService.ts` | `ExpoAudioPlayer`: both engines, sequence logic |
| Service | `src/data/services/TrackPlayerService.ts` | Remote-control handlers; `initializeTrackPlayer` |
| Entry | `index.ts` | Registers the TrackPlayer playback service |
| Domain | `src/domain/services/Audio.ts` | `QuranPlayer`, `AzanSound`, `AyahKey` contracts |
| Domain | `src/domain/entities/reciters.ts` | `RECITER_MAP`, `DEFAULT_RECITER_ID` |
| DI | `src/data/container.ts` | One `ExpoAudioPlayer` instance as `quranPlayer` and `azanSound` |
| UI | `src/presentation/screens/QuranScreen.tsx` | Page play button, long-press handler |
| UI | `src/presentation/components/quran/SurahPickerModal.tsx` | «تلاوة كاملة» tab |
| UI | `src/presentation/components/quran/ReciterPickerModal.tsx` | Reciter list |
| UI | `src/presentation/components/quran/TafsirBottomSheet.tsx` | «الصوت» button |
| Store | `src/presentation/store/slices/audioSlice.ts`, `src/presentation/store/slices/settingsSlice.ts` | Playback state; `selectedReciterId` |

## State and storage

| Slice | Fields | Persisted |
|---|---|---|
| `audio` | `isPlaying`, `isBuffering`, `currentSurahId`, `currentPosition`, `duration`, `playMode` (`surah` / `ayah` / `sequence`) | No (`blacklist: ['ui', 'audio']` in `src/presentation/store/index.ts`) |
| `settings` | `selectedReciterId` (default `alafasy`) | Yes, AsyncStorage key `root_v6` |

No audio is downloaded or cached by the app; every play streams from the network.

## Native, notifications and permissions

- `react-native-track-player` runs a media foreground service (`FOREGROUND_SERVICE`, `FOREGROUND_SERVICE_MEDIA_PLAYBACK` in `app.json`; `POST_NOTIFICATIONS` for the notification). Notification colour `0xD4AF37`; if the app is killed, playback stops and the notification is removed (`StopPlaybackAndRemoveNotification`).
- Full-surah playback: notification and lock-screen controls (play, pause, stop, ±15 s, seek).
- Ayah and page playback: no notification, no lock-screen controls, no headset-button handling. Whether it keeps playing in the background: Not verified (`setAudioModeAsync` with `staysActiveInBackground` is only called by the adhan path).
- No runtime permission is requested for playback.

## External services

| Host | Sent | Returned |
|---|---|---|
| `server{N}.mp3quran.net` | `GET /{server}/{SSS}.mp3` (reciter code + surah number) | One MP3 per surah |
| `everyayah.com` | `GET /data/{folder}/{SSS}{AAA}.mp3` (reciter folder + surah + ayah) | One MP3 per ayah |

Reciters (`RECITER_MAP`):

| Id | Name | everyayah folder | mp3quran server |
|---|---|---|---|
| `alafasy` | مشاري العفاسي | `Alafasy_128kbps` | `server8` / `afs` |
| `abdulbasit` | عبد الباسط (مرتل) | `Abdul_Basit_Murattal_64kbps` | `server7` / `basit` |
| `husary` | الحصري | `Husary_128kbps` | `server13` / `husr` |
| `sudais` | السديس | `Abdurrahmaan_As-Sudais_192kbps` | `server11` / `sds` |

## Settings that affect it

- `settings.selectedReciterId`: changed from the reciter picker in the index modal or the Quran section of the Settings screen. The same value also feeds reminder scheduling (`useNotifications` passes the reciter folder).

## Edge cases and limitations

- The page button plays only ayahs returned by `peekPage`; if the page is still loading the tap does nothing.
- `playSurah` returns `false` on failure, but `useAudio.playSurah` ignores the result and has already set `isBuffering: true`; nothing clears it if TrackPlayer never reports a state change. This is a plausible cause of #15, Not verified on a device.
- In the «تلاوة كاملة» list, tapping the current surah calls `togglePlayback` (pause/resume); tapping another starts it. There is no seek bar or position display anywhere, although `currentPosition` / `duration` are synced.
- `stopPlayback`, `seekTo` and `resumePlayback` are returned by `useAudio` but not used by any screen.
- A comment in `togglePlayback` refers to a "persisted current surah" after restart; the `audio` slice is not persisted, so `currentSurahId` is `null` after restart.
- Starting the in-app adhan replaces a playing ayah (shared `Sound`); starting an ayah resets a playing surah.
- Recitations cannot be reached from the home screen or the tab bar.

## Open issues

- #5 — Mushaf: stop button does not work after playing an ayah or a page
- #10 — UX: recitations are only reachable from inside the mushaf
- #15 — Full-surah recitation stays on the loading spinner (needs check on a real phone)
