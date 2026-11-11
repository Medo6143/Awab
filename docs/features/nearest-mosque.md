# Nearest mosque (أقرب مسجد)

> Status: Shipped, data source open · Lists mosques within 3 km from OpenStreetMap with distance, walking time, a live direction arrow and a Google Maps hand-off. On `master` since #21; which data source to keep is still undecided (see Open issues).

Merged to `master` in #21 (commit 88455e8, "Nearest mosque: card on the prayer screen and a full list").

## What it does

- On the prayer screen: a card «أقرب مسجد» with the nearest mosque's name, distance, minutes on foot, an arrow that points at it as the phone turns, a «وديني» button (walking directions) and a «كل المساجد» button.
- On its own screen: up to 10 mosques, nearest first; tapping a row opens walking directions in Google Maps.
- Always offers «دوّر في خرائط جوجل», a Google Maps search for "مسجد" around the user, for mosques OpenStreetMap does not have.

## How the user reaches it

| Path | Taps from launch | Route |
|---|---|---|
| Bottom tab «الصلاة» → scroll to the card under the five prayers | 1 (+ scroll) | card inside `TabPrayer` |
| Card → «كل المساجد» (or tap the "none nearby" card) | 2 | `المساجد` (`MosquesScreen`) |

## How it works

1. `NearestMosqueCard` receives `coords` from `usePrayerTimes` (no second position lookup) and watches only the compass via `useHeading`. `MosquesScreen` runs its own `useLocation()`.
2. `useNearbyMosques(coords)` calls `finder.findNearby(coords, skipCache)`. The effect is keyed on latitude and longitude rounded to 3 decimals (about 100 m), so GPS drift does not refetch. `retry()` sets a one-shot flag that skips the cache.
3. `OsmMosqueFinder` (`src/data/services/MosqueService.ts`), registered as `mosques` in `src/data/container.ts`:
   - Cache: AsyncStorage key `mosques:v2:<lat>,<lon>` (rounded to 3 decimals) holding `{ t, src, elements }`. Lifetime is 24 h for source `osm` and 1 h for source `nominatim`.
   - Primary: GET the app's own proxy on Vercel (owwab.vercel.app, path /api/mosques) with the rounded position, 20 s timeout.
   - Fallback when the proxy throws or returns non-2xx: Nominatim search, 12 s timeout per request.
   - Then: resolve each element's position, name it (`name:ar`, else `name`, else «مسجد»), compute `distanceMeters` from the exact position, drop anything beyond `MOSQUE_RADIUS_M` (3000 m), sort ascending.
4. Proxy (`landing/api/mosques.js`, a Vercel function): validates `lat`/`lon`, builds an Overpass query for `amenity=place_of_worship` + `religion=muslim` on nodes, ways and relations `around:3000`, `out center 80`, and tries two Overpass servers in order with a 9 s timeout each. Success is returned with `Cache-Control: public, s-maxage=86400, stale-while-revalidate=604800`. If both fail it answers 502 with the list of attempts.
5. Nominatim fallback: `q=mosque`, `format=jsonv2`, `limit=40`, `bounded=1`, `accept-language=ar`, viewbox of ±0.015 degrees (about 1.6 km). If fewer than 5 places of worship come back it retries once with ±0.03 degrees. Only `category=amenity`, `type=place_of_worship` results are kept.
6. Presentation: `distanceLabel` rounds to 10 m and switches to km at 1000 m; `walkMinutes` assumes 80 m per minute (minimum 1). `DirectionArrow` rotates by `bearingDeg(from, to) - heading`; with no compass reading it shows a plain pin instead.

| Number | Value | Where |
|---|---|---|
| Search radius | 3000 m | `src/domain/services/Mosques.ts`, `landing/api/mosques.js` |
| Rows shown | 10 | `src/presentation/screens/MosquesScreen.tsx` |
| Position rounding | 3 decimals (about 100 m) | `src/data/services/MosqueService.ts` |
| Cache lifetime | 24 h (osm), 1 h (nominatim) | `src/data/services/MosqueService.ts` |
| Overpass result cap | 80 elements | `landing/api/mosques.js` |
| Walking speed | 80 m/min | `src/domain/services/geo.ts` |

## Code map

