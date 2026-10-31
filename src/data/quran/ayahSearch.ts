/**
 * Offline ayah search over the bundled plain text. The text (~0.8 MB) is required on the
 * first search only, and normalized once into an in-memory index; each query is then a
 * linear scan of 6236 short strings with `includes`, a few milliseconds on a phone.
 */
export type AyahHit = {
  surah: number;
  ayah: number;
  page: number;
  number: number; // global ayah number (1..6236), what the mushaf highlights
  text: string;
};

type Entry = AyahHit & { norm: string };

const DIACRITICS = /[ً-ٰٟـ]/g; // tashkeel, dagger alef, tatweel

/** Spelling-insensitive form: no tashkeel, one alef, ya/alef maqsura and ta/ha merged. */
export const normalizeArabic = (s: string) =>
  s.replace(DIACRITICS, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .replace(/\s+/g, ' ')
    .trim();

let index: Entry[] | null = null;

const load = (): Entry[] => {
  if (index) return index;
  const { QURAN_PLAIN_TEXT } = require('./quranPlainText') as { QURAN_PLAIN_TEXT: string };
  index = QURAN_PLAIN_TEXT.split('\n').map((line, i) => {
    const [s, a, p, text] = line.split('|');
    return { surah: +s, ayah: +a, page: +p, number: i + 1, text, norm: normalizeArabic(text) };
  });
  return index;
};

/** Plain (undiacritized) text of ayahs `from..to`: the offline fallback for verse cards. */
export const plainAyahs = (surah: number, from: number, to: number): string[] =>
  load().filter((e) => e.surah === surah && e.ayah >= from && e.ayah <= to).map((e) => e.text);

/** Plain text of one ayah by its global number (1..6236): what voice tasmee compares with. */
export const plainAyah = (number: number): string => load()[number - 1]?.text ?? '';

/** Builds the index ahead of the first query (call when the search UI opens). */
export const warmAyahIndex = () => { load(); };

/**
 * Ayahs containing every word of the query (any order). Ayahs with the whole phrase come
 * first, then the rest in mushaf order. `total` counts all matches; `hits` is capped.
 */
export const searchAyahs = (query: string, limit = 60): { hits: AyahHit[]; total: number } => {
  const q = normalizeArabic(query);
  if (q.length < 2) return { hits: [], total: 0 };
  const words = q.split(' ');
  const phrase: Entry[] = [];
  const loose: Entry[] = [];
  for (const e of load()) {
    if (e.norm.includes(q)) phrase.push(e);
    else if (words.length > 1 && words.every((w) => e.norm.includes(w))) loose.push(e);
  }
  const all = phrase.concat(loose);
  return { hits: all.slice(0, limit).map(({ norm: _norm, ...hit }) => hit), total: all.length };
};

/** Ayahs printed on one mushaf page, in order (offline, from the bundled text). */
export const ayahsOnPage = (page: number): { surah: number; ayah: number }[] =>
  load().filter((e) => e.page === page).map((e) => ({ surah: e.surah, ayah: e.ayah }));

/** Mushaf page an ayah is printed on, and its global number (1..6236). */
export const ayahRef = (surah: number, ayah: number): { page: number; number: number } | undefined => {
  const e = load().find((x) => x.surah === surah && x.ayah === ayah);
  return e ? { page: e.page, number: e.number } : undefined;
};

/** First and last mushaf page of a surah. */
export const surahPageRange = (surah: number): { from: number; to: number } => {
  const pages = load().filter((e) => e.surah === surah).map((e) => e.page);
  return { from: Math.min(...pages), to: Math.max(...pages) };
};
