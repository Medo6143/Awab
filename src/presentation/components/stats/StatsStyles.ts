import { StyleSheet } from 'react-native';
import { colors, radius, space, type } from '../../../shared/theme/tokens';

export const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  tabContainer: { flexDirection: 'row', gap: space[2], marginBottom: space[4] },

  heroCaption: { ...type.body, color: colors.textMuted, marginTop: space[2], textAlign: 'center' },
  streakPill: { alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.goldSoft, paddingHorizontal: space[3], paddingVertical: 6, borderRadius: radius.pill, marginTop: space[3] },
  streakText: { ...type.label, color: colors.goldText },

  statsRow: { flexDirection: 'row', gap: space[3], marginTop: space[4] },
  statCard: { flex: 1, alignItems: 'center', paddingVertical: space[5] },

  statusRow: { flexDirection: 'row', alignItems: 'center', gap: space[3], paddingVertical: space[3] },
  statusText: { flex: 1 },
  statusTitle: { ...type.bodyMedium, color: colors.text },
  statusSub: { ...type.caption, color: colors.textMuted, marginTop: 2 },
  divider: { height: 1, backgroundColor: colors.hairline },

  chartContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 140, paddingHorizontal: 4 },
  barWrapper: { alignItems: 'center', gap: space[2] },
  barBackground: { width: 14, height: 100, backgroundColor: colors.surfaceRaised, borderRadius: 7, justifyContent: 'flex-end', overflow: 'hidden' },
  barFill: { width: '100%', borderRadius: 7 },
  barLabel: { ...type.caption, color: colors.textFaint },

  dhikrBarRow: { flexDirection: 'row', alignItems: 'center', marginBottom: space[3], gap: space[3] },
  dhikrBarLabel: { ...type.bodyMedium, color: colors.text, width: 110 },
  dhikrBarValue: { ...type.label, color: colors.textMuted, width: 44, fontVariant: ['tabular-nums'] },
  legendText: { ...type.caption, color: colors.textFaint, marginTop: space[1] },
  emptyInline: { ...type.body, color: colors.textMuted, textAlign: 'center', paddingVertical: space[3] },

  monthRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: space[3], paddingHorizontal: space[4], backgroundColor: colors.surface, borderRadius: radius.card, marginBottom: space[2] },
  monthDisplay: { flexDirection: 'row', alignItems: 'center', gap: space[2] },
  monthLabel: { ...type.bodyMedium, fontFamily: 'Tajawal_700Bold', color: colors.text },
  monthCount: { ...type.caption, color: colors.textMuted },

  historyCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, padding: space[4], borderRadius: radius.card, marginBottom: space[2], gap: space[3] },
  historyDatePart: { width: 56, alignItems: 'center' },
  historyDayNum: { ...type.h2, color: colors.text },
  historyDayShort: { ...type.caption, color: colors.textFaint },
  historyContentPart: { flex: 1, alignItems: 'flex-start' },
  historyBadgeRow: { flexDirection: 'row', gap: space[2], marginBottom: 6 },
  hBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: space[2], paddingVertical: 3, borderRadius: radius.pill, backgroundColor: colors.surfaceRaised },
  hBadgeText: { ...type.caption, fontSize: 11, color: colors.textMuted },
  historySummaryText: { ...type.caption, color: colors.textMuted },
});
