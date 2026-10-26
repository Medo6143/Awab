import { EmbeddableScreenProps } from '../navigation/types';
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Animated, Vibration, ScrollView } from 'react-native';
import * as Haptics from 'expo-haptics';
import { RotateCcw, Volume2, VolumeX, Settings2 } from 'lucide-react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import {
  incrementCount, resetCount, setTarget,
  addTarget, setSelectedDhikr, addDhikr, syncTasbeehReset,
} from '../store/slices/tasbeehSlice';
import { logDhikr } from '../store/slices/statsSlice';

import { Screen, ScreenHeader, IconButton, Chip, PillButton } from '../components/ui';
import { TasbeehCounter, TargetCarousel } from '../components/tasbeeh/TasbeehComponents';
import { TasbeehModals } from '../components/tasbeeh/TasbeehModals';
import { s } from '../components/tasbeeh/TasbeehStyles';
import { toAr } from '../components/tasbeeh/TasbeehConstants';
import { colors, icon } from '../../shared/theme/tokens';

const TasbeehScreen = ({ hideHeader, navigation }: EmbeddableScreenProps) => {
  const dispatch = useDispatch();
  const { count, target, targets, totalCount, selectedDhikr, dhikrList, floatingBubbleColor } = useSelector((state: RootState) => state.tasbeeh);

  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [showAddDhikr, setShowAddDhikr] = useState(false);
  const [newDhikr, setNewDhikr] = useState('');
  const [showCustomTarget, setShowCustomTarget] = useState(false);
  const [customTargetVal, setCustomTargetVal] = useState('');
  const [showManualAdd, setShowManualAdd] = useState(false);
  const [manualCountVal, setManualCountVal] = useState('');

  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => { dispatch(syncTasbeehReset()); }, [dispatch]);

  const handlePress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    dispatch(incrementCount(1));
    dispatch(logDhikr({ name: selectedDhikr, count: 1 }));
    if (count + 1 === target) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Vibration.vibrate([0, 100, 50, 100]);
    }
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.94, duration: 50, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 5, useNativeDriver: true }),
    ]).start();
  }, [count, target, scaleAnim, dispatch, selectedDhikr]);

  const resetToday = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    dispatch(resetCount());
  };

  return (
    <Screen
      tab
      padded={false}
      header={!hideHeader ? (
        <ScreenHeader
          title="المسبحة"
          subtitle={`الإجمالي ${toAr(totalCount)}`}
          right={
            <IconButton onPress={() => setIsSoundEnabled((v) => !v)} label={isSoundEnabled ? 'كتم الصوت' : 'تشغيل الصوت'}>
              {isSoundEnabled
                ? <Volume2 size={icon.size.md} color={colors.gold} strokeWidth={icon.stroke} />
                : <VolumeX size={icon.size.md} color={colors.textMuted} strokeWidth={icon.stroke} />}
            </IconButton>
          }
        />
      ) : undefined}
    >
      <View style={s.selectorArea}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.dhikrScroll}>
          <TouchableOpacity onPress={() => setShowAddDhikr(true)} style={s.addDhikrBtn} accessibilityLabel="إضافة ذكر">
            <Settings2 size={icon.size.md} color={colors.gold} strokeWidth={icon.stroke} />
          </TouchableOpacity>
          {dhikrList.map((d: string) => (
            <Chip key={d} label={d} selected={selectedDhikr === d} onPress={() => { dispatch(setSelectedDhikr(d)); resetToday(); }} />
          ))}
        </ScrollView>
      </View>

      <TargetCarousel
        targets={targets} currentTarget={target}
        onSelect={(t: number) => { dispatch(setTarget(t)); resetToday(); }}
        onCustom={() => setShowCustomTarget(true)}
        onManual={() => setShowManualAdd(true)}
      />

      <TasbeehCounter
        count={count}
        target={target}
        selectedDhikr={selectedDhikr}
        scaleAnim={scaleAnim}
        onPress={handlePress}
        accentColor={floatingBubbleColor}
      />

      <View style={s.bottomContainer}>
        <PillButton
          label="تصفير العداد"
          variant="ghost"
          onPress={resetToday}
          icon={<RotateCcw size={icon.size.md} color={colors.goldText} strokeWidth={icon.stroke} />}
          style={{ flex: 1 }}
        />
        <PillButton
          label="المسبحة العائمة"
          variant="ghost"
          onPress={() => navigation?.navigate('الإعدادات')}
          style={{ flex: 1 }}
        />
      </View>

      <TasbeehModals
        showAddDhikr={showAddDhikr} setShowAddDhikr={setShowAddDhikr} newDhikr={newDhikr} setNewDhikr={setNewDhikr}
        onAddDhikr={(val: string) => { if (val.trim()) { dispatch(addDhikr(val.trim())); dispatch(setSelectedDhikr(val.trim())); setNewDhikr(''); setShowAddDhikr(false); resetToday(); } }}
        showManualAdd={showManualAdd} setShowManualAdd={setShowManualAdd} manualCountVal={manualCountVal} setManualCountVal={setManualCountVal}
        onManualAdd={(val: string) => { const v = parseInt(val); if (v > 0) { dispatch(incrementCount(v)); dispatch(logDhikr({ name: selectedDhikr, count: v })); setManualCountVal(''); setShowManualAdd(false); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } }}
        showCustomTarget={showCustomTarget} setShowCustomTarget={setShowCustomTarget} customTargetVal={customTargetVal} setCustomTargetVal={setCustomTargetVal}
        onCustomTarget={(val: string) => { const v = parseInt(val); if (v > 0) { dispatch(addTarget(v)); dispatch(setTarget(v)); setCustomTargetVal(''); setShowCustomTarget(false); resetToday(); } }}
      />
    </Screen>
  );
};

export default TasbeehScreen;
