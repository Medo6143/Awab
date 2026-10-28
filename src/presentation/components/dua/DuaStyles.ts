import { StyleSheet, Dimensions } from 'react-native';
import { colors, radius, space, type } from '../../../shared/theme/tokens';

const { height: H } = Dimensions.get('window');

export const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },

  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: radius.field, paddingHorizontal: space[4], height: 48, gap: space[2], marginTop: space[4] },
  searchInput: { flex: 1, ...type.body, color: colors.text, paddingVertical: 0 },

  hero: { backgroundColor: colors.surface, borderRadius: radius.card, borderWidth: 1, borderColor: colors.goldLine, padding: space[5] },
  heroHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: space[3] },
  heroLabel: { ...type.label, color: colors.gold },
  heroAnother: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.goldSoft, borderRadius: radius.pill, paddingHorizontal: space[3], paddingVertical: 4 },
  heroAnotherText: { ...type.caption, color: colors.goldText },
  heroText: { fontFamily: 'Amiri_700Bold', fontSize: 24, color: colors.text, textAlign: 'center', lineHeight: 44, marginBottom: space[4] },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space[2], marginTop: space[4] },
  tile: { width: '31.5%', flexGrow: 1, alignItems: 'center', gap: 2, backgroundColor: colors.surface, borderRadius: radius.tile, paddingVertical: space[3] },
  tileOn: { backgroundColor: colors.gold },
  tileName: { ...type.label, color: colors.text, marginTop: 2 },
  tileCount: { ...type.caption, color: colors.textMuted },
  tileTextOn: { color: colors.onGold },

  listTitle: { ...type.h2, color: colors.text, marginTop: space[6], marginBottom: space[3] },
  listContent: { padding: 20, paddingTop: space[2], paddingBottom: space[8] },
  duaCard: { backgroundColor: colors.surface, borderRadius: radius.card, padding: space[5], marginBottom: space[3] },
  duaText: { fontFamily: 'Amiri_700Bold', fontSize: 22, color: colors.text, textAlign: 'center', lineHeight: 40, marginBottom: space[4] },
  duaFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: space[3] },
  duaRef: { ...type.caption, color: colors.textMuted, flex: 1 },
  actions: { flexDirection: 'row', gap: space[2] },
  actionBtn: { width: 36, height: 36, borderRadius: radius.pill, backgroundColor: colors.surfaceRaised, alignItems: 'center', justifyContent: 'center' },

  modalOverlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end' },
  modalContent: { height: H * 0.7, backgroundColor: colors.surface, borderTopLeftRadius: radius.sheet, borderTopRightRadius: radius.sheet, padding: space[6] },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: space[5] },
  modalTitle: { ...type.h2, color: colors.text },
  modalBody: { flex: 1 },
  inputLabel: { ...type.label, color: colors.textMuted, marginBottom: space[2] },
  textInput: { backgroundColor: colors.surfaceRaised, borderRadius: radius.field, padding: space[4], color: colors.text, ...type.body, textAlign: 'right', marginBottom: space[4] },
  largeInput: { height: 140, textAlignVertical: 'top' },
});
