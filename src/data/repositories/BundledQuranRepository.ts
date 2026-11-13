import { QuranRepository } from '../../domain/repositories/QuranRepository';
import { MushafAyah, SurahMeta } from '../../domain/entities/quran';

export const TOTAL_MUSHAF_PAGES = 604;

type Book = { pages: MushafAyah[][]; bySurah: MushafAyah[][]; surahs: SurahMeta[] };

let book: Book | null = null;

/**
 * The whole mushaf from the text bundled with the app (data/quran/quranUthmani.ts, the same
 * alquran.cloud text the pages used to be fetched as), parsed once on first use. No network:
 * the mushaf opens offline and pages never fail to load.
 */
const load = (): Book => {
  if (book) return book;
  // required here, not at the top, so the 1.5 MB of text is read only when the mushaf is used
  const { QURAN_UTHMANI, SURAH_META } = require('../quran/quranUthmani') as typeof import('../quran/quranUthmani');
  const surahs: SurahMeta[] = SURAH_META.map(([number, name, englishName, numberOfAyahs, revelationType]) => ({
    number, name, englishName, numberOfAyahs, revelationType,
  }));
  const pages: MushafAyah[][] = Array.from({ length: TOTAL_MUSHAF_PAGES + 1 }, () => []);
  const bySurah: MushafAyah[][] = Array.from({ length: 115 }, () => []);
  QURAN_UTHMANI.split('\n').forEach((line, i) => {
    const [s, k, p, j, h] = line.split('|', 5);
    const text = line.slice(s.length + k.length + p.length + j.length + h.length + 5);
    const meta = surahs[+s - 1];
    const ayah: MushafAyah = {
      number: i + 1,
      text,
      numberInSurah: +k,
      page: +p,
      juz: +j,
      hizbQuarter: +h,
      surah: { number: meta.number, name: meta.name, englishName: meta.englishName },
    };
    pages[ayah.page].push(ayah);
    bySurah[meta.number].push(ayah);
  });
  book = { pages, bySurah, surahs };
  return book;
};

/** QuranRepository on the bundled Uthmani text. */
export class BundledQuranRepository implements QuranRepository {
  peekPage(page: number) {
    const ayahs = page >= 1 && page <= TOTAL_MUSHAF_PAGES ? load().pages[page] : undefined;
    return ayahs?.length ? ayahs : undefined;
  }

  async getPage(page: number): Promise<MushafAyah[]> {
    const ayahs = this.peekPage(page);
    if (!ayahs) throw new Error(`no page ${page}`);
    return ayahs;
  }

  prefetchPage(_page: number) {
    // everything is in memory once loaded
  }

  async getSurahs(): Promise<SurahMeta[]> {
    return load().surahs;
  }

  async getAyahs(surah: number, from: number, to: number): Promise<string[]> {
    const list = load().bySurah[surah]?.slice(from - 1, to) ?? [];
    if (list.length !== to - from + 1) throw new Error(`ayahs ${surah}:${from}-${to} not found`);
    // the text prefixes each surah's first ayah with the basmala
    return list.map((a) => {
      const t = a.text.trim();
      return surah !== 1 && a.numberInSurah === 1 && t.startsWith('بِسْمِ') ? t.replace(/^\S+\s+\S+\s+\S+\s+\S+\s+/, '') : t;
    });
  }

  async getSurahStartPage(surah: number): Promise<number> {
    const first = load().bySurah[surah]?.[0];
    if (!first) throw new Error(`no surah ${surah}`);
    return first.page;
  }
}
