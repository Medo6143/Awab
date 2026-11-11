# Prayer times (مواقيت الصلاة)

> Status: Shipped · Today's five prayer times for the phone's position, fetched once a day from AlAdhan, shown under the "living sky" with a check-off for each prayer.

## What it does

- Shows Fajr, Dhuhr, Asr, Maghrib and Isha for today, plus sunrise in a footnote, the Hijri date and the weekday.
- Highlights the next prayer and counts down to it (the countdown itself is drawn by `SkyHero`).
- Lets the user tick each prayer as prayed. A prayer cannot be ticked before its time.
- Shows which calculation method and which Asr school the times were computed with.
- Hosts the Qibla compass in the same tab (see `docs/features/qibla.md`) and the nearest-mosque card (see `docs/features/nearest-mosque.md`).
- Feeds the same times to the adhan alarms, the notification schedulers and the home-screen widget.

## How the user reaches it

| Path | Taps from launch | Route |
|---|---|---|
| Bottom tab «الصلاة» | 1 | `TabPrayer` (`PrayerHubScreen`, opens on the times) |
| Home → tap the next-prayer area of the sky hero | 1 | `TabPrayer` |
| Stack route `الصلاة` (`PrayerTimesScreen` with a back button) | Not verified: registered in `src/presentation/navigation/AppNavigation.tsx`, but no `navigate('الصلاة')` call was found | `الصلاة` |

`TabPrayer` accepts `{ screen: 'times' | 'qibla' }`. On the times view the hub renders `PrayerTimesScreen` alone (its sky hero carries a «القبلة» button); on the qibla view it renders the hub header with two chips.

## How it works

1. `usePrayerTimes` calls `useLocation({ watchHeading: false })`, which asks `ExpoLocationProvider.currentPosition()` once per hook instance.
2. `ExpoLocationProvider` requests foreground permission, then tries `getCurrentPositionAsync` (Balanced accuracy). If that throws it falls back to the last known fix (max age 24 h), then to a Highest-accuracy request. It then reverse-geocodes the fix to get the ISO country code (failure is tolerated; the code stays `null`).
3. Method: `settings.prayerMethod` (`'auto'` by default). Auto maps the country code through `methodForCountry` in `src/domain/entities/prayerMethods.ts`; unlisted or unknown countries use method 3 (Muslim World League).
4. Asr school: `asrSchoolFor(settings.asrMethod, countryCode)`. Auto is Hanafi (1) for PK, IN, BD, AF and standard (0) everywhere else.
5. Cache check: if `prayer.cachedData` is for today (`DD-MM-YYYY`), has the same method id and the same school, it is reused and no request is made.
6. Otherwise `PrayerTimeService.getPrayerTimes(lat, lon, method, school)` calls AlAdhan. When `|latitude| >= 48` it adds `latitudeAdjustmentMethod=3` (angle-based rule for high latitudes).
7. The response is stored with `setPrayerData`; a failed request sets `status = 'failed'`.
8. `findNextPrayer` (`src/domain/entities/prayer.ts`) picks the next entry of Fajr, Sunrise, Dhuhr, Asr, Maghrib, Isha after now, or tomorrow's Fajr. `usePrayerTimes` recomputes it every 60 s.
9. Every time times are loaded (cache or network), and whenever the next prayer changes, the hook pushes data to the widget.

Auto method table (country → AlAdhan method id):

| Countries | Method |
|---|---|
| SA, YE | 4 Umm al-Qura |
| EG, SD, LY, SY, LB, PS, IQ | 5 Egyptian General Authority |
| JO 23 · AE 16 · KW 9 · QA 10 · BH, OM 8 | regional |
| MA 21 · DZ 19 · TN 18 · TR, AZ 13 · IR 7 | regional |
| PK, IN, BD, AF | 1 Karachi |
| ID 20 · MY 17 · SG, BN 11 · US, CA 2 · FR 12 · RU 14 · PT 22 | regional |
| anything else | 3 Muslim World League |

Checking off a prayer: `useToggleIbada` dispatches `toggleTask` (ibada slice) and `logPrayer` (stats slice) together, so the prayer screen, the worship list and the statistics agree. `prayerNotYet` blocks a tick before the prayer's time with a warning haptic and an alert; unticking is always allowed.

## Code map

