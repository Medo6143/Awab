import React from 'react';
import { View, Text, TouchableOpacity, FlatList, Dimensions } from 'react-native';
const { width } = Dimensions.get('window');
import { Activity, Sun, Moon, ChevronLeft, BookOpen, Clock, Compass } from 'lucide-react-native';
import { FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { THEME } from '../../../shared/theme/constants';
import { styles } from './HomeStyles';
import { DAILY_VERSES } from './HomeConstants';

// ── Next Prayer Card ──
export const NextPrayerCard = ({ nextPrayer, accentTheme }: any) => {
  const accentColor = (THEME.colors as any)[accentTheme] || THEME.colors.primary;
  return (
    <View style={styles.prayerSection}>
      <Text style={styles.sectionTitle}>الصلاة القادمة</Text>
      <LinearGradient colors={['#1a140f', '#0f0b07']} style={styles.prayerCard}>
        <View style={styles.prayerCardInner}>
          <View style={styles.prayerInfo}>
            <Text style={styles.prayerLabel}>صلاة</Text>
            <Text style={styles.prayerName}>{nextPrayer?.name || '---'}</Text>
            <Text style={styles.prayerCountdown}>
              {nextPrayer ? `متبقي ${nextPrayer.countdown}` : 'جاري التحميل...'}
            </Text>
          </View>
          <View style={[styles.prayerTimeBox, { borderColor: accentColor + '30' }]}>
            <Text style={[styles.prayerTime, { color: accentColor }]}>{nextPrayer?.time || '--:--'}</Text>
            <Text style={styles.prayerTimeLabel}>الوقت</Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

// ── Ibada Progress Card ──
export const IbadaProgressCard = ({ completedIbadaCount, totalIbadaCount, ibadaProgress, accentTheme, onPress, onReportPress }: any) => {
  const accentColor = (THEME.colors as any)[accentTheme] || THEME.colors.primary;
  return (
    <View style={styles.ibadaSection}>
      <TouchableOpacity activeOpacity={0.9} style={styles.ibadaCard} onPress={onPress}>
        <LinearGradient colors={['#15110d', '#0c0805']} style={styles.ibadaGradient}>
          <View style={styles.ibadaHeader}>
            <View style={{ alignItems: 'flex-end', flex: 1 }}>
              <Text style={styles.ibadaTitle}>حصاد اليوم التعبدي</Text>
            </View>
            <View style={[styles.ibadaIconBadge, { backgroundColor: accentColor + '15' }]}>
              <Activity color={accentColor} size={24} />
            </View>
          </View>

          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { 
              width: `${ibadaProgress * 100}%`, 
              backgroundColor: accentColor 
            }]} />
          </View>

          <View style={styles.ibadaStatsRow}>
            <Text style={styles.ibadaStatText}>مكتملة: {completedIbadaCount}</Text>
            <Text style={styles.ibadaStatText}>المتبقية: {totalIbadaCount - completedIbadaCount}</Text>
          </View>

          <TouchableOpacity 
            style={styles.reportBtn} 
            onPress={(e) => { e.stopPropagation(); onReportPress(); }}
          >
            <Text style={[styles.reportBtnText, { color: accentColor }]}>عرض التقرير اليومي</Text>
            <ChevronLeft color={accentColor} size={16} />
          </TouchableOpacity>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

// ── Heart Journey Card ──
export const HeartJourneyCard = ({ completedSurahsCount, onPress }: any) => (
  <View style={styles.heartSection}>
    <TouchableOpacity activeOpacity={0.9} style={styles.heartCard} onPress={onPress}>
      <LinearGradient 
        colors={['#8B0000', '#451a03']} 
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} 
        style={styles.heartGradient}
      >
        <View style={styles.heartInfo}>
          <Text style={styles.heartTitle}>نور القلب • متابعة الختمة</Text>
          <Text style={styles.heartSub}>أتممت {completedSurahsCount} من ١١٤ سورة</Text>
        </View>
        <View style={styles.heartIconCircle}>
          <MaterialCommunityIcons name="book-open-page-variant" color="#fcd34d" size={24} />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  </View>
);

// ── Quick Actions Grid ──
export const HomeGrid = ({ onNavigate }: any) => (
  <View style={styles.gridSection}>
    <Text style={styles.sectionTitle}>الوصول السريع</Text>
    <View style={styles.grid}>
      <TouchableOpacity 
        style={[styles.gridItem, { borderColor: 'rgba(59, 130, 246, 0.3)' }]} 
        onPress={() => onNavigate('القبلة')}
      >
        <View style={[styles.gridIconBox, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
          <FontAwesome5 name="kaaba" color="#3B82F6" size={22} />
        </View>
        <Text style={styles.gridLabel}>القبلة</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.gridItem, { borderColor: 'rgba(126, 34, 206, 0.3)' }]} 
        onPress={() => onNavigate('الزكاة')}
      >
        <View style={[styles.gridIconBox, { backgroundColor: 'rgba(126, 34, 206, 0.1)' }]}>
          <FontAwesome5 name="hand-holding-usd" color="#7E22CE" size={22} />
        </View>
        <Text style={styles.gridLabel}>الزكاة</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.gridItem, { borderColor: 'rgba(16, 185, 129, 0.3)' }]} 
        onPress={() => onNavigate('المسبحة')}
      >
        <View style={[styles.gridIconBox, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
          <MaterialCommunityIcons name="necklace" color="#10b981" size={26} />
        </View>
        <Text style={styles.gridLabel}>المسبحة</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.gridItem, { borderColor: 'rgba(212, 175, 55, 0.3)' }]} 
        onPress={() => onNavigate('الأدعية')}
      >
        <View style={[styles.gridIconBox, { backgroundColor: 'rgba(212, 175, 55, 0.1)' }]}>
          <FontAwesome5 name="praying-hands" color="#d4af37" size={22} />
        </View>
        <Text style={styles.gridLabel}>الأدعية</Text>
      </TouchableOpacity>
    </View>
  </View>
);

