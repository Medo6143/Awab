/**
 * Content types for the virtues pages and "رسائل من القرآن". Ayahs are stored as
 * references only: their text always comes from the Quran source (API / bundled text),
 * never typed by hand. `key` is a word the ayah must contain, checked by a script so a
 * wrong reference cannot slip in.
 */
export interface VerseRef {
  surah: number;
  from: number;
  to?: number;
  key: string;
}

/** A hadith verified on الدرر السنية: wording as in the source, source with number and grade. */
export interface Hadith {
  text: string;
  source: string;
  /** Who says it, when not the Prophet ﷺ himself (e.g. a Companion's report). */
  lead?: string;
}

/** A supplication from the Quran or authentic Sunnah. */
export interface Supplication {
  text: string;
  source: string;
}
