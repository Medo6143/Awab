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
