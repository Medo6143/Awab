import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { useSelector } from 'react-redux';
import { styles } from './HomeStyles';
import { ProgressRing } from '../ui';
import { RootState } from '../../store';
import { MORNING_ATHKAR, EVENING_ATHKAR } from '../../../shared/constants/athkar';
import { TOTAL_SURAHS } from './HomeConstants';

/** Three rings replacing three cards: today's ibada, the khatma, and today's athkar. */
export const ProgressRow = ({ onNavigate }: { onNavigate: (route: string, params?: any) => void }) => {
  const tasks = useSelector((s: RootState) => s.ibada.tasks);
  const completedSurahs = useSelector((s: RootState) => s.quran.completedSurahs?.length || 0);
  const athkarCounts = useSelector((s: RootState) => (s as any).athkar?.completionCounts || {});

  const ibada = tasks.length ? tasks.filter((t: any) => t.isCompleted).length / tasks.length : 0;
  const khatma = completedSurahs / TOTAL_SURAHS;

  let done = 0, total = 0;
  for (const item of [...MORNING_ATHKAR, ...EVENING_ATHKAR]) {
    total += item.count;
    done += Math.min(athkarCounts[item.id] || 0, item.count);
  }
  const athkar = total ? done / total : 0;

  const rings = [
    { key: 'ibada', progress: ibada, caption: 'العبادات', route: 'العبادات' },
    { key: 'khatma', progress: khatma, caption: 'الختمة', route: 'نور_القلب' },
    { key: 'athkar', progress: athkar, caption: 'الأذكار', route: 'TabAthkar' },
  ];

  return (
    <View style={styles.ringsRow}>
      {rings.map((r) => (
        <TouchableOpacity key={r.key} onPress={() => onNavigate(r.route)} accessibilityRole="button" accessibilityLabel={r.caption} activeOpacity={0.8}>
          <ProgressRing progress={r.progress} caption={r.caption} size={88} stroke={8} />
        </TouchableOpacity>
      ))}
    </View>
  );
};
