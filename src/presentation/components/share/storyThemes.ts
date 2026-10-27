import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import type { ShareCardStyle, ShareTextSize } from '../../store/slices/settingsSlice';

export type StoryTheme = {
  name: string;
  bg: string;
  text: string;    // ayah / dua
  accent: string;  // labels, reference, logo name
  muted: string;   // tafsir, footer
  line: string;    // frames and dividers
};

/** The four story designs; 'classic' is the original card and has no theme here. */
export const STORY_THEMES: Record<Exclude<ShareCardStyle, 'classic'>, StoryTheme> = {
  gold:   { name: 'هادئ ذهبي',   bg: '#0e0a07', text: '#f5efe6', accent: '#d4af37', muted: '#a89f93', line: 'rgba(212,175,55,0.45)' },
  paper:  { name: 'ورق المصحف',  bg: '#fbf3dc', text: '#2b1f15', accent: '#8a6d22', muted: '#6b5a3e', line: '#b8902f' },
  night:  { name: 'ليل الجامع',  bg: '#1b1426', text: '#ffffff', accent: '#f3d57a', muted: '#c8b99f', line: 'rgba(243,213,122,0.4)' },
  mihrab: { name: 'المحراب',     bg: '#0e0a07', text: '#f5efe6', accent: '#d4af37', muted: '#a89f93', line: '#d4af37' },
};

export const SHARE_STYLES: { id: ShareCardStyle; name: string }[] = [
  { id: 'gold', name: STORY_THEMES.gold.name },
  { id: 'paper', name: STORY_THEMES.paper.name },
  { id: 'night', name: STORY_THEMES.night.name },
  { id: 'mihrab', name: STORY_THEMES.mihrab.name },
  { id: 'classic', name: 'الكلاسيكي' },
];

export const SHARE_TEXT_SIZES: { id: ShareTextSize; name: string }[] = [
  { id: 'small', name: 'صغير' },
  { id: 'medium', name: 'متوسط' },
  { id: 'large', name: 'كبير' },
];

// Largest text size as % of the card width. The story designs stay smaller and airier
// than the classic card, which used to grow a short ayah up to 8.4%.
const MAX_U: Record<'story' | 'classic', Record<ShareTextSize, number>> = {
  story: { small: 4.6, medium: 5.6, large: 6.8 },
  classic: { small: 5.6, medium: 7, large: 8.4 },
};

export const useShareStyle = () => {
  const style = useSelector((s: RootState) => s.settings.shareCardStyle) ?? 'gold';
  const size = useSelector((s: RootState) => s.settings.shareTextSize) ?? 'medium';
  return { style, size };
};

export const useShareTextMax = (kind: 'story' | 'classic') => {
  const { size } = useShareStyle();
  return MAX_U[kind][size] ?? MAX_U[kind].medium;
};
