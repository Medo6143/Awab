import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import { MUSHAF_PALETTES, MushafPalette, MushafPaletteId } from '../../../shared/theme/tokens';

export type MushafThemeId = MushafPaletteId;

/** How a mushaf page design draws itself; its colours are MUSHAF_PALETTES[id]. */
export type MushafTheme = {
  id: MushafThemeId;
  name: string;
  palette: MushafPalette;
  /** The border around the page. */
  frame: 'geometric' | 'madani' | 'double' | 'none';
  /** The title at the start of a surah: a ruled band, or the Madani cartouche with its order and ayah count. */
  surahHeader: 'band' | 'cartouche' | 'plain';
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  textAlign: 'center' | 'justify';
  /** The name of Allah in its own colour (palette.divine). */
  divineNames: boolean;
};

export const MUSHAF_THEMES: Record<MushafThemeId, MushafTheme> = {
  classic: {
    id: 'classic', name: 'الكلاسيكي', palette: MUSHAF_PALETTES.classic, frame: 'geometric', surahHeader: 'band',
    fontFamily: 'Amiri_700Bold', fontSize: 23, lineHeight: 64, textAlign: 'center', divineNames: false,
  },
  madani: {
    id: 'madani', name: 'المدني', palette: MUSHAF_PALETTES.madani, frame: 'madani', surahHeader: 'cartouche',
    fontFamily: 'AmiriQuran_400Regular', fontSize: 23, lineHeight: 62, textAlign: 'justify', divineNames: true,
  },
  night: {
    id: 'night', name: 'الليلي', palette: MUSHAF_PALETTES.night, frame: 'geometric', surahHeader: 'band',
    fontFamily: 'Amiri_700Bold', fontSize: 23, lineHeight: 64, textAlign: 'center', divineNames: false,
  },
  green: {
    id: 'green', name: 'الأخضر', palette: MUSHAF_PALETTES.green, frame: 'double', surahHeader: 'cartouche',
    fontFamily: 'AmiriQuran_400Regular', fontSize: 23, lineHeight: 62, textAlign: 'center', divineNames: false,
  },
  simple: {
    id: 'simple', name: 'البسيط', palette: MUSHAF_PALETTES.simple, frame: 'none', surahHeader: 'plain',
    fontFamily: 'Amiri_700Bold', fontSize: 23, lineHeight: 60, textAlign: 'center', divineNames: false,
  },
};

export const MUSHAF_THEME_LIST: MushafTheme[] = Object.values(MUSHAF_THEMES);

/** The page design chosen in settings (classic for state saved before the setting existed). */
export const useMushafTheme = (): MushafTheme => {
  const id = useSelector((s: RootState) => s.settings.mushafTheme);
  return MUSHAF_THEMES[id && id in MUSHAF_THEMES ? id : 'classic'];
};

/** The text sizes the mushaf offers, as multiples of each design's own size. */
export const MUSHAF_FONT_SCALES = [0.85, 1, 1.15, 1.3, 1.45] as const;

/** The mushaf text size chosen in the mushaf (1 for state saved before the setting existed). */
export const useMushafFontScale = (): number => {
  const scale = useSelector((s: RootState) => s.settings.mushafFontScale);
  return typeof scale === 'number' && scale > 0 ? scale : 1;
};
