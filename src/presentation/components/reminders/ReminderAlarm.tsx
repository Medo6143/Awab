import React, { useEffect, useRef } from 'react';
import { Animated, Image, Modal, PanResponder, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { BookOpen, ChevronsLeft, Volume2 } from 'lucide-react-native';
import { RootState } from '../../store';
import { hideReminderAlarm } from '../../store/slices/uiSlice';
import { useToggleIbada } from '../../hooks/useToggleIbada';
import { useVerseText } from '../../hooks/useGuidance';
import { azanNative } from '../../../data/services/nativeModules';
import { reminderPayload } from '../../../data/notifications/CustomReminderScheduler';
import { Reminder, ReminderQuote, presetOf, resolveReminderTime } from '../../../domain/entities/reminders';
import { REMINDER_ART } from './art';
import { navigationRef } from '../../navigation/AppNavigation';
import { toAr } from '../../../shared/utils/format';
import { night, radius, space, type } from '../../../shared/theme/tokens';

/** Ibada tasks a reminder's "done" button checks off. */
const TASK_OF: Partial<Record<Reminder['kind'], string>> = { qiyam: 'qiyam_al_layl', duha: 'duha' };

const SOUND_LABEL: Record<Reminder['sound'], string> = {
  recitation: 'تلاوة بصوت القارئ', takbir: 'التكبير', salawat: 'صلِّ على النبي ﷺ', system: 'منبّه الموبايل',
};

const clock = (h: number, m: number) => `${toAr(((h + 11) % 12) + 1)}:${toAr(String(m).padStart(2, '0'))}`;

/**
 * The full-screen alarm for the user's own reminders (قيام الليل, ورد القرآن, ...): the
 * reminder's picture, time and title, a verse or hadith, and slide-to-confirm so it can't be
 * dismissed by a sleepy tap. The native service plays the sound until stopped or snoozed.
 */
export const ReminderAlarm = () => {
  const dispatch = useDispatch();
  const id = useSelector((s: RootState) => s.ui.ringingReminder);
  const reminder = useSelector((s: RootState) => s.reminders?.list.find((r) => r.id === id));
  const timings = useSelector((s: RootState) => s.prayer.cachedData?.timings) as Record<string, string> | undefined;
  const tasks = useSelector((s: RootState) => s.ibada.tasks);
  const toggle = useToggleIbada();
  const insets = useSafeAreaInsets();
  if (!id) return null;

  const preset = presetOf(reminder?.kind ?? 'custom');
  const at = reminder ? resolveReminderTime(reminder.time, timings) : null;
  const now = new Date();
  const close = () => {
    try { azanNative()?.stopAzan?.(); azanNative()?.releaseLockScreen?.(); } catch {}
    dispatch(hideReminderAlarm());
  };
  const done = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const task = reminder && TASK_OF[reminder.kind];
    const t = task ? tasks.find((x) => x.id === task) : undefined;
    if (t && !t.isCompleted) toggle(t.id, false);
    close();
    if (reminder?.kind === 'quran' || reminder?.kind === 'kahf') {
      setTimeout(() => navigationRef.isReady() && navigationRef.navigate('MainTabs', { screen: 'TabQuran' }), 300);
    }
  };
  const snooze = async () => {
    const minutes = reminder?.snoozeMinutes ?? 10;
    try {
      const json = (await azanNative()?.getRingingReminder?.()) ?? (reminder && at ? reminderPayload(reminder, at) : null);
      if (json) await azanNative()?.snoozeReminder?.(json, minutes);
    } catch {}
    azanNative()?.releaseLockScreen?.();
    dispatch(hideReminderAlarm());
  };
  const opensMushaf = reminder?.kind === 'quran' || reminder?.kind === 'kahf';

  return (
    <Modal visible animationType="fade" statusBarTranslucent onRequestClose={() => {}}>
      <View style={st.root}>
        <View style={st.hero}>
          <Image source={REMINDER_ART[reminder?.art ?? 'mosque']} style={st.heroImg} resizeMode="cover" />
          {/* the picture melts into the page: dim at the top for the status bar, dark at the bottom for the time */}
          <LinearGradient style={StyleSheet.absoluteFill} colors={['rgba(14,10,7,0.45)', 'rgba(14,10,7,0)', 'rgba(14,10,7,0)', 'rgba(14,10,7,0.75)', night.bg]} locations={[0, 0.18, 0.58, 0.88, 1]} />
          <Text style={[st.when, { top: insets.top + space[4] }]}>{whenLabel(reminder)}</Text>
          <View style={st.over}>
            <Text style={st.time}>{clock(now.getHours(), now.getMinutes())}</Text>
            <Text style={st.title} numberOfLines={1}>{reminder?.title || preset.name}</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={st.body} showsVerticalScrollIndicator={false}>
          {preset.quote ? <Quote quote={preset.quote} /> : null}
          {reminder?.message ? <Text style={st.message}>{reminder.message}</Text> : null}
        </ScrollView>

        <View style={[st.footer, { paddingBottom: space[4] + insets.bottom }]}>
          <View style={st.chip}>
            <Volume2 size={14} color={night.goldText} />
            <Text style={st.chipText}>{SOUND_LABEL[reminder?.sound ?? 'takbir']}</Text>
          </View>
          {opensMushaf ? (
            <TouchableOpacity style={st.cta} onPress={done} activeOpacity={0.85} accessibilityRole="button">
              <BookOpen size={20} color={night.onGold} />
              <Text style={st.ctaText}>{preset.done}</Text>
            </TouchableOpacity>
          ) : (
            <SlideToConfirm label={`اسحب: ${preset.done}`} onConfirm={done} />
          )}
          <View style={st.row}>
            <TouchableOpacity style={st.secondary} onPress={snooze} accessibilityRole="button">
              <Text style={st.secondaryText}>أجّل {toAr(reminder?.snoozeMinutes ?? 10)} دقايق</Text>
            </TouchableOpacity>
            <TouchableOpacity style={st.secondary} onPress={close} accessibilityRole="button">
              <Text style={[st.secondaryText, { color: night.textMuted }]}>إيقاف</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const whenLabel = (r?: Reminder) => {
  if (!r) return 'تذكيرك';
  if (r.time.type === 'prayer') {
    const names = { Fajr: 'الفجر', Dhuhr: 'الظهر', Asr: 'العصر', Maghrib: 'المغرب', Isha: 'العشاء' };
    const m = Math.abs(r.time.offset);
    const span = m === 60 ? 'بساعة' : m % 60 === 0 ? `بـ${toAr(m / 60)} ساعات` : `بـ${toAr(m)} دقيقة`;
    return m === 0 ? `وقت ${names[r.time.prayer]}` : `${r.time.offset < 0 ? 'قبل' : 'بعد'} ${names[r.time.prayer]} ${span}`;
  }
  return 'تذكيرك';
};

const Quote = ({ quote }: { quote: ReminderQuote }) =>
  quote.type === 'verse' ? <VerseQuote quote={quote} /> : (
    <View>
      <Text style={st.quote}>«{quote.text}»</Text>
      <Text style={st.ref}>{quote.source}</Text>
    </View>
  );

const VerseQuote = ({ quote }: { quote: Extract<ReminderQuote, { type: 'verse' }> }) => {
  const { texts } = useVerseText({ surah: quote.surah, from: quote.from, to: quote.to, key: '' });
  return (
    <View>
      <Text style={st.quote}>﴿ {texts.join(' ')} ﴾</Text>
      <Text style={st.ref}>{quote.label}</Text>
    </View>
  );
};

/** Drag the knob across to confirm; it springs back if let go early. RTL: it travels left. */
const SlideToConfirm = ({ label, onConfirm }: { label: string; onConfirm: () => void }) => {
  const x = useRef(new Animated.Value(0)).current;
  const width = useRef(0);
  const KNOB = 52;
  const pan = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (_, g) => x.setValue(Math.max(-(width.current - KNOB - 12), Math.min(0, g.dx))),
    onPanResponderRelease: (_, g) => {
      if (-g.dx > (width.current - KNOB) * 0.7) {
        Animated.timing(x, { toValue: -(width.current - KNOB - 12), duration: 120, useNativeDriver: true }).start(onConfirm);
      } else {
        Animated.spring(x, { toValue: 0, useNativeDriver: true }).start();
      }
    },
  })).current;
  useEffect(() => () => x.stopAnimation(), [x]);

  return (
    <View style={st.slide} onLayout={(e) => { width.current = e.nativeEvent.layout.width; }} accessibilityRole="adjustable" accessibilityLabel={label}
      accessibilityActions={[{ name: 'activate' }]} onAccessibilityAction={onConfirm}>
      <Animated.View style={[st.knob, { transform: [{ translateX: x }] }]} {...pan.panHandlers}>
        <ChevronsLeft size={24} color={night.onGold} />
      </Animated.View>
      <Text style={st.slideText}>{label}</Text>
    </View>
  );
};

