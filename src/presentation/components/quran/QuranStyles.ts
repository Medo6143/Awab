import { StyleSheet, Dimensions } from 'react-native';
import { colors, radius, space, type } from '../../../shared/theme/tokens';

const { height: H } = Dimensions.get('window');

// The mushaf keeps its paper look (paper tokens); all chrome around it is the dark system.
export const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },

  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: space[4], paddingVertical: space[3], backgroundColor: colors.bg,
  },
  topTitle: { ...type.h2, color: colors.text },
  topActions: { flexDirection: 'row', gap: space[2], alignItems: 'center' },
  iconBtn: { width: 42, height: 42, borderRadius: radius.tile, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },

  mushafOuter: { flex: 1, paddingHorizontal: space[3], paddingTop: space[1] },
  frameGoldLayer: { flex: 1, borderWidth: 4, borderColor: colors.gold, backgroundColor: colors.surface, borderRadius: radius.field, padding: 4 },
  frameCreamLayer: { flex: 1, backgroundColor: colors.paper, borderRadius: 8, overflow: 'hidden' },

  ornateHeader: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: space[4], paddingVertical: space[2],
    backgroundColor: colors.paperDeep, borderBottomWidth: 2, borderBottomColor: colors.paperRule,
  },
  headerCornerLeft: { width: 24, height: 24, borderTopWidth: 2, borderLeftWidth: 2, borderColor: colors.paperRule },
  headerCornerRight: { width: 24, height: 24, borderTopWidth: 2, borderRightWidth: 2, borderColor: colors.paperRule },
  headerCenterInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  ornateLine: { flex: 1, height: 2, backgroundColor: colors.paperRule, marginHorizontal: space[2] },
  headerPageText: { ...type.label, fontSize: 16, color: colors.paperInk },
  headerBookmark: { marginHorizontal: space[3] },

  ayahList: { padding: space[4], paddingBottom: 60, flexGrow: 1 },
  centerLoader: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 120 },
  loaderSub: { ...type.body, color: '#78350f', marginTop: space[3] },
  pageError: { flex: 1, justifyContent: 'center', paddingHorizontal: space[4] },
  pageErrorText: { ...type.body, color: colors.paperInk, textAlign: 'center', marginTop: space[2] },
  pageRetryBtn: { alignSelf: 'center', marginTop: space[4], backgroundColor: colors.paperDeep, paddingHorizontal: space[5], height: 40, borderRadius: radius.pill, justifyContent: 'center' },
  pageRetryText: { ...type.label, color: colors.paperInk },

  surahGroup: { marginBottom: space[6] },
  goldBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.gold, paddingVertical: space[2], borderRadius: radius.field, marginBottom: space[5] },
  goldBannerTitle: { fontFamily: 'Amiri_700Bold', fontSize: 34, color: colors.paperInk, textAlign: 'center', writingDirection: 'rtl' },
  bannerPatternLeft: { width: 20, height: 2, backgroundColor: colors.paperInk, marginRight: space[4] },
  bannerPatternRight: { width: 20, height: 2, backgroundColor: colors.paperInk, marginLeft: space[4] },

  basmalaContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: space[4], width: '100%' },
  mushafBasmala: { fontFamily: 'Amiri_700Bold', fontSize: 32, color: colors.paperInk, textAlign: 'center' },

  textFlow: { fontFamily: 'Amiri_700Bold', fontSize: 23, lineHeight: 64, color: '#271900', textAlign: 'center', writingDirection: 'rtl' },
  singleAyah: { paddingHorizontal: 1 },
  highlightedText: { backgroundColor: 'rgba(212,175,55,0.4)', borderRadius: 6 },

  ayaMarkContainer: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center', marginHorizontal: 4 },
  ayaOrnament: { fontFamily: 'Amiri_700Bold', fontSize: 26, color: colors.goldDeep, position: 'absolute' },
  ayaMarkNumber: { fontFamily: 'Tajawal_700Bold', fontSize: 14, color: colors.paperInk, zIndex: 1, top: 7, left: 0, bottom: 0, right: 0 },

  ornateFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: space[5], paddingVertical: space[3], backgroundColor: colors.bg },
  navBtn: { paddingVertical: space[2], paddingHorizontal: space[4], backgroundColor: colors.surface, borderRadius: radius.pill, flexDirection: 'row', alignItems: 'center', gap: space[2] },
  btnDisabled: { opacity: 0.4 },
  navBtnText: { ...type.label, color: colors.text },
  pageIndicator: { paddingHorizontal: space[3], paddingVertical: 6, backgroundColor: colors.goldSoft, borderRadius: radius.pill },
  pageIndicatorText: { ...type.label, fontSize: 15, color: colors.goldText },

  // ── Tafsir sheet (paper) ──
  sheetOverlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end' },
  sheetContent: { backgroundColor: colors.paper, borderTopLeftRadius: radius.sheet, borderTopRightRadius: radius.sheet, height: H * 0.85, overflow: 'hidden' },
  sheetGrabArea: { paddingVertical: space[3], alignItems: 'center' },
  sheetGrab: { width: 48, height: 5, backgroundColor: colors.paperDeep, borderRadius: 3 },
  sheetScrollable: { flex: 1 },
  sheetScrollContent: { padding: space[6] },
  ayahPreviewCard: { backgroundColor: colors.paperDeep, padding: space[6], borderRadius: radius.card, marginBottom: space[6] },
  ayahPreviewText: { fontFamily: 'Amiri_700Bold', fontSize: 24, color: '#271900', textAlign: 'center', lineHeight: 44 },
  ayahPreviewRef: { ...type.caption, fontSize: 13, color: '#8b4513', textAlign: 'center', marginTop: space[2] },

  tafsirLoader: { alignItems: 'center', marginTop: 50 },
  loadingTextSmall: { ...type.body, color: '#78350f', marginTop: space[3] },
  tafsirTextMain: { color: '#271900', textAlign: 'justify', lineHeight: 32, writingDirection: 'rtl' },

  simpleTafsir: { borderRightWidth: 4, borderRightColor: colors.paperRule, paddingRight: space[4] },
  bookTafsir: { backgroundColor: '#fcf8eb', padding: space[6], borderRadius: radius.field },
  bookOrnamentTop: { height: 10, borderBottomWidth: 1.5, borderBottomColor: colors.paperRule, marginBottom: space[4] },
  bookOrnamentBottom: { height: 10, borderTopWidth: 1.5, borderTopColor: colors.paperRule, marginTop: space[4] },
  bookText: { fontFamily: 'Amiri_400Regular' },

  modernTafsir: { backgroundColor: '#fff', padding: space[6], borderRadius: radius.card },
  modernHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: space[4], gap: space[3] },
  modernIndicator: { width: 6, height: 26, backgroundColor: colors.gold, borderRadius: 3 },
  modernTitle: { ...type.h2, color: colors.paperInk },
  modernText: { fontFamily: 'Amiri_400Regular' },

  sheetToolBar: { flexDirection: 'row', paddingVertical: space[3], paddingHorizontal: space[5], justifyContent: 'space-around', backgroundColor: colors.paperDeep },
  sheetToolBtn: { alignItems: 'center', gap: 4 },
  sheetToolLab: { ...type.caption, color: colors.paperInk },

  // ── Dark modals (picker, bookmarks) ──
  modalPage: { flex: 1, backgroundColor: colors.bg },
  modalHead: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: space[5], paddingVertical: space[3], justifyContent: 'space-between' },
  modalHeadTitle: { ...type.h2, color: colors.text },

  pickerTabs: { flexDirection: 'row', gap: space[2], paddingHorizontal: space[5], paddingBottom: space[3] },

  searchFieldWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, marginHorizontal: space[5], marginBottom: space[3], borderRadius: radius.field, paddingHorizontal: space[4], height: 48, gap: space[2] },
  searchInput: { flex: 1, ...type.body, color: colors.text, paddingVertical: 0 },

  surahEntry: { flexDirection: 'row', alignItems: 'center', padding: space[4], backgroundColor: colors.surface, borderRadius: radius.card, marginHorizontal: space[5], marginBottom: space[2] },
  surahEntryActive: { backgroundColor: colors.surfaceRaised },
  surahNumHex: { width: 42, height: 42, borderRadius: radius.tile, backgroundColor: colors.goldSoft, alignItems: 'center', justifyContent: 'center' },
  surahNumHexText: { ...type.label, fontSize: 15, color: colors.goldText },
  surahTextSection: { flex: 1, marginHorizontal: space[4] },
  surahRowTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: space[2] },
  surahEntryName: { ...type.h2, fontSize: 19, color: colors.text },
  revBadge: { paddingHorizontal: space[2], paddingVertical: 2, borderRadius: radius.pill, backgroundColor: colors.surfaceRaised },
  meccanBg: {},
  medinanBg: {},
  revText: { ...type.caption, fontSize: 10, color: colors.textMuted },
  surahMetaRow: { flexDirection: 'row-reverse', alignItems: 'center', marginTop: 4, gap: space[2] },
  surahEntrySub: { ...type.caption, color: colors.textMuted },
  vDivider: { width: 1, height: 10, backgroundColor: colors.hairline },

  juzBox: { flex: 1, margin: 5, padding: space[4], backgroundColor: colors.surface, borderRadius: radius.card, alignItems: 'center' },
  juzBoxTitle: { ...type.caption, color: colors.textMuted },
  juzBoxNum: { ...type.h2, color: colors.goldText, marginVertical: 2 },
  juzBoxPage: { ...type.caption, fontSize: 10, color: colors.textFaint },

  reciterHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: space[4], backgroundColor: colors.surface, marginHorizontal: space[5], marginBottom: space[3], borderRadius: radius.card },
  reciterInfo: { flex: 1 },
  reciterLabel: { ...type.caption, color: colors.textMuted },
  reciterActiveName: { ...type.label, fontSize: 15, color: colors.text },
  changeReciterBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.goldSoft, paddingHorizontal: space[3], paddingVertical: 8, borderRadius: radius.pill },
  changeReciterText: { ...type.label, color: colors.goldText },

  reciterModalOverlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'center', padding: space[6], alignItems: 'center' },
  reciterModalContent: { width: '92%', maxHeight: '70%', backgroundColor: colors.surface, borderRadius: radius.sheet, padding: space[5] },
  reciterModalHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: space[4] },
  reciterModalTitle: { ...type.h2, color: colors.text },
  reciterItem: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', padding: space[4], backgroundColor: colors.surfaceRaised, borderRadius: radius.field, marginBottom: space[2] },
  reciterItemActive: { backgroundColor: colors.goldSoft },
  reciterItemName: { ...type.bodyMedium, color: colors.textMuted },
  reciterItemNameActive: { color: colors.goldText, fontFamily: 'Tajawal_700Bold' },

  bookmarkRow: { flexDirection: 'row-reverse', alignItems: 'center', padding: space[4], marginHorizontal: space[5], marginBottom: space[2], backgroundColor: colors.surface, borderRadius: radius.card, gap: space[3] },
  bookmarkRowLabel: { ...type.bodyMedium, color: colors.text },
  emptyBoxText: { ...type.body, color: colors.textMuted, textAlign: 'center', marginTop: 50 },
});
