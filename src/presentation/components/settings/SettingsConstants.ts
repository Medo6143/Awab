import { ACCENTS, AccentKey } from '../../../shared/theme/tokens';
import { TafsirStyle } from '../../store/slices/settingsSlice';

/** The short tafsir; the "simple" style always uses it. */
export const MUYASSAR_TAFSIR_ID = 16;

export const TAFSIR_LIST = [
  { id: 91, name: 'تفسير السعدي' },
  { id: 14, name: 'تفسير ابن كثير' },
  { id: 15, name: 'تفسير الطبري' },
  { id: 90, name: 'تفسير القرطبي' },
  { id: MUYASSAR_TAFSIR_ID, name: 'التفسير الميسر' },
];

export const STYLES_LIST: { id: TafsirStyle; name: string }[] = [
  { id: 'simple', name: 'بسيط (مختصر)' },
  { id: 'book', name: 'كتاب' },
  { id: 'modern', name: 'عصري' },
];

export const THEME_LIST: { id: AccentKey; name: string; color: string }[] = [
  { id: 'gold', name: 'ذهبي', color: ACCENTS.gold.accent },
  { id: 'emerald', name: 'زمردي', color: ACCENTS.emerald.accent },
  { id: 'midnight', name: 'ليلي', color: ACCENTS.midnight.accent },
];
