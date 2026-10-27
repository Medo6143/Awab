/**
 * Hadith library entries from موسوعة الأحاديث النبوية (HadeethEnc). Only hadiths the
 * encyclopedia grades صحيح or حسن are bundled; the index is small and offline, the full
 * text, explanation and benefits are loaded per hadith and kept.
 */
export interface HadithCategory {
  id: number;
  title: string;
  parent: number | null;
  count: number;
}

export interface HadithIndexEntry {
  id: number;
  title: string;        // the hadith's key sentence, as the encyclopedia titles it
  grade: string;        // صحيح / حسن (and their variants)
  attribution: string;  // e.g. متفق عليه، رواه مسلم
  categories: number[];
}

export interface HadithDetail {
  id: number;
  intro: string;        // عن فلان رضي الله عنه قال...
  text: string;         // full text, with tashkeel
  grade: string;
  attribution: string;
  explanation: string;
  benefits: string[];
  words: { word: string; meaning: string }[];
  reference: string;
}

export interface HadithRepository {
  getHadith(id: number): Promise<HadithDetail>;
}
