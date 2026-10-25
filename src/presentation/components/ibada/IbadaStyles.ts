import { StyleSheet } from 'react-native';
import { colors, radius, space, type } from '../../../shared/theme/tokens';

export const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { paddingBottom: space[10] },

  hero: { alignItems: 'center', paddingVertical: space[4] },
  heroCaption: { ...type.body, color: colors.textMuted, marginTop: space[3] },

  section: { marginBottom: space[2] },
  taskCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: space[3], paddingRight: space[4], backgroundColor: colors.surface, borderRadius: radius.card, marginBottom: space[2] },
  taskCardDone: { backgroundColor: colors.surfaceRaised },
  taskLeft: { flexDirection: 'row', alignItems: 'center', gap: space[3], flex: 1 },
  taskName: { ...type.bodyMedium, fontSize: 16, color: colors.text, flex: 1 },
  taskNameCompleted: { color: colors.textMuted, textDecorationLine: 'line-through' },
});
