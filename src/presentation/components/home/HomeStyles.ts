import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const CARD_GAP = 16;
const SIDE_PAD = 20;

export const styles = StyleSheet.create({
  // ── Root ──
  root: { flex: 1, backgroundColor: '#0c0805' },
  scrollContent: { paddingBottom: 100 },

  // ── Header ──
  header: {
    marginBottom: 8,
    overflow: 'hidden',
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
  },
  headerBackground: {
    width: '100%',
    height: 240,
  },
  headerGradient: {
    flex: 1,
    paddingHorizontal: SIDE_PAD,
    paddingTop: 48,
    justifyContent: 'flex-end',
    paddingBottom: 28,
  },
  headerTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerAppName: {
    fontFamily: 'Tajawal_800ExtraBold',
    fontSize: 20,
    color: '#d4af37',
  },
  headerActionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  headerActionBtn: {
    padding: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
  },
  headerGreetingArea: {
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontFamily: 'Tajawal_800ExtraBold',
    fontSize: 28,
    color: '#fff',
  },
  headerSub: {
    fontFamily: 'Tajawal_500Medium',
    fontSize: 14,
    color: '#e2e8f0',
    marginTop: 4,
  },
  hijriBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    alignSelf: 'flex-start',
  },
  hijriText: {
    fontFamily: 'Tajawal_700Bold',
    fontSize: 14,
    color: '#d4af37',
  },
  holidayBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#d4af37',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  holidayBadgeText: {
    fontFamily: 'Tajawal_700Bold',
    fontSize: 11,
    color: '#2b1f15',
  },

  // ── Section Titles ──
  sectionTitle: {
    fontFamily: 'Tajawal_800ExtraBold',
    fontSize: 18,
    color: '#d4af37',
    marginBottom: 14,
    paddingHorizontal: SIDE_PAD,
  },

  // ── Next Prayer Card ──
  prayerSection: { paddingHorizontal: SIDE_PAD, marginBottom: 20, marginTop: 20 },
  prayerCard: {
    borderRadius: 24,
    padding: 20,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(212, 175, 55, 0.25)',
  },
  prayerCardInner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  prayerInfo: {
    alignItems: 'flex-start',
    flex: 1,
  },
  prayerLabel: {
    fontFamily: 'Tajawal_500Medium',
    fontSize: 13,
    color: '#94a3b8',
  },
  prayerName: {
    fontFamily: 'Tajawal_800ExtraBold',
    fontSize: 24,
    color: '#fff',
    marginTop: 2,
  },
  prayerCountdown: {
    fontFamily: 'Tajawal_500Medium',
    fontSize: 13,
    color: '#d4af37',
    marginTop: 4,
  },
  prayerTimeBox: {
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
    alignItems: 'center',
  },
  prayerTime: {
    fontFamily: 'Tajawal_800ExtraBold',
    fontSize: 28,
    color: '#d4af37',
  },
  prayerTimeLabel: {
    fontFamily: 'Tajawal_400Regular',
    fontSize: 10,
    color: '#94a3b8',
    marginTop: -2,
  },

  // ── Ibada Progress Card ──
  ibadaSection: { paddingHorizontal: SIDE_PAD, marginBottom: 20 },
  ibadaCard: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#2b1f15',
  },
  ibadaGradient: { padding: 20 },
  ibadaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  ibadaTitle: {
    fontFamily: 'Tajawal_800ExtraBold',
    fontSize: 18,
    color: '#fff',
    marginRight: 90  ,
  },

  ibadaIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#1e293b',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: { height: '100%', borderRadius: 4 },
  ibadaStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  ibadaStatText: {
    fontFamily: 'Tajawal_500Medium',
    fontSize: 12,
    color: '#64748b',
  },
  reportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    paddingVertical: 10,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  reportBtnText: {
    fontFamily: 'Tajawal_500Medium',
    fontSize: 14,
  },

  // ── Achievements Quick View ──
  achievementsSection: { marginBottom: 20 },
  achievementsScroll: { paddingHorizontal: 20, gap: 12 },
  badgeCard: {
    backgroundColor: '#15110d',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#2b1f15',
    alignItems: 'center',
    width: 100
  },
  badgeLocked: { opacity: 0.5 },
  badgeIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1a140f',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10
  },
  badgeName: {
    fontFamily: 'Tajawal_500Medium',
    fontSize: 12,
    color: '#d4af37',
    textAlign: 'center'
  },

  // ── Heart Journey ──
  heartSection: { paddingHorizontal: SIDE_PAD, marginBottom: 20 },
  heartCard: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#451a03',
  },
  heartGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    justifyContent: 'space-between',
  },
  heartInfo: { flex: 1, alignItems: 'flex-start' },
  heartTitle: {
    fontFamily: 'Tajawal_800ExtraBold',
    fontSize: 17,
    color: '#fff',
  },
  heartSub: {
    fontFamily: 'Tajawal_500Medium',
    fontSize: 12,
    color: '#d4af37',
    marginTop: 4,
  },
  heartIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.15)',
  },

  // ── Quick Actions Grid ──
  gridSection: { paddingHorizontal: SIDE_PAD, marginBottom: 24 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: CARD_GAP,
    justifyContent: 'flex-start',
  },
  gridItem: {
    width: (width - SIDE_PAD * 2 - CARD_GAP) / 2,
    backgroundColor: '#15110d',
    borderRadius: 22,
    padding: 18,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#2b1f15',
  },
  gridIconBox: {
    width: 50,
    height: 50,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  gridLabel: {
    fontFamily: 'Tajawal_700Bold',
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
  },

  // ── Daily Verse Carousel ──
  verseSection: { marginBottom: 30 },
  verseCarouselContent: { paddingHorizontal: SIDE_PAD },
  verseCard: {
    width: width - 40,
    backgroundColor: '#15110d',
    padding: 24,
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: 'rgba(212, 175, 55, 0.2)',
    alignItems: 'center',
    marginRight: CARD_GAP,
  },
  verseBadge: {
    backgroundColor: '#B8860B',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 16,
  },
  verseBadgeText: {
    fontFamily: 'Tajawal_700Bold',
    fontSize: 11,
    color: '#fff',
  },
  verseText: {
    fontFamily: 'Amiri_700Bold',
    fontSize: 22,
    color: '#fff',
    textAlign: 'center',
    lineHeight: 40,
  },
  verseRef: {
    fontFamily: 'Tajawal_500Medium',
    fontSize: 13,
    color: '#64748b',
    marginTop: 14,
  },

  // ── Athkar Quick Section ──
  athkarSection: { paddingHorizontal: SIDE_PAD, marginBottom: 24 },
  athkarRow: {
    flexDirection: 'row',
    gap: 12,
  },
  athkarCard: {
    flex: 1,
    backgroundColor: '#15110d',
    borderRadius: 22,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#2b1f15',
  },
  athkarIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  athkarTitle: {
    fontFamily: 'Tajawal_700Bold',
    fontSize: 15,
    color: '#fff',
  },
  athkarSub: {
    fontFamily: 'Tajawal_500Medium',
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
});
