import React, { useState, useCallback, useRef, useEffect } from 'react';
import { 
  View, Text, TouchableOpacity, 
  Animated, Vibration, ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { RotateCcw, Volume2, VolumeX, Settings } from 'lucide-react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { 
  incrementCount, resetCount, setTarget, 
  addTarget, setSelectedDhikr, addDhikr, syncTasbeehReset 
} from '../store/slices/tasbeehSlice';
import { logDhikr } from '../store/slices/statsSlice';

// Tasbeeh Components & Constants
import { TasbeehCounter, TargetSelector } from '../components/tasbeeh/TasbeehComponents';
import { TasbeehModals } from '../components/tasbeeh/TasbeehModals';
import { s } from '../components/tasbeeh/TasbeehStyles';
import { toAr } from '../components/tasbeeh/TasbeehConstants';

const TasbeehScreen = ({ hideHeader }: any) => {
  const dispatch = useDispatch();
  const { count, target, targets, totalCount, selectedDhikr, dhikrList } = useSelector((state: RootState) => state.tasbeeh);
  const accentTheme = useSelector((state: RootState) => state.settings.accentTheme);
  
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [showAddDhikr, setShowAddDhikr] = useState(false);
  const [newDhikr, setNewDhikr] = useState('');
  const [showCustomTarget, setShowCustomTarget] = useState(false);
  const [customTargetVal, setCustomTargetVal] = useState('');
  const [showManualAdd, setShowManualAdd] = useState(false);
  const [manualCountVal, setManualCountVal] = useState('');
  
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    dispatch(syncTasbeehReset());
  }, [dispatch]);

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

  }, [count, target, scaleAnim, dispatch]);

  const resetToday = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    dispatch(resetCount());
  };

  return (
    <SafeAreaView style={s.root}>
      {!hideHeader && (
        <View style={s.header}>
          <TouchableOpacity onPress={() => setIsSoundEnabled(!isSoundEnabled)} style={s.iconBtn}>
            {isSoundEnabled ? <Volume2 size={22} color="#fcd34d" /> : <VolumeX size={22} color="#94a3b8" />}
          </TouchableOpacity>
          <Text style={s.headerTitle}>المسبحة</Text>
          <View style={s.totalBadge}><Text style={s.totalText}>{toAr(totalCount)} :الإجمالي</Text></View>
        </View>
      )}

      <View style={[s.selectorArea, { marginTop: hideHeader ? 10 : 20 }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.dhikrScroll}>
          <TouchableOpacity onPress={() => setShowAddDhikr(true)} style={s.addDhikrBtn}><Settings size={20} color="#fcd34d" /></TouchableOpacity>
          {dhikrList.map((d: string) => (
            <TouchableOpacity key={d} onPress={() => { dispatch(setSelectedDhikr(d)); resetToday(); }} style={[s.dhikrChip, selectedDhikr === d && s.dhikrChipActive]}>
              <Text style={[s.dhikrChipText, selectedDhikr === d && s.dhikrChipTextActive]}>{d}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <TargetSelector 
        targets={targets} currentTarget={target} 
        onSelect={(t: number) => { dispatch(setTarget(t)); resetToday(); }}
        onCustom={() => setShowCustomTarget(true)}
        onManual={() => setShowManualAdd(true)}
      />

      <TasbeehCounter count={count} target={target} selectedDhikr={selectedDhikr} scaleAnim={scaleAnim} onPress={handlePress} />

      <TasbeehModals 
        showAddDhikr={showAddDhikr} setShowAddDhikr={setShowAddDhikr} newDhikr={newDhikr} setNewDhikr={setNewDhikr} 
        onAddDhikr={(val: string) => { if (val.trim()) { dispatch(addDhikr(val.trim())); dispatch(setSelectedDhikr(val.trim())); setNewDhikr(''); setShowAddDhikr(false); resetToday(); } }}
        showManualAdd={showManualAdd} setShowManualAdd={setShowManualAdd} manualCountVal={manualCountVal} setManualCountVal={setManualCountVal}
        onManualAdd={(val: string) => { const v = parseInt(val); if (v > 0) { dispatch(incrementCount(v)); dispatch(logDhikr({ name: selectedDhikr, count: v })); setManualCountVal(''); setShowManualAdd(false); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } }}
        showCustomTarget={showCustomTarget} setShowCustomTarget={setShowCustomTarget} customTargetVal={customTargetVal} setCustomTargetVal={setCustomTargetVal}
        onCustomTarget={(val: string) => { const v = parseInt(val); if (v > 0) { dispatch(addTarget(v)); dispatch(setTarget(v)); setCustomTargetVal(''); setShowCustomTarget(false); resetToday(); } }}
      />

      <View style={s.bottomContainer}>
        <TouchableOpacity onPress={resetToday} style={s.resetCircle}>
          <RotateCcw size={22} color="#B8860B" />
          <Text style={s.resetLabel}>تصفير العداد</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default TasbeehScreen;
