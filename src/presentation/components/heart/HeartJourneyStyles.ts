import { StyleSheet, Dimensions } from 'react-native';
import { colors, radius, space, type } from '../../../shared/theme/tokens';

const { width } = Dimensions.get('window');

export const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  backBtn: { width: 44, height: 44, borderRadius: radius.tile, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  progressBadge: { backgroundColor: colors.goldSoft, paddingHorizontal: space[3], paddingVertical: 6, borderRadius: radius.pill },
  progressBadgeText: { ...type.label, color: colors.goldText },

  scrollContent: { paddingBottom: space[10] },
  heartContainer: { height: width * 0.9 * 1.1, alignItems: 'center', justifyContent: 'center', marginTop: space[1] },
  heartZoomBtn: { position: 'absolute', top: 8, left: 20, width: 44, height: 44, borderRadius: radius.tile, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', zIndex: 2 },

  // ── Zoom modal ──
  zoomRoot: { flex: 1, backgroundColor: colors.bg },
  zoomHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: space[3] },
  zoomTitle: { ...type.h2, color: colors.text },
  zoomHint: { ...type.caption, color: colors.textMuted, textAlign: 'center', paddingVertical: space[2] },
  zoomCaption: { position: 'absolute', bottom: 56, alignSelf: 'center', backgroundColor: colors.surfaceRaised, borderRadius: radius.pill, paddingHorizontal: space[5], paddingVertical: space[3] },
  zoomCaptionText: { ...type.bodyMedium, fontFamily: 'Tajawal_700Bold', color: colors.text },

  // ── Narrative ──
  narrative: { paddingHorizontal: 20, marginTop: -space[2], marginBottom: space[4] },
  narrativeTitle: { ...type.h1, fontFamily: 'Amiri_700Bold', color: colors.text },
  narrativeSub: { ...type.body, color: colors.textMuted, marginTop: 2 },
  narrativeHeader: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'flex-start' },
  khatmaBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.goldSoft, paddingHorizontal: space[3], paddingVertical: 6, borderRadius: radius.pill },
  khatmaBadgeText: { ...type.label, color: colors.goldText },
  controlsRow: { flexDirection: 'row-reverse', gap: space[2], marginTop: space[4] },
  controlBtn: { flexDirection: 'row-reverse', alignItems: 'center', gap: space[2], backgroundColor: colors.surface, paddingHorizontal: space[4], height: 44, borderRadius: radius.pill },
  controlBtnText: { ...type.label, fontSize: 14, color: colors.goldText },
  finishBtn: { backgroundColor: colors.gold },

  // ── Checklist ──
  checklistContainer: { paddingHorizontal: 20 },
  searchBox: { flexDirection: 'row-reverse', alignItems: 'center', gap: space[2], backgroundColor: colors.surface, borderRadius: radius.field, paddingHorizontal: space[4], height: 48, marginBottom: space[3] },
  searchInput: { flex: 1, color: colors.text, ...type.body, textAlign: 'right', paddingVertical: 0 },
  searchEmpty: { ...type.body, color: colors.textMuted, textAlign: 'center', paddingVertical: space[5] },
  checkItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.surface, padding: space[4], borderRadius: radius.card, marginBottom: space[2] },
  checkItemDone: { backgroundColor: colors.surfaceRaised },
  checkRight: { flexDirection: 'row', alignItems: 'center', gap: space[4] },
  surahNum: { ...type.label, color: colors.textFaint, width: 28 },
  surahName: { ...type.bodyMedium, fontSize: 17, color: colors.text },
  surahNameDone: { color: colors.goldText },

  // ── Modals ──
  modalOverlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: width * 0.9, maxHeight: '80%', backgroundColor: colors.surface, borderRadius: radius.sheet, padding: space[5] },
  modalHeader: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: space[4] },
  modalTitle: { ...type.h2, color: colors.text },
  juzGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: space[2] },
  juzChip: { backgroundColor: colors.surfaceRaised, paddingHorizontal: space[3], paddingVertical: space[3], borderRadius: radius.pill, width: '30%', alignItems: 'center' },
  juzChipText: { ...type.bodyMedium, color: colors.text },
  bulkItem: { flexDirection: 'row-reverse', justifyContent: 'space-between', padding: space[4], backgroundColor: colors.surfaceRaised, marginBottom: space[2], borderRadius: radius.field },
  bulkItemText: { ...type.bodyMedium, fontSize: 17, color: colors.text },
  bulkItemNum: { ...type.label, color: colors.goldText },
});
