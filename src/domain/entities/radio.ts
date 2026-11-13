/** A live Quran radio stream. */
export interface RadioStation {
  id: string;
  name: string;
  /** Live MP3 stream. May redirect; the player resolves it to https before playing. */
  url: string;
}

/**
 * The two national Quran radios, shown first. The Cairo stream is the widely used radiojar
 * relay, not an official Maspero URL, so it may move without notice.
 */
export const FEATURED_STATIONS: (RadioStation & { subtitle: string })[] = [
  { id: 'cairo', name: 'إذاعة القرآن الكريم من القاهرة', subtitle: 'بث مباشر', url: 'https://stream.radiojar.com/8s5u5tpdtwzuv' },
  { id: 'saudi', name: 'إذاعة القرآن الكريم السعودية', subtitle: 'بث مباشر', url: 'https://stream.radiojar.com/0tpy1h0kxtzuv' },
];

/**
 * Spelling-insensitive Arabic for search: no tashkeel, one alef, ya/alef maqsura and ta/ha
 * merged, and no spaces («عبد الباسط» finds «عبدالباسط»).
 */
const fold = (s: string) =>
  s.replace(/[ً-ٰٟـ]/g, '').replace(/[أإآ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه').replace(/\s+/g, '').toLowerCase();

/** Stations whose name contains `query` (all of them when the query is empty). */
export const searchStations = (list: RadioStation[], query: string) => {
  const q = fold(query);
  return q ? list.filter((s) => fold(s.name).includes(q)) : list;
};

/** Drops stations already featured (same stream) and trims the trailing dashes some names carry. */
export const tidyStations = (list: RadioStation[]): RadioStation[] => {
  const featured = new Set(FEATURED_STATIONS.map((s) => s.url));
  return list
    .filter((s) => s.url && !featured.has(s.url))
    .map((s) => ({ ...s, name: s.name.replace(/[\s\-–]+$/, '').trim() }));
};