| Layer | File | Role |
|---|---|---|
| Screen | `src/presentation/screens/MosquesScreen.tsx` | Full list, refresh button, states, Google search button |
| Screen | `src/presentation/screens/PrayerTimesScreen.tsx` | Mounts `NearestMosqueCard` under the prayer rows |
| Component | `src/presentation/components/prayer/MosqueParts.tsx` | `NearestMosqueCard`, `MosqueRow`, `DirectionArrow`, `distanceLabel`, `openInMaps` |
| Hook | `src/presentation/hooks/useNearbyMosques.ts` | Fetch, loading/error, retry that bypasses the cache |
| Hook | `src/presentation/hooks/useLocation.ts` | Position and `useHeading` for the arrows |
| Data | `src/data/services/MosqueService.ts` | `OsmMosqueFinder`: cache, proxy, Nominatim fallback, map URLs |
| Domain | `src/domain/services/Mosques.ts` | `Mosque`, `MosqueFinder`, `MOSQUE_RADIUS_M` |
| Domain | `src/domain/services/geo.ts` | `distanceMeters`, `bearingDeg`, `walkMinutes` |
| DI | `src/data/container.ts` | `mosques: new OsmMosqueFinder()` |
| Server | `landing/api/mosques.js` | Vercel function that queries Overpass |
| Navigation | `src/presentation/navigation/AppNavigation.tsx` | Stack route `المساجد` |

## State and storage

- No Redux slice. Results, loading and error live in `useNearbyMosques` state.
- AsyncStorage: one key per rounded position, `mosques:v2:<lat>,<lon>`. Keys are never deleted, so they accumulate as the user moves around.
- The server stores and logs nothing itself; Vercel's edge caches each rounded point for a day.

## Native, notifications and permissions

- Foreground location (shared with prayer times) and the compass for the arrows.
- `Linking.openURL` for Google Maps links; if nothing can open the link an alert says so.
- No notifications and no custom native code.

## External services

| Host | Sent | Returned |
|---|---|---|
| `owwab.vercel.app` (the app's proxy) | `lat`, `lon` rounded to 3 decimals | `{ elements: [{ type, id, lat, lon, tags: { name, name:ar } }], remark }` |
| `overpass-api.de`, then `overpass.kumi.systems` (called by the proxy, not by the phone) | Overpass QL query with the rounded point, User-Agent "Owwab 1.0" | Overpass JSON |
| `nominatim.openstreetmap.org` (fallback, called by the phone) | Bounding box around the rounded point, `q=mosque`, User-Agent "Owwab 1.0" | Up to 40 places with `osm_type`, `osm_id`, `lat`, `lon`, `name` |
| `www.google.com` (maps links opened outside the app) | Destination coordinates, or the user's exact coordinates in the search link | n/a |

## Settings that affect it

None.

## Edge cases and limitations

- Known problem (reported by the maintainer, not reproducible from code): Overpass answers 406 both from the user's network and from Vercel, so the proxy path fails and the app lands on the Nominatim fallback.
- Known problem: the Nominatim fallback is a name search, so it only returns mosques whose OSM name matches; unnamed mosques and small zawiyas are missing, and results are ranked by importance, not distance.
- The client ignores the proxy's `remark` field. An Overpass timeout that still returns HTTP 200 with an empty list is cached as "no mosques" for 24 h on the phone and for a day at the edge.
- No location: the card renders nothing (the prayer screen already asks); the list screen shows «حدّد موقعك» with no retry action.
- Nominatim returns at most 40 results per request, so a dense area can lose its nearest mosques even inside the box.
- The card and the list screen each run their own fetch; the second one is served from the AsyncStorage cache.
- The walking-time text always uses the plural «دقايق».
- The footer note on the list screen hard-codes "OpenStreetMap" as the source.

## Open issues

- #22: deploy `landing/` so `/api/mosques` exists. Until then every lookup uses the Nominatim fallback.
- Open decision, not yet filed as an issue: the data source. If Overpass also refuses Vercel (see Edge cases), the proxy does not help. Options on the table are Google Places (accurate, needs a key and billing) or dropping the in-app list and only opening Google Maps (what `mapSearchUrl` already does). The feature is on `master` with the Nominatim fallback in the meantime.
