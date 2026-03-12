import { StyleSheet } from 'react-native';

export const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0c0805' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
  backBtn: { padding: 10, backgroundColor: '#1a140f', borderRadius: 12 },
  headerTitle: { fontFamily: 'Tajawal_700Bold', fontSize: 22, color: '#fcd34d' },
  
  content: { padding: 20 },
  progressCard: { padding: 25, borderRadius: 28, borderWidth: 1, borderColor: '#2b1f15', marginBottom: 30 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  progressTitle: { fontFamily: 'Tajawal_700Bold', fontSize: 20, color: '#fff' },
  progressSub: { fontFamily: 'Tajawal_500Medium', fontSize: 14, color: '#94a3b8' },
  
  progressBarBg: { height: 10, backgroundColor: '#334155', borderRadius: 5, overflow: 'hidden', marginBottom: 15 },
  progressBarFill: { height: '100%', borderRadius: 5 },
  
  statsRow: { flexDirection: 'row', gap: 20 },
  statItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statText: { fontFamily: 'Tajawal_500Medium', fontSize: 12, color: '#cbd5e1' },
  
  section: { marginBottom: 25 },
  sectionTitle: { fontFamily: 'Tajawal_700Bold', fontSize: 16, color: '#64748b', marginBottom: 15, textAlign: 'right' },
  
  taskCard: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 16, 
    backgroundColor: '#1a140f', 
    borderRadius: 20, 
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#2b1f15'
  },
  taskLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  categoryBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  categoryText: { fontFamily: 'Tajawal_700Bold', fontSize: 10 },
  taskName: { fontFamily: 'Tajawal_500Medium', fontSize: 16, color: '#fff' },
  taskNameCompleted: { color: '#94a3b8', textDecorationLine: 'line-through' },
});
