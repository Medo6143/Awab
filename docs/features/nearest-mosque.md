# Nearest mosque (أقرب مسجد)

> Status: Shipped · A button that opens Google Maps on the mosques around the user. The app lists no mosques itself (decided in #22).

## What it does

- On the prayer screen, under the five prayers: a card «أقرب مسجد · افتح خرائط جوجل على المساجد اللي حواليك». Tapping it opens Google Maps searching for «مسجد» around the user's position.
- On the home grid: the «المساجد» tile does the same, without a position (Google Maps searches around the phone itself).
- If nothing on the phone can open the link, an alert says so.

## Why there is no list in the app

The first version (#21) listed mosques within 3 km from OpenStreetMap, through a Vercel proxy for Overpass with Nominatim as a fallback. It did not hold up:

- Overpass refuses requests by IP from Egyptian networks and from Vercel (HTTP 406, even on its status page).
- No open dataset covers Egyptian villages. Measured on 2026-11-12 around أبو غالب (Imbaba, Giza) and Imbaba city:

| Within | OSM | Overture Places (2026-10-21) | Foursquare OS Places (2026-10-15) | All three, deduplicated |
|---|---|---|---|---|
| 3 km of أبو غالب | 0 | 0 | 0 | 0 |
| 10 km of أبو غالب | 0 | 6 (across the Nile, in Ashmoun) | 0 | 6 |
| 3 km of Imbaba | 32 | 84 | 43 | 120 |

All of Egypt has 2,489 mosques in OSM. Google Maps has the village mosques, and Google Places needs an API key with a billing card. So the app hands the search to Google Maps.

## Code map

| Layer | File | Role |
|---|---|---|
| Domain | `src/domain/services/Mosques.ts` | `mosqueSearchUrl(at?)`: the Google Maps search link |
| Component | `src/presentation/components/prayer/MosqueParts.tsx` | `NearestMosqueCard`, `openMosquesNearby(at?)` |
| Screen | `src/presentation/screens/PrayerTimesScreen.tsx` | Mounts the card with `coords` from `usePrayerTimes` |
| Component | `src/presentation/components/home/HomeSections.tsx` | «المساجد» tile |

## External services

| Host | Sent | When |
|---|---|---|
| `www.google.com/maps` (opened outside the app) | The user's position, 5 decimals, in the link from the prayer screen; nothing from the home tile | Only when the user taps |

## Settings, storage, permissions

None of its own. It uses the position the prayer screen already has: no extra request, no cache, no server.
