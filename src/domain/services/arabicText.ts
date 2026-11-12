const DIACRITICS = /[ً-ٰٟـ]/g; // tashkeel, dagger alef, tatweel

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
