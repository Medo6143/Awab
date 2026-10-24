// Legacy THEME object kept for existing imports. New code should import from ./tokens.
// Values are derived from the design tokens so the two can never drift apart.
import { colors, font, space, ACCENTS } from './tokens';

export const THEME = {
  colors: {
    primary: colors.gold,
    secondary: '#8B0000',
    background: colors.bg,
    surface: colors.surface,
    border: colors.hairline,
    text: colors.text,
    textMuted: colors.textMuted,
    // Flipped to the single accent gold at the end of the redesign (was #fcd34d).
    gold: ACCENTS.gold.accent,
    emerald: ACCENTS.emerald.accent,
    midnight: ACCENTS.midnight.accent,
  },
  spacing: { xs: space[1], sm: space[2], md: space[4], lg: space[6], xl: space[8] },
  fonts: { regular: font.regular, medium: font.medium, bold: font.bold, quran: font.quran },
};

export { tokens, colors, radius, space, font, type, elevation, icon, layout, ACCENTS } from './tokens';
