import { StyleSheet } from 'react-native';

export const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0c0805' },
  content: { padding: 20, paddingBottom: 40 },
  header: { fontSize: 32, color: '#fcd34d', marginBottom: 30, marginTop: 40, textAlign: 'right', fontFamily: 'Tajawal_700Bold' },
  
  section: { marginBottom: 25 },
  sectionTitle: { color: '#64748b', fontSize: 13, fontFamily: 'Tajawal_700Bold', marginBottom: 12, textAlign: 'right', textTransform: 'uppercase' },
  sectionContent: { backgroundColor: '#1a140f', borderRadius: 24, padding: 8, overflow: 'hidden', borderWidth: 1, borderColor: '#2b1f15' },
  
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12 },
  itemLeft: { flexDirection: 'row', alignItems: 'center' },
  iconWrapper: { backgroundColor: '#334155', padding: 8, borderRadius: 12, marginHorizontal: 12 },
  itemLabel: { color: '#FFF', fontSize: 16, fontFamily: 'Tajawal_500Medium' },
  
  subSection: { padding: 12, borderTopWidth: 1, borderTopColor: '#334155' },
  labelRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 8 },
  subLabel: { color: '#cbd5e1', fontSize: 14, fontFamily: 'Tajawal_500Medium' },
  
  tafsirGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#334155', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: 'transparent' },
  chipText: { color: '#94a3b8', fontSize: 14, fontFamily: 'Tajawal_500Medium' },
  chipTextActive: { color: '#FFF' },
  
  styleRow: { flexDirection: 'row', gap: 10 },
  styleBtn: { flex: 1, backgroundColor: '#334155', paddingVertical: 10, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: 'transparent' },
  styleText: { color: '#94a3b8', fontSize: 14, fontFamily: 'Tajawal_500Medium' },
  
  themeGrid: { flexDirection: 'row', gap: 10 },
  themeBtn: { flex: 1, alignItems: 'center', backgroundColor: '#1a140f', padding: 12, borderRadius: 16, borderWidth: 1, borderColor: 'transparent' },
  colorCircle: { width: 24, height: 24, borderRadius: 12, marginBottom: 8 },
  themeBtnText: { fontFamily: 'Tajawal_500Medium', fontSize: 12, color: '#64748b' },

  reciterGrid: { flexDirection: 'column', gap: 8 },
  reciterBtn: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', 
    backgroundColor: '#0c0805', padding: 15, borderRadius: 16, borderWidth: 1, borderColor: '#2b1f15' 
  },
  reciterBtnText: { fontFamily: 'Tajawal_500Medium', fontSize: 15, color: '#94a3b8' },

  fontControls: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  fontBtn: { backgroundColor: '#334155', width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  fontBtnText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  fontPreview: { flex: 1, backgroundColor: '#0c0805', borderRadius: 12, padding: 10, alignItems: 'center', justifyContent: 'center', minHeight: 60 },
  previewText: { color: '#FFF', textAlign: 'center', fontFamily: 'Tajawal_400Regular' },
  
  aboutBtn: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1e293b', borderRadius: 20, padding: 16 },
  aboutText: { color: '#FFF', fontSize: 16, fontFamily: 'Tajawal_500Medium' },

  settingsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 10 },
  methodItem: { 
    width: '48%', backgroundColor: '#1a140f', padding: 12, borderRadius: 16, 
    borderWidth: 1, borderColor: '#2b1f15', marginBottom: 5 
  },
  methodLabel: { color: '#94a3b8', fontSize: 12, fontFamily: 'Tajawal_500Medium', textAlign: 'center' },
  testBtn: { 
    marginTop: 15, padding: 15, borderRadius: 16, borderStyle: 'dashed', 
    borderWidth: 1, alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(252, 211, 77, 0.1)', borderColor: 'rgba(252, 211, 77, 0.4)'
  },
});
