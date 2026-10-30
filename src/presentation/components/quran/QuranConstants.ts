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

const BASMALA_FORMS = [
  'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ',
  'بِسۡمِ ٱللَّهِ ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ',
  'بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ',
];

/**
 * Ayah text as the mushaf prints it: the API prefixes each surah's first ayah with the
 * basmala, which the page shows as a header instead (except at-Tawba, which has none).
 * In al-Fatiha the basmala IS ayah 1, so its text comes back empty.
 */
export function mushafAyahText(a: Ayah): string {
  let text = a.text.trim();
  if (a.numberInSurah === 1 && a.surah.number !== 9) {
    const form = BASMALA_FORMS.find((f) => text.startsWith(f));
    if (form) text = text.replace(form, '').trim();
  }
  return text;
}
