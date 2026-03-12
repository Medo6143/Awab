import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { CheckCircle2, Circle, Star, Activity, Zap } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { s } from './IbadaStyles';
import { IBADA_CATEGORIES } from './IbadaConstants';

export const IbadaProgressCard = ({ completedCount, totalCount, progress, accentColor }: any) => (
  <LinearGradient colors={['#1e293b', '#0c0805']} style={s.progressCard}>
    <View style={s.progressHeader}>
       <View>
          <Text style={s.progressTitle}>حصاد اليوم</Text>
          <Text style={s.progressSub}>{completedCount} من {totalCount} مهام مكتملة</Text>
       </View>
        <Star color={accentColor} size={32} fill={accentColor + '20'} />
    </View>
    <View style={s.progressBarBg}>
       <View style={[s.progressBarFill, { width: `${progress * 100}%`, backgroundColor: accentColor }]} />
    </View>
    <View style={s.statsRow}>
       <View style={s.statItem}>
          <Activity size={16} color={accentColor} />
          <Text style={s.statText}>الالتزام: {Math.round(progress * 100)}%</Text>
       </View>
       <View style={s.statItem}>
          <Zap size={16} color="#fbbf24" />
          <Text style={s.statText}>تحدي اليوم</Text>
       </View>
    </View>
  </LinearGradient>
);

export const TaskItem = ({ task, onToggle, accentColor }: any) => {
  const category = IBADA_CATEGORIES.find(c => c.id === task.category);
  return (
    <TouchableOpacity 
      style={[s.taskCard, task.isCompleted && { borderColor: accentColor, backgroundColor: '#1e293b' }]}
      onPress={onToggle}
    >
      <View style={s.taskLeft}>
        <View style={[s.categoryBadge, { backgroundColor: category?.color + '20' }]}>
           <Text style={[s.categoryText, { color: category?.color }]}>{category?.name}</Text>
        </View>
        <Text style={[s.taskName, task.isCompleted && s.taskNameCompleted]}>{task.name}</Text>
      </View>
      {task.isCompleted ? (
        <CheckCircle2 color={accentColor} size={24} fill={accentColor + '20'} />
      ) : (
        <Circle color="#475569" size={24} />
      )}
    </TouchableOpacity>
  );
};
