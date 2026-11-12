import type { StyleSheet } from 'react-native';

/**
 * Design tokens for أوّاب — a dark and a light palette, modern, one gold accent.
 *
 * Rules of the system:
 * - Surfaces are separated by spacing, not borders. `hairline` only where unavoidable.
 * - `gold` is THE accent (icons, fills, progress, active states). `goldText` is for
 *   big emphasis numbers only. Never mix the two on one element.
 *   The `gold*` / `onGold` keys follow the colour picked in settings (see ACCENT_OF);
 *   what must stay gold whatever the accent (the mushaf paper) uses the `paper*` keys.
 * - Shadows: none on cards. `elevation.floating` only for the tab bar and the floating sebha.
 * - Icons: lucide-react-native only, stroke 1.75.
 */

const dark = {
  bg: '#0e0a07',
  surface: '#1a140f',
  surfaceRaised: '#241b14',
  hairline: 'rgba(255,255,255,0.06)',

  gold: '#d4af37',
  goldSoft: 'rgba(212,175,55,0.14)',
  goldDeep: '#9a7a1f',
  goldText: '#fcd34d',
  goldLine: 'rgba(212,175,55,0.45)',
  goldLineSoft: 'rgba(212,175,55,0.22)',
  onGold: '#1a140f',

  text: '#f5efe6',
  textSoft: '#d9d0c3',
  textMuted: '#a89f93',
  textFaint: '#6b6259',

  success: '#4caf7d',
  successSoft: 'rgba(76,175,125,0.14)',
  danger: '#c0392b',
  dangerSoft: 'rgba(192,57,43,0.14)',

  // Mushaf paper (Quran screen only), the same in both themes
  paper: '#fdf6e3',
  paperDeep: '#ebd9a3',
  paperInk: '#2b1f15',
  paperRule: '#d4af37',
  paperCard: '#fffdf6',
  paperCardBook: '#fcf8eb',
  paperBorder: '#efe2bf',
  paperDivider: '#e8dcbc',
  paperQuote: '#8a5a12',
  paperMuted: '#8b6b3e',

  // list rows and checkboxes drawn as a light wash over the page
  card: 'rgba(255,255,255,0.05)',
  cardBorder: 'rgba(255,255,255,0.08)',
  ring: 'rgba(255,255,255,0.3)',
  dangerText: '#ff8a80',

  overlay: 'rgba(0,0,0,0.6)',
  glass: 'rgba(26,20,15,0.72)',
  glassOpaque: 'rgba(26,20,15,0.94)',
};
export type Palette = { readonly [K in keyof typeof dark]: string };

/** The dark palette whatever the theme: for full-screen art and shared images that keep one look. */
export const night: Palette = dark;

/** Warm paper-white; the gold is darker so it still reads on a light surface. */
const light: Palette = {
  ...dark,
  bg: '#faf6ef',
  surface: '#ffffff',
  surfaceRaised: '#f3ece0',
  hairline: 'rgba(43,31,21,0.08)',

  gold: '#b8901f',
  goldSoft: 'rgba(184,144,31,0.14)',
  goldDeep: '#8a6a12',
  goldText: '#8a6a12',
  goldLine: 'rgba(184,144,31,0.5)',
  goldLineSoft: 'rgba(184,144,31,0.3)',
  onGold: '#ffffff',

  text: '#2b1f15',
  textSoft: '#4a3b2d',
  textMuted: '#7a6a58',
  textFaint: '#a89a88',

  success: '#2e8b57',
  successSoft: 'rgba(46,139,87,0.12)',
  danger: '#b03a2e',
  dangerSoft: 'rgba(176,58,46,0.1)',

  card: '#ffffff',
  cardBorder: 'rgba(43,31,21,0.08)',
  ring: 'rgba(43,31,21,0.25)',
  dangerText: '#b03a2e',

  overlay: 'rgba(43,31,21,0.45)',
  glass: 'rgba(255,253,248,0.82)',
  glassOpaque: 'rgba(255,253,248,0.96)',
};

let isLight = false;

/** The theme now on screen; ThemeRoot sets it and remounts the app when it changes. */
export const isLightTheme = () => isLight;
export const setLightTheme = (on: boolean) => { isLight = on; };

