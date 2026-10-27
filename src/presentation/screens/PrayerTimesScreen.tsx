import { EmbeddableScreenProps } from '../navigation/types';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Check, ChevronRight, MapPin } from 'lucide-react-native';
import { useDispatch, useSelector } from 'react-redux';
import * as Haptics from 'expo-haptics';
import { RootState } from '../store';
import { toggleTask } from '../store/slices/ibadaSlice';
import { usePrayerTimes } from '../hooks/usePrayerTimes';
import { Screen, ErrorState, EmptyState, Skeleton } from '../components/ui';
import { SkyButton, SkyHero } from '../components/home/SkyHero';
import { AsrIcon, DhuhrIcon, FajrIcon, IconComponent, IshaIcon, KaabaIcon, MaghribIcon } from '../components/icons/IslamicIcons';
import { toAr } from '../../shared/utils/format';
import { colors, radius, space, type } from '../../shared/theme/tokens';

const PRAYERS: { key: string; task: string; ar: string; Icon: IconComponent }[] = [
  { key: 'Fajr', task: 'fajr', ar: 'الفجر', Icon: FajrIcon },
  { key: 'Dhuhr', task: 'dhuhr', ar: 'الظهر', Icon: DhuhrIcon },
  { key: 'Asr', task: 'asr', ar: 'العصر', Icon: AsrIcon },
  { key: 'Maghrib', task: 'maghrib', ar: 'المغرب', Icon: MaghribIcon },
  { key: 'Isha', task: 'isha', ar: 'العشاء', Icon: IshaIcon },
];

// aladhan.com method ids → the authority's Arabic name
const METHODS: Record<number, string> = {
  1: 'جامعة العلوم الإسلامية بكراتشي', 2: 'الجمعية الإسلامية لأمريكا الشمالية', 3: 'رابطة العالم الإسلامي',
  4: 'جامعة أم القرى', 5: 'الهيئة المصرية العامة للمساحة', 8: 'منطقة الخليج', 9: 'الكويت', 10: 'قطر',
  12: 'اتحاد المنظمات الإسلامية بفرنسا', 13: 'رئاسة الشؤون الدينية التركية', 16: 'دبي', 19: 'الجزائر', 21: 'المغرب', 23: 'الأردن',
};

const WEEKDAYS = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

/**
 * Prayer times under the same living sky as home: times on the sun's arc, then today's
 * five prayers, each one checked off here (shared with the worship tasks and the home arc).
 */
