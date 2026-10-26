/**
 * Design tokens for أوّاب — dark, modern, one light-gold accent.
 *
 * Rules of the system:
 * - Surfaces are separated by spacing, not borders. `hairline` only where unavoidable.
 * - `gold` is THE accent (icons, fills, progress, active states). `goldText` is for
 *   big emphasis numbers only. Never mix the two on one element.
 * - Shadows: none on cards. `elevation.floating` only for the tab bar and the floating sebha.
 * - Icons: lucide-react-native only, stroke 1.75.
 */

export const colors = {
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

  // Mushaf paper (Quran screen only)
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

  overlay: 'rgba(0,0,0,0.6)',
  glass: 'rgba(26,20,15,0.72)',
  glassOpaque: 'rgba(26,20,15,0.94)',
} as const;

/** Per-theme interactive accent. Static gold (mushaf frame etc.) does not change. */
export const ACCENTS = {
  gold:     { accent: '#d4af37', accentText: '#fcd34d', accentSoft: 'rgba(212,175,55,0.14)', onAccent: '#1a140f' },
  emerald:  { accent: '#2e8b6a', accentText: '#7fd3b5', accentSoft: 'rgba(46,139,106,0.16)', onAccent: '#0b1a14' },
  midnight: { accent: '#4f5bd5', accentText: '#a5acff', accentSoft: 'rgba(79,91,213,0.16)',  onAccent: '#0e1024' },
} as const;
export type AccentKey = keyof typeof ACCENTS;
export type Accent = (typeof ACCENTS)[AccentKey];

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
