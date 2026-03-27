import React, { useEffect } from 'react';
import { ScrollView, View, I18nManager } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { syncIbadaDailyReset } from '../store/slices/ibadaSlice';
import { RootState } from '../store';
import { usePrayerTimes } from '../hooks/usePrayerTimes';

// Home Components & Constants
import { HomeHeader } from '../components/home/HomeHeader';
import { 
  HeartJourneyCard, IbadaProgressCard, NextPrayerCard,
  DailyVerseCarousel, HomeGrid, AthkarQuickSection 
} from '../components/home/HomeSections';
import { DailyReportModal } from '../components/home/DailyReportModal';
import { styles } from '../components/home/HomeStyles';
import { TOTAL_SURAHS } from '../components/home/HomeConstants';
import { THEME } from '../../shared/theme/constants';

const HomeScreen = ({ navigation }: any) => {
  const dispatch = useDispatch();
  const [reportVisible, setReportVisible] = React.useState(false);
  
  const { streak, badges } = useSelector((state: RootState) => state.achievements);
  const { accentTheme } = useSelector((state: RootState) => state.settings);
  const accentColor = (THEME.colors as any)[accentTheme] || THEME.colors.primary;
  
  const { tasks } = useSelector((state: RootState) => state.ibada);
  const { dailyRecords } = useSelector((state: RootState) => state.stats);

  useEffect(() => {
    dispatch(syncIbadaDailyReset());
  }, [dispatch]);
  
  const { date: apiDate, timings } = usePrayerTimes();
  const hijri = apiDate?.hijri;

  const getNextPrayer = () => {
    if (!timings) return null;
    const now = new Date();
    const prayerNamesAr: any = { Fajr: 'الفجر', Dhuhr: 'الظهر', Asr: 'العصر', Maghrib: 'المغرب', Isha: 'العشاء' };
    const order = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
    
    for (const name of order) {
      const [h, m] = ((timings as any)[name] || '00:00').split(':').map(Number);
      const prayerTime = new Date();
      prayerTime.setHours(h, m, 0);
      
      if (prayerTime > now) {
        const diff = Math.floor((prayerTime.getTime() - now.getTime()) / (1000 * 60));
        const hours = Math.floor(diff / 60);
        const mins = diff % 60;
        return {
          name: prayerNamesAr[name],
          time: (timings as any)[name],
          countdown: hours > 0 ? `${hours}س و ${mins}د` : `${mins} دقيقة`
        };
      }
    }
    return { name: 'الفجر', time: timings.Fajr, countdown: 'غداً' };
  };

  const getDynamicContent = () => {
    if (!hijri) return { title: 'أوّاب', sub: 'تقبل الله منا ومنكم صالح الأعمال', isHoliday: false };

    const day = parseInt(String(hijri.day));
    const month = parseInt(String(hijri.month.number));
    const dayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });

    if (month === 9) return { title: ' • رمضان', sub: 'شهر القرآن والتقوى', isHoliday: true, holidayName: 'رمضان' };
    if (month === 10 && day <= 3) return { title: 'عيد فطر مبارك', sub: 'كل عام وأنتم بخير', isHoliday: true, holidayName: 'عيد الفطر' };
    if (month === 12 && day >= 10 && day <= 13) return { title: 'عيد أضحى مبارك', sub: 'أعاده الله علينا باليمن والبركات', isHoliday: true, holidayName: 'عيد الأضحى' };
    if (dayName === 'Friday') return { title: 'جمعة مباركة', sub: 'نور ما بين الجمعتين', isHoliday: false };

    const hour = new Date().getHours();
    if (hour < 12) return { title: 'صباح الخير', sub: 'يوم مليء بالبركة والعمل الصالح', isHoliday: false };
    return { title: 'مساء الخير', sub: 'تقبل الله طاعاتكم في هذا المساء', isHoliday: false };
  };

  const dynamicContent = getDynamicContent();
  const nextPrayer = getNextPrayer();
  const hijriDateStr = hijri ? `${hijri.day} ${hijri.month.ar} ${hijri.year}` : '';

  const completedIbadaCount = tasks.filter((t: any) => t.isCompleted).length;
  const totalIbadaCount = tasks.length;
  const ibadaProgress = completedIbadaCount / totalIbadaCount || 0;
  const completedSurahsCount = useSelector((state: RootState) => state.quran.completedSurahs?.length || 0);

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        <HomeHeader 
          dynamicContent={dynamicContent} 
          hijriDateStr={hijriDateStr} 
          accentTheme={accentTheme}
          onSettingsPress={() => navigation.navigate('الإعدادات')}
          onStatsPress={() => navigation.navigate('الإحصائيات')}
        />

        <NextPrayerCard nextPrayer={nextPrayer} accentTheme={accentTheme} />

        <IbadaProgressCard 
          completedIbadaCount={completedIbadaCount}
          totalIbadaCount={totalIbadaCount}
          ibadaProgress={ibadaProgress}
          accentTheme={accentTheme}
          onPress={() => navigation.navigate('العبادات')}
          onReportPress={() => setReportVisible(true)}
        />

        <HeartJourneyCard 
          completedSurahsCount={completedSurahsCount}
          onPress={() => navigation.navigate('نور_القلب')}
        />

        <HomeGrid onNavigate={navigation.navigate} />

        <DailyVerseCarousel />

        <View style={{ height: 40 }} />
      </ScrollView>

      <DailyReportModal 
        visible={reportVisible} 
        onClose={() => setReportVisible(false)} 
        tasks={tasks}
        stats={{
          dhikrCount: dailyRecords[new Date().toISOString().split('T')[0]]?.dhikrCount || 0,
          dhikrDetails: dailyRecords[new Date().toISOString().split('T')[0]]?.dhikrDetails || {},
          quranPages: dailyRecords[new Date().toISOString().split('T')[0]]?.quranPages?.length || 0
        }}
        accentColor={accentColor}
      />
    </SafeAreaView>
  );
};

export default HomeScreen;
