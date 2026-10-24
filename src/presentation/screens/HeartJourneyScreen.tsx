import React, { useEffect, useRef, useMemo, useState } from 'react';
import { Animated, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { toggleSurahCompleted, setCompletedSurahs, finishKhatma } from '../store/slices/quranSlice';
import { SURAH_NAMES } from '../../shared/constants/surahs';
import * as Haptics from 'expo-haptics';

// Heart Components & Constants
import { HeartVisualizer } from '../components/heart/HeartVisualizer';
import { SurahChecklist } from '../components/heart/SurahChecklist';
import { HeartJourneyHeader, HeartNarrative } from '../components/heart/HeartJourneyHeader';
import { JuzSelectionModal, BulkMarkModal } from '../components/heart/HeartModals';
import { s } from '../components/heart/HeartJourneyStyles';
import { JUZ_SURAH_RANGES, toAr } from '../components/heart/HeartJourneyConstants';
import { HEART_MAP } from '../components/heart/heartMap';

const HeartJourneyScreen = ({ navigation }: any) => {
  const dispatch = useDispatch();
  const completedSurahs = useSelector((state: RootState) => state.quran.completedSurahs as number[] || []);
  const khatmaCount = useSelector((state: RootState) => (state.quran as any).khatmaCount as number || 0);

  const [showJuzModal, setShowJuzModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);

  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.05, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  // Overall khatma progress drives how high the heart fills red (like a tank).
  const heartProgress = completedSurahs.length / 114;

  const heartSegments = useMemo(() => {
    return HEART_MAP.cells.map((cell) => ({
      id: cell.id,
      name: SURAH_NAMES[cell.id - 1],
      d: cell.d,
      cx: cell.cx,
      cy: cell.cy,
      completed: completedSurahs.includes(cell.id),
    }));
  }, [completedSurahs]);

  const handleToggle = (id: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    dispatch(toggleSurahCompleted(id));
  };

  const markUntilSurah = (surahId: number) => {
    const list = Array.from({ length: surahId }, (_, i) => i + 1);
    dispatch(setCompletedSurahs(list));
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShowBulkModal(false);
  };

  const markJuz = (juzIndex: number) => {
    const start = JUZ_SURAH_RANGES[juzIndex][0];
    const end = JUZ_SURAH_RANGES[juzIndex][1];
    const newCompleted = new Set(completedSurahs);
    for (let i = start; i <= end; i++) newCompleted.add(i);
    dispatch(setCompletedSurahs(Array.from(newCompleted)));
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShowJuzModal(false);
  };

  const handleFinishKhatma = () => {
    if (completedSurahs.length < 114) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    dispatch(finishKhatma());
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0c0805' }}>
      <HeartJourneyHeader onBack={() => navigation.goBack()} completedCount={completedSurahs.length} />

      <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
        <HeartVisualizer pulseAnim={pulseAnim} heartSegments={heartSegments} progress={heartProgress} />

        <HeartNarrative 
          khatmaCount={khatmaCount} 
          completedCount={completedSurahs.length} 
          onShowJuz={() => setShowJuzModal(true)} 
          onShowBulk={() => setShowBulkModal(true)} 
          onFinish={handleFinishKhatma} 
        />

        <SurahChecklist completedSurahs={completedSurahs} onToggle={handleToggle} />
      </ScrollView>

      <JuzSelectionModal visible={showJuzModal} onClose={() => setShowJuzModal(false)} onSelectJuz={markJuz} />
      <BulkMarkModal visible={showBulkModal} onClose={() => setShowBulkModal(false)} onSelectSurah={markUntilSurah} />
    </SafeAreaView>
  );
};

export default HeartJourneyScreen;
