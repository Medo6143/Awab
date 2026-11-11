# Qibla (اتجاه القبلة)

> Status: Shipped · A compass that turns with the phone and points a Kaaba needle along the great-circle bearing to Makkah, computed on the device.

## What it does

- Rotates a compass disk against the phone's heading and a Kaaba pointer toward the qibla.
- Shows two numbers: the qibla bearing from north, and the current deviation of the phone from it.
- Declares "aligned" when the deviation is under 5 degrees: the ring turns gold, the status line changes to «أنت تواجه القبلة», and the phone gives one medium haptic.
- Shows the compass sensor's accuracy as a chip (high, medium, low, or "calibrating").

## How the user reaches it

| Path | Taps from launch | Route |
|---|---|---|
| Home → «القبلة» tile in the sections grid | 1 | `القبلة` (stack, with a back header) |
| Bottom tab «الصلاة» → «القبلة» button on the sky hero | 2 | `TabPrayer` with the hub's internal tab set to `qibla` |
| Deep param: `navigate('TabPrayer', { screen: 'qibla' })` | n/a | `TabPrayer` |

Inside the hub, `QiblaScreen` is rendered with `hideHeader` and `tab`, under the hub's own header and its two chips («المواقيت», «القبلة»).

## How it works

1. `QiblaScreen` calls `useLocation()` with the compass enabled.
2. Position: `ExpoLocationProvider.currentPosition()` runs once on mount (Balanced accuracy, then last known fix up to 24 h old, then Highest accuracy).
3. Bearing: `qiblaBearing(coords)` in `src/domain/services/geo.ts` is the initial great-circle bearing from the user to the Kaaba at 21.4225 N, 39.8262 E, in degrees 0 to 360 clockwise from north. No network is involved.
4. Heading: `useHeading` subscribes to `watchHeadingAsync`. `ExpoLocationProvider.watchHeading` reports `trueHeading`, or `magHeading` while `trueHeading` is -1 (before the phone knows where it is).
5. Smoothing: each reading moves the stored heading 70 % of the way along the shorter arc (`last + shortestDelta * 0.7`), so 359 to 1 moves 2 degrees and not 358.
6. Rotation: `qiblaRotation = (qiblaDir - heading + 360) % 360`; deviation is `min(rotation, 360 - rotation)`.
7. Animation: disk and pointer are driven by two `Animated.Value`s with 100 ms timing and the native driver. Targets are unwrapped with a "shortest path" helper so the disk never spins the long way round.
8. Accuracy: expo's 3, 2, 1 map to `high`, `medium`, `low`; anything else is `unknown` (shown as «معايرة»).

| Number | Value | Where |
|---|---|---|
| Aligned threshold | under 5 degrees | `src/presentation/screens/QiblaScreen.tsx` |
| Smoothing factor | 0.7 per reading | `src/presentation/hooks/useLocation.ts` |
| Animation duration | 100 ms | `src/presentation/screens/QiblaScreen.tsx` |
| Kaaba coordinates | 21.4225, 39.8262 | `src/domain/services/geo.ts` |

## Code map

| Layer | File | Role |
|---|---|---|
| Screen | `src/presentation/screens/QiblaScreen.tsx` | Layout, rotation maths, alignment, haptic, status text |
| Screen | `src/presentation/screens/PrayerHubScreen.tsx` | Embeds the qibla as the second view of the «الصلاة» tab |
| Component | `src/presentation/components/qibla/QiblaComponents.tsx` | `CompassDisk` (image + N/E/S/W ticks) and `QiblaPointer` (needle + Kaaba) |
| Component | `src/presentation/components/qibla/QiblaStyles.ts` | Styles |
| Asset | `assets/images/qibla_compass_bg.png` | The disk image |
| Hook | `src/presentation/hooks/useLocation.ts` | `useLocation` (position, country, qibla bearing) and `useHeading` (compass) |
| Data | `src/data/services/LocationService.ts` | `ExpoLocationProvider`: permission, position, heading watcher |
| Domain | `src/domain/services/geo.ts` | `bearingDeg`, `qiblaBearing`, also `distanceMeters` and `walkMinutes` used by the mosque feature |
| Domain | `src/domain/services/Location.ts` | `LocationProvider` and `HeadingReading` types |
| DI | `src/data/container.ts` | Registers `location: new ExpoLocationProvider()` |

## State and storage

Nothing is persisted. Position, heading, accuracy and the qibla bearing are React state inside the hooks and are recomputed every time the screen mounts. No Redux slice is involved.

## Native, notifications and permissions

- Foreground location permission, requested twice in parallel on mount: once by `currentPosition()` and once by `useHeading` before it starts the watcher. Both go through `requestForegroundPermissionsAsync`.
- Sensors: the magnetometer/rotation sensors behind expo-location's heading API.
- Haptics: `expo-haptics` medium impact when `aligned` becomes true.
- No notifications and no custom native code.

## External services

None. The bearing is computed on the device. (The country lookup inside `currentPosition()` uses the OS geocoder, but the qibla screen does not use its result.)

## Settings that affect it

None. The «مواقيت الصلاة حسب الموقع» switch in Settings does not gate location access (no code reads `settings.locationEnabled`).

## Edge cases and limitations

- "No reading yet" is detected with `heading === 0` rather than the `hasHeading` flag that `useHeading` already exposes. A phone pointing exactly at north (smoothed heading exactly 0) is treated as uncalibrated, and `aligned` can never be true at heading 0.
- On a phone without a compass the screen stays on «حرّك الهاتف على شكل ∞ للمعايرة» forever; there is no "no compass" message.
- Until the first position arrives `qiblaDir` is 0, so the pointer briefly points at north and the bearing reads ٠°.
- The chip «الشمال الحقيقي» is static text. While `trueHeading` is -1 the value shown is actually magnetic north.
- Location denied or unavailable: `EmptyState` «الموقع غير متاح» with no retry button; the text tells the user to enable location and reopen the screen.
- The position is taken once per mount. Moving a long distance with the screen open does not update the bearing.
- The alignment haptic fires on every transition into the aligned state, so hovering around the 5 degree edge can buzz repeatedly.
- Compass letters on the disk are Latin (N, E, S, W) in an otherwise Arabic UI.

## Open issues

None.
