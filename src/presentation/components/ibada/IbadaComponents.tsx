import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Check, Plus } from 'lucide-react-native';
import { IbadaTask } from '../../store/slices/ibadaSlice';
import { ProgressRing } from '../ui';
import { toAr } from '../../../shared/utils/format';
import { colors, radius, space, type, themed } from '../../../shared/theme/tokens';

const SHORT: Record<string, string> = { fajr: 'الفجر', dhuhr: 'الظهر', asr: 'العصر', maghrib: 'المغرب', isha: 'العشاء' };

export type RingGroup = { key: string; label: string; color: string; done: number; total: number };

/** Today in three rings: the obligatory prayers, the sunnah, and the daily athkar and wird. */
export const IbadaRings = ({ groups }: { groups: RingGroup[] }) => (
  <View style={st.rings}>
    {groups.map((g) => (
      <View key={g.key} accessible accessibilityLabel={`${g.label} ${g.done} من ${g.total}`}>
        <ProgressRing progress={g.total ? g.done / g.total : 0} size={78} stroke={7} color={g.color} label={`${toAr(g.done)}/${toAr(g.total)}`} caption={g.label} />
      </View>
    ))}
  </View>
);

/** The five prayers side by side; the next one has a gold edge. */
export const PrayerSquares = ({ tasks, nextId, isLocked, onToggle }: {
  tasks: IbadaTask[]; nextId?: string; isLocked?: (t: IbadaTask) => boolean; onToggle: (t: IbadaTask) => void;
}) => (
  <View style={st.squares}>
    {tasks.map((t) => (
      <TouchableOpacity
        key={t.id}
        activeOpacity={0.8}
        onPress={() => onToggle(t)}
        style={[st.square, t.isCompleted ? st.squareDone : t.id === nextId ? st.squareNext : null, isLocked?.(t) && { opacity: 0.55 }]}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: t.isCompleted, disabled: isLocked?.(t) }}
        accessibilityLabel={t.name}
      >
        <View style={[st.dot, t.isCompleted && st.dotOn]}>{t.isCompleted ? <Check size={13} color="#fff" strokeWidth={3} /> : null}</View>
        <Text style={[st.squareText, t.isCompleted && { color: colors.success }, !t.isCompleted && t.id === nextId && { color: colors.goldText }]}>{SHORT[t.id] ?? t.name}</Text>
      </TouchableOpacity>
    ))}
  </View>
);

export const TaskRow = ({ task, onToggle }: { task: IbadaTask; onToggle: () => void }) => (
  <TouchableOpacity activeOpacity={0.8} onPress={onToggle} style={st.row} accessibilityRole="checkbox" accessibilityState={{ checked: task.isCompleted }} accessibilityLabel={task.name}>
    <Text style={[st.rowText, task.isCompleted && { color: colors.textMuted }]}>{task.name}</Text>
    <View style={[st.check, task.isCompleted && st.checkOn]}>{task.isCompleted ? <Check size={14} color="#fff" strokeWidth={3} /> : null}</View>
  </TouchableOpacity>
);

/** Small good deeds as chips; your own ones can be removed with a long press. */
export const DeedChips = ({ tasks, onToggle, onRemove, onAdd }: {
  tasks: IbadaTask[]; onToggle: (t: IbadaTask) => void; onRemove: (t: IbadaTask) => void; onAdd: () => void;
}) => (
  <View style={st.chips}>
    {tasks.map((t) => (
      <TouchableOpacity
        key={t.id}
        activeOpacity={0.8}
        onPress={() => onToggle(t)}
        onLongPress={t.id.startsWith('custom_') ? () => onRemove(t) : undefined}
        style={[st.chip, t.isCompleted && st.chipOn]}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: t.isCompleted }}
        accessibilityLabel={t.name}
      >
        {t.isCompleted ? <Check size={13} color={colors.success} strokeWidth={3} /> : null}
        <Text style={[st.chipText, t.isCompleted && { color: colors.success }]}>{t.name}</Text>
      </TouchableOpacity>
    ))}
    <TouchableOpacity activeOpacity={0.8} onPress={onAdd} style={st.chipAdd} accessibilityRole="button" accessibilityLabel="إضافة مهمة">
      <Plus size={14} color={colors.goldText} />
      <Text style={[st.chipText, { color: colors.goldText }]}>مهمة</Text>
    </TouchableOpacity>
  </View>
);

const st = themed(() => ({
  rings: { flexDirection: 'row', justifyContent: 'space-around', marginTop: space[2], marginBottom: space[4] },
  squares: { flexDirection: 'row', gap: space[2] },
  square: {
    flex: 1, alignItems: 'center', gap: space[1], paddingVertical: space[3], borderRadius: radius.card,
    backgroundColor: colors.card, borderWidth: 1, borderColor: colors.cardBorder,
  },
  squareDone: { backgroundColor: colors.successSoft, borderColor: 'rgba(76,175,125,0.3)' },
  squareNext: { borderColor: colors.goldLine },
  squareText: { ...type.caption, color: colors.textSoft },
  dot: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, borderColor: colors.ring, alignItems: 'center', justifyContent: 'center' },
  dotOn: { backgroundColor: colors.success, borderColor: colors.success },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: space[3], marginBottom: space[2],
    backgroundColor: colors.card, borderWidth: 1, borderColor: colors.cardBorder,
    borderRadius: radius.card, paddingHorizontal: space[4], paddingVertical: space[3],
  },
  rowText: { ...type.bodyMedium, color: colors.text, flex: 1 },
  check: { width: 26, height: 26, borderRadius: 13, borderWidth: 1.5, borderColor: colors.ring, alignItems: 'center', justifyContent: 'center' },
  checkOn: { backgroundColor: colors.success, borderColor: colors.success },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space[2] },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: space[4], paddingVertical: space[2], borderRadius: radius.pill, backgroundColor: colors.card },
  chipOn: { backgroundColor: colors.successSoft },
  chipAdd: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: space[4], paddingVertical: space[2], borderRadius: radius.pill, borderWidth: 1, borderStyle: 'dashed', borderColor: colors.goldLine },
  chipText: { ...type.label, color: colors.textSoft },
}));
