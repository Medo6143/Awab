import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import * as Haptics from 'expo-haptics';
import { BookOpen, Check, Minus, Plus, SlidersHorizontal } from 'lucide-react-native';
import { RootState } from '../../store';
import { addWirdToday, setTodayWird, setWirdGoal } from '../../store/slices/quranSlice';
import { getLocalToday } from '../../store/slices/statsSlice';
import { DEFAULT_WIRD, WIRD_PRESETS, WirdMode, pagesLabel, wirdGoal } from '../../../domain/entities/wird';
import { Chip, PillButton, ProgressBar, Sheet } from '../ui';
import { toAr } from '../../../shared/utils/format';
import { colors, icon, radius, space, type } from '../../../shared/theme/tokens';

const MINUTES_PER_PAGE = 2;

/**
 * "وردك اليوم" on home: today's goal in pages, how many were read (pages opened in the
 * mushaf today), where to continue, and buttons to read, add more for today, or change the goal.
 */
export const WirdCard = ({ surahName, page, onRead }: { surahName: string; page: number; onRead: () => void }) => {
  const dispatch = useDispatch();
  const wird = { ...DEFAULT_WIRD, ...useSelector((s: RootState) => s.quran.wird) };
  const date = getLocalToday();
  const read = useSelector((s: RootState) => s.stats.dailyRecords?.[date]?.quranPages?.length ?? 0);
  const goal = wirdGoal(wird, date);
  const [sheet, setSheet] = useState<'goal' | 'more' | null>(null);

  const pick = (pages: number) => { Haptics.selectionAsync(); dispatch(setTodayWird({ date, pages })); };

  // "daily" mode and no goal yet today: ask for it right in the card
  if (goal == null) {
    return (
      <View style={st.card}>
        <View style={st.head}>
          <Text style={st.title}>حدّد وردك النهارده</Text>
          <TouchableOpacity onPress={() => setSheet('goal')} hitSlop={10} accessibilityRole="button" accessibilityLabel="إعدادات الورد">
            <SlidersHorizontal size={icon.size.md} color={colors.textMuted} strokeWidth={icon.stroke} />
          </TouchableOpacity>
        </View>
        <Text style={st.sub}>هتكمّل من صفحة {toAr(page)} · {surahName}</Text>
        <View style={st.chips}>
          {WIRD_PRESETS.map((p) => <Chip key={p.pages} size="sm" label={p.label} onPress={() => pick(p.pages)} />)}
        </View>
        <GoalSheet visible={sheet === 'goal'} onClose={() => setSheet(null)} />
      </View>
    );
  }

  const done = read >= goal;
  const left = Math.max(0, goal - read);
  return (
    <View style={[st.card, done && st.cardDone]}>
      <View style={st.head}>
        <Text style={st.title}>وردك اليوم</Text>
        <View style={[st.badge, done && st.badgeDone]}>
          {done ? <Check size={14} color={colors.onGold} strokeWidth={2.5} /> : null}
          <Text style={[st.badgeText, done && st.badgeTextDone]}>{toAr(Math.min(read, goal))} من {pagesLabel(goal)}</Text>
        </View>
      </View>
      <ProgressBar progress={goal ? read / goal : 0} style={{ marginVertical: space[3] }} />
      <Text style={st.sub}>كمّل من صفحة {toAr(page)} · {surahName}</Text>
      <Text style={st.hint}>
        {done ? 'ما شاء الله، خلّصت وردك. تقدر تزوّد لو حابب.' : `فاضل ${pagesLabel(left)}، حوالي ${toAr(left * MINUTES_PER_PAGE)} دقيقة`}
      </Text>
      <View style={st.actions}>
        <PillButton label={done ? 'اقرأ أكتر' : 'كمّل القراءة'} icon={<BookOpen size={18} color={colors.onGold} />} onPress={onRead} style={{ flex: 1 }} />
        <TouchableOpacity style={st.small} onPress={() => setSheet('more')} accessibilityRole="button" accessibilityLabel="زوّد ورد النهارده">
          <Plus size={16} color={colors.goldText} /><Text style={st.smallText}>زوّد</Text>
        </TouchableOpacity>
        <TouchableOpacity style={st.small} onPress={() => setSheet('goal')} accessibilityRole="button" accessibilityLabel="هدف الورد">
          <SlidersHorizontal size={16} color={colors.goldText} />
        </TouchableOpacity>
      </View>

      <GoalSheet visible={sheet === 'goal'} onClose={() => setSheet(null)} />
      <Sheet visible={sheet === 'more'} title="زوّد ورد النهارده" onClose={() => setSheet(null)}>
        <Text style={st.sheetHint}>الزيادة للنهارده بس، وبكره يرجع وردك زي ما هو.</Text>
        <View style={st.chips}>
          {WIRD_PRESETS.map((p) => (
            <Chip key={p.pages} label={`+ ${p.label}`} onPress={() => {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              dispatch(addWirdToday({ date, pages: p.pages }));
              setSheet(null);
            }} />
          ))}
        </View>
        {wird.extra?.date === date && wird.extra.pages > 0 ? (
          <TouchableOpacity onPress={() => { dispatch(addWirdToday({ date, pages: -wird.extra!.pages })); setSheet(null); }} style={{ marginTop: space[4] }} accessibilityRole="button">
            <Text style={st.reset}>شيل الزيادة ({pagesLabel(wird.extra.pages)})</Text>
          </TouchableOpacity>
        ) : null}
      </Sheet>
    </View>
  );
};

