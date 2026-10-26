import { EmbeddableScreenProps } from '../navigation/types';
import React, { useState, useEffect } from 'react';
import { FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import * as Haptics from 'expo-haptics';
import { Sparkles } from 'lucide-react-native';
import { RootState } from '../store';
import { incrementAthkarCount, syncDailyReset, resetAthkarCounts } from '../store/slices/athkarSlice';
import { logDhikr } from '../store/slices/statsSlice';
import { MORNING_ATHKAR, EVENING_ATHKAR, AthkarItem } from '../../shared/constants/athkar';
import { EmptyState } from '../components/ui';
import { AthkarHeader, AthkarTabs, AthkarProgressBar, AthkarCard } from '../components/athkar/AthkarComponents';
import { s } from '../components/athkar/AthkarStyles';
import { colors } from '../../shared/theme/tokens';

/** Rendered both as a tab (route TabAthkar, no back button) and as a stack screen (الأذكار). */
const AthkarScreen = ({ route, navigation, hideHeader }: EmbeddableScreenProps<'الأذكار' | 'TabAthkar'>) => {
  const dispatch = useDispatch();
  const isTab = route?.name === 'TabAthkar';
  const initialTab = route?.params?.type === 'evening' ? 'evening' : 'morning';
  const [activeTab, setActiveTab] = useState<'morning' | 'evening'>(initialTab);
  const completionCounts = useSelector((state: RootState) => state.athkar.completionCounts);

  useEffect(() => { dispatch(syncDailyReset()); }, [dispatch]);
  useEffect(() => { if (route?.params?.type) setActiveTab(route.params.type); }, [route?.params?.type]);

  const athkarList = activeTab === 'morning' ? MORNING_ATHKAR : EVENING_ATHKAR;

  const handlePress = (item: AthkarItem) => {
    const current = completionCounts[item.id] || 0;
    if (current < item.count) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      dispatch(incrementAthkarCount({ id: item.id, target: item.count }));
      dispatch(logDhikr({ name: item.text, count: 1 }));
      if (current + 1 === item.count) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const totalPossible = athkarList.reduce((acc, curr) => acc + curr.count, 0);
  const totalCompleted = athkarList.reduce((acc, curr) => acc + Math.min(completionCounts[curr.id] || 0, curr.count), 0);
  const progressPercent = totalPossible ? (totalCompleted / totalPossible) * 100 : 0;
  const allDone = totalCompleted >= totalPossible;

  return (
    <SafeAreaView edges={['top']} style={s.root}>
      <AthkarHeader hideHeader={hideHeader} isTab={isTab} onBack={() => navigation?.goBack()} onReset={() => dispatch(resetAthkarCounts())} />
      <AthkarTabs activeTab={activeTab} onTabChange={setActiveTab} />
      <AthkarProgressBar progressPercent={progressPercent} totalCompleted={totalCompleted} totalPossible={totalPossible} />

      <FlatList
        data={athkarList}
        renderItem={({ item }) => <AthkarCard item={item} currentCount={completionCounts[item.id] || 0} onToggle={handlePress} />}
        keyExtractor={(item) => item.id}
        contentContainerStyle={s.listPadding}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={allDone ? (
          <EmptyState icon={Sparkles} title={activeTab === 'morning' ? 'أتممت أذكار الصباح' : 'أتممت أذكار المساء'} message="تقبّل الله منك. يمكنك إعادة الضبط لتكرارها." />
        ) : null}
        style={{ backgroundColor: colors.bg }}
      />
    </SafeAreaView>
  );
};

export default AthkarScreen;
