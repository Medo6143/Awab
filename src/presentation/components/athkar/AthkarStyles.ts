import { StyleSheet } from 'react-native';
import { colors, layout, radius, space, type } from '../../../shared/theme/tokens';

export const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  tabContainer: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: space[3], gap: space[2] },

  progressSection: { paddingHorizontal: 20, marginBottom: space[2] },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: space[2] },
  progressLabel: { ...type.label, color: colors.goldText },
  progressSub: { ...type.caption, color: colors.textMuted },

  listPadding: { padding: 20, paddingTop: space[2], paddingBottom: layout.tabBarInset },
  athkarCard: { backgroundColor: colors.surface, borderRadius: radius.card, padding: space[5], marginBottom: space[3] },
  athkarCardCompleted: { backgroundColor: colors.surfaceRaised, opacity: 0.85 },
  cardBody: { alignItems: 'center' },
  athkarText: { fontFamily: 'Amiri_700Bold', fontSize: 21, color: colors.text, textAlign: 'center', lineHeight: 38, marginBottom: space[4] },
  textCompleted: { color: colors.textMuted },

  counterContainer: { flexDirection: 'row', alignItems: 'center', gap: space[3] },
  miniCounter: { paddingHorizontal: space[5], height: 40, justifyContent: 'center', borderRadius: radius.pill, backgroundColor: colors.goldSoft },
  miniCounterCompleted: { backgroundColor: colors.successSoft },
  counterText: { ...type.label, fontSize: 16, color: colors.goldText, fontVariant: ['tabular-nums'] },
  counterTextCompleted: { color: colors.success },
  checkmark: { marginLeft: 2 },
});
