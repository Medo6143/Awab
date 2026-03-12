import { StyleSheet, Dimensions } from 'react-native';

const { height: H } = Dimensions.get('window');

export const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0c0805' },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#1a140f' 
  },
  headerTitle: { fontFamily: 'Tajawal_700Bold', fontSize: 24, color: '#fcd34d' },
  addBtn: { padding: 8, backgroundColor: '#1a140f', borderRadius: 12, borderWidth: 1, borderColor: '#2b1f15' },

  searchSection: { paddingHorizontal: 20, marginTop: 20 },
  searchBar: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#1a140f', 
    borderRadius: 18, 
    paddingHorizontal: 16,
    height: 55,
    borderWidth: 1,
    borderColor: '#2b1f15'
  },
  searchInput: { flex: 1, fontFamily: 'Tajawal_400Regular', fontSize: 16, color: '#fff', marginRight: 12 },

  categoriesScroll: { marginTop: 20, marginBottom: 10 },
  catContent: { paddingHorizontal: 20, flexDirection: 'row', gap: 10 },
  catChip: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#1a140f', 
    paddingHorizontal: 16, 
    paddingVertical: 10, 
    borderRadius: 99,
    borderWidth: 1,
    borderColor: '#B8860B',
    gap: 8
  },
  catChipActive: { backgroundColor: '#B8860B' },
  catText: { fontFamily: 'Tajawal_500Medium', fontSize: 14, color: '#fcd34d' },
  catTextActive: { color: '#fff' },

  listContent: { padding: 20, paddingBottom: 100 },
  duaCard: { 
    backgroundColor: '#1a140f', 
    borderRadius: 24, 
    padding: 24, 
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2b1f15',
  },
  duaText: { 
    fontFamily: 'Amiri_700Bold', 
    fontSize: 22, 
    color: '#F4EBD0', 
    textAlign: 'center', 
    lineHeight: 40,
    marginBottom: 20
  },
  duaFooter: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#2b1f15',
    paddingTop: 15
  },
  duaRef: { fontFamily: 'Tajawal_400Regular', fontSize: 13, color: '#94a3b8' },
  actionBtn: { padding: 8, backgroundColor: '#2b1f15', borderRadius: 12 },

  emptyState: { marginTop: 100, alignItems: 'center' },
  emptyText: { fontFamily: 'Tajawal_400Regular', fontSize: 16, color: '#64748b' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  modalContent: { 
    height: H * 0.7, 
    backgroundColor: '#0c0805', 
    borderTopLeftRadius: 40, 
    borderTopRightRadius: 40,
    borderTopWidth: 2,
    borderTopColor: '#d4af37',
    padding: 24
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
  modalTitle: { fontFamily: 'Tajawal_700Bold', fontSize: 22, color: '#fcd34d' },
  modalBody: { flex: 1 },
  inputLabel: { fontFamily: 'Tajawal_700Bold', fontSize: 16, color: '#94a3b8', marginBottom: 12, textAlign: 'right' },
  textInput: { 
    backgroundColor: '#1a140f', 
    borderRadius: 18, 
    padding: 16, 
    color: '#fff', 
    fontFamily: 'Tajawal_400Regular',
    fontSize: 16,
    textAlign: 'right',
    borderWidth: 1,
    borderColor: '#2b1f15',
    marginBottom: 20
  },
  largeInput: { height: 150, textAlignVertical: 'top' },
  submitBtn: { 
    backgroundColor: '#B8860B', 
    paddingVertical: 18, 
    borderRadius: 20, 
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#B8860B',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5
  },
  submitBtnDisabled: { opacity: 0.5, backgroundColor: '#1a140f' },
  submitBtnText: { fontFamily: 'Tajawal_700Bold', fontSize: 18, color: '#fff' }
});
