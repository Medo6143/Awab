import { StyleSheet } from 'react-native';

export const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0c0805' },
  center: { alignItems: 'center', justifyContent: 'center' },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 20
  },
  backBtn: { padding: 10, backgroundColor: '#1a140f', borderRadius: 12 },
  headerTitle: { fontFamily: 'Tajawal_700Bold', fontSize: 22, color: '#fcd34d' },

  countdownContainer: { padding: 20 },
  glassCard: { 
    padding: 30, 
    borderRadius: 32, 
    alignItems: 'center', 
    borderWidth: 1, 
    borderColor: 'rgba(255,255,255,0.1)',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10
  },
  nextLabel: { fontFamily: 'Tajawal_700Bold', fontSize: 18, color: '#fcd34d', marginBottom: 10 },
  remainingTime: { fontFamily: 'Tajawal_700Bold', fontSize: 48, color: '#fff', marginBottom: 15 },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dateText: { fontFamily: 'Tajawal_400Regular', fontSize: 14, color: '#94a3b8' },

  listContainer: { paddingHorizontal: 20, gap: 12 },
  timeRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 20, 
    backgroundColor: '#1a140f', 
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#2b1f15'
  },
  activeRow: { borderColor: '#B8860B', backgroundColor: '#2b1f15' },
  timeInfo: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  timeName: { fontFamily: 'Tajawal_700Bold', fontSize: 18, color: '#94a3b8' },
  activeText: { color: '#fcd34d' },
  timeValue: { fontFamily: 'Tajawal_700Bold', fontSize: 20, color: '#fff' },

  imsakiyaBtn: { margin: 20, borderRadius: 20, overflow: 'hidden' },
  imsakiyaGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 18, gap: 12 },
  imsakiyaBtnText: { fontFamily: 'Tajawal_700Bold', fontSize: 16, color: '#fff' }
});
