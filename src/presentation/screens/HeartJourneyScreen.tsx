import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, View, TouchableOpacity } from 'react-native';
import { Maximize2 } from 'lucide-react-native';
import { Screen } from '../components/ui';
import { colors } from '../../shared/theme/tokens';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { toggleSurahCompleted, setCompletedSurahs, finishKhatma } from '../store/slices/quranSlice';
import * as Haptics from 'expo-haptics';

// Heart Components & Constants
import { AnatomicalHeart } from '../components/heart/AnatomicalHeart';
import { HeartZoomModal } from '../components/heart/HeartZoomModal';
import { SurahChecklist } from '../components/heart/SurahChecklist';
import { HeartJourneyHeader, HeartNarrative } from '../components/heart/HeartJourneyHeader';
import { JuzSelectionModal, BulkMarkModal } from '../components/heart/HeartModals';
import { s } from '../components/heart/HeartJourneyStyles';
import { JUZ_SURAH_RANGES, toAr } from '../components/heart/HeartJourneyConstants';

const HeartJourneyScreen = ({ navigation }: any) => {
  const dispatch = useDispatch();
  const completedSurahs = useSelector((state: RootState) => state.quran.completedSurahs as number[] || []);
  const khatmaCount = useSelector((state: RootState) => (state.quran as any).khatmaCount as number || 0);

  const [showJuzModal, setShowJuzModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showZoom, setShowZoom] = useState(false);

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

  const handleToggle = useCallback((id: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    dispatch(toggleSurahCompleted(id));
  }, [dispatch]);

  const openZoom = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowZoom(true);
  }, []);

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
    <Screen scroll padded={false} header={<HeartJourneyHeader onBack={() => navigation.goBack()} completedCount={completedSurahs.length} />}>
        <View style={s.heartContainer}>
          <TouchableOpacity onPress={openZoom} style={s.heartZoomBtn} accessibilityLabel="تكبير القلب">
            <Maximize2 color={colors.gold} size={18} />
          </TouchableOpacity>
          <AnatomicalHeart
            pulseAnim={pulseAnim}
            completedSurahs={completedSurahs}
            progress={heartProgress}
            onToggleSurah={handleToggle}
            onZoomRequest={openZoom}
          />
        </View>

        <HeartNarrative 
          khatmaCount={khatmaCount} 
          completedCount={completedSurahs.length} 
          onShowJuz={() => setShowJuzModal(true)} 
          onShowBulk={() => setShowBulkModal(true)} 
          onFinish={handleFinishKhatma} 
        />

        <SurahChecklist completedSurahs={completedSurahs} onToggle={handleToggle} />

      <JuzSelectionModal visible={showJuzModal} onClose={() => setShowJuzModal(false)} onSelectJuz={markJuz} />
      <BulkMarkModal visible={showBulkModal} onClose={() => setShowBulkModal(false)} onSelectSurah={markUntilSurah} />
      <HeartZoomModal
        visible={showZoom}
        onClose={() => setShowZoom(false)}
        completedSurahs={completedSurahs}
        progress={heartProgress}
        onToggleSurah={handleToggle}
      />
    </Screen>
  );
};

export default HeartJourneyScreen;
