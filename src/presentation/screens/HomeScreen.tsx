import { PlainRoute, ScreenProps } from '../navigation/types';
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { syncIbadaDailyReset } from '../store/slices/ibadaSlice';
import { RootState } from '../store';
import { usePrayerTimes } from '../hooks/usePrayerTimes';
import { useAccent } from '../../shared/theme/useAccent';
import { space } from '../../shared/theme/tokens';

import { Screen } from '../components/ui';
import { SkyButton, SkyHero } from '../components/home/SkyHero';
import { Activity, Settings } from 'lucide-react-native';
import { ContinueCard, DayStats } from '../components/home/DayCards';
import { HomeGrid } from '../components/home/HomeSections';
import { MORNING_ATHKAR, EVENING_ATHKAR } from '../../shared/constants/athkar';
import { SURAH_START_PAGE } from '../../domain/entities/surahPages';
import { SURAH_NAMES } from '../../shared/constants/surahs';
import { DailyMessageCard } from '../components/home/DailyMessageCard';
import { DailyReportModal } from '../components/home/DailyReportModal';

const todayKey = () => new Date().toISOString().split('T')[0];

const PRAYER_TASKS: Record<string, string> = { fajr: 'Fajr', dhuhr: 'Dhuhr', asr: 'Asr', maghrib: 'Maghrib', isha: 'Isha' };
const ATHKAR_TEXTS = new Set([...MORNING_ATHKAR, ...EVENING_ATHKAR].map((a) => a.text));
const WEEKDAYS = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

/** Surah the given mushaf page belongs to (the last surah starting on or before it). */
const surahOfPage = (page: number) => {
  let i = 0;
  while (i + 1 < SURAH_START_PAGE.length && SURAH_START_PAGE[i + 1] <= page) i++;
  return SURAH_NAMES[i];
};

const HomeScreen = ({ navigation }: Pick<ScreenProps, 'navigation'>) => {
  const dispatch = useDispatch();
  const accent = useAccent();
  const [reportVisible, setReportVisible] = useState(false);

  const { tasks } = useSelector((state: RootState) => state.ibada);
  const { dailyRecords } = useSelector((state: RootState) => state.stats);
  const currentPage = useSelector((state: RootState) => state.quran.currentPage ?? 1);
  const athkarCounts = useSelector((state: RootState) => state.athkar.completionCounts ?? {});

  useEffect(() => { dispatch(syncIbadaDailyReset()); }, [dispatch]);

  const { date: apiDate, timings, nextPrayer, loading } = usePrayerTimes();
  const hijri = apiDate?.hijri;
  const hijriDateStr = hijri ? `${hijri.day} ${hijri.month.ar} ${hijri.year}` : '';

  const getDynamicContent = () => {
    if (!hijri) return { title: 'أوّاب', sub: 'تقبل الله منا ومنكم صالح الأعمال', isHoliday: false };
    const day = parseInt(String(hijri.day));
    const month = parseInt(String(hijri.month.number));
    const dayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    if (month === 9) return { title: 'رمضان كريم', sub: 'شهر القرآن والتقوى', isHoliday: true, holidayName: 'رمضان' };
    if (month === 10 && day <= 3) return { title: 'عيد فطر مبارك', sub: 'كل عام وأنتم بخير', isHoliday: true, holidayName: 'عيد الفطر' };
    if (month === 12 && day >= 10 && day <= 13) return { title: 'عيد أضحى مبارك', sub: 'أعاده الله علينا باليمن والبركات', isHoliday: true, holidayName: 'عيد الأضحى' };
    if (dayName === 'Friday') return { title: 'جمعة مباركة', sub: 'نور ما بين الجمعتين', isHoliday: false };
    const hour = new Date().getHours();
    if (hour < 12) return { title: 'صباح الخير', sub: 'يوم مليء بالبركة والعمل الصالح', isHoliday: false };
    return { title: 'مساء الخير', sub: 'تقبل الله طاعاتكم في هذا المساء', isHoliday: false };
  };

  const navigateTo = (route: PlainRoute) => navigation.navigate(route);
  const today = dailyRecords[todayKey()];
  // the day's tasbih from the sebha and the floating bead; athkar taps are logged by their text and left out
  const tasbeehCount = Object.entries(today?.dhikrDetails ?? {}).reduce((sum, [name, n]) => (ATHKAR_TEXTS.has(name) ? sum : sum + n), 0);

  const greeting = getDynamicContent();
  const dateLine = [WEEKDAYS[new Date().getDay()], hijriDateStr].filter(Boolean).join(' · ');
  const donePrayers = new Set(tasks.filter((t) => PRAYER_TASKS[t.id] && t.isCompleted).map((t) => PRAYER_TASKS[t.id]));

  // morning athkar until mid-afternoon, evening after
  const evening = new Date().getHours() >= 15;
  const athkarList = evening ? EVENING_ATHKAR : MORNING_ATHKAR;
  const athkarDone = athkarList.filter((a) => (athkarCounts[a.id] ?? 0) >= a.count).length;

  return (
    <Screen scroll tab padded={false} edges={[]}>
      <SkyHero
        greeting={greeting.title}
        dateLine={dateLine}
        timings={timings}
        next={nextPrayer}
        donePrayers={donePrayers}
        loading={loading}
        onPressPrayer={() => navigateTo('TabPrayer')}
        actions={
          <>
            <SkyButton onPress={() => navigateTo('الإحصائيات')} label="الإحصائيات"><Activity size={19} color="#fff" /></SkyButton>
            <SkyButton onPress={() => navigateTo('الإعدادات')} label="الإعدادات"><Settings size={19} color="#fff" /></SkyButton>
          </>
        }
      />

      <View style={{ paddingHorizontal: 20, marginTop: -space[4] }}>
      <ContinueCard surahName={`سورة ${surahOfPage(currentPage)}`} page={currentPage} onPress={() => navigateTo('TabQuran')} />
      <DayStats
        items={[
          { key: 'athkar', label: evening ? 'أذكار المساء' : 'أذكار الصباح', value: athkarDone, total: athkarList.length, onPress: () => navigateTo('TabAthkar') },
          { key: 'tasbeeh', label: 'المسبحة اليوم', value: tasbeehCount, onPress: () => navigateTo('TabTasbeeh') },
          { key: 'prayers', label: 'الصلوات', value: donePrayers.size, total: 5, onPress: () => navigateTo('العبادات') },
        ]}
      />

      <HomeGrid onNavigate={navigateTo} onReport={() => setReportVisible(true)} />

      <DailyMessageCard
        onOpenMessage={(mood) => navigation.navigate('رسائل_القرآن', { mood })}
        onOpenHadith={(id) => navigation.navigate('الحديث', { id })}
      />
      <View style={{ height: space[4] }} />
      </View>

      <DailyReportModal
        visible={reportVisible}
        onClose={() => setReportVisible(false)}
        tasks={tasks}
        stats={{
          dhikrCount: today?.dhikrCount || 0,
          dhikrDetails: today?.dhikrDetails || {},
          quranPages: today?.quranPages?.length || 0,
        }}
        accentColor={accent.accent}
      />
    </Screen>
  );
};

export default HomeScreen;
