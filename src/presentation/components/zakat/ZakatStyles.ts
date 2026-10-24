import { StyleSheet } from 'react-native';
import { colors, radius, space, type } from '../../../shared/theme/tokens';

export const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  hero: { alignItems: 'center', paddingVertical: space[6] },
  nisabBadge: { flexDirection: 'row-reverse', alignItems: 'center', gap: 6, marginTop: space[4], backgroundColor: colors.surfaceRaised, paddingHorizontal: space[3], paddingVertical: 6, borderRadius: radius.pill },
  nisabText: { ...type.caption, color: colors.textMuted },
  belowNisab: { ...type.caption, color: colors.textMuted, marginTop: space[2], textAlign: 'center' },

  form: { gap: space[4], marginTop: space[4] },
  inputWrapper: { gap: space[2] },
  inputLabel: { ...type.label, color: colors.textMuted, textAlign: 'right' },
  inputRow: { flexDirection: 'row-reverse', alignItems: 'center', backgroundColor: colors.surfaceRaised, borderRadius: radius.field, paddingHorizontal: space[3], height: 56, gap: space[2] },
  input: { flex: 1, ...type.h2, color: colors.text, paddingVertical: 0, fontVariant: ['tabular-nums'] },
  unitText: { ...type.label, color: colors.textFaint },

  infoTitle: { ...type.h2, color: colors.text, marginBottom: space[2], textAlign: 'right' },
  infoDesc: { ...type.body, color: colors.textMuted, textAlign: 'right' },
});
