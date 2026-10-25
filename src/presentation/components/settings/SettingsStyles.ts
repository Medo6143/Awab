import { StyleSheet } from 'react-native';
import { colors, radius, space, type } from '../../../shared/theme/tokens';

export const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { paddingBottom: space[10] },

  section: { marginBottom: space[2] },
  sectionContent: { backgroundColor: colors.surface, borderRadius: radius.card, overflow: 'hidden' },

  itemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: space[4], paddingVertical: space[3], gap: space[3] },
  itemDivider: { height: 1, backgroundColor: colors.hairline, marginHorizontal: space[4] },
  itemLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: space[3] },
  itemLabel: { ...type.bodyMedium, color: colors.text, flex: 1 },
  itemSub: { ...type.caption, color: colors.textMuted, marginTop: 2 },

  subSection: { padding: space[4], borderTopWidth: 1, borderTopColor: colors.hairline },
  labelRow: { flexDirection: 'row', alignItems: 'center', marginBottom: space[3], gap: space[2] },
  subLabel: { ...type.label, fontSize: 14, color: colors.textMuted },
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: space[2] },
  row: { flexDirection: 'row', gap: space[2] },

  // Stepper
  stepper: { flexDirection: 'row', alignItems: 'center', gap: space[3] },
  stepBtn: { width: 44, height: 44, borderRadius: radius.pill, backgroundColor: colors.surfaceRaised, alignItems: 'center', justifyContent: 'center' },
  stepValue: { flex: 1, height: 44, backgroundColor: colors.surfaceRaised, borderRadius: radius.field, alignItems: 'center', justifyContent: 'center' },
  stepValueText: { ...type.label, fontSize: 16, color: colors.text, fontVariant: ['tabular-nums'] },

  // Themes
  themeGrid: { flexDirection: 'row', gap: space[2] },
  themeBtn: { flex: 1, alignItems: 'center', backgroundColor: colors.surfaceRaised, padding: space[4], borderRadius: radius.card, gap: space[2] },
  colorCircle: { width: 28, height: 28, borderRadius: 14 },
  themeBtnText: { ...type.label, color: colors.textMuted },

  // Reciters
  reciterGrid: { gap: space[2] },
  reciterBtn: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.surfaceRaised, padding: space[4], borderRadius: radius.field },
  reciterBtnText: { ...type.bodyMedium, color: colors.textMuted },

  // Font preview
  fontPreview: { flex: 1, backgroundColor: colors.surfaceRaised, borderRadius: radius.field, padding: space[3], alignItems: 'center', justifyContent: 'center', minHeight: 56 },
  previewText: { color: colors.text, textAlign: 'center', fontFamily: 'Amiri_400Regular' },

  // Colour swatches
  swatchRow: { flexDirection: 'row', flexWrap: 'wrap', gap: space[2], marginTop: space[2] },
  swatch: { width: 34, height: 34, borderRadius: 17, borderWidth: 2, borderColor: 'transparent' },
  hint: { ...type.caption, color: colors.textFaint, marginTop: space[3] },

  // Azan readiness
  readinessRow: { flexDirection: 'row', alignItems: 'center', gap: space[3], paddingVertical: space[3] },
  readinessText: { flex: 1 },
  readinessTitle: { ...type.bodyMedium, color: colors.text },
  readinessHint: { ...type.caption, color: colors.textMuted, marginTop: 2 },
  readinessSummary: { ...type.body, color: colors.textMuted, marginBottom: space[2] },

  // About / credit
  aboutBtn: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.surface, borderRadius: radius.card, padding: space[4], marginTop: space[6] },
  aboutText: { ...type.bodyMedium, color: colors.text },
  credit: { alignItems: 'center', marginTop: space[8] },
  creditText: { ...type.caption, color: colors.textFaint },
  creditName: { ...type.label, color: colors.gold, marginTop: 4 },
});