const PrayerTimesScreen = ({ navigation, tab, onOpenQibla }: EmbeddableScreenProps & { onOpenQibla?: () => void }) => {
  const dispatch = useDispatch();
  const { timings, date, nextPrayer, loading, error, hasLocation, retry } = usePrayerTimes();
  const tasks = useSelector((s: RootState) => s.ibada.tasks);
  const meta = useSelector((s: RootState) => s.prayer.cachedData?.meta);
  const done = new Set(tasks.filter((t) => t.isCompleted).map((t) => t.id));
  const donePrayers = new Set(PRAYERS.filter((p) => done.has(p.task)).map((p) => p.key));

  const hijri = date?.hijri;
  const dateLine = [WEEKDAYS[new Date().getDay()], hijri ? `${hijri.day} ${hijri.month.ar} ${hijri.year}` : ''].filter(Boolean).join(' · ');
  const method = meta?.method?.id != null ? METHODS[meta.method.id] : undefined;
  const school = meta?.school === 'HANAFI' ? 'الحنفي' : meta?.school === 'STANDARD' ? 'الجمهور' : undefined;

  const toggle = (task: string) => {
    Haptics.selectionAsync();
    dispatch(toggleTask(task));
  };

  let body: React.ReactNode;
  if (!timings && !hasLocation && !loading) {
    body = <EmptyState icon={MapPin} title="حدّد موقعك" message="نحتاج الموقع لحساب مواقيت الصلاة في مدينتك" action={{ label: 'تفعيل الموقع', onPress: retry }} />;
  } else if (!timings && error) {
    body = <ErrorState message="تعذّر تحميل مواقيت الصلاة. تأكد من الاتصال بالإنترنت." onRetry={retry} />;
  } else if (!timings) {
    body = <View style={{ gap: space[2] }}>{PRAYERS.map((p) => <Skeleton key={p.key} height={60} radius={16} />)}</View>;
  } else {
    body = (
      <>
        <View style={st.listHead}>
          <Text style={st.listTitle}>صلوات اليوم</Text>
          <Text style={st.listSub}>{toAr(donePrayers.size)} من ٥ · اضغط ✓ لما تصلّي</Text>
        </View>
        {PRAYERS.map(({ key, task, ar, Icon }) => {
          const isNext = nextPrayer?.name === key;
          const checked = done.has(task);
          return (
            <TouchableOpacity
              key={key}
              activeOpacity={0.8}
              onPress={() => toggle(task)}
              style={[st.row, isNext && st.rowNext]}
              accessibilityRole="checkbox"
              accessibilityState={{ checked }}
              accessibilityLabel={`${ar} ${timings[key as keyof typeof timings] ?? ''}`}
            >
              <View style={[st.icon, isNext && st.iconNext]}>
                <Icon size={22} color={isNext ? colors.gold : colors.textMuted} />
              </View>
              <Text style={[st.name, isNext && st.nameNext]}>
                {ar}{isNext ? <Text style={st.nextTag}> · القادمة</Text> : null}
              </Text>
              <Text style={[st.time, isNext && st.timeNext]}>{toAr(String(timings[key as keyof typeof timings] ?? '').slice(0, 5))}</Text>
              <View style={[st.check, checked && st.checkOn]}>{checked ? <Check size={14} color="#fff" strokeWidth={3} /> : null}</View>
            </TouchableOpacity>
          );
        })}
        <Text style={st.footnote}>
          الشروق {toAr(String(timings.Sunrise ?? '').slice(0, 5))}
          {method ? ` · الحساب: ${method}` : ''}
          {school ? ` · العصر: ${school}` : ''}
        </Text>
      </>
    );
  }

  return (
    <Screen scroll tab={tab} padded={false} edges={[]}>
      <SkyHero
        greeting="مواقيت الصلاة"
        dateLine={dateLine}
        timings={timings}
        next={nextPrayer}
        donePrayers={donePrayers}
        loading={loading}
        showTimes
        actions={
          onOpenQibla ? (
            <SkyButton onPress={onOpenQibla} label="القبلة"><KaabaIcon size={20} color="#fff" /></SkyButton>
          ) : navigation ? (
            <SkyButton onPress={() => navigation.goBack()} label="رجوع"><ChevronRight size={20} color="#fff" /></SkyButton>
          ) : null
        }
      />
      <View style={st.body}>{body}</View>
    </Screen>
  );
};

const st = StyleSheet.create({
  body: { paddingHorizontal: 20, marginTop: -space[3] },
  listHead: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: space[2] },
  listTitle: { ...type.h2, color: colors.text },
  listSub: { ...type.caption, color: colors.textMuted },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: space[3], marginBottom: space[2],
    backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: radius.card, paddingHorizontal: space[3], paddingVertical: space[3],
  },
  rowNext: { backgroundColor: colors.surfaceRaised, borderColor: colors.goldLine },
  icon: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center' },
  iconNext: { backgroundColor: colors.goldSoft },
  name: { ...type.bodyMedium, color: colors.textSoft, flex: 1 },
  nameNext: { fontFamily: 'Tajawal_700Bold', color: colors.text },
  nextTag: { ...type.caption, color: colors.gold },
  time: { fontFamily: 'Tajawal_700Bold', fontSize: 18, color: colors.text, fontVariant: ['tabular-nums'] },
  timeNext: { color: colors.goldText },
  check: { width: 26, height: 26, borderRadius: 13, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.3)', alignItems: 'center', justifyContent: 'center' },
  checkOn: { backgroundColor: colors.success, borderColor: colors.success },
  footnote: { ...type.caption, color: colors.textFaint, textAlign: 'center', marginTop: space[3], lineHeight: 18 },
});

export default PrayerTimesScreen;
