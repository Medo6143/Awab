import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSelector } from 'react-redux';
import * as Haptics from 'expo-haptics';
import { Bell, AlarmClock, Minus, Plus, Play, Check } from 'lucide-react-native';
import { RootState } from '../../store';
import { Chip, PillButton, Sheet } from '../ui';
import { REMINDER_ART } from './art';
import { azanNative } from '../../../data/services/nativeModules';
import { reminderSoundSpec } from '../../../data/notifications/CustomReminderScheduler';
import { RECITER_MAP } from '../../../data/services/AudioService';
import {
  PRAYER_NAMES_AR, REMINDER_PRESETS, Reminder, ReminderArt, ReminderKind, ReminderSound, WEEKDAYS_SHORT, newReminder, presetOf,
} from '../../../domain/entities/reminders';
import { PRAYER_IDS } from '../../../domain/entities/notifications';
import { toAr } from '../../../shared/utils/format';
import { colors, radius, space, type } from '../../../shared/theme/tokens';

const SOUNDS: { id: ReminderSound; label: string; hint: string }[] = [
  { id: 'recitation', label: 'تلاوة بصوت القارئ', hint: 'آيات مناسبة، بتتحمل مرة وتشتغل من غير نت' },
  { id: 'takbir', label: 'التكبير', hint: 'أول الأذان، «الله أكبر»' },
  { id: 'salawat', label: 'صلِّ على النبي ﷺ', hint: 'الصوت اللي في التطبيق' },
  { id: 'system', label: 'منبّه الموبايل', hint: 'النغمة الأساسية لموبايلك' },
];
const ARTS: { id: ReminderArt; label: string }[] = [
  { id: 'qiyam', label: 'الدعاء' }, { id: 'quran', label: 'القرآن' }, { id: 'mosque', label: 'المسجد' },
];
const OFFSETS = [-60, -30, 0, 15, 30, 60];

const offsetLabel = (m: number) => (m === 0 ? 'وقتها' : `${m < 0 ? 'قبل' : 'بعد'} ${m % 60 === 0 ? (Math.abs(m) === 60 ? 'بساعة' : `${toAr(Math.abs(m) / 60)} س`) : `${toAr(Math.abs(m))} د`}`);
export const clock12 = (h: number, m: number) => `${toAr(((h + 11) % 12) + 1)}:${toAr(String(m).padStart(2, '0'))} ${h < 12 ? 'ص' : 'م'}`;