const DARK_ACCENTS = {
  gold: {
    accent: '#d4af37', accentText: '#fcd34d', accentSoft: 'rgba(212,175,55,0.14)', onAccent: '#1a140f',
    deep: '#9a7a1f', line: 'rgba(212,175,55,0.45)', lineSoft: 'rgba(212,175,55,0.22)',
  },
  emerald: {
    accent: '#2e8b6a', accentText: '#7fd3b5', accentSoft: 'rgba(46,139,106,0.16)', onAccent: '#0b1a14',
    deep: '#1f6b50', line: 'rgba(46,139,106,0.5)', lineSoft: 'rgba(46,139,106,0.26)',
  },
  midnight: {
    accent: '#4f5bd5', accentText: '#a5acff', accentSoft: 'rgba(79,91,213,0.16)', onAccent: '#0e1024',
    deep: '#3a45b0', line: 'rgba(79,91,213,0.5)', lineSoft: 'rgba(79,91,213,0.26)',
  },
};
const LIGHT_ACCENTS: typeof DARK_ACCENTS = {
  gold: {
    accent: '#b8901f', accentText: '#8a6a12', accentSoft: 'rgba(184,144,31,0.14)', onAccent: '#ffffff',
    deep: '#8a6a12', line: 'rgba(184,144,31,0.5)', lineSoft: 'rgba(184,144,31,0.3)',
  },
  emerald: {
    accent: '#2e8b6a', accentText: '#1f6b50', accentSoft: 'rgba(46,139,106,0.12)', onAccent: '#ffffff',
    deep: '#1f6b50', line: 'rgba(46,139,106,0.5)', lineSoft: 'rgba(46,139,106,0.3)',
  },
  midnight: {
    accent: '#4f5bd5', accentText: '#3a45b0', accentSoft: 'rgba(79,91,213,0.12)', onAccent: '#ffffff',
    deep: '#3a45b0', line: 'rgba(79,91,213,0.5)', lineSoft: 'rgba(79,91,213,0.3)',
  },
};

/** The accent of each theme, for the mode on screen. */
export const ACCENTS = {} as typeof DARK_ACCENTS;
for (const key of Object.keys(DARK_ACCENTS) as (keyof typeof DARK_ACCENTS)[]) {
  Object.defineProperty(ACCENTS, key, { enumerable: true, get: () => (isLight ? LIGHT_ACCENTS : DARK_ACCENTS)[key] });
}
export type AccentKey = keyof typeof ACCENTS;
export type Accent = (typeof ACCENTS)[AccentKey];

let accentKey: AccentKey = 'gold';

/** The accent now on screen; ThemeRoot sets it and remounts the app when it changes. */
export const currentAccentKey = () => accentKey;
export const setAccentKey = (key: AccentKey) => { accentKey = key; };

/** The palette keys that are "the accent": they resolve to the selected accent, not to fixed gold. */
const ACCENT_OF: Partial<Record<keyof Palette, keyof Accent>> = {
  gold: 'accent',
  goldText: 'accentText',
  goldSoft: 'accentSoft',
  onGold: 'onAccent',
  goldDeep: 'deep',
  goldLine: 'line',
  goldLineSoft: 'lineSoft',
};

/**
 * The current palette. Each key is a getter, so code that reads `colors.text` while
 * rendering gets the colour of the theme and accent on screen.
 */
export const colors = {} as Palette;
for (const key of Object.keys(dark) as (keyof Palette)[]) {
  const accentField = ACCENT_OF[key];
  Object.defineProperty(colors, key, {
    enumerable: true,
    get: () => (accentField ? ACCENTS[accentKey][accentField] : (isLight ? light : dark)[key]),
  });
}

/**
 * A stylesheet built once per theme and accent. Write `themed(() => ({ ... }))` where a screen would
 * write `StyleSheet.create({ ... })`; `st.card` is then the current theme's style.
 */
export const themed = <T extends StyleSheet.NamedStyles<T> | StyleSheet.NamedStyles<any>>(
  build: () => T & StyleSheet.NamedStyles<any>,
): T => {
  const sheets: Record<string, T> = {};
  const sheet = () => {
    const mode = `${isLight ? 'light' : 'dark'}-${accentKey}`;
    return (sheets[mode] ??= build()) as T;
  };
  const out = {} as T;
  for (const key of Object.keys(sheet())) {
    Object.defineProperty(out, key, { enumerable: true, get: () => sheet()[key as keyof T] });
  }
  return out;
};

