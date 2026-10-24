import { ACCENTS } from '../../../shared/theme/tokens';
import { TafsirStyle } from '../../store/slices/settingsSlice';

export const TAFSIR_LIST = [
  { id: 91, name: 'تفسير السعدي' },
  { id: 14, name: 'تفسير ابن كثير' },
  { id: 15, name: 'تفسير الطبري' },
  { id: 90, name: 'تفسير القرطبي' },
  { id: 16, name: 'التفسير الميسر' },
];

export const STYLES_LIST: { id: TafsirStyle; name: string }[] = [
  { id: 'simple', name: 'بسيط' },
  { id: 'book', name: 'كتاب' },
  { id: 'modern', name: 'عصري' },
];

export const THEME_LIST = [
  { id: 'gold', name: 'ذهبي', color: ACCENTS.gold.accent },
  { id: 'emerald', name: 'زمردي', color: ACCENTS.emerald.accent },
  { id: 'midnight', name: 'ليلي', color: ACCENTS.midnight.accent },
];
