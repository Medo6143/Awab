import React, { useState } from 'react';
import { StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { AlarmClock, Bell, Plus } from 'lucide-react-native';
import { ScreenProps } from '../navigation/types';
import { RootState } from '../store';
import { removeReminder, saveReminder, toggleReminder } from '../store/slices/remindersSlice';
import { IconButton, Screen, ScreenHeader, SectionTitle } from '../components/ui';
import { ReminderEditor, clock12 } from '../components/reminders/ReminderEditor';
import { AzanReadinessCard } from '../components/settings/AzanReadinessCard';
import { PRAYER_NAMES_AR, REMINDER_PRESETS, Reminder, WEEKDAYS_SHORT, newReminder, resolveReminderTime } from '../../domain/entities/reminders';
import { toAr } from '../../shared/utils/format';
import { colors, icon, radius, space, type } from '../../shared/theme/tokens';

const daysLabel = (days: number[]) =>
  days.length === 0 || days.length === 7 ? 'كل يوم' : days.map((d) => WEEKDAYS_SHORT[d]).join('، ');

const timeLabel = (r: Reminder, timings?: Record<string, string>) => {
  const at = resolveReminderTime(r.time, timings);
  const clock = at ? clock12(at.hours, at.minutes) : '';
  if (r.time.type === 'clock') return clock;
  const m = Math.abs(r.time.offset);
  const rel = m === 0 ? `وقت ${PRAYER_NAMES_AR[r.time.prayer]}` : `${r.time.offset < 0 ? 'قبل' : 'بعد'} ${PRAYER_NAMES_AR[r.time.prayer]} ${m === 60 ? 'بساعة' : m % 60 === 0 ? `بـ${toAr(m / 60)} ساعات` : `بـ${toAr(m)} دقيقة`}`;
  return clock ? `${clock} · ${rel}` : rel;
};

/** "تذكيراتي": the user's own reminders for any worship, as a notification or an alarm. */
const RemindersScreen = ({ navigation }: Pick<ScreenProps, 'navigation'>) => {
  const dispatch = useDispatch();
  const list = useSelector((s: RootState) => s.reminders?.list ?? []);
  const timings = useSelector((s: RootState) => s.prayer.cachedData?.timings) as Record<string, string> | undefined;
  const [editing, setEditing] = useState<Reminder | null>(null);
  const [adding, setAdding] = useState(false);
  const hasAlarm = list.some((r) => r.enabled && r.style === 'alarm');

  const close = () => { setEditing(null); setAdding(false); };

  return (
    <Screen scroll header={<ScreenHeader title="تذكيراتي" subtitle="قيام، قرآن، أو أي عبادة" onBack={() => navigation.goBack()}
      right={<IconButton onPress={() => setAdding(true)} label="تذكير جديد"><Plus size={icon.size.lg} color={colors.gold} strokeWidth={icon.stroke} /></IconButton>} />}>

      {list.length === 0 ? (
        <View style={st.empty}>
          <Text style={st.emptyTitle}>ابدأ بتذكير</Text>
          <Text style={st.emptyText}>اختار عبادة، وأوّاب يفكّرك بيها في وقتها، بإشعار أو بمنبّه يصحّيك.</Text>
          <View style={st.quick}>
            {REMINDER_PRESETS.filter((p) => p.kind !== 'custom').map((p) => (
              <TouchableOpacity key={p.kind} style={st.quickBtn} onPress={() => dispatch(saveReminder(newReminder(p.kind)))} accessibilityRole="button">
                <Plus size={16} color={colors.goldText} />
                <Text style={st.quickText}>{p.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ) : (
        list.map((r) => (
          <TouchableOpacity key={r.id} style={[st.card, !r.enabled && st.off]} onPress={() => setEditing(r)} activeOpacity={0.85} accessibilityRole="button">
            <View style={st.cardHead}>
              <Text style={st.title} numberOfLines={1}>{r.title}</Text>
              <Switch value={r.enabled} onValueChange={() => { dispatch(toggleReminder(r.id)); }}
                trackColor={{ true: colors.goldDeep, false: colors.surfaceRaised }} thumbColor={r.enabled ? colors.gold : colors.textFaint} />
            </View>
            <Text style={st.time}>{timeLabel(r, timings)}</Text>
            <View style={st.meta}>
              {r.style === 'alarm' ? <AlarmClock size={14} color={colors.gold} /> : <Bell size={14} color={colors.textMuted} />}
              <Text style={[st.metaText, r.style === 'alarm' && { color: colors.gold }]}>{r.style === 'alarm' ? 'منبّه بشاشة كاملة' : 'إشعار'}</Text>
              <Text style={st.metaText}>· {daysLabel(r.days)}</Text>
            </View>
          </TouchableOpacity>
        ))
      )}

      {hasAlarm ? (
        <>
          <SectionTitle title="عشان المنبّه يشتغل" />
          <AzanReadinessCard />
        </>
      ) : null}

      <ReminderEditor
        visible={adding || !!editing}
        initial={editing}
        onClose={close}
        onSave={(r) => { dispatch(saveReminder(r)); close(); }}
        onDelete={(id) => { dispatch(removeReminder(id)); close(); }}
      />
    </Screen>
  );
};

const st = StyleSheet.create({
  empty: { backgroundColor: colors.surface, borderRadius: radius.card, padding: space[5], marginTop: space[2] },
  emptyTitle: { ...type.h2, color: colors.text },
  emptyText: { ...type.body, color: colors.textMuted, marginTop: space[1] },
  quick: { flexDirection: 'row', flexWrap: 'wrap', gap: space[2], marginTop: space[4] },
  quickBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.goldSoft, borderRadius: radius.pill, paddingHorizontal: space[3], paddingVertical: space[2] },
  quickText: { ...type.label, color: colors.goldText },
  card: { backgroundColor: colors.surface, borderRadius: radius.card, padding: space[4], marginBottom: space[3] },
  off: { opacity: 0.55 },
  cardHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { ...type.bodyMedium, fontFamily: 'Tajawal_700Bold', fontSize: 17, color: colors.text, flex: 1 },
  time: { fontFamily: 'Tajawal_800ExtraBold', fontSize: 20, color: colors.text, marginTop: 2 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: space[2] },
  metaText: { ...type.caption, color: colors.textMuted },
});

export default RemindersScreen;
