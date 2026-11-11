import AsyncStorage from '@react-native-async-storage/async-storage';
import { Coordinates } from '../../domain/entities/types';
import { distanceMeters } from '../../domain/services/geo';
import { Mosque, MosqueFinder, MOSQUE_RADIUS_M } from '../../domain/services/Mosques';

/**
 * Mosques around the user from OpenStreetMap: first through the app's own endpoint on Vercel
 * (landing/api/mosques.js asks Overpass, which many Egyptian networks cannot reach directly),
 * then Nominatim when that is down. Free, no account or key, and nothing tied to the user.
 * The position is rounded to about 100 m before it leaves the phone, and the answer is kept,
 * so walking around does not query again.
 */
const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;
// a full Overpass answer is good for a day; the thinner Nominatim one only for an hour,
// so the full list comes back as soon as the proxy does
const TTL = { osm: DAY, nominatim: HOUR } as const;
type Source = keyof typeof TTL;
const PROXY = 'https://owwab.vercel.app/api/mosques';
const round = (n: number) => Math.round(n * 1000) / 1000;
const KEY = (c: Coordinates) => `mosques:v2:${round(c.latitude)},${round(c.longitude)}`;

type Element = { type: string; id: number; lat?: number; lon?: number; center?: { lat: number; lon: number }; tags?: Record<string, string | undefined> };

/** fetch that gives up after `ms`, so a stalled server ends in the error state, not a skeleton. */
async function fetchWithin(url: string, ms: number, init?: RequestInit): Promise<Response> {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), ms);
  try {
    const res = await fetch(url, { ...init, signal: ctl.signal });
    if (!res.ok) throw new Error(`${url} ${res.status}`);
    return res;
  } finally {
    clearTimeout(timer);
  }
}

async function fetchProxy(c: Coordinates): Promise<Element[]> {
  const res = await fetchWithin(`${PROXY}?lat=${round(c.latitude)}&lon=${round(c.longitude)}`, 20000);
  return ((await res.json()).elements ?? []) as Element[];
}

// Nominatim, the other OpenStreetMap service, is the fallback. Its policy asks apps to name themselves.
const UA = 'Owwab/1.0 (+https://owwab.vercel.app)';
type Place = { osm_type: string; osm_id: number; lat: string; lon: string; category: string; type: string; name?: string };

async function fetchNominatim(c: Coordinates): Promise<Element[]> {
  // its search ranks by fame, not distance, and returns at most 40: start with a tight box
  // (about 1.6 km each way) so the nearest ones are in it, and widen only if it comes back thin
  for (const d of [0.015, 0.03]) {
    const box = [c.longitude - d, c.latitude + d, c.longitude + d, c.latitude - d].map(round).join(',');
    const url = `https://nominatim.openstreetmap.org/search?q=mosque&format=jsonv2&limit=40&bounded=1&accept-language=ar&viewbox=${box}`;
    const res = await fetchWithin(url, 12000, { headers: { 'User-Agent': UA, Accept: 'application/json' } });
    const places = ((await res.json()) as Place[]).filter((p) => p.category === 'amenity' && p.type === 'place_of_worship');
    if (places.length >= 5 || d === 0.03) {
      return places.map((p) => ({ type: p.osm_type, id: p.osm_id, lat: +p.lat, lon: +p.lon, tags: p.name ? { name: p.name } : undefined }));
    }
  }
  return [];
}

const fetchMosques = (c: Coordinates): Promise<{ src: Source; elements: Element[] }> =>
  fetchProxy(c)
    .then((elements) => ({ src: 'osm' as const, elements }))
    .catch(() => fetchNominatim(c).then((elements) => ({ src: 'nominatim' as const, elements })));

/** Nearest first, within MOSQUE_RADIUS_M. Distances are from the exact position; only the query
 *  uses the rounded one. `fresh` skips the saved answer (the refresh button). */
async function findNearbyMosques(at: Coordinates, fresh = false): Promise<Mosque[]> {
  let raw: Element[] | null = null;
  if (!fresh) try {
    const saved = await AsyncStorage.getItem(KEY(at));
    if (saved) {
      const { t, src, elements } = JSON.parse(saved);
      if (Date.now() - t < (TTL[src as Source] ?? HOUR)) raw = elements;
    }
  } catch {}
  if (!raw) {
    const { src, elements } = await fetchMosques(at);
    raw = elements;
    AsyncStorage.setItem(KEY(at), JSON.stringify({ t: Date.now(), src, elements })).catch(() => {});
  }
  return raw
    .map((e) => {
      const lat = e.lat ?? e.center?.lat, lon = e.lon ?? e.center?.lon;
      if (lat == null || lon == null) return null;
      const coords = { latitude: lat, longitude: lon };
      const name = e.tags?.['name:ar'] || e.tags?.name || 'مسجد';
      return { id: `${e.type}/${e.id}`, name, coords, meters: distanceMeters(at, coords) };
    })
    .filter((m): m is Mosque => !!m && m.meters <= MOSQUE_RADIUS_M)
    .sort((a, b) => a.meters - b.meters);
}

/** MosqueFinder on OpenStreetMap, with Google Maps for the links. */
export class OsmMosqueFinder implements MosqueFinder {
  findNearby(at: Coordinates, fresh = false) {
    return findNearbyMosques(at, fresh);
  }

  walkingDirectionsUrl(m: Mosque) {
    return `https://www.google.com/maps/dir/?api=1&destination=${m.coords.latitude},${m.coords.longitude}&travelmode=walking`;
  }

  /** Google knows the small mosques OpenStreetMap does not have. */
  mapSearchUrl(at: Coordinates) {
    return `https://www.google.com/maps/search/${encodeURIComponent('مسجد')}/@${at.latitude},${at.longitude},15z`;
  }
}
