import React from 'react';
import { View } from 'react-native';
import { MapPin } from 'lucide-react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { usePrayerTimes } from '../hooks/usePrayerTimes';
import { Screen, ScreenHeader, ErrorState, EmptyState, Skeleton } from '../components/ui';
import { PrayerCountdown, PrayerTimeRow, PrayerListSkeleton } from '../components/prayer/PrayerTimesComponents';
import { s } from '../components/prayer/PrayerTimesStyles';
import { space } from '../../shared/theme/tokens';

const HIDDEN = ['Imsak', 'Sunset', 'Midnight', 'Firstthird', 'Lastthird'];

/** Standalone (stack) or embedded in PrayerHub with `hideHeader` + `tab`. */
const PrayerTimesScreen = ({ navigation, hideHeader, tab }: any) => {
  const { timings, date, nextPrayer, loading, error, hasLocation, retry } = usePrayerTimes();
  const notificationsEnabled = useSelector((st: RootState) => st.settings.notificationsEnabled);
  const prayersPref = useSelector((st: RootState) => (st.settings.notificationPrefs as any)?.prayers ?? true);
  const notify = !!notificationsEnabled && !!prayersPref;

  let body: React.ReactNode;
  if (!hasLocation && !loading) {
    body = <EmptyState icon={MapPin} title="حدّد موقعك" message="نحتاج الموقع لحساب مواقيت الصلاة في مدينتك" action={{ label: 'تفعيل الموقع', onPress: retry }} />;
  } else if (error) {
    body = <ErrorState message="تعذّر تحميل مواقيت الصلاة. تأكد من الاتصال بالإنترنت." onRetry={retry} />;
  } else if (loading || !timings) {
    body = (
      <>
        <Skeleton height={180} radius={20} />
        <View style={{ height: space[4] }} />
        <PrayerListSkeleton />
      </>
    );
  } else {
    body = (
      <>
        <PrayerCountdown nextPrayer={nextPrayer as any} date={date} />
        <View style={s.list}>
          {Object.entries(timings)
            .filter(([k]) => !HIDDEN.includes(k))
            .map(([name, time]) => (
              <PrayerTimeRow key={name} name={name} time={time as string} isActive={nextPrayer?.name === name} notify={notify} />
            ))}
        </View>
      </>
    );
  }

  return (
    <Screen
      scroll
      tab={tab}
      edges={hideHeader ? [] : ['top']}
      header={!hideHeader ? <ScreenHeader title="مواقيت الصلاة" onBack={() => navigation.goBack()} /> : undefined}
    >
      {body}
    </Screen>
  );
};

export default PrayerTimesScreen;
