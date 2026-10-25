import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { CheckCircle2, Circle } from 'lucide-react-native';
import { s } from './IbadaStyles';
import { IBADA_CATEGORIES } from './IbadaConstants';
import { ProgressRing, IconTile, StatNumber } from '../ui';
import { colors, icon } from '../../../shared/theme/tokens';
import { useAccent } from '../../../shared/theme/useAccent';
import { toAr } from '../../../shared/utils/format';

export const IbadaProgressCard = ({ completedCount, totalCount, progress }: any) => (
  <View style={s.hero}>
    <ProgressRing
      progress={progress}
      size={150}
      stroke={12}
      icon={<StatNumber value={`${toAr(Math.round(progress * 100))}٪`} size="h1" caption="الالتزام" />}
    />
    <Text style={s.heroCaption}>{toAr(completedCount)} من {toAr(totalCount)} مهام مكتملة اليوم</Text>
  </View>
);

export const TaskItem = ({ task, onToggle }: any) => {
  const accent = useAccent();
  const category = IBADA_CATEGORIES.find((c) => c.id === task.category);
  return (
    <TouchableOpacity
      style={[s.taskCard, task.isCompleted && s.taskCardDone]}
      onPress={onToggle}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: !!task.isCompleted }}
      accessibilityLabel={task.name}
      activeOpacity={0.8}
    >
      <View style={s.taskLeft}>
        {category ? <IconTile icon={category.icon} tone={task.isCompleted ? 'muted' : 'accent'} /> : null}
        <Text style={[s.taskName, task.isCompleted && s.taskNameCompleted]}>{task.name}</Text>
      </View>
      {task.isCompleted ? (
        <CheckCircle2 color={accent.accent} size={icon.size.lg} strokeWidth={icon.stroke} />
      ) : (
        <Circle color={colors.textFaint} size={icon.size.lg} strokeWidth={icon.stroke} />
      )}
    </TouchableOpacity>
  );
};
