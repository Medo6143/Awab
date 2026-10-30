/**
 * Text helpers for tasmee (reciting from memory). The Uthmani text marks pauses and sajda
 * with standalone signs separated by spaces; those are glued to the word before them so a
 * "word" is always something you say.
 */

const LETTER = /[ء-يٱ-ۓ]/;            // an Arabic letter (incl. alef wasla and Persian forms)
const MARK = /[ً-ٰٟۖ-ۭ]/;      // tashkeel and Quranic annotation marks

export type TasmeeHelp = 'none' | 'firstWord' | 'firstLetter';

export const splitWords = (text: string): string[] => {
  const out: string[] = [];
  for (const token of text.trim().split(/\s+/)) {
    if (!token) continue;
    if (!LETTER.test(token) && out.length) out[out.length - 1] += ` ${token}`;
    else out.push(token);
  }
  return out;
};

/**
 * First letter of a word with the marks riding on it, e.g. «خَ». A leading alef wasla says
 * nothing on its own, so it takes the next letter too: «ٱلَّ», «ٱرْ».
 */
export const firstLetter = (word: string): string => {
  const chars = Array.from(word);
  const start = chars.findIndex((c) => LETTER.test(c));
  if (start < 0) return '';
  let end = start;
  for (let letters = chars[start] === 'ٱ' ? 2 : 1; letters > 0 && end < chars.length; letters--) {
    end++;
    while (end < chars.length && MARK.test(chars[end])) end++;
  }
  return chars.slice(start, end).join('');
};

/** Letters only: drives the width of a word's hidden bar. */
export const letterCount = (word: string) => Array.from(word).filter((c) => LETTER.test(c)).length;

/** «آية / آيتين / ٣ آيات / ١١ آية» with Arabic-Indic digits. */
export const ayahsLabel = (n: number, toAr: (n: number) => string) =>
  n === 1 ? 'آية واحدة' : n === 2 ? 'آيتين' : `${toAr(n)} ${n <= 10 ? 'آيات' : 'آية'}`;

export const minutesLabel = (n: number, toAr: (n: number) => string) =>
  n === 1 ? 'دقيقة' : n === 2 ? 'دقيقتين' : `${toAr(n)} ${n <= 10 ? 'دقايق' : 'دقيقة'}`;
