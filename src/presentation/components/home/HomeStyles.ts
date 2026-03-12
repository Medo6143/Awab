import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0c0805' },
  scrollContent: { paddingBottom: 20 },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 24, 
    paddingTop: 20, 
    marginBottom: 10 
  },
  headerTitle: { fontFamily: 'Tajawal_700Bold', fontSize: 32, color: '#fff' },
  headerTopRow: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'flex-start', gap: 10 },
  holidayBadge: { 
    flexDirection: 'row-reverse', alignItems: 'center', gap: 4, backgroundColor: '#fcd34d', 
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, marginTop: 4
  },
  holidayBadgeText: { fontFamily: 'Tajawal_700Bold', fontSize: 10, color: '#451a03' },
  headerSub: { fontFamily: 'Tajawal_400Regular', fontSize: 14, color: '#94a3b8', marginTop: 4 },
  hijriDate: { fontFamily: 'Tajawal_500Medium', fontSize: 12, color: '#fcd34d', marginTop: 6 },
  headerSettingsBtn: { padding: 12, backgroundColor: '#1a140f', borderRadius: 18, borderWidth: 1, borderColor: '#2b1f15' },

  streakContainer: { paddingHorizontal: 20, marginBottom: 10 },
  streakCard: { flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: 20, borderWidth: 1, borderColor: '#2b1f15', gap: 12 },
  streakLeft: { alignItems: 'center', borderRightWidth: 1, borderRightColor: '#2b1f15', paddingRight: 12 },
  streakValue: { fontFamily: 'Tajawal_700Bold', fontSize: 24, color: '#fff' },
  streakLabel: { fontFamily: 'Tajawal_400Regular', fontSize: 10, color: '#94a3b8' },
  streakRight: { flex: 1 },
  streakTitle: { fontFamily: 'Tajawal_700Bold', fontSize: 14, color: '#fff' },
  streakSub: { fontFamily: 'Tajawal_400Regular', fontSize: 11, color: '#64748b' },

  nextPrayerRow: { paddingHorizontal: 20, marginBottom: 20 },
  nextPrayerCard: { borderRadius: 24, padding: 20, overflow: 'hidden', borderWidth: 1, borderColor: '#d4af3730' },
  nextPrayerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  nextPrayerTitle: { fontFamily: 'Tajawal_700Bold', fontSize: 18, color: '#fcd34d' },
  nextPrayerTime: { fontFamily: 'Tajawal_700Bold', fontSize: 28, color: '#fff' },
  nextPrayerCountdown: { fontFamily: 'Tajawal_500Medium', fontSize: 14, color: '#94a3b8' },

  heartCTARow: { paddingHorizontal: 20, marginBottom: 20 },
  heartCTA: { borderRadius: 24, overflow: 'hidden', borderWidth: 1, borderColor: '#451a03' },
  heartGradient: { flexDirection: 'row', alignItems: 'center', padding: 20, justifyContent: 'space-between' },
  heartCTALeft: { flex: 1 },
  heartCTATitle: { fontFamily: 'Tajawal_700Bold', fontSize: 18, color: '#fff' },
  heartCTASub: { fontFamily: 'Tajawal_400Regular', fontSize: 13, color: '#fcd34d', marginTop: 4 },
  heartIconCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },

  ibadaProgressRow: { paddingHorizontal: 20, marginBottom: 20 },
  ibadaCard: { borderRadius: 24, overflow: 'hidden', borderWidth: 1, borderColor: '#2b1f15' },
  ibadaGradient: { padding: 20 },
  ibadaHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  ibadaTitle: { fontFamily: 'Tajawal_700Bold', fontSize: 18, color: '#fff' },
  ibadaSub: { fontFamily: 'Tajawal_400Regular', fontSize: 13, color: '#94a3b8' },
  progressBarBg: { height: 8, backgroundColor: '#334155', borderRadius: 4, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 4 },
  reportBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginTop: 15, 
    paddingVertical: 10, 
    backgroundColor: '#ffffff05', 
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: '#ffffff08'
  },
  reportBtnText: { fontFamily: 'Tajawal_700Bold', fontSize: 13 },

  carouselSection: { marginBottom: 30 },
  carouselContainer: { paddingHorizontal: 20 },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, paddingHorizontal: 20, marginBottom: 30 },
  gridItem: { 
    width: (width - 52) / 2, 
    backgroundColor: '#1a140f', 
    borderRadius: 20, 
    padding: 16, 
    alignItems: 'center', 
    borderWidth: 1 
  },
  iconBox: { padding: 12, borderRadius: 16, marginBottom: 8 },
  itemLabel: { fontFamily: 'Tajawal_700Bold', fontSize: 16, color: '#fff' },

  athkarSection: { paddingHorizontal: 20, marginBottom: 30 },
  sectionTitle: { fontFamily: 'Tajawal_700Bold', fontSize: 18, color: '#fcd34d', marginBottom: 15 },
  athkarRow: { flexDirection: 'row', gap: 12 },
  athkarCardSmall: { 
    flex: 1,
    backgroundColor: '#1a140f', 
    padding: 16, 
    borderRadius: 20, 
    borderWidth: 1,
    borderColor: '#2b1f15',
    alignItems: 'center'
  },
  athkarIconSmall: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  athkarTitleSmall: { fontFamily: 'Tajawal_700Bold', fontSize: 16, color: '#fff' },
  athkarSubSmall: { fontFamily: 'Tajawal_400Regular', fontSize: 10, color: '#64748b', marginTop: 4, textAlign: 'center' },

  dailyVerse: { 
    width: width - 40,
    backgroundColor: '#1a140f', 
    padding: 24, 
    borderRadius: 24, 
    borderWidth: 1, 
    borderColor: '#d4af37',
    alignItems: 'center',
    marginRight: 15
  },
  verseBadge: { backgroundColor: '#B8860B', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 99, marginBottom: 16 },
  verseBadgeText: { fontFamily: 'Tajawal_700Bold', fontSize: 12, color: '#fff' },
  verseText: { fontFamily: 'Amiri_700Bold', fontSize: 22, color: '#fff', textAlign: 'center', lineHeight: 36 },
  verseRef: { fontFamily: 'Tajawal_400Regular', fontSize: 13, color: '#94a3b8', marginTop: 12 },

  achievementsSection: { marginTop: 10, paddingHorizontal: 20 },
  achievementsScroll: { gap: 10, paddingRight: 40 },
  badgeCard: { backgroundColor: '#1a140f', padding: 12, borderRadius: 18, alignItems: 'center', minWidth: 90, borderWidth: 1, borderColor: '#2b1f15' },
  badgeLocked: { opacity: 0.5 },
  badgeIconBox: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#33415520', alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  badgeName: { fontFamily: 'Tajawal_700Bold', fontSize: 12, color: '#fff' },
});
