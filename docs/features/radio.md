# Quran radio (الإذاعة)

> Status: Shipped · Live Quran radio: the Cairo and Saudi Quran radios, and about 170 mp3quran stations (reciters around the clock, tafsir, ruqyah), playing in the background with the media notification.

## What it does

- Home → «الإذاعة» (it took the «الختمات» tile; khatmat is still reachable from the mushaf and from «نور القلب»).
- On top: «إذاعة القرآن الكريم من القاهرة» and «إذاعة القرآن الكريم السعودية», each a card with a live dot and a play button.
- Below: «إذاعات القرّاء والتفسير», the mp3quran list with a search that ignores tashkeel, alef forms and spaces («عبد الباسط» finds «عبدالباسط»).
- A bar at the bottom shows the station with a «مباشر» tag, play/pause and stop. Pausing a live stream and pressing play starts it again at the live point, not minutes behind.
- One player for everything: starting a station stops a surah, and the other way round.

## How it works

1. `useRadioStations` asks `radios.stations()` (`Mp3QuranRadioDirectory`): GET `https://www.mp3quran.net/api/v3/radios?language=ar`, kept in AsyncStorage (`radios:v1`) for 7 days and served from there when offline. `tidyStations` drops the stations already featured and trims trailing dashes from names.
2. Tapping a station calls `useAudio().playLive(station)`, which records `playMode: 'live'` and `liveStation` in the audio slice and calls `QuranPlayer.playLive`.
3. `ExpoAudioPlayer.playLive` follows the stream's redirects first (`resolveStreamUrl`, headers only) and plays the final address over https. Radiojar answers its https URL with a redirect to http, which Android's player refuses (cross-protocol redirect, cleartext off); the same address works over https.
4. The stream goes through react-native-track-player with `isLiveStream: true`, so it keeps playing in the background with the notification and lock-screen controls.

## Code map

| Layer | File | Role |
|---|---|---|
| Domain | `src/domain/entities/radio.ts` | `RadioStation`, `FEATURED_STATIONS`, `searchStations`, `tidyStations` |
| Domain | `src/domain/services/Radio.ts` | `RadioDirectory` |
| Domain | `src/domain/services/Audio.ts` | `QuranPlayer.playLive` |
| Data | `src/data/services/Mp3QuranRadioDirectory.ts` | The station list, cached |
| Data | `src/data/services/AudioService.ts` | `playLive`, `resolveStreamUrl` |
| Hook | `src/presentation/hooks/useRadioStations.ts` | Load, error, retry |
| Hook | `src/presentation/hooks/useAudio.ts` | `playLive`, live-aware `togglePlayback` |
| Screen | `src/presentation/screens/RadioScreen.tsx` | Featured cards, search, list |
| Component | `src/presentation/components/quran/NowPlayingBar.tsx` | The bottom bar, shared with «التلاوات» |

## External services

| Host | Sent | Returned |
|---|---|---|
| `www.mp3quran.net` | Nothing personal | The station list |
| `stream.radiojar.com` (Cairo, Saudi) | Nothing personal | Live MP3 |
| `backup.qurango.net` (mp3quran stations) | Nothing personal | Live MP3 |

## Edge cases and limitations

- The Cairo stream is the widely used radiojar relay, not an official Maspero URL. If it moves, `FEATURED_STATIONS` needs the new address.
- Some mp3quran stations share a reciter's name (different recitation styles); the API gives no more detail.
- About 30 MB an hour of mobile data; the screen says so.
- Not verified on a device yet: background playback, the notification, and the Cairo redirect handling.