| Layer | File | Role |
|---|---|---|
| Screen | `src/presentation/screens/PrayerHubScreen.tsx` | The «الصلاة» tab: switches between times and qibla |
| Screen | `src/presentation/screens/PrayerTimesScreen.tsx` | Sky hero, the five rows, footnote, nearest-mosque card, empty/error/skeleton states |
| Component | `src/presentation/components/home/SkyHero.tsx` | The sky, the sun arc and the countdown shared with Home |
| Component | `src/presentation/components/prayer/PrayerTimesStyles.ts` | Hub chip styles (and styles for the older row components) |
| Component | `src/presentation/components/prayer/PrayerTimesComponents.tsx` | `PrayerCountdown`, `PrayerTimeRow`, `PrayerListSkeleton`: no importer found (dead code) |
| Hook | `src/presentation/hooks/usePrayerTimes.ts` | Location → method → cache → fetch → next prayer → widget |
| Hook | `src/presentation/hooks/useLocation.ts` | Position once, country code, optional compass |
| Hook | `src/presentation/hooks/useToggleIbada.ts` | Tick/untick with the "not yet" rule |
| Data | `src/data/services/PrayerTimeService.ts` | AlAdhan request, Asr school rule |
| Data | `src/data/services/LocationService.ts` | `ExpoLocationProvider` on expo-location |
| Data | `src/data/api/clients.ts` | `prayerApi` axios client (no timeout set) |
| Data | `src/data/api/prayerService.ts` | `fetchPrayerTimes` by city: no importer found (dead code) |
| Domain | `src/domain/entities/prayerMethods.ts` | Method list, country table, default |
| Domain | `src/domain/entities/prayer.ts` | `findNextPrayer`, `prayerJustStarted`, `prayerFromNotification` |
| Domain | `src/domain/services/Location.ts` | `LocationProvider` interface |
| Store | `src/presentation/store/slices/prayerSlice.ts` | Cached day of times |
| Store | `src/presentation/store/slices/settingsSlice.ts` | `prayerMethod`, `asrMethod` |

## State and storage

- `prayer.cachedData`: the whole AlAdhan `data` object (`timings`, `date`, `meta`). `prayer.lastFetchedDate` is written but never read for decisions. `prayer.status`: `idle | loading | failed`.
- `settings.prayerMethod` (`'auto'` or a method id), `settings.asrMethod` (`auto | shafii | hanafi`).
- `ibada.tasks` (ids `fajr`, `dhuhr`, `asr`, `maghrib`, `isha`) and the stats slice hold the ticks.
- Everything above is persisted by redux-persist in AsyncStorage under `persist:root_v6` (`src/presentation/store/index.ts`). Coordinates and country code are not stored; they live in hook state only.

## Native, notifications and permissions

- Permission: foreground location, requested by expo-location the first time any screen mounts `useLocation`. Location permissions are not listed in `app.json`; Not verified where the manifest entries come from (presumably expo-location's own manifest).
- No native code of its own. The times are consumed by the adhan alarms (`docs/features/adhan.md`), the schedulers (`docs/features/notifications.md`) and the widget (`docs/features/widget.md`).

## External services

| Host | Sent | Returned |
|---|---|---|
| `api.aladhan.com` (GET /v1/timings) | `latitude`, `longitude` (full precision), `method`, `school`, optional `latitudeAdjustmentMethod=3` | `timings` (HH:mm strings), `date` (Gregorian + Hijri), `meta` (method id, school) |
| OS geocoder via expo-location `reverseGeocodeAsync` | The coordinates | Address list; only `isoCountryCode` is used |

## Settings that affect it

Settings → «الصلاة والأذان»:

- «طريقة حساب المواقيت» (`PrayerMethodSelector`): «تلقائي حسب بلدك» or one of the 21 methods in `PRAYER_METHODS`. Changing it refetches.
- «حساب وقت العصر» (`AsrMethodSelector`): auto, majority (Shafi'i), Hanafi. Changing it refetches.
- «مواقيت الصلاة حسب الموقع» toggles `settings.locationEnabled`, but no code reads that flag, so the switch has no effect.

## Edge cases and limitations

- The cache key is date + method + school only. Travelling to another city on the same day keeps the old city's times until the date changes or a setting changes.
- Times are fetched only while the app is open. If the app is not opened for days, alarms and the widget keep yesterday's clock times.
- `usePrayerTimes` is mounted in several places at once (`useNotifications` in `App.tsx`, Home, the prayer screen, the worship list). Each instance runs its own location lookup and its own 60 s timer.
- No location permission: `EmptyState` «حدّد موقعك» with a retry button. `retry` only re-runs the fetch effect; it does not re-request the position, because `useLocation` fetches once on mount.
- Network failure with no cache: `ErrorState`. With a cache from an earlier day the old times stay on screen with no stale indicator.
- The "not yet" rule compares clock minutes on the same day, so after midnight tomorrow's Fajr row is locked again until Fajr.
- `PrayerTimesScreen` has its own `METHODS` name table (14 entries) separate from `PRAYER_METHODS` (21 entries); methods 7, 11, 14, 17, 18, 20, 22 show no method name in the footnote.
- `settings.calculationMethod` (default 5) is a leftover field: it has a reducer but nothing reads it.

## Open issues

None filed for this feature specifically. Related: #20 — UI polish found in the UX pass.
