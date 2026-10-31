import { StyleSheet } from 'react-native';
import { colors, radius, space, type, themed } from '../../../shared/theme/tokens';

export const s = themed(() => ({
  // ── Hero ──
  hero: { padding: space[5], alignItems: 'flex-start' },
  heroEyebrow: { ...type.label, color: colors.textMuted },
  heroName: { ...type.h1, color: colors.text, marginTop: 2 },
  heroDateRow: { flexDirection: 'row', alignItems: 'center', gap: space[2], marginTop: space[3] },
  heroDate: { ...type.caption, color: colors.textMuted },

  // ── Rows ──
  list: { gap: space[2], marginTop: space[4] },
  row: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: space[4], paddingVertical: space[4],
    borderRadius: radius.card, backgroundColor: colors.surface,
  },
  rowActive: { backgroundColor: colors.surfaceRaised },
  prayerIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.surfaceRaised, alignItems: 'center', justifyContent: 'center' },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: space[3] },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'transparent' },
  rowName: { ...type.bodyMedium, color: colors.textMuted },
  rowNameActive: { color: colors.text, fontFamily: 'Tajawal_700Bold' },
  rowTime: { ...type.h2, color: colors.text, fontVariant: ['tabular-nums'] },
  rowTimeActive: { color: colors.goldText },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: space[3] },
  nowPill: { backgroundColor: colors.goldSoft, paddingHorizontal: space[2], paddingVertical: 3, borderRadius: radius.pill },
  nowPillText: { ...type.caption, color: colors.goldText },

  skeletonRow: { height: 64, borderRadius: radius.card, marginBottom: space[2] },

  // ── Hub ──
  hubTabs: { flexDirection: 'row', gap: space[2], paddingHorizontal: 20, paddingBottom: space[3] },
}));
