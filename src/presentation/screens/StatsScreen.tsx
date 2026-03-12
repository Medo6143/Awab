import React, { useState, useEffect } from 'react';
import { 
  View, Text, ScrollView, 
  TouchableOpacity, Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { 
  Calendar, BookOpen, Activity, 
  ChevronRight, ChevronDown, ChevronUp, Star, ArrowUpRight,
  Heart
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { RootState } from '../store';
import { THEME } from '../../shared/theme/constants';
import { IbadaTask } from '../store/slices/ibadaSlice';

// Stats Components & Styles
import { PremiumStatCard, HeroStatsCard, WeeklyActivityChart, DhikrBreakdownChart } from '../components/stats/StatsComponents';
import { DailyReportModal } from '../components/home/DailyReportModal';
import { s } from '../components/stats/StatsStyles';

const StatsScreen = ({ navigation }: any) => {
  const toAr = (n: number | string) => n.toLocaleString('ar-EG');
  const [activeTab, setActiveTab] = useState<'day' | 'month'>('day');
  const [expandedMonths, setExpandedMonths] = useState<Record<string, boolean>>({});
  const [reportVisible, setReportVisible] = useState(false);
  const [reportData, setReportData] = useState<any>(null);
  
  const { dailyRecords } = useSelector((state: RootState) => state.stats);
  const { tasks } = useSelector((state: RootState) => state.ibada);
  const { accentTheme } = useSelector((state: RootState) => state.settings);
  
  const accentColor = (THEME.colors as any)[accentTheme] || THEME.colors.primary;
  
  const todayKey = new Date().toDateString();
  const todayStats = (dailyRecords || {})[todayKey] || { prayers: [], dhikrCount: 0, quranPages: [] };

  const getRangeStats = (days: number) => {
    const dates = Object.keys(dailyRecords).sort((a, b) => new Date(b).getTime() - new Date(a).getTime()).slice(0, days);
    let prayers = 0, dhikr = 0, pages = 0;
    const allDhikrDetails: Record<string, number> = {};
    let nightPrayerCount = 0;
    
    dates.forEach(d => {
      const record = dailyRecords[d] || { prayers: [], dhikrCount: 0, quranPages: [], dhikrDetails: {} };
      prayers += (record.prayers || []).length;
      dhikr += (record.dhikrCount || 0);
      pages += (record.quranPages || []).length;
      
      if ((record.prayers || []).includes('qiyam_al_layl') || (record.prayers || []).includes('qiyan_al_layl')) {
        nightPrayerCount++;
      }

      const details = record.dhikrDetails || {};
      Object.entries(details).forEach(([name, count]) => {
        allDhikrDetails[name] = (allDhikrDetails[name] || 0) + (count as number);
      });
    });

    const topDhikr = Object.entries(allDhikrDetails)
      .sort((a, b) => b[1] - a[1])[0] || [null, 0];

    return { prayers, dhikr, pages, topDhikr, nightPrayerCount, allDhikrDetails };
  };

  const calculateStreak = () => {
    let streak = 0;
    const records = dailyRecords || {};
    const sortedDates = Object.keys(records).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    
    let checkDate = new Date();
    // If no record today, check from yesterday
    if (!records[todayKey]) {
        checkDate.setDate(checkDate.getDate() - 1);
    }

    for (const _ of sortedDates) { 
        const d = checkDate.toDateString();
        if (records[d]) {
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
        } else {
            break;
        }
    }
    return streak;
  };

  const streak = calculateStreak();
  const todayDhikrDetails = todayStats.dhikrDetails || {};
  const todayTop = Object.entries(todayDhikrDetails).sort((a,b) => (b[1] as number) - (a[1] as number))[0] || [null, 0];

  const monthStats = getRangeStats(30);

  const displayStats = activeTab === 'day' ? {
    prayers: (todayStats.prayers || []).length,
    dhikr: todayStats.dhikrCount || 0,
    pages: (todayStats.quranPages || []).length,
    label: 'اليوم',
    comparison: streak > 1 ? `مستمر لمدة ${toAr(streak)} أيام!` : 'بداية مباركة اليوم',
    topDhikr: todayTop[0] ? `${todayTop[0]} (${toAr(todayTop[1])})` : 'لا يوجد ذكر مسجل',
    qiyam: ((todayStats.prayers || []).includes('qiyam_al_layl') || (todayStats.prayers || []).includes('qiyan_al_layl')) ? 'نور في سجل اليوم' : 'فرصة للقيام الليلة'
  } : {
    prayers: monthStats.prayers,
    dhikr: monthStats.dhikr,
    pages: monthStats.pages,
    label: 'أخر ٣٠ يوم',
    comparison: `التزام بنسبة ${toAr(Math.round((monthStats.prayers / 150) * 100))}%`,
    topDhikr: monthStats.topDhikr[0] ? `${monthStats.topDhikr[0]} (${toAr(monthStats.topDhikr[1])})` : 'لا يوجد ذكر مسجل',
    qiyam: `تمت المحافظة ${toAr(monthStats.nightPrayerCount)} ليلة`
  };

  const monthNames = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
  
  // Group history by month (YYYY-MM)
  const groupedHistory = Object.keys(dailyRecords)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
    .reduce((acc, dateStr) => {
        // e.g., "Mon Mar 12 2026" or "2026-03-12"
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return acc; // Skip invalid
        const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        if (!acc[monthKey]) acc[monthKey] = [];
        acc[monthKey].push(dateStr);
        return acc;
    }, {} as Record<string, string[]>);

  // Default expand the current month
  useEffect(() => {
    const d = new Date();
    const currentMonthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    setExpandedMonths({ [currentMonthKey]: true });
  }, []);

  const toggleMonth = (mKey: string) => {
    setExpandedMonths(prev => ({ ...prev, [mKey]: !prev[mKey] }));
  };

  const chartData = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const k = d.toDateString(); // Or handle legacy keys if needed
    
    // Check if we have standard keys or toDateString keys
    const val = (dailyRecords || {})[k]?.dhikrCount || (dailyRecords || {})[d.toISOString().split('T')[0]]?.dhikrCount || 0;
    return val;
  });

  const handleShowReport = (type: 'day' | 'month', dateKey?: string) => {
    let statsData: any = {};
    let periodDisplayName = '';
    let reportTasks: IbadaTask[] = [];

    if (type === 'day') {
      const targetDate = dateKey || todayKey;
      const record = dailyRecords[targetDate] || { prayers: [], dhikrCount: 0, quranPages: [], dhikrDetails: {} };
      statsData = {
        dhikrCount: record.dhikrCount,
        dhikrDetails: record.dhikrDetails,
        quranPages: record.quranPages.length
      };
      // Format targetDate nicely in Arabic
      try {
        periodDisplayName = new Date(targetDate).toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long' });
      } catch (e) {
        periodDisplayName = targetDate;
      }
      reportTasks = tasks.map(t => ({ ...t, isCompleted: record.prayers.includes(t.id) }));
    } else {
      const mStats = getRangeStats(30);
      statsData = {
        dhikrCount: mStats.dhikr,
        dhikrDetails: mStats.allDhikrDetails,
        quranPages: mStats.pages
      };
      periodDisplayName = `آخر ٣٠ يوم (${monthNames[new Date().getMonth()]})`;
      reportTasks = [];
    }

    setReportData({ type, stats: statsData, name: periodDisplayName, tasks: reportTasks });
    setReportVisible(true);
  };

  const maxDhikr = Math.max(...chartData, 100);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0c0805' }}>
      <LinearGradient colors={['#0c0805', '#1a120b']} style={s.root} />
      
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.glassBtn}>
          <ChevronRight color={accentColor} size={24} />
        </TouchableOpacity>
        <View style={{ alignItems: 'center' }}>
           <Text style={s.headerTitle}>بوابة الإحصائيات</Text>
           <Text style={s.headerSub}>تتبع رحلتك الروحانية</Text>
        </View>
        <View style={{ width: 44 }} />
      </View>

      {/* Tabs */}
      <View style={s.tabContainer}>
        {(['day', 'month'] as const).map(t => (
          <TouchableOpacity 
            key={t}
            style={[s.tab, activeTab === t && { backgroundColor: accentColor, borderColor: accentColor }]}
            onPress={() => setActiveTab(t)}
          >
            <Text style={[s.tabText, activeTab === t && { color: '#000' }]}>
              {t === 'day' ? 'اليوم' : 'إحصائيات الشهر'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scrollContent}>
        <View style={s.mainStatsRow}>
           <PremiumStatCard icon={<Activity color="#fbbf24" size={20} />} label="الصلوات والمهام" value={displayStats.prayers} percentage={activeTab === 'day' ? (displayStats.prayers / 10) * 100 : 100} color="#fbbf24" />
           <PremiumStatCard icon={<BookOpen color="#10b981" size={20} />} label="صفحات القرآن" value={displayStats.pages} percentage={75} color="#10b981" />
        </View>

        <HeroStatsCard 
          accentColor={accentColor} 
          label={`إجمالي التسبيح ${displayStats.label}`} 
          value={displayStats.dhikr} 
          comparison={displayStats.comparison} 
          onPress={() => handleShowReport(activeTab)}
        />

        <View style={s.sectionGlass}>
          <View style={s.sectionHeader}>
            <View style={[s.headerDot, { backgroundColor: '#8b5cf6' }]} />
            <Text style={s.sectionTitle}>نور الليل (قيام الليل)</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 15 }}>
            <View style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: '#8b5cf620', alignItems: 'center', justifyContent: 'center' }}>
              {(todayStats.prayers || []).includes('qiyam_al_layl') || (todayStats.prayers || []).includes('qiyan_al_layl') ? (
                <Heart color="#fcd34d" size={28} fill="#fcd34d" />
              ) : (
                <Star color="#8b5cf6" size={28} />
              )}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: 'Tajawal_700Bold', fontSize: 18, color: '#fff', marginBottom: 4 }}>قيام الليل</Text>
              <Text style={{ fontFamily: 'Tajawal_400Regular', fontSize: 14, color: '#94a3b8' }}>{displayStats.qiyam}</Text>
            </View>
          </View>
        </View>

        {/* Fasting Indicator */}
        <View style={s.sectionGlass}>
          <View style={s.sectionHeader}>
            <View style={[s.headerDot, { backgroundColor: '#10b981' }]} />
            <Text style={s.sectionTitle}>الصيام والبركة</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 15 }}>
            <View style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: '#10b98120', alignItems: 'center', justifyContent: 'center' }}>
              {(todayStats.prayers || []).includes('fasting') ? (
                <Activity color="#10b981" size={28} />
              ) : (
                <Activity color="#475569" size={28} />
              )}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: 'Tajawal_700Bold', fontSize: 18, color: '#fff', marginBottom: 4 }}>صيام اليوم</Text>
              <Text style={{ fontFamily: 'Tajawal_400Regular', fontSize: 14, color: '#94a3b8' }}>
                {(todayStats.prayers || []).includes('fasting') ? 'هنيئاً لك صيام اليوم.. تقبل الله' : 'لم يتم تسجيل صيام لليوم'}
              </Text>
            </View>
          </View>
        </View>

        <DhikrBreakdownChart details={activeTab === 'day' ? todayDhikrDetails : monthStats.allDhikrDetails} accentColor={accentColor} />

        <WeeklyActivityChart chartData={chartData} maxDhikr={maxDhikr} accentColor={accentColor} />

        {/* History / Accordion Section */}
        <View style={s.historySection}>
            <View style={s.sectionHeader}>
               <View style={[s.headerDot, { backgroundColor: '#10b981' }]} />
               <Text style={s.sectionTitle}>دفتر العبادات</Text>
            </View>
            
            {Object.keys(groupedHistory).length === 0 && (
                <View style={s.emptyState}>
                    <BookOpen color="#475569" size={30} style={{ marginBottom: 10 }}/>
                    <Text style={s.emptyStateText}>لا توجد سجلات سابقة</Text>
                </View>
            )}

            {Object.entries(groupedHistory).map(([mKey, days]) => {
                const year = mKey.split('-')[0];
                const monthIdx = parseInt(mKey.split('-')[1], 10) - 1;
                const mName = monthNames[monthIdx] || mKey;
                const isExpanded = expandedMonths[mKey];

                return (
                    <View key={mKey} style={{ marginBottom: 15 }}>
                        <TouchableOpacity style={s.navigatorGlass} onPress={() => toggleMonth(mKey)} activeOpacity={0.7}>
                            <View style={s.monthDisplay}>
                                <Calendar size={20} color={accentColor} />
                                <Text style={s.monthLabel}>{mName} {year}</Text>
                                <View style={[s.hBadge, { backgroundColor: 'rgba(255,255,255,0.05)' }]}>
                                   <Text style={[s.hBadgeText, { color: '#94a3b8' }]}>{days.length} يوم مسجل</Text>
                                </View>
                            </View>
                            {isExpanded ? <ChevronUp color="#94a3b8" size={22} /> : <ChevronDown color="#94a3b8" size={22} />}
                        </TouchableOpacity>

                        {isExpanded && days.map((date) => {
                            const dObj = new Date(date);
                            const dayNum = !isNaN(dObj.getDate()) ? dObj.getDate() : '-';
                            const weekDay = ['أحد','اثنين','ثلاثاء','أربح','خميس','جمعة','سبت'][dObj.getDay()] || '';

                            return (
                                <TouchableOpacity key={date} style={s.historyCard} onPress={() => handleShowReport('day', date)} activeOpacity={0.7}>
                                    <View style={s.historyDatePart}>
                                        <Text style={s.historyDayNum}>{dayNum}</Text>
                                        <Text style={s.historyDayShort}>{weekDay}</Text>
                                    </View>
                                    <View style={s.historyContentPart}>
                                        <View style={s.historyBadgeRow}>
                                            <View style={[s.hBadge, { backgroundColor: '#fbbf2420' }]}><Activity size={10} color="#fbbf24" /><Text style={[s.hBadgeText, { color: '#fbbf24' }]}>{(dailyRecords[date].prayers || []).length} مهام</Text></View>
                                            <View style={[s.hBadge, { backgroundColor: '#10b98120' }]}><BookOpen size={10} color="#10b981" /><Text style={[s.hBadgeText, { color: '#10b981' }]}>{(dailyRecords[date].quranPages || []).length} صفحات</Text></View>
                                            {((dailyRecords[date].prayers || []).includes('qiyam_al_layl') || (dailyRecords[date].prayers || []).includes('qiyan_al_layl')) && (
                                                <View style={[s.hBadge, { backgroundColor: '#8b5cf620' }]}><Star size={10} color="#8b5cf6" /><Text style={[s.hBadgeText, { color: '#8b5cf6' }]}>قيام</Text></View>
                                            )}
                                        </View>
                                        <Text style={s.historySummaryText}>{toAr(dailyRecords[date].dhikrCount || 0)} تسبيحة مباركة</Text>
                                    </View>
                                    <ArrowUpRight color="#475569" size={20} />
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                );
            })}
        </View>
        <View style={{ height: 100 }} />
      </ScrollView>

      {reportData && (
        <DailyReportModal 
          visible={reportVisible} 
          onClose={() => setReportVisible(false)} 
          tasks={reportData.tasks}
          stats={reportData.stats}
          accentColor={accentColor}
          periodType={reportData.type}
          periodName={reportData.name}
        />
      )}
    </SafeAreaView>
  );
};

export default StatsScreen;