const st = StyleSheet.create({
  root: { flex: 1, backgroundColor: night.bg },
  hero: { height: '58%', width: '100%', justifyContent: 'flex-end', overflow: 'hidden' },
  heroImg: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' },
  when: { position: 'absolute', alignSelf: 'center', ...type.label, color: '#e9dcc6' },
  over: { alignItems: 'center', paddingBottom: space[2] },
  time: { fontFamily: 'Tajawal_800ExtraBold', fontSize: 64, lineHeight: 72, color: night.text },
  title: { fontFamily: 'Amiri_700Bold', fontSize: 32, lineHeight: 48, color: night.goldText, paddingHorizontal: space[5] },
  body: { paddingHorizontal: space[6], paddingTop: space[3], alignItems: 'center' },
  quote: { fontFamily: 'Amiri_400Regular', fontSize: 20, lineHeight: 36, color: night.text, textAlign: 'center' },
  ref: { ...type.caption, color: night.gold, textAlign: 'center', marginTop: 2 },
  message: { ...type.body, color: night.textSoft, textAlign: 'center', marginTop: space[3] },
  footer: { paddingHorizontal: space[5], gap: space[3], alignItems: 'center' },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: night.goldSoft, borderWidth: 1, borderColor: night.goldLineSoft, borderRadius: radius.pill, paddingHorizontal: space[4], paddingVertical: 5 },
  chipText: { ...type.caption, color: night.goldText },
  cta: { alignSelf: 'stretch', height: 60, borderRadius: radius.card, backgroundColor: night.gold, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space[2] },
  ctaText: { fontFamily: 'Tajawal_800ExtraBold', fontSize: 17, color: night.onGold },
  slide: { alignSelf: 'stretch', height: 64, borderRadius: radius.pill, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: night.goldLine, flexDirection: 'row', alignItems: 'center', padding: 6 },
  knob: { width: 52, height: 52, borderRadius: 26, backgroundColor: night.gold, alignItems: 'center', justifyContent: 'center', zIndex: 2 },
  slideText: { flex: 1, textAlign: 'center', fontFamily: 'Tajawal_700Bold', fontSize: 16, color: night.text, marginEnd: 52 },
  row: { flexDirection: 'row', gap: space[3], alignSelf: 'stretch' },
  secondary: { flex: 1, alignItems: 'center', paddingVertical: space[3], borderRadius: radius.card, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  secondaryText: { ...type.bodyMedium, color: night.text },
});
