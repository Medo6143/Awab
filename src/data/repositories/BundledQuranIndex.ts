import { QuranIndex } from '../../domain/repositories/QuranIndex';
import { ayahByNumber, ayahRef, plainAyah, plainAyahs, searchAyahs, surahPageRange, warmAyahIndex } from '../quran/ayahSearch';

/** QuranIndex on the bundled plain text (data/quran/ayahSearch). */
export class BundledQuranIndex implements QuranIndex {
  warm() { warmAyahIndex(); }
  search(query: string, limit?: number) { return searchAyahs(query, limit); }
  ayahByNumber(number: number) { return ayahByNumber(number); }
  plainAyah(number: number) { return plainAyah(number); }
  plainAyahs(surah: number, from: number, to: number) { return plainAyahs(surah, from, to); }
  ayahRef(surah: number, ayah: number) { return ayahRef(surah, ayah); }
  surahPageRange(surah: number) { return surahPageRange(surah); }
}
