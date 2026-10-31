import { Dimensions } from 'react-native';

export const { width: W, height: H } = Dimensions.get('window');
export const TOTAL_PAGES = 604;
export const JUZ_PAGES = [
  1, 22, 42, 62, 82, 102, 122, 142, 162, 182, 
  202, 222, 242, 262, 282, 302, 322, 342, 362, 382, 
  402, 422, 442, 462, 482, 502, 522, 542, 562, 582
];

export { toAr } from '../../../shared/utils/format';

export function stripHtml(html: string) {
  return html.replace(/<[^>]*>?/gm, '').trim();
}

// Quran types live in the domain; re-exported so existing UI imports keep working.
import type { MushafAyah, SurahMeta } from '../../../domain/entities/quran';
export type Ayah = MushafAyah;
export type { SurahMeta };

/** The basmala's four words, letters only. */
const BASMALA = ['بسم', 'الله', 'الرحمن', 'الرحيم'];
// letters only: marks are dropped (their order varies, e.g. shadda+fatha vs fatha+shadda) and alef forms merged
const skeleton = (w: string) => w.replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, '').replace(/[ٱأإآ]/g, 'ا');

/**
 * Ayah text as the mushaf prints it: the API prefixes each surah's first ayah with the
 * basmala, which the page shows as a header instead (except at-Tawba, which has none).
 * In al-Fatiha the basmala IS ayah 1, so its text comes back empty. Matching is by letters,
 * not exact characters: the API writes shadda before fatha, so an exact pattern never
 * matched and the basmala showed twice.
 */
export function mushafAyahText(a: Ayah): string {
  const text = a.text.trim();
  if (a.numberInSurah !== 1 || a.surah.number === 9) return text;
  const words = text.split(/\s+/);
  return BASMALA.every((b, i) => skeleton(words[i] ?? '') === b) ? words.slice(4).join(' ') : text;
}
