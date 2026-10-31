import { StyleSheet, Dimensions } from 'react-native';
import { colors, radius, space, type, themed } from '../../../shared/theme/tokens';

const { width } = Dimensions.get('window');

export const s = themed(() => ({
  root: { flex: 1, backgroundColor: colors.bg },
  totalBadge: { backgroundColor: colors.goldSoft, paddingHorizontal: space[3], paddingVertical: 6, borderRadius: radius.pill },
  totalText: { ...type.label, color: colors.goldText },

  selectorArea: { marginTop: space[2] },
  dhikrScroll: { paddingHorizontal: 20, flexDirection: 'row', gap: space[2] },

  // ── Carousel ──
  carouselWrapper: { marginTop: space[4], paddingBottom: space[1] },
  carouselContent: { paddingHorizontal: 20, gap: space[2] },
  carouselItem: { minWidth: 64, height: 44, borderRadius: radius.pill, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', paddingHorizontal: space[4] },
  carouselItemActive: { backgroundColor: colors.goldSoft },
  carouselItemText: { ...type.label, fontSize: 16, color: colors.textMuted },
  carouselItemTextActive: { color: colors.goldText },
  carouselAddItem: { height: 44, borderRadius: radius.pill, borderWidth: 1, borderStyle: 'dashed', borderColor: colors.goldLine, flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: space[4] },
  carouselAddText: { ...type.label, fontSize: 15, color: colors.goldText },
  carouselIconItem: { width: 44, height: 44, borderRadius: radius.pill, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  dotsRow: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: space[2] },
  dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: colors.surfaceRaised },
  dotActive: { backgroundColor: colors.gold, width: 14 },

  counterBody: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: space[2] },
  dhikrHeader: { fontFamily: 'Amiri_700Bold', fontSize: 22, color: colors.textMuted, textAlign: 'center', marginBottom: space[2] },
  mainCount: { ...type.display, fontSize: 84, lineHeight: 92, color: colors.goldText },
  progressTextRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: -2 },
  progressText: { ...type.bodyMedium, color: colors.textMuted },

  bottomContainer: { paddingHorizontal: 20, paddingBottom: space[3], width: '100%', flexDirection: 'row', gap: space[2] },
  addDhikrBtn: { width: 44, height: 44, borderRadius: radius.pill, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },

  // ── Modals ──
  modalOverlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: width * 0.88, backgroundColor: colors.surface, borderRadius: radius.sheet, padding: space[6] },
  modalTitle: { ...type.h2, color: colors.text, textAlign: 'center', marginBottom: space[2] },
  modalSubTitle: { ...type.caption, color: colors.textMuted, textAlign: 'center', marginBottom: space[4] },
  modalInput: { backgroundColor: colors.surfaceRaised, borderRadius: radius.field, padding: space[4], color: colors.text, ...type.body, marginBottom: space[4] },
  modalActions: { flexDirection: 'row', gap: space[3] },
  modalBtnAdd: { flex: 1, backgroundColor: colors.gold, height: 48, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  modalBtnCancel: { flex: 1, backgroundColor: colors.surfaceRaised, height: 48, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  modalBtnText: { ...type.label, fontSize: 15, color: colors.text },
  modalBtnTextPrimary: { ...type.label, fontSize: 15, color: colors.onGold },
  suggestionsLabel: { ...type.label, color: colors.textMuted, marginBottom: space[2] },
  suggestionChip: { backgroundColor: colors.goldSoft, paddingHorizontal: space[4], paddingVertical: space[2], borderRadius: radius.pill },
  suggestionText: { ...type.label, color: colors.goldText },
}));
