import { StyleSheet } from 'react-native';

export const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0c0805' },
  header: { 
    backgroundColor: '#0c0805',
    borderBottomWidth: 1,
    borderBottomColor: '#1a140f',
    zIndex: 10
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#1a140f',
    margin: 16,
    borderRadius: 16,
    padding: 4,
    borderWidth: 1,
    borderColor: '#2b1f15'
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 6,
    borderRadius: 12,
  },
  activeTab: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  tabLabel: {
    fontFamily: 'Tajawal_700Bold',
    fontSize: 13,
    color: '#94a3b8',
  },
  content: { flex: 1 ,marginTop: -60 ,     zIndex:50}
});
