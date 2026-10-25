import { StyleSheet } from 'react-native';
import { colors, radius, space, type } from '../../../shared/theme/tokens';

export const styles = StyleSheet.create({
  // ── Header ──
  header: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', paddingTop: space[3], paddingBottom: space[4] },
  headerText: { flex: 1, alignItems: 'flex-start' },
  headerTitle: { ...type.h1, color: colors.text },
  headerSub: { ...type.body, color: colors.textMuted, marginTop: 2 },
  hijriRow: { flexDirection: 'row', alignItems: 'center', gap: space[2], marginTop: space[2], alignSelf: 'flex-start' },
  hijriText: { ...type.label, color: colors.gold },
  holidayPill: { backgroundColor: colors.goldSoft, paddingHorizontal: space[3], paddingVertical: 4, borderRadius: radius.pill },
  holidayText: { ...type.caption, color: colors.goldText },
  headerActions: { flexDirection: 'row', gap: space[2], marginLeft: space[3] },

  // ── Next prayer hero ──
  hero: { height: 190, borderRadius: radius.card, overflow: 'hidden', backgroundColor: colors.surface },
  heroImage: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
  heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(14,10,7,0.62)' },
  heroBody: { flex: 1, padding: space[5], justifyContent: 'space-between' },
  heroTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  heroEyebrow: { ...type.label, color: colors.textMuted },
  heroTimePill: { backgroundColor: 'rgba(255,255,255,0.08)', paddingHorizontal: space[3], paddingVertical: 6, borderRadius: radius.pill },
  heroTimeText: { ...type.label, color: colors.text },
  heroBottom: { alignItems: 'flex-start' },
  heroCaption: { ...type.body, color: colors.textMuted, marginTop: -4 },
  heroPrayerName: { ...type.h2, color: colors.text },
  heroStateWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  // ── Progress row ──
  ringsRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-start', paddingVertical: space[2] },

  // ── Grid ──
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: space[4] },
  gridItem: { width: '22%', alignItems: 'center', gap: space[2] },
  gridLabel: { ...type.caption, color: colors.textMuted, textAlign: 'center' },

  // ── Verse ──
  verseTag: { alignSelf: 'flex-start', backgroundColor: colors.goldSoft, paddingHorizontal: space[3], paddingVertical: 4, borderRadius: radius.pill },
  verseTagText: { ...type.caption, color: colors.goldText },
  verseText: { ...type.quran, color: colors.text, textAlign: 'center', marginTop: space[3] },
  verseRef: { ...type.caption, color: colors.textMuted, textAlign: 'center', marginTop: space[2] },
});
