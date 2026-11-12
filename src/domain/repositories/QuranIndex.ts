/** One ayah found offline: where it is and its plain (undiacritized) text. */
export type AyahHit = {
  surah: number;
  ayah: number;
  page: number;
  /** Global ayah number (1..6236), what the mushaf highlights. */
  number: number;
  text: string;
};

/**
 * The Quran text bundled in the app, for what must work offline: search, page and ayah
 * lookups, and the plain text voice tasmee compares with. Loaded on first use.
 */
export interface QuranIndex {
  /** Builds the index ahead of the first query (call when a search UI opens). */
  warm(): void;
  /** Ayahs with every word of the query; whole-phrase matches first. `total` counts all, `hits` is capped. */
  search(query: string, limit?: number): { hits: AyahHit[]; total: number };
  /** One ayah by its global number (1..6236). */
  ayahByNumber(number: number): AyahHit | undefined;
  /** Plain text of one ayah by its global number. */
  plainAyah(number: number): string;
  /** Plain text of ayahs `from..to` of a surah: the offline fallback for verse cards. */
  plainAyahs(surah: number, from: number, to: number): string[];
  /** The mushaf page an ayah is printed on, and its global number. */
  ayahRef(surah: number, ayah: number): { page: number; number: number } | undefined;
  /** First and last mushaf page of a surah. */
  surahPageRange(surah: number): { from: number; to: number };
}
