import React from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { Activity, Sun, Moon, ChevronLeft, BookOpen, Clock, Compass, HandHeart, CircleDot, Wallet } from 'lucide-react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { THEME } from '../../../shared/theme/constants';
import { styles } from './HomeStyles';
import { DAILY_VERSES } from './HomeConstants';

// Next Prayer Card
export const NextPrayerCard = ({ nextPrayer, accentTheme }: any) => (
  <View style={styles.nextPrayerRow}>
    <LinearGradient colors={['#1a140f', '#0c0805']} style={styles.nextPrayerCard}>
      <View style={styles.nextPrayerHeader}>
        <Text style={styles.nextPrayerTitle}>الصلاة القادمة</Text>
        <Clock color={(THEME.colors as any)[accentTheme] || THEME.colors.primary} size={20} />
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 10 }}>
        <Text style={styles.nextPrayerTime}>{nextPrayer?.time}</Text>
        <Text style={styles.nextPrayerCountdown}>{nextPrayer?.name} • متبقي {nextPrayer?.countdown}</Text>
      </View>
    </LinearGradient>
  </View>
);

// Heart Journey Card (Refined)
export const HeartJourneyCard = ({ completedSurahsCount, onPress }: any) => (
  <View style={styles.heartCTARow}>
    <TouchableOpacity activeOpacity={0.9} style={styles.heartCTA} onPress={onPress}>
      <LinearGradient colors={['#8B0000', '#451a03']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.heartGradient}>
        <View style={styles.heartCTALeft}>
          <Text style={styles.heartCTATitle}>نور القلب (متابعة الختمة)</Text>
          <Text style={styles.heartCTASub}>أتممت {completedSurahsCount} من ١١٤ سورة بنجاح</Text>
        </View>
        <View style={styles.heartIconCircle}>
           <Activity color="#fcd34d" size={24} />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  </View>
);

// Streak Dashboard
export const StreakDashboard = ({ streak, accentTheme }: any) => (
  <View style={styles.streakContainer}>
    <LinearGradient colors={['#1e293b', '#0c0805']} style={styles.streakCard}>
      <View style={styles.streakLeft}>
         <Text style={styles.streakValue}>{streak}</Text>
         <Text style={styles.streakLabel}>أيام متتالية</Text>
      </View>
      <Activity color={(THEME.colors as any)[accentTheme] || THEME.colors.primary} size={24} />
      <View style={styles.streakRight}>
         <Text style={styles.streakTitle}>بناء العادة الإيمانية</Text>
         <Text style={styles.streakSub}>استمر في التقدم كل يوم</Text>
      </View>
    </LinearGradient>
  </View>
);

