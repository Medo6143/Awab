import React from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { Target } from 'lucide-react-native';
import { s } from './TasbeehStyles';
import { toAr } from './TasbeehConstants';

export const TasbeehCounter = ({ count, target, selectedDhikr, scaleAnim, onPress }: any) => (
  <View style={s.counterBody}>
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity activeOpacity={0.9} onPress={onPress} style={s.mainCircle}>
         <View style={s.innerRing}>
            <Text style={s.dhikrHeader}>{selectedDhikr}</Text>
            <Text style={s.mainCount}>{toAr(count)}</Text>
            <View style={s.progressTextRow}>
               <Target size={14} color="#B8860B" />
               <Text style={s.progressText}>الهدف: {toAr(target)}</Text>
            </View>
         </View>
      </TouchableOpacity>
    </Animated.View>
  </View>
);

export const TargetSelector = ({ targets, currentTarget, onSelect, onCustom, onManual }: any) => (
  <View style={s.targetRow}>
    {targets.map((t: number) => (
      <TouchableOpacity 
        key={t} 
        onPress={() => onSelect(t)} 
        style={[s.targetBtn, currentTarget === t && s.targetBtnActive]}
      >
        <Text style={[s.targetBtnText, currentTarget === t && s.targetBtnTextActive]}>{toAr(t)}</Text>
      </TouchableOpacity>
    ))}
    <TouchableOpacity onPress={onCustom} style={s.targetBtn}>
      <Target size={20} color="#d4af37" />
    </TouchableOpacity>
    <TouchableOpacity onPress={onManual} style={[s.targetBtn, { backgroundColor: '#2b1f15' }]}>
      <Text style={{ fontSize: 18, color: '#fcd34d', fontWeight: 'bold' }}>+</Text>
    </TouchableOpacity>
  </View>
);
