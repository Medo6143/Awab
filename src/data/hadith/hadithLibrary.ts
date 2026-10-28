import type { HadithCategory, HadithIndexEntry } from '../../domain/entities/hadith';
import { normalizeArabic } from '../quran/ayahSearch';

/**
 * Offline index of the hadith library: categories, and one line per hadith
 * ("id|grade|attribution|cat,cat|title|text") generated from HadeethEnc, keeping only
 * hadiths graded صحيح or حسن. Loaded on first use; search scans the normalized title and
 * full text (a few ms over ~3.5k hadiths).
 */
type Entry = HadithIndexEntry & { norm: string };

let cache: { categories: HadithCategory[]; entries: Entry[]; byId: Map<number, Entry> } | null = null;

const load = () => {
  if (cache) return cache;
  const { HADITH_CATEGORIES, HADITH_INDEX_TEXT } = require('./hadithIndex') as { HADITH_CATEGORIES: HadithCategory[]; HADITH_INDEX_TEXT: string };
  const entries: Entry[] = HADITH_INDEX_TEXT.split('\n').map((line) => {
    const [id, grade, attribution, cats, title, text = ''] = line.split('|');
    return { id: +id, grade, attribution, categories: cats ? cats.split(',').map(Number) : [], title, norm: normalizeArabic(`${title} ${text}`) };
  });
  cache = { categories: HADITH_CATEGORIES, entries, byId: new Map(entries.map((e) => [e.id, e])) };
  return cache;
};

const strip = ({ norm: _n, ...e }: Entry): HadithIndexEntry => e;

export const warmHadithIndex = () => { load(); };

export const hadithCount = () => load().entries.length;

/** Child categories (parent null = the roots), with how many indexed hadiths each holds. */
export const hadithCategories = (parent: number | null): (HadithCategory & { indexed: number })[] => {
  const { categories, entries } = load();
  return categories
    .filter((c) => c.parent === parent)
    .map((c) => ({ ...c, indexed: entries.filter((e) => e.categories.includes(c.id)).length }))
    .filter((c) => c.indexed > 0);
};

export const hadithCategory = (id: number) => load().categories.find((c) => c.id === id);

export const hadithsIn = (categoryId: number): HadithIndexEntry[] =>
  load().entries.filter((e) => e.categories.includes(categoryId)).map(strip);

export const hadithEntry = (id: number): HadithIndexEntry | undefined => {
  const e = load().byId.get(id);
  return e ? strip(e) : undefined;
};

/** Hadiths whose title or text contains every word of the query (diacritics/hamza-insensitive). */
export const searchHadiths = (query: string, limit = 80): { hits: HadithIndexEntry[]; total: number } => {
  const q = normalizeArabic(query);
  if (q.length < 2) return { hits: [], total: 0 };
  const words = q.split(' ');
  const phrase: Entry[] = [];
  const loose: Entry[] = [];
  for (const e of load().entries) {
    if (e.norm.includes(q)) phrase.push(e);
    else if (words.length > 1 && words.every((w) => e.norm.includes(w))) loose.push(e);
  }
  const all = phrase.concat(loose);
  return { hits: all.slice(0, limit).map(strip), total: all.length };
};

/** Same hadith all day, a different one each day. */
export const hadithOfTheDay = (date = new Date()): HadithIndexEntry => {
  const { entries } = load();
  const day = Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000);
  return strip(entries[(day * 7919) % entries.length]);
};

/** Any hadith but `exceptId`, for "حديث تاني". */
export const randomHadith = (exceptId?: number): HadithIndexEntry => {
  const { entries } = load();
  let e = entries[Math.floor(Math.random() * entries.length)];
  if (e.id === exceptId && entries.length > 1) e = entries[(entries.indexOf(e) + 1) % entries.length];
  return strip(e);
};
