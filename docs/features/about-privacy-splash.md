# About, privacy and launch («عن أوّاب» · «الخصوصية»)

> Status: Shipped · Two static information screens, the animated launch screen, and the startup sequence that mounts the app and its global overlays.

## What it does

- **About («عن التطبيق»)** – logo, name, the verse «إِنَّهُ أَوَّابٌ», the version from `expoConfig.version`, a six-item feature list and a list of content sources with credits (including the CC BY 4.0 credit for the speech model).
- **Privacy («الخصوصية»)** – six cards of fixed text: summary, what stays on the device, location, services contacted, permissions, deleting data.
- **Animated splash** – shown once per cold start over the app: a gold mihrab outline draws itself, light falls on a prostrating figure, then the name and verse appear. It lasts about 4.3 s plus a 380 ms fade; tapping anywhere skips it.
- **Startup** – `index.ts` and `App.tsx` force RTL, register audio playback, load fonts, restore the store, and mount three global overlays.

There is no onboarding flow: no first-run screens, no permission walkthrough, no stored "first launch" flag. The first launch goes from the splash straight to Home, and permissions are asked when a feature first needs them (location and notifications are requested within seconds of the first launch by `useLocation` and `useNotifications`).

## How the user reaches it

- About: Home → gear → «عن أوّاب» (2 taps). Route `عن_التطبيق`.
- Privacy: Home → gear → «الخصوصية» (2 taps). Route `الخصوصية`.
- Splash: every cold start, no route (rendered by `App.tsx`).

## How it works

Launch order:

| Step | Where | What happens |
|------|-------|--------------|
| 1 | `index.ts` | `I18nManager.allowRTL(true)`, `forceRTL(true)`, `swapLeftAndRightInRTL(true)` before `App` is imported |
| 2 | `index.ts` | `registerRootComponent(App)`, then `TrackPlayer.registerPlaybackService` with `TrackPlayerService` (remote play/pause/stop/seek/jump handlers) |
| 3 | `App.tsx` module scope | `SplashScreen.preventAutoHideAsync()`; a `QueryClient` is created; `global.css` (NativeWind) is imported |
| 4 | `App` effects | `appDependencies.notifications.init()` sets the foreground notification handler; RTL is forced again if `I18nManager.isRTL` is false; `initializeTrackPlayer()` sets up the player and its capabilities |
| 5 | `App` | Loads Tajawal (400/500/700/800) and Amiri (400/700). Ready when fonts loaded, failed, or 8 s passed, **and** the player setup has settled. Until then it renders `null` under the native splash |
| 6 | `App` | `SplashScreen.hideAsync()`; renders `ErrorBoundary` → `SafeAreaProvider` → Redux `Provider` → `PersistGate` → `Bootstrapper` |
| 7 | `Bootstrapper` | Calls `useNotifications()` (prayer times, permission request, full reschedule after 1.5 s, adhan and reminder listeners) and dispatches the athkar `syncDailyReset` |
| 8 | `Bootstrapper` children | `QueryClientProvider` → `ThemeRoot` → `AppNavigation`, with `AnimatedSplash` drawn on top until it reports done |
| 9 | `Bootstrapper` overlays | `AzanVideoModal` (driven by `ui.azanModal`), `ReminderAlarm` (driven by `ui.ringingReminder`), `FloatingTasbeehController` (keeps the native floating sebha in sync) |

The three overlays sit outside the navigator, so they can appear over any screen. `ui` is not persisted, so an open adhan screen does not come back after the app is killed. `AppNavigation` also runs `useAudio()` to keep the audio slice in sync with TrackPlayer.

The splash animates with `Animated` (stroke dash offsets for the two arch paths, opacity and translate for the rest). Its background is fixed at `#0c0805`, the same colour as the native splash in `app.json`, so the hand-off is not visible.

`ErrorBoundary` in `App.tsx` replaces the whole app with an Arabic error message when a render throws; there is no retry button.

## Code map

| Layer | File | Role |
|-------|------|------|
| Entry | `index.ts` | RTL, root component, TrackPlayer service registration |
| Entry | `App.tsx` | Fonts, player setup, providers, `ErrorBoundary`, `Bootstrapper`, overlays |
| Screen | `src/presentation/screens/AboutScreen.tsx` | `FEATURES` and `SOURCES` lists, version |
| Screen | `src/presentation/screens/PrivacyScreen.tsx` | `SECTIONS` text |
| Component | `src/presentation/components/splash/AnimatedSplash.tsx` | Launch animation |
| Component | `src/presentation/components/azan/AzanVideoModal.tsx` | Global adhan screen |
| Component | `src/presentation/components/reminders/ReminderAlarm.tsx` | Global reminder alarm screen |
| Component | `src/presentation/components/tasbeeh/FloatingTasbeeh.tsx` | `FloatingTasbeehController` |
| Hook | `src/presentation/hooks/useNotifications.ts` | Scheduling and adhan/reminder listeners |
| Data | `src/data/services/TrackPlayerService.ts` | Playback service and `initializeTrackPlayer` |
| Data | `src/data/container.ts` | `appDependencies` composition root |
| Data | `src/data/notifications/ExpoNotificationCenter.ts` | `init()`, permission request, reschedule cycle |
| Store | `src/presentation/store/index.ts` | Persist config (`ui` and `audio` blacklisted) |
| Store | `src/presentation/store/slices/uiSlice.ts` | `azanModal`, `ringingReminder` |
| Theme | `src/shared/theme/ThemeRoot.tsx` | Palette choice around the navigator |
| Navigation | `src/presentation/navigation/AppNavigation.tsx` | Routes `عن_التطبيق`, `الخصوصية` |
| Assets | `assets/images/sajid.png`, `assets/icon.png`, `assets/splash-blank.png` | Splash figure, About logo, native splash image |

