import { AyahRef, MushafAyah, SurahMeta } from '../entities/quran';

/**
 * Everything the app needs to read the Quran. Screens depend on this contract, never on
 * a URL or an HTTP client, so the source (network, bundled data, a test double) can be
 * swapped without touching the UI.
 */
export interface QuranRepository {
  /** Ayahs of one Mushaf page (1..604). Rejects when the page cannot be loaded. */
  getPage(page: number): Promise<MushafAyah[]>;
  /** A page already in memory, without any I/O. */
  peekPage(page: number): MushafAyah[] | undefined;
  /** Warm the cache for a page in the background; never rejects. */
  prefetchPage(page: number): void;
  getSurahs(): Promise<SurahMeta[]>;
  /** Mushaf page a surah starts on. */
  getSurahStartPage(surah: number): Promise<number>;
}

/** Tafsir text as HTML, so presentation can keep its structure. */
export interface TafsirRepository {
  getTafsir(tafsirId: number, ref: AyahRef): Promise<string>;
}