/** The goal: a quick pick or any number of pages, and whether it repeats daily or is chosen each day. */
const GoalSheet = ({ visible, onClose }: { visible: boolean; onClose: () => void }) => {
  const dispatch = useDispatch();
  const saved = { ...DEFAULT_WIRD, ...useSelector((s: RootState) => s.quran.wird) };
  const [pages, setPages] = useState(saved.pages);
  const [mode, setMode] = useState<WirdMode>(saved.mode);
  // start from the saved goal every time the sheet opens
  useEffect(() => { if (visible) { setPages(saved.pages); setMode(saved.mode); } }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps
  const step = (d: number) => setPages((p) => Math.max(1, Math.min(60, p + d)));
  const save = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    dispatch(setWirdGoal({ pages, mode }));
    // switching to "daily" keeps today's goal as the number just picked
    if (mode === 'daily') dispatch(setTodayWird({ date: getLocalToday(), pages }));
    onClose();
  };

  return (
    <Sheet visible={visible} title="هدف الورد" onClose={onClose}>
      <Text style={st.label}>كام صفحة في اليوم؟</Text>
      <View style={st.chips}>
        {WIRD_PRESETS.map((p) => <Chip key={p.pages} size="sm" label={p.label} selected={pages === p.pages} onPress={() => setPages(p.pages)} />)}
      </View>
      <View style={st.stepper}>
        <TouchableOpacity style={st.stepBtn} onPress={() => step(-1)} accessibilityRole="button" accessibilityLabel="أقل"><Minus size={18} color={colors.goldText} /></TouchableOpacity>
        <Text style={st.stepValue}>{pagesLabel(pages)}</Text>
        <TouchableOpacity style={st.stepBtn} onPress={() => step(1)} accessibilityRole="button" accessibilityLabel="أكتر"><Plus size={18} color={colors.goldText} /></TouchableOpacity>
      </View>

      <Text style={st.label}>التكرار</Text>
      <View style={st.chips}>
        <Chip size="sm" label="ثابت كل يوم" selected={mode === 'fixed'} onPress={() => setMode('fixed')} />
        <Chip size="sm" label="أحدده كل يوم" selected={mode === 'daily'} onPress={() => setMode('daily')} />
      </View>
      <Text style={st.sheetHint}>
        {mode === 'fixed' ? 'نفس الورد كل يوم، وتقدر تزوّد عليه في أي يوم.' : 'كل يوم الصبح هيسألك وردك النهارده قد إيه.'}
      </Text>
      <PillButton label="حفظ" onPress={save} style={{ marginTop: space[5] }} />
    </Sheet>
  );
};

const st = StyleSheet.create({
  card: { backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: radius.card, padding: space[4] },
  cardDone: { borderColor: colors.goldLine },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { ...type.bodyMedium, fontFamily: 'Tajawal_700Bold', fontSize: 16, color: colors.text },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.goldSoft, borderRadius: radius.pill, paddingHorizontal: space[3], paddingVertical: 3 },
  badgeDone: { backgroundColor: colors.gold },
  badgeText: { ...type.label, color: colors.goldText },
  badgeTextDone: { color: colors.onGold },
  sub: { ...type.caption, fontSize: 13, color: colors.textSoft, marginTop: 2 },
  hint: { ...type.caption, color: colors.textMuted, marginTop: 2 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: space[2], marginTop: space[3] },
  small: { flexDirection: 'row', alignItems: 'center', gap: 4, height: 44, paddingHorizontal: space[3], borderRadius: radius.pill, backgroundColor: colors.goldSoft },
  smallText: { ...type.label, color: colors.goldText },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space[2], marginTop: space[2] },
  label: { ...type.label, color: colors.textMuted, marginTop: space[4] },
  sheetHint: { ...type.caption, color: colors.textMuted, marginTop: space[3], lineHeight: 18 },
  reset: { ...type.label, color: colors.textMuted, textAlign: 'center' },
  stepper: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: space[3], backgroundColor: colors.surfaceRaised, borderRadius: radius.field, padding: space[2] },
  stepBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.goldSoft, alignItems: 'center', justifyContent: 'center' },
  stepValue: { ...type.h2, color: colors.text },
});