## State and storage

About, Privacy and the splash store nothing. Whether the splash has been shown is `useState` in `App`, so it replays on every cold start. The whole Redux store except `ui` and `audio` is persisted under the AsyncStorage key `persist:root_v6`. Other AsyncStorage keys written directly by the data layer: `mosques:v2:<lat>,<lon>` (`MosqueService.ts`) and a per-hadith cache (`HadeethEncRepository.ts`). The speech model is saved to the app's document directory under `asr/`.

## Native, notifications and permissions

- RTL: forced from JS in `index.ts` and again in `App.tsx`. The comment in `App.tsx` says it is also forced in `MainApplication.kt`; no such code is in `native/` or `plugins/`. Not verified (the generated `android/` folder is gitignored).
- Launch itself triggers the notification permission prompt and the location prompt through `useNotifications` → `usePrayerTimes`.
- Declared Android permissions (`app.json`): `USE_FULL_SCREEN_INTENT`, `SCHEDULE_EXACT_ALARM`, `USE_EXACT_ALARM`, `RECEIVE_BOOT_COMPLETED`, `WAKE_LOCK`, `VIBRATE`, `FOREGROUND_SERVICE`, `FOREGROUND_SERVICE_MEDIA_PLAYBACK`, `FOREGROUND_SERVICE_SPECIAL_USE`, `REQUEST_IGNORE_BATTERY_OPTIMIZATIONS`, `SYSTEM_ALERT_WINDOW`, `POST_NOTIFICATIONS`, `RECORD_AUDIO`. Media read permissions are blocked. Location is added by expo-location.

## External services

About and Privacy make no requests. The table checks the Privacy screen's list against every host found under `src/` (Grep for `https://`).

| Host | Used by | Sent | On Privacy screen | On About screen |
|------|---------|------|-------------------|-----------------|
| `api.aladhan.com` | Prayer times | Exact latitude and longitude, method, school | Yes | Yes |
| `api.alquran.cloud` | Mushaf text | Surah / page numbers | Yes | Yes |
| `api.quran.com` | Tafsir | Tafsir id, ayah key | Yes | Yes |
| `hadeethenc.com` | Hadith text and explanation | Hadith id | Yes | Yes |
| `server*.mp3quran.net` | Full-surah audio | Reciter path, surah number | Yes | Yes |
| `everyayah.com` | Ayah audio, reminder recitation | Reciter folder, surah, ayah | Yes | Yes |
| `audio.qurancdn.com` | Word audio in tasmee | Surah, ayah, word position | **No** (only "quran.com" for tafsir) | Yes, as quran.com word by word |
| `github.com` (release asset) | One-time 157 MB speech model download | Nothing beyond the request | **No** | Credit only, no mention of a download |
| `owwab.vercel.app` | Nearest mosques | Position rounded to 3 decimals (about 100 m) | **No** | **No** |
| `nominatim.openstreetmap.org` | Nearest mosques fallback | Bounding box around the rounded position, `User-Agent: Owwab/1.0` | **No** | **No** |
| `www.google.com/maps` | Directions and map search links, opened in an external app | Mosque coordinates; the search link carries the user's exact position | **No** | **No** |
| `www.islamcan.com` | Nothing: `MUEZZINS` in `AzanConstants.ts` is never imported | — | — | — |

Mismatches between the Privacy text and the code:

1. **Location.** The screen says location is used for prayer times and qibla only, and that coordinates go to aladhan.com. Since nearest mosque (#21) the rounded position also goes to `owwab.vercel.app` (and to Nominatim as a fallback), and exact coordinates are placed in Google Maps links.
2. **Location switch.** The screen says «مواقيت الصلاة حسب الموقع» can be turned off in Settings. The switch only flips `settings.locationEnabled`, which nothing reads, so location is still requested and sent.
3. **Service list is incomplete.** `audio.qurancdn.com` and the GitHub model download are missing.
4. **Microphone.** Voice tasmee requests `RECORD_AUDIO`; the permissions card does not mention it. Recognition runs on the device (ONNX model), and no audio upload was found under `src/`.
5. **Location permission** is described in its own card but not listed in the permissions card; the country lookup is described correctly (device geocoder).
6. **dorar.net** is credited on About for hadith review; no request to it exists in `src/`, which is consistent with Privacy.

Confirmed as stated: no account, no analytics or ad SDK calls found under `src/`, user data kept in AsyncStorage on the device. `expo-updates` is a dependency in `package.json` with no update URL in `app.json`; whether it contacts a server is Not verified.

## Settings that affect it

- `settings.theme`: About and Privacy follow light/dark. The splash keeps its dark background but takes `colors.gold` from the active palette.
- `settings.azanSettings.visualAzanEnabled` and `.type` decide whether the global adhan modal opens and plays.
- Accent colour: neither screen follows it (both use `colors.gold`).

## Edge cases and limitations

- If `TrackPlayer.setupPlayer()` hangs, `playerReady` never becomes true and the app stays on the native splash; only fonts have a timeout (8 s).
- `forceRTL` takes effect only after a restart, so a very first launch on an LTR device may lay out LTR once. Not verified on a device.
- The splash is not shown when the app resumes from the background, only on a cold start.
- Privacy and About texts are hard-coded; nothing ties them to the actual host list, so they drift (see the mismatches above).
- About falls back to version `1.0.0` when `expoConfig` is missing.
- `ErrorBoundary` uses fixed dark colours and shows the raw error message.

## Open issues

None filed for these screens. The privacy-text mismatches above have no issue number yet.
