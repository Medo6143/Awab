/** One ayah as shown on a Mushaf page. */
export interface MushafAyah {
  number: number;          // global ayah number (1..6236)
  text: string;
  numberInSurah: number;
  page: number;
  surah: { number: number; name: string; englishName: string };
}

/** Surah list entry for the index. */
export interface SurahMeta {
  number: number;
  name: string;
  englishName: string;
  numberOfAyahs: number;
  revelationType: string;
}

export interface AyahRef {
  surah: number;
  ayah: number;
}
