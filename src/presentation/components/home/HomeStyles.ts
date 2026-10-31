import { StyleSheet } from 'react-native';
import { colors, space, type, themed } from '../../../shared/theme/tokens';

export const styles = themed(() => ({
  // ── Grid ──
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: space[4] },
  gridItem: { width: '22%', alignItems: 'center', gap: space[2] },
  gridLabel: { ...type.caption, color: colors.textMuted, textAlign: 'center' },
}));