/**
 * Mushaf page designs. Each keeps its own colours whatever the app theme (a page is a page);
 * «night» is the dark one. `frame`/`frameDeep` draw the border and the surah header, `marker`
 * the ayah numbers, `divine` (Madani only) the name of Allah.
 */
export const MUSHAF_PALETTES = {
  classic: {
    paper: '#fdf6e3', ink: '#271900', muted: '#8b6b3e', frame: '#c9a24a', frameDeep: '#b8902f',
    band: '#fdf6e3', marker: '#b8902f', highlight: 'rgba(212,175,55,0.4)', divine: '#271900',
  },
  madani: {
    paper: '#fffaeb', ink: '#1f1a14', muted: '#7a5c2e', frame: '#b08a4a', frameDeep: '#7a5a24',
    band: '#efe0b6', marker: '#6b4f1d', highlight: 'rgba(176,138,74,0.32)', divine: '#b3261e',
  },
  night: {
    paper: '#11151f', ink: '#ece4d2', muted: '#8f97ab', frame: '#c9a24a', frameDeep: '#e7c873',
    band: '#1a2030', marker: '#e7c873', highlight: 'rgba(231,200,115,0.25)', divine: '#ece4d2',
  },
  green: {
    paper: '#eef3ea', ink: '#1e2a1f', muted: '#4d6b50', frame: '#5f8a63', frameDeep: '#3f6e44',
    band: '#5f8a63', marker: '#3f6e44', highlight: 'rgba(95,138,99,0.3)', divine: '#1e2a1f',
  },
  simple: {
    paper: '#ffffff', ink: '#1a1a1a', muted: '#888780', frame: '#d3d1c7', frameDeep: '#888780',
    band: '#ffffff', marker: '#888780', highlight: 'rgba(0,0,0,0.08)', divine: '#1a1a1a',
  },
} as const;
export type MushafPaletteId = keyof typeof MUSHAF_PALETTES;
export type MushafPalette = { readonly [K in keyof (typeof MUSHAF_PALETTES)['classic']]: string };

export const radius = { card: 20, field: 12, pill: 999, tile: 14, sheet: 28 } as const;

export const space = { 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 8: 32, 10: 40 } as const;

export const font = {
  regular: 'Tajawal_400Regular',
  medium: 'Tajawal_500Medium',
  bold: 'Tajawal_700Bold',
  extraBold: 'Tajawal_800ExtraBold',
  quran: 'Amiri_700Bold',
  quranRegular: 'Amiri_400Regular',
} as const;

export const type = {
  display:    { fontFamily: font.extraBold, fontSize: 44, lineHeight: 52 },
  h1:         { fontFamily: font.bold, fontSize: 28, lineHeight: 36 },
  h2:         { fontFamily: font.bold, fontSize: 20, lineHeight: 28 },
  body:       { fontFamily: font.regular, fontSize: 15, lineHeight: 24 },
  bodyMedium: { fontFamily: font.medium, fontSize: 15, lineHeight: 24 },
  label:      { fontFamily: font.bold, fontSize: 13, lineHeight: 18 },
  caption:    { fontFamily: font.medium, fontSize: 12, lineHeight: 16 },
  quran:      { fontFamily: font.quran, fontSize: 24, lineHeight: 44 },
  quranBody:  { fontFamily: font.quranRegular, fontSize: 22, lineHeight: 40 },
} as const;

export const elevation = {
  none: {},
  floating: {
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
} as const;

export const icon = { size: { sm: 16, md: 20, lg: 24, xl: 32 }, stroke: 1.75 } as const;

export const layout = {
  screenPadding: 20,
  tabBarHeight: 64,
  tabBarBottom: 24,
  /** Bottom padding for scroll content on tab screens so the last item clears the floating bar. */
  tabBarInset: 64 + 24 + 16,
} as const;

export const tokens = { colors, ACCENTS, radius, space, font, type, elevation, icon, layout } as const;
export default tokens;
