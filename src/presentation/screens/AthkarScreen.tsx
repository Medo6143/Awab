import { EmbeddableScreenProps } from '../navigation/types';
import React, { useState, useEffect } from 'react';
import { FlatList, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import * as Haptics from 'expo-haptics';
import { ChevronRight, Moon, RotateCcw, Sun } from 'lucide-react-native';
import { CrescentStarIcon } from '../components/icons/IslamicIcons';
import { RootState } from '../store';
import { incrementAthkarCount, syncDailyReset, resetAthkarCounts } from '../store/slices/athkarSlice';
import { logDhikr } from '../store/slices/statsSlice';
import { MORNING_ATHKAR, EVENING_ATHKAR, AthkarItem } from '../../shared/constants/athkar';
import { EmptyState, useBottomInset } from '../components/ui';
import { VirtueBanner } from '../components/guidance/GuidanceBlocks';
import { SkyButton } from '../components/home/SkyHero';
import { AthkarCard, AthkarSky, AthkarTab } from '../components/athkar/AthkarComponents';
import { colors, space } from '../../shared/theme/tokens';

const WEEKDAYS = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

/** Rendered both as a tab (route TabAthkar, no back button) and as a stack screen (الأذكار). */
const AthkarScreen = ({ route, navigation }: EmbeddableScreenProps<'الأذكار' | 'TabAthkar'>) => {
  const listBottom = useBottomInset(true);
  const dispatch = useDispatch();
  const isTab = route?.name === 'TabAthkar';
  // morning until 15:00, evening after (same split as the home stats)
  const initialTab: AthkarTab = route?.params?.type ?? (new Date().getHours() < 15 ? 'morning' : 'evening');
  const [activeTab, setActiveTab] = useState<AthkarTab>(initialTab);
  const completionCounts = useSelector((state: RootState) => state.athkar.completionCounts);
  const hijri = useSelector((state: RootState) => state.prayer.cachedData?.date?.hijri);

  useEffect(() => { dispatch(syncDailyReset()); }, [dispatch]);
  useEffect(() => { if (route?.params?.type) setActiveTab(route.params.type); }, [route?.params?.type]);

  const athkarList = activeTab === 'morning' ? MORNING_ATHKAR : EVENING_ATHKAR;
  const countOf = (item: AthkarItem) => Math.min(completionCounts[item.id] || 0, item.count);

  const handlePress = (item: AthkarItem) => {
    const current = completionCounts[item.id] || 0;
    if (current < item.count) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      dispatch(incrementAthkarCount({ id: item.id, target: item.count }));
      dispatch(logDhikr({ name: item.text, count: 1 }));
      if (current + 1 === item.count) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const totalPossible = athkarList.reduce((acc, item) => acc + item.count, 0);
  const totalCompleted = athkarList.reduce((acc, item) => acc + countOf(item), 0);
  const doneItems = athkarList.filter((item) => countOf(item) >= item.count).length;
  const allDone = doneItems === athkarList.length;
  const currentId = athkarList.find((item) => countOf(item) < item.count)?.id;
  const subtitle = [WEEKDAYS[new Date().getDay()], hijri ? `${hijri.day} ${hijri.month.ar} ${hijri.year}` : ''].filter(Boolean).join(' · ');

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <FlatList
        data={athkarList}
        renderItem={({ item }) => (
          <View style={{ paddingHorizontal: 20 }}>
            <AthkarCard item={item} currentCount={countOf(item)} isCurrent={item.id === currentId} onToggle={handlePress} />
          </View>
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: listBottom }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            <AthkarSky
              tab={activeTab}
              subtitle={subtitle}
              doneItems={doneItems}
              totalItems={athkarList.length}
              progress={totalPossible ? totalCompleted / totalPossible : 0}
              actions={
                <>
                  <SkyButton
                    onPress={() => setActiveTab(activeTab === 'morning' ? 'evening' : 'morning')}
                    label={activeTab === 'morning' ? 'أذكار المساء' : 'أذكار الصباح'}
                  >
                    {activeTab === 'morning' ? <Moon size={19} color="#fff" /> : <Sun size={19} color="#fff" />}
                  </SkyButton>
                  <SkyButton onPress={() => dispatch(resetAthkarCounts())} label="إعادة ضبط العدّادات">
                    <RotateCcw size={18} color="#fff" />
                  </SkyButton>
                  {!isTab && navigation ? (
                    <SkyButton onPress={() => navigation.goBack()} label="رجوع"><ChevronRight size={20} color="#fff" /></SkyButton>
                  ) : null}
                </>
              }
            />
            <View style={{ paddingHorizontal: 20, marginTop: -space[3] }}>
              {allDone ? (
                <EmptyState icon={CrescentStarIcon} title={activeTab === 'morning' ? 'أتممت أذكار الصباح' : 'أتممت أذكار المساء'} message="تقبّل الله منك. يمكنك إعادة الضبط لتكرارها." />
              ) : null}
            </View>
          </>
        }
        ListFooterComponent={
          <View style={{ paddingHorizontal: 20, marginTop: space[2] }}>
            <VirtueBanner
              icon={CrescentStarIcon}
              title="فضل الذكر"
              sub="لماذا نذكر الله؟ آيات وأحاديث صحيحة في أجر الذاكرين"
              onPress={() => navigation?.navigate('الفضائل', { topic: 'dhikr' })}
            />
          </View>
        }
      />
    </View>
  );
};

export default AthkarScreen;