// ── Daily Verse Carousel ──
export const DailyVerseCarousel = () => (
  <View style={styles.verseSection}>
    <Text style={styles.sectionTitle}>آية وتأمل</Text>
    <FlatList
      horizontal
      pagingEnabled
      showsHorizontalScrollIndicator={false}
      data={DAILY_VERSES}
      keyExtractor={(_, i) => String(i)}
      renderItem={({ item }) => (
        <LinearGradient colors={['#1a140f', '#15110d']} style={styles.verseCard}>
          <View style={styles.verseBadge}>
            <Text style={styles.verseBadgeText}>{item.tag}</Text>
          </View>
          <Text style={styles.verseText}>{item.text}</Text>
          <Text style={styles.verseRef}>{item.ref}</Text>
        </LinearGradient>
      )}
      contentContainerStyle={styles.verseCarouselContent}
    />
  </View>
);

// ── Athkar Quick Section ──
export const AthkarQuickSection = ({ onNavigate }: any) => (
  <View style={styles.athkarSection}>
    <Text style={[styles.sectionTitle, { paddingHorizontal: 0 }]}>أذكار اليوم</Text>
    <View style={styles.athkarRow}>
      <TouchableOpacity style={styles.athkarCard} onPress={() => onNavigate('الأذكار', { type: 'morning' })}>
        <View style={[styles.athkarIcon, { backgroundColor: 'rgba(245, 158, 11, 0.1)' }]}>
          <Sun color="#F59E0B" size={20} />
        </View>
        <Text style={styles.athkarTitle}>الصباح</Text>
        <Text style={styles.athkarSub}>بركة اليوم</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.athkarCard} onPress={() => onNavigate('الأذكار', { type: 'evening' })}>
        <View style={[styles.athkarIcon, { backgroundColor: 'rgba(37, 99, 235, 0.1)' }]}>
          <Moon color="#2563EB" size={20} />
        </View>
        <Text style={styles.athkarTitle}>المساء</Text>
        <Text style={styles.athkarSub}>حفظ وأمان</Text>
      </TouchableOpacity>
    </View>
  </View>
);

// Legacy export for StreakDashboard (unused but keeping for compatibility)
export const StreakDashboard = ({ streak, accentTheme }: any) => null;
