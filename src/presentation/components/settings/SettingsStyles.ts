import { StyleSheet } from 'react-native';

export const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0c0805' },
  content: { paddingBottom: 60 },
  
  // Header
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#2b1f15',
    backgroundColor: '#15110d',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    color: '#d4af37',
    fontFamily: 'Tajawal_800ExtraBold',
  },
  headerSub: {
    fontSize: 14,
    color: '#94a3b8',
    fontFamily: 'Tajawal_500Medium',
    marginTop: 4,
  },
  
  // Sections
  section: {
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    color: '#d4af37',
    fontSize: 15,
    fontFamily: 'Tajawal_800ExtraBold',
    marginBottom: 12,
  },
  sectionContent: {
    backgroundColor: '#15110d',
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#2b1f15',
  },
  
  // Items
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2b1f15',
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  itemLabel: {
    color: '#FFF',
    fontSize: 16,
    fontFamily: 'Tajawal_500Medium',
    flex: 1,
  },
  
  // Subsections
  subSection: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#2b1f15',
    backgroundColor: '#1a140f',
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  subLabel: {
    color: '#cbd5e1',
    fontSize: 15,
    fontFamily: 'Tajawal_700Bold',
  },
  
  // Tafsir Grid
  tafsirGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0c0805',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#2b1f15',
  },
  chipText: {
    color: '#94a3b8',
    fontSize: 14,
    fontFamily: 'Tajawal_500Medium',
  },
  chipTextActive: {
    color: '#FFF',
    fontFamily: 'Tajawal_700Bold',
  },
  
  // Style Row
  styleRow: {
    flexDirection: 'row',
    gap: 10,
  },
  styleBtn: {
    flex: 1,
    backgroundColor: '#0c0805',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#2b1f15',
  },
  styleText: {
    color: '#94a3b8',
    fontSize: 14,
    fontFamily: 'Tajawal_700Bold',
  },
  
  // Themes
  themeGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  themeBtn: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#0c0805',
    padding: 16,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#2b1f15',
  },
  colorCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginBottom: 10,
  },
  themeBtnText: {
    fontFamily: 'Tajawal_700Bold',
    fontSize: 13,
    color: '#64748b',
  },

  // Reciters
  reciterGrid: {
    flexDirection: 'column',
    gap: 10,
  },
  reciterBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0c0805',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#2b1f15',
  },
  reciterBtnText: {
    fontFamily: 'Tajawal_700Bold',
    fontSize: 15,
    color: '#94a3b8',
  },

  // Font Controls
  fontControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  fontBtn: {
    backgroundColor: '#0c0805',
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#2b1f15',
  },
  fontBtnText: {
    color: '#FFF',
    fontSize: 20,
    fontFamily: 'Tajawal_700Bold',
  },
  fontPreview: {
    flex: 1,
    backgroundColor: '#0c0805',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 64,
    borderWidth: 1,
    borderColor: '#2b1f15',
  },
  previewText: {
    color: '#FFF',
    textAlign: 'center',
    fontFamily: 'Tajawal_400Regular',
  },
  
  // About Button
  aboutBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#15110d',
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 20,
    borderWidth: 1.5,
    borderColor: '#2b1f15',
    marginTop: 10,
  },
  aboutText: {
    color: '#d4af37',
    fontSize: 16,
    fontFamily: 'Tajawal_800ExtraBold',
  },
});
