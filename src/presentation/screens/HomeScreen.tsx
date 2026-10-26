import { PlainRoute, ScreenProps } from '../navigation/types';
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { syncIbadaDailyReset } from '../store/slices/ibadaSlice';
import { RootState } from '../store';
import { usePrayerTimes } from '../hooks/usePrayerTimes';
import { useAccent } from '../../shared/theme/useAccent';
import { space } from '../../shared/theme/tokens';

import { Screen, SectionTitle } from '../components/ui';
import { HomeHeader } from '../components/home/HomeHeader';
import { NextPrayerHero } from '../components/home/NextPrayerHero';
import { ProgressRow } from '../components/home/ProgressRow';
import { HomeGrid, DailyVerseCard } from '../components/home/HomeSections';
import { DailyReportModal } from '../components/home/DailyReportModal';

const todayKey = () => new Date().toISOString().split('T')[0];

const HomeScreen = ({ navigation }: Pick<ScreenProps, 'navigation'>) => {
  const dispatch = useDispatch();
  const accent = useAccent();
  const [reportVisible, setReportVisible] = useState(false);

  const { tasks } = useSelector((state: RootState) => state.ibada);
  const { dailyRecords } = useSelector((state: RootState) => state.stats);

  useEffect(() => { dispatch(syncIbadaDailyReset()); }, [dispatch]);

  const { date: apiDate, nextPrayer, loading, error, hasLocation, retry } = usePrayerTimes();
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

  return (
    <Screen scroll tab>
      <HomeHeader
        dynamicContent={getDynamicContent()}
        hijriDateStr={hijriDateStr}
        onSettingsPress={() => navigateTo('الإعدادات')}
        onStatsPress={() => navigateTo('الإحصائيات')}
      />

      <NextPrayerHero
        nextPrayer={nextPrayer}
        loading={loading}
        error={error}
        hasLocation={hasLocation}
        onRetry={retry}
        onPress={() => navigateTo('TabPrayer')}
        onLocate={retry}
      />

      <SectionTitle title="يومك" action={{ label: 'التقرير اليومي', onPress: () => setReportVisible(true) }} />
      <ProgressRow onNavigate={navigateTo} />

      <HomeGrid onNavigate={navigateTo} />

      <DailyVerseCard />
      <View style={{ height: space[4] }} />

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