// Ibada Progress
export const IbadaProgressCard = ({ completedIbadaCount, totalIbadaCount, ibadaProgress, accentTheme, onPress, onReportPress }: any) => (
  <View style={styles.ibadaProgressRow}>
    <TouchableOpacity activeOpacity={0.9} style={styles.ibadaCard} onPress={onPress}>
      <LinearGradient colors={['#1e293b', '#0c0805']} style={styles.ibadaGradient}>
        <View style={styles.ibadaHeader}>
           <View>
              <Text style={styles.ibadaTitle}>حصاد اليوم التعبدي</Text>
              <Text style={styles.ibadaSub}>{completedIbadaCount} من {totalIbadaCount} مهام مكتملة</Text>
           </View>
           <Activity color={(THEME.colors as any)[accentTheme] || THEME.colors.primary} size={28} />
        </View>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${ibadaProgress * 100}%`, backgroundColor: (THEME.colors as any)[accentTheme] || THEME.colors.primary }]} />
        </View>
        
        {/* New Report Button */}
        <TouchableOpacity 
          style={styles.reportBtn} 
          onPress={(e) => {
            e.stopPropagation();
            onReportPress();
          }}
        >
          <Text style={[styles.reportBtnText, { color: (THEME.colors as any)[accentTheme] || THEME.colors.primary }]}>عرض التقرير اليومي التفصيلي</Text>
          <ChevronLeft color={(THEME.colors as any)[accentTheme] || THEME.colors.primary} size={16} />
        </TouchableOpacity>
      </LinearGradient>
    </TouchableOpacity>
  </View>
);

// Daily Verse Carousel
export const DailyVerseCarousel = () => (
  <View style={styles.carouselSection}>
    <Text style={[styles.sectionTitle, { paddingHorizontal: 20 }]}>آية وتأمل</Text>
    <FlatList
      horizontal
      pagingEnabled
      showsHorizontalScrollIndicator={false}
      data={DAILY_VERSES}
      keyExtractor={(_, i) => String(i)}
      renderItem={({ item }) => (
        <LinearGradient colors={['#1a140f', '#2b1f15']} style={styles.dailyVerse}>
          <View style={styles.verseBadge}>
            <Text style={styles.verseBadgeText}>{item.tag}</Text>
          </View>
          <Text style={styles.verseText}>{item.text}</Text>
          <Text style={styles.verseRef}>{item.ref}</Text>
        </LinearGradient>
      )}
      contentContainerStyle={styles.carouselContainer}
    />
  </View>
);

// Home Grid
export const HomeGrid = ({ onNavigate }: any) => (
  <View style={styles.grid}>
    <TouchableOpacity style={[styles.gridItem, { borderColor: '#B8860B' }]} onPress={() => onNavigate('القرآن', { screen: 'القرآن' })}>
      <View style={[styles.iconBox, { backgroundColor: 'rgba(184, 134, 11, 0.1)' }]}><FontAwesome5 name="quran" color="#B8860B" size={24} /></View>
      <Text style={styles.itemLabel}>المصحف</Text>
    </TouchableOpacity>

    <TouchableOpacity style={[styles.gridItem, { borderColor: '#10B981' }]} onPress={() => onNavigate('الصلاة', { screen: 'الصلاة' })}>
      <View style={[styles.iconBox, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}><FontAwesome5 name="mosque" color="#10B981" size={20} /></View>
      <Text style={styles.itemLabel}>المواقيت</Text>
    </TouchableOpacity>

    <TouchableOpacity style={[styles.gridItem, { borderColor: '#EC4899' }]} onPress={() => onNavigate('الذكر', { screen: 'duas' })}>
      <View style={[styles.iconBox, { backgroundColor: 'rgba(236, 72, 153, 0.1)' }]}><FontAwesome5 name="praying-hands" color="#EC4899" size={22} /></View>
      <Text style={styles.itemLabel}>الأدعية</Text>
    </TouchableOpacity>

    <TouchableOpacity style={[styles.gridItem, { borderColor: '#6366F1' }]} onPress={() => onNavigate('الذكر', { screen: 'tasbeeh' })}>
      <View style={[styles.iconBox, { backgroundColor: 'rgba(99, 102, 241, 0.1)' }]}><FontAwesome5 name="braille" color="#6366F1" size={24} /></View>
      <Text style={styles.itemLabel}>المسبحة</Text>
    </TouchableOpacity>

    <TouchableOpacity style={[styles.gridItem, { borderColor: '#3B82F6' }]} onPress={() => onNavigate('القبلة')}>
      <View style={[styles.iconBox, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}><FontAwesome5 name="kaaba" color="#3B82F6" size={24} /></View>
      <Text style={styles.itemLabel}>القبلة</Text>
    </TouchableOpacity>

    <TouchableOpacity style={[styles.gridItem, { borderColor: '#7E22CE' }]} onPress={() => onNavigate('الزكاة')}>
      <View style={[styles.iconBox, { backgroundColor: 'rgba(126, 34, 206, 0.1)' }]}><FontAwesome5 name="hand-holding-usd" color="#7E22CE" size={24} /></View>
      <Text style={styles.itemLabel}>الزكاة</Text>
    </TouchableOpacity>
  </View>
);

// Athkar Section
export const AthkarQuickSection = ({ onNavigate }: any) => (
  <View style={styles.athkarSection}>
    <Text style={styles.sectionTitle}>أذكار اليوم</Text>
    <View style={styles.athkarRow}>
      <TouchableOpacity style={styles.athkarCardSmall} onPress={() => onNavigate('الذكر', { screen: 'athkar', type: 'morning' })}>
        <View style={[styles.athkarIconSmall, { backgroundColor: '#FFEDD5' }]}><Sun color="#F59E0B" size={20} /></View>
        <Text style={styles.athkarTitleSmall}>الصباح</Text>
        <Text style={styles.athkarSubSmall}>بركة اليوم</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.athkarCardSmall} onPress={() => onNavigate('الذكر', { screen: 'athkar', type: 'evening' })}>
        <View style={[styles.athkarIconSmall, { backgroundColor: '#DBEAFE' }]}><Moon color="#2563EB" size={20} /></View>
        <Text style={styles.athkarTitleSmall}>المساء</Text>
        <Text style={styles.athkarSubSmall}>حفظ وأمان</Text>
      </TouchableOpacity>
    </View>
  </View>
);
