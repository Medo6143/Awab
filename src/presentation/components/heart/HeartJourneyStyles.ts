import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0c0805' },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1a140f'
  },
  backBtn: { padding: 10, backgroundColor: '#1a140f', borderRadius: 14 },
  headerTitle: { fontFamily: 'Tajawal_700Bold', fontSize: 20, color: '#fcd34d' },
  progressBadge: { backgroundColor: '#8B0000', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 10 },
  progressBadgeText: { color: '#fff', fontFamily: 'Tajawal_700Bold', fontSize: 13 },

  scrollContent: { paddingBottom: 50 },
  heartContainer: { 
    height: width * 1.0, 
    alignItems: 'center', 
    justifyContent: 'center',
    marginTop: 10
  },

  narrative: { paddingHorizontal: 24, marginTop: -20, marginBottom: 20 },
  narrativeTitle: { fontFamily: 'Amiri_700Bold', fontSize: 28, color: '#fcd34d' },
  narrativeSub: { fontFamily: 'Tajawal_400Regular', fontSize: 14, color: '#94a3b8', marginTop: 5 },

  checklistContainer: { paddingHorizontal: 20 },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1a140f',
    padding: 16,
    borderRadius: 20,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#2b1f15'
  },
  checkItemDone: { borderColor: '#8B0000', backgroundColor: '#2b1f15' },
  checkRight: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  surahNum: { fontFamily: 'Tajawal_700Bold', fontSize: 14, color: '#B8860B', width: 25 },
  surahName: { fontFamily: 'Tajawal_700Bold', fontSize: 18, color: '#fff' },
  surahNameDone: { color: '#fcd34d' },

  narrativeHeader: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'flex-start' },
  khatmaBadge: { 
    flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#fcd34d', 
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12, borderWidth: 1, borderColor: '#451a03' 
  },
  khatmaBadgeText: { fontFamily: 'Tajawal_700Bold', fontSize: 12, color: '#451a03' },
  
  controlsRow: { flexDirection: 'row-reverse', gap: 12, marginTop: 15 },
  controlBtn: { 
    flexDirection: 'row-reverse', alignItems: 'center', gap: 8, backgroundColor: '#1a140f', 
    paddingHorizontal: 15, paddingVertical: 10, borderRadius: 15, borderWidth: 1, borderColor: '#2b1f15' 
  },
  controlBtnText: { fontFamily: 'Tajawal_700Bold', fontSize: 14, color: '#fcd34d' },
  finishBtn: { backgroundColor: '#8B0000', borderColor: '#451a03' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: width * 0.9, maxHeight: '80%', backgroundColor: '#1a120b', borderRadius: 25, padding: 20, borderWidth: 2, borderColor: '#d4af37' },
  modalHeader: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, borderBottomWidth: 1, borderBottomColor: '#2b1f15', paddingBottom: 15 },
  modalTitle: { fontFamily: 'Tajawal_700Bold', fontSize: 18, color: '#fcd34d' },
  
  juzGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10 },
  juzChip: { backgroundColor: '#2b1f15', paddingHorizontal: 15, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: '#451a03', width: '30%', alignItems: 'center' },
  juzChipText: { fontFamily: 'Tajawal_500Medium', fontSize: 14, color: '#fff' },

  bulkItem: { flexDirection: 'row-reverse', justifyContent: 'space-between', padding: 15, backgroundColor: '#2b1f15', marginBottom: 8, borderRadius: 12 },
  bulkItemText: { fontFamily: 'Tajawal_700Bold', fontSize: 18, color: '#fff' },
  bulkItemNum: { fontFamily: 'Tajawal_500Medium', fontSize: 14, color: '#fcd34d' }
});
