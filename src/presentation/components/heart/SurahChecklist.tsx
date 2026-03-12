import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { CheckCircle2, Circle } from 'lucide-react-native';
import { s } from './HeartJourneyStyles';
import { toAr } from './HeartJourneyConstants';
import { SURAH_NAMES } from '../../../shared/constants/surahs';

export const SurahChecklist = ({ completedSurahs, onToggle }: any) => (
  <View style={s.checklistContainer}>
    {SURAH_NAMES.map((name, index) => {
      const id = index + 1;
      const isDone = completedSurahs.includes(id);
      return (
        <TouchableOpacity 
          key={id} 
          style={[s.checkItem, isDone && s.checkItemDone]}
          onPress={() => onToggle(id)}
        >
          <View style={s.checkRight}>
              <Text style={s.surahNum}>{toAr(id)}</Text>
              <Text style={[s.surahName, isDone && s.surahNameDone]}>{name}</Text>
          </View>
          {isDone ? (
              <CheckCircle2 color="#fcd34d" size={24} />
          ) : (
              <Circle color="#2b1f15" size={24} />
          )}
        </TouchableOpacity>
      );
    })}
  </View>
);
