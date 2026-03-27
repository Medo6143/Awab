import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0c0805' },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#1a140f'
  },
  headerTitle: { fontFamily: 'Tajawal_700Bold', fontSize: 24, color: '#fcd34d' },
  iconBtn: { padding: 10, backgroundColor: '#1a140f', borderRadius: 14 },
  totalBadge: { backgroundColor: '#B8860B', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 12 },
  totalText: { fontFamily: 'Tajawal_700Bold', fontSize: 13, color: '#fff' },

  selectorArea: { marginTop: 16 },
  dhikrScroll: { paddingHorizontal: 20, flexDirection: 'row', gap: 10 },
  dhikrChip: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 20, backgroundColor: '#1a140f', borderWidth: 1, borderColor: '#2b1f15' },
  dhikrChipActive: { borderColor: '#d4af37', backgroundColor: '#2b1f15' },
  dhikrChipText: { fontFamily: 'Tajawal_500Medium', fontSize: 15, color: '#94a3b8' },
  dhikrChipTextActive: { color: '#fcd34d', fontFamily: 'Tajawal_700Bold' },

  // ── Legacy (kept for fallback) ──
  targetRow: { flexDirection: 'row', justifyContent: 'center', gap: 12, marginTop: 25 },
  targetBtn: { width: 60, height: 45, borderRadius: 14, backgroundColor: '#1a140f', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#2b1f15' },
  targetBtnActive: { backgroundColor: '#B8860B', borderColor: '#fcd34d' },
  targetBtnText: { fontFamily: 'Tajawal_700Bold', fontSize: 16, color: '#94a3b8' },
  targetBtnTextActive: { color: '#fff' },

  // ── Carousel ──
  carouselWrapper: { marginTop: 18, paddingBottom: 6 },
  carouselContent: { paddingHorizontal: 20, gap: 10 },
  carouselItem: {
    minWidth: 68, height: 52, borderRadius: 16,
    backgroundColor: '#1a140f', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: '#2b1f15',
    paddingHorizontal: 14,
  },
  carouselItemActive: {
    backgroundColor: '#2b1f15',
    borderColor: '#d4af37',
    shadowColor: '#d4af37',
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  carouselItemText: { fontFamily: 'Tajawal_700Bold', fontSize: 17, color: '#64748b' },
  carouselItemTextActive: { color: '#fcd34d', fontSize: 18 },
  carouselIconItem: {
    width: 52, height: 52, borderRadius: 16,
    backgroundColor: '#1a140f', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: '#2b1f15',
  },
  dotsRow: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 8 },
  dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: '#2b1f15' },
  dotActive: { backgroundColor: '#B8860B', width: 14 },

  counterBody: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  mainCircle: {
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: (width * 0.8) / 2,
    backgroundColor: '#1a140f',
    padding: 12,
    borderWidth: 8,
    borderColor: '#d4af37',
    shadowColor: '#d4af37',
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 20
  },
  innerRing: {
    flex: 1,
    borderRadius: 999,
    backgroundColor: '#2b1f15',
    borderWidth: 2,
    borderColor: '#B8860B',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20
  },
  dhikrHeader: { fontFamily: 'Amiri_700Bold', fontSize: 22, color: '#94a3b8', textAlign: 'center', marginBottom: 10 },
  mainCount: { fontFamily: 'Tajawal_700Bold', fontSize: 90, color: '#fcd34d' },
  progressTextRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: -5 },
  progressText: { fontFamily: 'Tajawal_500Medium', fontSize: 16, color: '#B8860B' },

  bottomContainer: { paddingHorizontal: 20, paddingBottom: 25, width: '100%' },
  resetCircle: { marginTop: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 14, backgroundColor: '#1a140f', borderRadius: 18, borderWidth: 1, borderColor: '#2b1f15' },
  resetLabel: { fontFamily: 'Tajawal_700Bold', fontSize: 16, color: '#B8860B' },

  addDhikrBtn: { width: 45, height: 45, borderRadius: 22, backgroundColor: '#1a140f', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#2b1f15' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: width * 0.85, backgroundColor: '#1a120b', borderRadius: 24, padding: 24, borderWidth: 1.5, borderColor: '#d4af37' },
  modalTitle: { fontFamily: 'Tajawal_700Bold', fontSize: 20, color: '#fcd34d', textAlign: 'center', marginBottom: 20 },
  modalInput: { backgroundColor: '#2b1f15', borderRadius: 12, padding: 15, color: '#fff', fontFamily: 'Tajawal_400Regular', fontSize: 16, marginBottom: 20, borderWidth: 1, borderColor: '#451a03' },
  modalActions: { flexDirection: 'row', gap: 12 },
  modalBtnAdd: { flex: 1, backgroundColor: '#B8860B', padding: 14, borderRadius: 12, alignItems: 'center' },
  modalBtnCancel: { flex: 1, backgroundColor: '#2b1f15', padding: 14, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#451a03' },
  modalBtnText: { fontFamily: 'Tajawal_700Bold', fontSize: 16, color: '#fff' },
  modalSubTitle: { fontFamily: 'Tajawal_400Regular', fontSize: 13, color: '#94a3b8', textAlign: 'center', marginBottom: 15, marginTop: -15 },
});
