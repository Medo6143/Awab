import { Dimensions } from 'react-native';

export const { width: W, height: H } = Dimensions.get('window');
export const TOTAL_PAGES = 604;
export const JUZ_PAGES = [
  1, 22, 42, 62, 82, 102, 122, 142, 162, 182, 
  202, 222, 242, 262, 282, 302, 322, 342, 362, 382, 
  402, 422, 442, 462, 482, 502, 522, 542, 562, 582
];

export function toAr(n: number) {
  return n.toString().replace(/[0-9]/g, d => '٠١٢٣٤٥٦٧٨٩'[+d]);
}

export function stripHtml(html: string) {
  return html.replace(/<[^>]*>?/gm, '').trim();
}

export interface Ayah {
  number: number;
  text: string;
  numberInSurah: number;
  page: number;
  surah: { number: number; name: string; englishName: string };
}

export interface SurahMeta {
  number: number;
  name: string;
  englishName: string;
  numberOfAyahs: number;
  revelationType: string;
}

export const pageCache = new Map<number, Ayah[]>();
