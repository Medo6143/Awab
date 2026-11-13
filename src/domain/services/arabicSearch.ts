import { normalizeArabic } from './arabicText';

/**
 * Search that finds a word in the forms the texts actually use. A plain substring search for
 * «الابتلاء» finds nothing: hadiths say «ابتلى», «يبتلي», «بلاء». So each query word becomes a
 * few alternative terms: the word without «ال»/«و»/«ف»/«ب» in front and common endings
 * behind, the root letters of an افتعال noun («ابتلاء» → «بتل»), and, for topics people
 * search by name, the words the texts use for them.
 */

/** Topic → words the texts use for it (all normalized, keyed by the stripped stem). */
const TOPICS: Record<string, string[]> = {
  ابتل: ['بلاء', 'بتلي', 'بتلا', 'مصيب', 'مبتلي'],
  بتل: ['بلاء', 'بتلي', 'مصيب'],
  بلاء: ['بلاء', 'بتلي', 'مصيب'],
  مصيب: ['مصيب', 'مصايب', 'بلاء'],
  مصايب: ['مصيب', 'مصايب', 'بلاء'],
  حزن: ['حزن', 'غم', 'كرب', 'الهم'],
  هم: ['الهم', 'هموم', 'غم', 'حزن', 'كرب'],
  قلق: ['الهم', 'غم', 'حزن', 'كرب'],
  ضيق: ['ضيق', 'الهم', 'غم', 'كرب'],
  اكتياب: ['الهم', 'غم', 'حزن', 'كرب'],
  رزق: ['رزق', 'يرزق', 'رزاق'],
  فقر: ['فقر', 'الفقير', 'فقرا'],
  توب: ['توب', 'استغفر'],
  توبه: ['توب', 'استغفر'],
  استغفار: ['استغفر', 'يستغفر', 'مغفر'],
  مرض: ['مرض', 'مريض', 'سقم', 'وجع'],
  مريض: ['مرض', 'مريض', 'سقم', 'وجع'],
  موت: ['موت', 'يموت', 'ميت'],
  صبر: ['صبر', 'صابر', 'يصبر', 'اصبر'],
  غضب: ['غضب', 'يغضب', 'تغضب'],
  ام: ['ام', 'امك', 'الوالد', 'بر'],
  والدين: ['والد', 'امك', 'ابيك', 'بر'],
  دعاء: ['دعاء', 'يدعو', 'ادعو', 'دعوه'],
  جنه: ['الجنه', 'جنه'],
  نار: ['النار', 'جهنم'],
};

const PREFIXES = ['وال', 'فال', 'بال', 'كال', 'لل', 'ال'];
const SUFFIXES = ['ات', 'ون', 'ين', 'ها', 'هم', 'كم', 'نا', 'ه'];

/** The word without its article/conjunction in front and a common ending behind. */
export const lightStem = (word: string) => {
  let w = normalizeArabic(word);
  // «والد…» is a word of its own, not «و» + «ال» + «د…»
  const pre = w.startsWith('والد') ? undefined : PREFIXES.find((p) => w.startsWith(p) && w.length - p.length >= 3);
  if (pre) w = w.slice(pre.length);
  else if ((w[0] === 'و' || w[0] === 'ف') && w.length >= 5) w = w.slice(1);
  if (w.endsWith('ء') && w.length >= 4) w = w.slice(0, -1);
  const suf = SUFFIXES.find((x) => w.endsWith(x) && w.length - x.length >= 3);
  if (suf) w = w.slice(0, -suf.length);
  if (w.endsWith('ا') && w.length >= 5) w = w.slice(0, -1);
  return w;
};

export type Term = { text: string; weight: number };

/**
 * Alternatives for one query word, each with a weight for ranking (3 the word as typed, 2 its
 * stem or root letters, 1 a word for the same topic); a text matches the word when it holds any.
 */
export const searchTerms = (word: string): Term[] => {
  const w = normalizeArabic(word);
  // a two-letter word is searched as a whole word; one that names a topic («هم») as the topic
  if (w.length <= 2) return TOPICS[w] ? TOPICS[w].filter((t) => t !== w).map((text) => ({ text, weight: 2 })) : [{ text: w, weight: 3 }];
  const stem = lightStem(w);
  const terms = new Map<string, number>([[w, 3]]);
  const add = (t: string, weight: number) => { if (t.length >= 2 && !terms.has(t)) terms.set(t, weight); };
  add(stem, 2);
  // افتعال / افتعل: «ابتلاء» «ابتلي» → the letters after the alef, so «يبتلي» matches too
  if (stem.length >= 4 && stem[0] === 'ا' && stem[2] === 'ت') add(stem.slice(1), 2);
  for (const extra of TOPICS[stem] ?? TOPICS[w] ?? []) add(extra, 1);
  return [...terms].map(([text, weight]) => ({ text, weight }));
};

/** Letters that may come in front of a word inside it: conjunctions, prepositions, «ال», verb prefixes. */
const CLITIC = 'وفبكلاتنيس';

/**
 * Whether normalized `padded` text (with a space at both ends) holds `term` at the start of a
 * word, or after a few clitic letters («والبلاء», «يبتلي»), never in the middle of another
 * word (so «تاب» is not found inside «كتاب»); two-letter terms must be whole words.
 */
export const hasTerm = (padded: string, term: string) => {
  if (term.length <= 2) return padded.includes(` ${term} `) || padded.includes(` ال${term} `) || padded.includes(` و${term} `);
  for (let i = padded.indexOf(term); i !== -1; i = padded.indexOf(term, i + 1)) {
    let j = i;
    while (j > 0 && padded[j - 1] !== ' ') j--;
    if (i - j <= 3 && [...padded.slice(j, i)].every((c) => CLITIC.includes(c))) return true;
  }
  return false;
};
