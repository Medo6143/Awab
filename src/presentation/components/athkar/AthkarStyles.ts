import { StyleSheet } from 'react-native';

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
  backBtn: { padding: 8, backgroundColor: '#1a140f', borderRadius: 12 },
  headerTitle: { fontFamily: 'Tajawal_700Bold', fontSize: 24, color: '#fcd34d' },
  resetBtn: { padding: 8 },

  tabContainer: { 
    flexDirection: 'row', 
    paddingHorizontal: 20, 
    marginVertical: 20, 
    gap: 12 
  },
  tab: { 
    flex: 1, 
    flexDirection: 'row',
    alignItems: 'center', 
    justifyContent: 'center',
    backgroundColor: '#1a140f', 
    paddingVertical: 14, 
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#2b1f15',
    gap: 8
  },
  tabActive: { backgroundColor: '#B8860B', borderColor: '#fcd34d' },
  tabLabel: { fontFamily: 'Tajawal_700Bold', fontSize: 16, color: '#94a3b8' },
  tabLabelActive: { color: '#fff' },

  progressSection: { paddingHorizontal: 24, marginBottom: 20 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  progressLabel: { fontFamily: 'Tajawal_700Bold', fontSize: 14, color: '#fcd34d' },
  progressSub: { fontFamily: 'Tajawal_400Regular', fontSize: 13, color: '#94a3b8' },
  progressBarBg: { height: 8, backgroundColor: '#1a140f', borderRadius: 4, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: '#B8860B' },

  listPadding: { padding: 20, paddingBottom: 50 },
  athkarCard: { 
    backgroundColor: '#1a140f', 
    borderRadius: 24, 
    padding: 24, 
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2b1f15',
  },
  athkarCardCompleted: { borderColor: '#2E7D32', borderLeftWidth: 4, opacity: 0.8 },
  cardBody: { alignItems: 'center' },
  athkarText: { 
    fontFamily: 'Amiri_700Bold', 
    fontSize: 21, 
    color: '#F4EBD0', 
    textAlign: 'center', 
    lineHeight: 38,
    marginBottom: 20
  },
  textCompleted: { color: '#94a3b8' },
  
  counterContainer: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  miniCounter: { 
    paddingHorizontal: 20, 
    paddingVertical: 10, 
    borderRadius: 15, 
    backgroundColor: '#2b1f15',
    borderWidth: 1,
    borderColor: '#B8860B'
  },
  miniCounterCompleted: { backgroundColor: '#2E7D32', borderColor: '#4ADE80' },
  counterText: { fontFamily: 'Tajawal_700Bold', fontSize: 16, color: '#fcd34d' },
  counterTextCompleted: { color: '#fff' },
  checkmark: { marginLeft: 5 }
});
