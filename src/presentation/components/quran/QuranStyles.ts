import { StyleSheet, Dimensions } from 'react-native';

const { height: H } = Dimensions.get('window');

export const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0c0805' },
  
  topBar: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', 
    paddingHorizontal: 16, paddingVertical: 14, backgroundColor: '#1a120b',
    borderBottomWidth: 1, borderBottomColor: '#2b1f15'
  },
  topTitle: { fontFamily: 'Tajawal_700Bold', fontSize: 18, color: '#fcd34d' },
  topActions: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  iconBtn: { padding: 8, backgroundColor: '#2b1f15', borderRadius: 10 },

  mushafOuter: { flex: 1, padding: 8 },
  frameGoldLayer: { 
    flex: 1, borderWidth: 6, borderColor: '#d4af37', backgroundColor: '#2b1f15',
    borderRadius: 8, padding: 6, elevation: 20
  },
  frameCreamLayer: { 
    flex: 1, backgroundColor: '#F4EBD0', borderRadius: 4, overflow: 'hidden',
    borderWidth: 1.5, borderColor: '#fbbf24'
  },

  ornateHeader: { 
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, paddingVertical: 10, 
    backgroundColor: '#ebd9a3', borderBottomWidth: 2, borderBottomColor: '#d4af37'
  },
  headerCornerLeft: { width: 30, height: 30, borderTopWidth: 2, borderLeftWidth: 2, borderColor: '#d4af37' },
  headerCornerRight: { width: 30, height: 30, borderTopWidth: 2, borderRightWidth: 2, borderColor: '#d4af37' },
  headerCenterInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  ornateLine: { flex: 1, height: 2, backgroundColor: '#d4af37', marginHorizontal: 10 },
  headerPageText: { fontFamily: 'Tajawal_700Bold', fontSize: 18, color: '#451a03' },
  headerBookmark: { marginHorizontal: 15 },

  ayahList: { padding: 16, paddingBottom: 60, flexGrow: 1 },
  centerLoader: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 150 },
  loaderSub: { fontFamily: 'Tajawal_400Regular', fontSize: 16, color: '#78350f', marginTop: 15 },

  surahGroup: { marginBottom: 30 },
  goldBanner: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', 
    backgroundColor: '#d4af37', paddingVertical: 10, borderRadius: 8, marginBottom: 20
  },
  goldBannerTitle: { 
    fontFamily: 'Amiri_700Bold', fontSize: 36, color: '#451a03',
    textAlign: 'center', writingDirection: 'rtl'
  },
  bannerPatternLeft: { width: 20, height: 2, backgroundColor: '#451a03', marginRight: 15 },
  bannerPatternRight: { width: 20, height: 2, backgroundColor: '#451a03', marginLeft: 15 },

  basmalaContainer: { 
    alignItems: 'center', 
    justifyContent: 'center',
    paddingVertical: 15,
    width: '100%',
  },
  mushafBasmala: { 
    fontFamily: 'Amiri_700Bold', 
    fontSize: 34, 
    color: '#451a03',
    textAlign: 'center'
  },

  textFlow: { 
    fontFamily: 'Amiri_700Bold', fontSize: 23, lineHeight: 66, color: '#271900', 
    textAlign: 'center', writingDirection: 'rtl',
  },
  singleAyah: { paddingHorizontal: 1 },
  highlightedText: { backgroundColor: 'rgba(212, 175, 55, 0.45)', borderRadius: 6 },
  
  ayaMarkContainer: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  ayaOrnament: {
    fontFamily: 'Amiri_700Bold',
    fontSize: 26,
    color: '#b45309',
    position: 'absolute',
  },
  ayaMarkNumber: {
    fontFamily: 'Tajawal_700Bold',
    fontSize: 15,
    color: '#422006',
    zIndex: 1,
    top:7,left:0,bottom:0,right:0,
    marginTop: 0, 
  },

  ornateFooter: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', 
    paddingHorizontal: 25, paddingVertical: 18, backgroundColor: '#1a140f',
    borderTopWidth: 2, borderTopColor: '#d4af37',
    borderBottomLeftRadius: 30, borderBottomRightRadius: 30,
    elevation: 8, shadowColor: '#000', shadowOpacity: 0.4, shadowRadius: 8,
  },
  navBtn: { 
    paddingVertical: 10, paddingHorizontal: 16, backgroundColor: '#2b1f15', 
    borderRadius: 14, borderWidth: 1.5, borderColor: '#d4af37',
    flexDirection: 'row', alignItems: 'center', gap: 10,
  },
  btnDisabled: { opacity: 0.5, borderColor: '#475569' },
  navBtnText: { fontFamily: 'Tajawal_700Bold', fontSize: 14, color: '#fcd34d' },
  pageIndicator: {
    paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#0c0805',
    borderRadius: 10, borderWidth: 1, borderColor: '#3f2b1d',
  },
  pageIndicatorText: { fontFamily: 'Tajawal_700Bold', fontSize: 15, color: '#fcd34d' },

  sheetOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheetContent: { 
    backgroundColor: '#FDF6E3', borderTopLeftRadius: 40, borderTopRightRadius: 40,
    borderTopWidth: 6, borderTopColor: '#d4af37', height: H * 0.85, overflow: 'hidden'
  },
  sheetGrabArea: { paddingVertical: 15, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  sheetGrab: { width: 60, height: 6, backgroundColor: '#d4af37', borderRadius: 3 },
  sheetScrollable: { flex: 1 },
  sheetScrollContent: { padding: 25 },
  ayahPreviewCard: { backgroundColor: '#ebd9a3', padding: 24, borderRadius: 22, marginBottom: 25 },
  ayahPreviewText: { fontFamily: 'Amiri_700Bold', fontSize: 24, color: '#271900', textAlign: 'center', lineHeight: 45 },
  ayahPreviewRef: { fontFamily: 'Tajawal_500Medium', fontSize: 14, color: '#8b4513', textAlign: 'center', marginTop: 10 },

  tafsirLoader: { alignItems: 'center', marginTop: 50 },
  loadingTextSmall: { fontFamily: 'Tajawal_400Regular', fontSize: 15, color: '#78350f', marginTop: 12 },
  tafsirTextMain: { color: '#271900', textAlign: 'justify', lineHeight: 32, writingDirection: 'rtl' },

  simpleTafsir: { borderRightWidth: 4, borderRightColor: '#d4af37', paddingRight: 18 },
  bookTafsir: { backgroundColor: '#fcf8eb', padding: 28, borderRadius: 12, borderWidth: 1.5, borderColor: '#ebd9a3' },
  bookOrnamentTop: { height: 10, borderBottomWidth: 1.5, borderBottomColor: '#d4af37', marginBottom: 15 },
  bookOrnamentBottom: { height: 10, borderTopWidth: 1.5, borderTopColor: '#d4af37', marginTop: 15 },
  bookText: { fontFamily: 'Amiri_400Regular' },
  
  modernTafsir: { backgroundColor: '#fff', padding: 24, borderRadius: 24, elevation: 3 },
  modernHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 18, gap: 12 },
  modernIndicator: { width: 7, height: 28, backgroundColor: '#fbbf24', borderRadius: 4 },
  modernTitle: { fontFamily: 'Tajawal_700Bold', fontSize: 20, color: '#451a03' },
  modernText: { fontFamily: 'Amiri_400Regular' },

  sheetToolBar: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#eee', paddingVertical: 15, paddingHorizontal: 20, justifyContent: 'space-around', backgroundColor: '#FDF6E3' },
  sheetToolBtn: { alignItems: 'center', gap: 5 },
  sheetToolLab: { fontFamily: 'Tajawal_500Medium', fontSize: 12, color: '#8b4513' },

  modalPage: { flex: 1, backgroundColor: '#0c0805' },
  modalHead: { flexDirection: 'row', alignItems: 'center', padding: 15, borderBottomWidth: 1, borderBottomColor: '#2b1f15', justifyContent: 'space-between' },
  modalHeadTitle: { fontFamily: 'Tajawal_700Bold', fontSize: 18, color: '#fcd34d' },

  pickerTabs: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#2b1f15' },
  pickerTab: { flex: 1, paddingVertical: 15, alignItems: 'center' },
  pickerTabActive: { borderBottomWidth: 2, borderBottomColor: '#fcd34d' },
  tabLabel: { fontFamily: 'Tajawal_700Bold', fontSize: 14, color: '#64748b' },
  tabLabelActive: { color: '#fcd34d' },

  searchFieldWrap: { 
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#2b1f15', 
    margin: 18, borderRadius: 18, borderWidth: 1.5, borderColor: '#d4af37', paddingHorizontal: 18 
  },
  searchInput: { flex: 1, fontFamily: 'Tajawal_400Regular', fontSize: 17, padding: 14, color: '#fff' },

  surahEntry: { 
    flexDirection: 'row', alignItems: 'center', padding: 20, backgroundColor: '#1a120b', 
    borderRadius: 20, marginHorizontal: 18, marginBottom: 12, borderWidth: 1, borderColor: '#2b1f15'
  },
  surahNumHex: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#2b1f15', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#d4af37' },
  surahNumHexText: { fontFamily: 'Tajawal_700Bold', fontSize: 16, color: '#fcd34d' },
  surahTextSection: { flex: 1, marginHorizontal: 18 },
  surahRowTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 10 },
  surahEntryName: { fontFamily: 'Tajawal_700Bold', fontSize: 20, color: '#fbbf24' },
  revBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, borderWidth: 1 },
  meccanBg: { backgroundColor: 'rgba(184, 134, 11, 0.1)', borderColor: '#B8860B' },
  medinanBg: { backgroundColor: 'rgba(46, 125, 50, 0.1)', borderColor: '#2E7D32' },
  revText: { fontFamily: 'Tajawal_500Medium', fontSize: 10, color: '#fff' },
  surahMetaRow: { flexDirection: 'row-reverse', alignItems: 'center', marginTop: 4, gap: 8 },
  surahEntrySub: { fontFamily: 'Tajawal_400Regular', fontSize: 13, color: '#94a3b8' },
  vDivider: { width: 1, height: 12, backgroundColor: '#334155' },

  juzBox: { flex: 1, margin: 5, padding: 15, backgroundColor: '#1a120b', borderRadius: 15, alignItems: 'center', borderWidth: 1, borderColor: '#2b1f15' },
  juzBoxTitle: { fontFamily: 'Tajawal_400Regular', fontSize: 12, color: '#64748b' },
  juzBoxNum: { fontFamily: 'Tajawal_700Bold', fontSize: 18, color: '#fcd34d', marginVertical: 4 },
  juzBoxPage: { fontFamily: 'Tajawal_500Medium', fontSize: 10, color: '#64748b' },

  reciterHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, backgroundColor: '#1a120b', marginHorizontal: 18, marginTop: 18, borderRadius: 15, borderWidth: 1, borderColor: '#2b1f15' },
  reciterInfo: { flex: 1 },
  reciterLabel: { fontFamily: 'Tajawal_400Regular', fontSize: 11, color: '#94a3b8' },
  reciterActiveName: { fontFamily: 'Tajawal_700Bold', fontSize: 14, color: '#fcd34d' },
  changeReciterBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#2b1f15', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: '#d4af37' },
  changeReciterText: { fontFamily: 'Tajawal_500Medium', fontSize: 12, color: '#fcd34d' },

  reciterModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', padding: 25, alignItems: 'center' },
  reciterModalContent: { width: '90%', maxHeight: '70%', backgroundColor: '#1a120b', borderRadius: 25, padding: 20, borderWidth: 2, borderColor: '#d4af37' },
  reciterModalHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  reciterModalTitle: { fontFamily: 'Tajawal_700Bold', fontSize: 18, color: '#fcd34d' },
  reciterItem: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', padding: 18, borderBottomWidth: 1, borderBottomColor: '#2b1f15', backgroundColor: '#2b1f15', borderRadius: 12, marginBottom: 10 },
  reciterItemActive: { backgroundColor: '#332a21', borderColor: '#fcd34d', borderWidth: 1 },
  reciterItemName: { fontFamily: 'Tajawal_500Medium', fontSize: 16, color: '#94a3b8' },
  reciterItemNameActive: { color: '#fcd34d', fontFamily: 'Tajawal_700Bold' },

  bookmarkRow: { flexDirection: 'row-reverse', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#2b1f15', gap: 15 },
  bookmarkRowLabel: { fontFamily: 'Tajawal_700Bold', fontSize: 16, color: '#fcd34d' },
  emptyBoxText: { fontFamily: 'Tajawal_400Regular', fontSize: 16, color: '#64748b', textAlign: 'center', marginTop: 50 },
});
