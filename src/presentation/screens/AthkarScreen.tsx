import React, { useState, useEffect } from 'react';
import { FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import * as Haptics from 'expo-haptics';
import { RootState } from '../store';
import { incrementAthkarCount, syncDailyReset, resetAthkarCounts } from '../store/slices/athkarSlice';
import { logDhikr } from '../store/slices/statsSlice';
import { MORNING_ATHKAR, EVENING_ATHKAR, AthkarItem } from '../../shared/constants/athkar';

// Athkar Components & Styles
import { 
    AthkarHeader, AthkarTabs, AthkarProgressBar, AthkarCard 
} from '../components/athkar/AthkarComponents';
import { s } from '../components/athkar/AthkarStyles';

const AthkarScreen = ({ route, navigation, hideHeader }: any) => {
  const dispatch = useDispatch();
  const initialTab = route?.params?.type === 'evening' ? 'evening' : 'morning';
  const [activeTab, setActiveTab] = useState<'morning' | 'evening'>(initialTab);
  
  const completionCounts = useSelector((state: RootState) => state.athkar.completionCounts);

  useEffect(() => {
    dispatch(syncDailyReset());
  }, [dispatch]);

  const athkarList = activeTab === 'morning' ? MORNING_ATHKAR : EVENING_ATHKAR;

  const handlePress = (item: AthkarItem) => {
    const current = completionCounts[item.id] || 0;
    if (current < item.count) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      dispatch(incrementAthkarCount({ id: item.id, target: item.count }));
      dispatch(logDhikr({ name: item.text, count: 1 }));
      
      if (current + 1 === item.count) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    }
  };

  const totalPossible = athkarList.reduce((acc, curr) => acc + curr.count, 0);
  const totalCompleted = athkarList.reduce((acc, curr) => acc + (completionCounts[curr.id] || 0), 0);
  const progressPercent = (totalCompleted / totalPossible) * 100;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0c0805' }}>
      <AthkarHeader 
        hideHeader={hideHeader} 
        onBack={() => navigation.goBack()} 
        onReset={() => dispatch(resetAthkarCounts())} 
      />

      <AthkarTabs activeTab={activeTab} onTabChange={setActiveTab} />

      <AthkarProgressBar 
        progressPercent={progressPercent} 
        totalCompleted={totalCompleted} 
        totalPossible={totalPossible} 
      />

      <FlatList
        data={athkarList}
        renderItem={({ item }) => (
            <AthkarCard 
                item={item} 
                currentCount={completionCounts[item.id] || 0} 
                onToggle={handlePress} 
            />
        )}
        keyExtractor={item => item.id}
        contentContainerStyle={s.listPadding}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

export default AthkarScreen;