/** Add or edit one reminder. `initial` null with `kind` starts a new one from that preset. */
export const ReminderEditor = ({ visible, initial, onSave, onDelete, onClose }: {
  visible: boolean; initial: Reminder | null;
  onSave: (r: Reminder) => void; onDelete?: (id: string) => void; onClose: () => void;
}) => {
  const reciterId = useSelector((s: RootState) => s.settings.selectedReciterId);
  const [r, setR] = useState<Reminder>(() => initial ?? newReminder('qiyam'));
  const isNew = !initial;
  useEffect(() => { if (visible) setR(initial ?? newReminder('qiyam')); }, [visible, initial]);
  const set = (patch: Partial<Reminder>) => setR((x) => ({ ...x, ...patch }));

  const pickKind = (kind: ReminderKind) => {
    const fresh = newReminder(kind);
    setR({ ...fresh, id: r.id });
  };
  const toggleDay = (d: number) => set({ days: r.days.includes(d) ? r.days.filter((x) => x !== d) : [...r.days, d].sort() });
  const preview = (sound: ReminderSound) => {
    Haptics.selectionAsync();
    azanNative()?.previewReminderSound?.(reminderSoundSpec({ kind: r.kind, sound }, RECITER_MAP[reciterId]?.folder));
  };
  const step = (field: 'hour' | 'minute', d: number) => {
    if (r.time.type !== 'clock') return;
    const total = ((r.time.hour * 60 + r.time.minute + (field === 'hour' ? d * 60 : d)) % 1440 + 1440) % 1440;
    set({ time: { type: 'clock', hour: Math.floor(total / 60), minute: total % 60 } });
  };
  const canSave = (r.title || presetOf(r.kind).name).trim().length > 0 && (r.kind !== 'custom' || r.title.trim().length > 0);

  return (
    <Sheet visible={visible} title={isNew ? 'تذكير جديد' : 'تعديل التذكير'} onClose={onClose}>
      {isNew ? (
        <>
          <Text style={st.label}>العبادة</Text>
          <View style={st.wrap}>
            {REMINDER_PRESETS.map((p) => <Chip key={p.kind} size="sm" label={p.name} selected={r.kind === p.kind} onPress={() => pickKind(p.kind)} />)}
          </View>
        </>
      ) : null}

      <Text style={st.label}>العنوان</Text>
      <TextInput style={st.input} value={r.title} onChangeText={(title) => set({ title })} placeholder="مثلًا: صدقة اليوم" placeholderTextColor={colors.textFaint} />
      <Text style={st.label}>الرسالة</Text>
      <TextInput style={[st.input, { minHeight: 64 }]} value={r.message} onChangeText={(message) => set({ message })} multiline placeholder="اكتب رسالتك بكلامك" placeholderTextColor={colors.textFaint} />

      <Text style={st.label}>الوقت</Text>
      <View style={st.wrap}>
        <Chip size="sm" label="ساعة محددة" selected={r.time.type === 'clock'} onPress={() => set({ time: { type: 'clock', hour: 8, minute: 0 } })} />
        <Chip size="sm" label="حسب الصلاة" selected={r.time.type === 'prayer'} onPress={() => set({ time: { type: 'prayer', prayer: 'Fajr', offset: -60 } })} />
      </View>
      {r.time.type === 'clock' ? (
        <View style={st.clock}>
          <Stepper label="الساعة" onMinus={() => step('hour', -1)} onPlus={() => step('hour', 1)} />
          <Text style={st.clockValue}>{clock12(r.time.hour, r.time.minute)}</Text>
          <Stepper label="الدقايق" onMinus={() => step('minute', -5)} onPlus={() => step('minute', 5)} />
        </View>
      ) : (
        <>
          <View style={st.wrap}>
            {PRAYER_IDS.map((p) => <Chip key={p} size="sm" label={PRAYER_NAMES_AR[p]} selected={r.time.type === 'prayer' && r.time.prayer === p}
              onPress={() => set({ time: { type: 'prayer', prayer: p, offset: r.time.type === 'prayer' ? r.time.offset : 0 } })} />)}
          </View>
          <View style={st.wrap}>
            {OFFSETS.map((o) => <Chip key={o} size="sm" label={offsetLabel(o)} selected={r.time.type === 'prayer' && r.time.offset === o}
              onPress={() => r.time.type === 'prayer' && set({ time: { ...r.time, offset: o } })} />)}
          </View>
        </>
      )}

      <Text style={st.label}>الأيام</Text>
      <View style={st.wrap}>
        <Chip size="sm" label="كل يوم" selected={r.days.length === 0} onPress={() => set({ days: [] })} />
        {WEEKDAYS_SHORT.map((d, i) => <Chip key={d} size="sm" label={d} selected={r.days.includes(i)} onPress={() => toggleDay(i)} />)}
      </View>

      <Text style={st.label}>شكل التذكير</Text>
      <View style={st.styles}>
        <StyleOption icon={<Bell size={20} color={r.style === 'notification' ? colors.onGold : colors.goldText} />} label="إشعار" hint="رسالة في الإشعارات" on={r.style === 'notification'} onPress={() => set({ style: 'notification' })} />
        <StyleOption icon={<AlarmClock size={20} color={r.style === 'alarm' ? colors.onGold : colors.goldText} />} label="منبّه" hint="شاشة كاملة وصوت لحد ما تقفله" on={r.style === 'alarm'} onPress={() => set({ style: 'alarm' })} />
      </View>

      {r.style === 'alarm' ? (
        <>
          <Text style={st.label}>الصوت</Text>
          {SOUNDS.map((s) => (
            <TouchableOpacity key={s.id} style={st.sound} onPress={() => set({ sound: s.id })} accessibilityRole="radio" accessibilityState={{ checked: r.sound === s.id }}>
              <View style={[st.radio, r.sound === s.id && st.radioOn]}>{r.sound === s.id ? <Check size={12} color={colors.onGold} strokeWidth={3} /> : null}</View>
              <View style={{ flex: 1 }}>
                <Text style={st.soundLabel}>{s.label}{s.id === presetOf(r.kind).sound ? <Text style={st.def}>  · الافتراضي</Text> : null}</Text>
                <Text style={st.soundHint}>{s.hint}</Text>
              </View>
              <TouchableOpacity style={st.play} onPress={() => preview(s.id)} hitSlop={8} accessibilityRole="button" accessibilityLabel={`اسمع ${s.label}`}>
                <Play size={14} color={colors.goldText} fill={colors.goldText} />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}

          <Text style={st.label}>الصورة</Text>
          <View style={st.arts}>
            {ARTS.map((a) => (
              <TouchableOpacity key={a.id} style={[st.art, r.art === a.id && st.artOn]} onPress={() => set({ art: a.id })} accessibilityRole="radio" accessibilityState={{ checked: r.art === a.id }} accessibilityLabel={a.label}>
                <Image source={REMINDER_ART[a.id]} style={st.artImg} />
                <Text style={st.artLabel}>{a.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={st.label}>التأجيل</Text>
          <View style={st.wrap}>
            {[5, 10, 15].map((m) => <Chip key={m} size="sm" label={`${toAr(m)} دقايق`} selected={r.snoozeMinutes === m} onPress={() => set({ snoozeMinutes: m })} />)}
          </View>
        </>
      ) : null}

      <PillButton label="حفظ" disabled={!canSave} onPress={() => { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); onSave({ ...r, title: r.title.trim() || presetOf(r.kind).name }); }} style={{ marginTop: space[6] }} />
      {!isNew && onDelete ? <PillButton label="حذف التذكير" variant="danger" onPress={() => onDelete(r.id)} style={{ marginTop: space[3] }} /> : null}
    </Sheet>
  );
};

const Stepper = ({ label, onMinus, onPlus }: { label: string; onMinus: () => void; onPlus: () => void }) => (
  <View style={st.stepper}>
    <TouchableOpacity style={st.stepBtn} onPress={onPlus} accessibilityRole="button" accessibilityLabel={`${label} أكتر`}><Plus size={16} color={colors.goldText} /></TouchableOpacity>
    <TouchableOpacity style={st.stepBtn} onPress={onMinus} accessibilityRole="button" accessibilityLabel={`${label} أقل`}><Minus size={16} color={colors.goldText} /></TouchableOpacity>
  </View>
);

const StyleOption = ({ icon, label, hint, on, onPress }: { icon: React.ReactNode; label: string; hint: string; on: boolean; onPress: () => void }) => (
  <TouchableOpacity style={[st.styleOpt, on && st.styleOn]} onPress={onPress} accessibilityRole="radio" accessibilityState={{ checked: on }}>
    {icon}
    <Text style={[st.styleLabel, on && { color: colors.onGold }]}>{label}</Text>
    <Text style={[st.styleHint, on && { color: colors.onGold }]}>{hint}</Text>
  </TouchableOpacity>
);

const st = StyleSheet.create({
  label: { ...type.label, color: colors.textMuted, marginTop: space[5], marginBottom: space[2] },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: space[2], marginBottom: space[2] },
  input: { ...type.body, color: colors.text, backgroundColor: colors.surfaceRaised, borderRadius: radius.field, paddingHorizontal: space[4], paddingVertical: space[3], textAlign: 'right' },
  clock: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.surfaceRaised, borderRadius: radius.field, padding: space[3], marginTop: space[2] },
  clockValue: { fontFamily: 'Tajawal_800ExtraBold', fontSize: 26, color: colors.text },
  stepper: { gap: space[2] },
  stepBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.goldSoft, alignItems: 'center', justifyContent: 'center' },
  styles: { flexDirection: 'row', gap: space[3] },
  styleOpt: { flex: 1, gap: 4, padding: space[3], borderRadius: radius.tile, backgroundColor: colors.surfaceRaised, borderWidth: 1, borderColor: 'transparent' },
  styleOn: { backgroundColor: colors.gold },
  styleLabel: { ...type.bodyMedium, fontFamily: 'Tajawal_700Bold', color: colors.text },
  styleHint: { ...type.caption, color: colors.textMuted },
  sound: { flexDirection: 'row', alignItems: 'center', gap: space[3], paddingVertical: space[3], borderBottomWidth: 1, borderBottomColor: colors.hairline },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: colors.textFaint, alignItems: 'center', justifyContent: 'center' },
  radioOn: { borderColor: colors.gold, backgroundColor: colors.gold },
  soundLabel: { ...type.bodyMedium, color: colors.text },
  def: { ...type.caption, color: colors.gold },
  soundHint: { ...type.caption, color: colors.textMuted },
  play: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.goldSoft, alignItems: 'center', justifyContent: 'center' },
  arts: { flexDirection: 'row', gap: space[2] },
  art: { flex: 1, borderRadius: radius.tile, overflow: 'hidden', borderWidth: 2, borderColor: 'transparent', backgroundColor: colors.surfaceRaised },
  artOn: { borderColor: colors.gold },
  artImg: { width: '100%', height: 80 },
  artLabel: { ...type.caption, color: colors.textSoft, textAlign: 'center', paddingVertical: 4 },
});
