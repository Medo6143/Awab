import { StyleSheet } from 'react-native';

export const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0c0805' },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 20
  },
  backBtn: { padding: 10, backgroundColor: '#1a140f', borderRadius: 12 },
  headerTitle: { fontFamily: 'Tajawal_700Bold', fontSize: 22, color: '#fcd34d' },

  resultContainer: { padding: 20 },
  resultCard: { 
    padding: 30, 
    borderRadius: 32, 
    alignItems: 'center', 
    borderWidth: 1, 
    borderColor: 'rgba(255,255,255,0.1)',
    shadowColor: '#B8860B',
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 8
  },
  resultLabel: { fontFamily: 'Tajawal_500Medium', fontSize: 16, color: '#94a3b8', marginBottom: 10 },
  resultValue: { fontFamily: 'Tajawal_700Bold', fontSize: 42, color: '#fcd34d' },
  nisabBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 15, backgroundColor: 'rgba(255,255,255,0.05)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  nisabText: { fontFamily: 'Tajawal_400Regular', fontSize: 12, color: '#94a3b8' },

  form: { padding: 20, gap: 20 },
  inputWrapper: { gap: 10 },
  inputLabel: { fontFamily: 'Tajawal_700Bold', fontSize: 16, color: '#fcd34d', textAlign: 'right' },
  inputRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#1a140f', 
    borderRadius: 20, 
    paddingHorizontal: 16,
    height: 60,
    borderWidth: 1,
    borderColor: '#2b1f15'
  },
  iconBox: { width: 40, alignItems: 'center' },
  input: { flex: 1, fontFamily: 'Tajawal_700Bold', fontSize: 18, color: '#fff', paddingHorizontal: 10 },
  unitText: { fontFamily: 'Tajawal_500Medium', fontSize: 14, color: '#64748b' },

  infoBox: { margin: 20, padding: 24, backgroundColor: '#1a140f', borderRadius: 24, borderWidth: 1, borderColor: '#2b1f15' },
  infoTitle: { fontFamily: 'Tajawal_700Bold', fontSize: 18, color: '#fcd34d', marginBottom: 10, textAlign: 'right' },
  infoDesc: { fontFamily: 'Tajawal_400Regular', fontSize: 14, color: '#94a3b8', textAlign: 'justify', lineHeight: 24 }
});
