import React, { useMemo, useRef, useState } from 'react';
import { Animated, PanResponder, Text, TouchableOpacity, View } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { colors, icon, radius, space, themed, type } from '../../../shared/theme/tokens';
import { useAccent } from '../../../shared/theme/useAccent';
import { toAr } from '../../../shared/utils/format';
import type { DayStats } from '../../store/slices/statsSlice';

export const MONTHS = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
/** The week starts on Saturday, as on Egyptian calendars. */
const WEEK = ['سبت', 'أحد', 'اثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة'];

const key = (y: number, m: number, d: number) => `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

/** How full a day was, 0..3: tasks ticked, plus a point each for dhikr and Quran. */
export const dayLevel = (r?: Partial<DayStats>) => {
  if (!r) return 0;
  const score = (r.prayers || []).length + (r.dhikrCount ? 1 : 0) + ((r.quranPages || []).length ? 1 : 0);
  return score >= 6 ? 3 : score >= 3 ? 2 : score > 0 ? 1 : 0;
};

const FILL = [0, 0.22, 0.5, 1];

type Props = {
  byDay: Record<string, Partial<DayStats>>;
  /** Days that were a return after a gap: a small dot under the day. */
  returnDays?: Set<string>;
  onDayPress: (dateKey: string) => void;
  /** The shown month's harvest (month is 0..11). */
  onMonthPress: (year: number, month: number) => void;
  onYearPress: (year: number) => void;
};

/**
 * The worship log as a month calendar: each day tinted by how full it was, today ringed, days
 * to come faint. Arrows or a sideways swipe move between months (not past this one); a day
 * opens its report, the buttons under it the month's and the year's.
 */
export const IbadaCalendar = ({ byDay, returnDays, onDayPress, onMonthPress, onYearPress }: Props) => {
  const accent = useAccent();
  const now = new Date();
  const [shown, setShown] = useState({ y: now.getFullYear(), m: now.getMonth() });
  const slide = useRef(new Animated.Value(0)).current;
  const atNow = shown.y === now.getFullYear() && shown.m === now.getMonth();
  const first = useMemo(() => Object.keys(byDay).sort()[0], [byDay]);
  const atFirst = !!first && key(shown.y, shown.m, 1) <= first;

  const move = (by: 1 | -1) => {
    if ((by === 1 && atNow) || (by === -1 && atFirst)) return;
    // the next month comes in from the left, the earlier one from the right (Arabic reading order)
    slide.setValue(by === 1 ? -40 : 40);
    Animated.timing(slide, { toValue: 0, duration: 220, useNativeDriver: true }).start();
    setShown(({ y, m }) => {
      const d = new Date(y, m + by, 1);
      return { y: d.getFullYear(), m: d.getMonth() };
    });
  };
  const moveRef = useRef(move);
  moveRef.current = move;

  const pan = useRef(PanResponder.create({
    onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 14 && Math.abs(g.dx) > Math.abs(g.dy) * 2,
    onPanResponderRelease: (_, g) => {
      if (g.dx > 50) moveRef.current(1);       // finger to the right: on to the next month
      else if (g.dx < -50) moveRef.current(-1);
    },
  })).current;

  const { weeks, summary } = useMemo(() => {
    const days = new Date(shown.y, shown.m + 1, 0).getDate();
    const lead = (new Date(shown.y, shown.m, 1).getDay() + 1) % 7; // Saturday = 0
    const cells: (number | null)[] = [...Array(lead).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];
    while (cells.length % 7) cells.push(null);
    const rows: (number | null)[][] = [];
    for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));
    let active = 0, tasks = 0, pages = 0;
    for (let d = 1; d <= days; d++) {
      const r = byDay[key(shown.y, shown.m, d)];
      if (!r) continue;
      active++;
      tasks += (r.prayers || []).length;
      pages += (r.quranPages || []).length;
    }
    return { weeks: rows, summary: { active, tasks, pages } };
  }, [byDay, shown]);

  const todayKey = key(now.getFullYear(), now.getMonth(), now.getDate());

  return (
    <View style={st.card} {...pan.panHandlers}>
      <View style={st.header}>
        <TouchableOpacity onPress={() => move(-1)} disabled={atFirst} style={[st.arrow, atFirst && st.off]} accessibilityLabel="الشهر اللي فات" hitSlop={8}>
          <ChevronRight size={icon.size.md} color={colors.text} strokeWidth={icon.stroke} />
        </TouchableOpacity>
        <View style={st.titleWrap}>
          <Text style={st.title}>{MONTHS[shown.m]} {toAr(shown.y)}</Text>
          <Text style={st.summary}>
            {toAr(summary.active)} يوم · {toAr(summary.tasks)} عبادة · {toAr(summary.pages)} صفحة
          </Text>
        </View>
        <TouchableOpacity onPress={() => move(1)} disabled={atNow} style={[st.arrow, atNow && st.off]} accessibilityLabel="الشهر الجاي" hitSlop={8}>
          <ChevronLeft size={icon.size.md} color={colors.text} strokeWidth={icon.stroke} />
        </TouchableOpacity>
      </View>

      <View style={st.week}>
        {WEEK.map((w) => <Text key={w} style={st.weekDay}>{w}</Text>)}
      </View>

      <Animated.View style={{ transform: [{ translateX: slide }] }}>
        {weeks.map((row, i) => (
          <View key={i} style={st.week}>
            {row.map((d, j) => {
              if (d == null) return <View key={j} style={st.cell} />;
              const k = key(shown.y, shown.m, d);
              const future = k > todayKey;
              const level = future ? 0 : dayLevel(byDay[k]);
              const isToday = k === todayKey;
              return (
                <View key={j} style={st.cell}>
                  <TouchableOpacity
                    disabled={future}
                    onPress={() => onDayPress(k)}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityLabel={`${toAr(d)} ${MONTHS[shown.m]}`}
                    style={[st.day, isToday && { borderColor: accent.accent, borderWidth: 2 }]}
                  >
                    {level > 0 ? <View style={[st.fill, { backgroundColor: accent.accent, opacity: FILL[level] }]} /> : null}
                    <Text style={[st.dayNum, future && st.future, level === 3 && { color: accent.onAccent }]}>{toAr(d)}</Text>
                  </TouchableOpacity>
                  {returnDays?.has(k) ? <View style={[st.returnDot, { backgroundColor: accent.accent }]} /> : <View style={st.returnDotSpace} />}
                </View>
              );
            })}
          </View>
        ))}
      </Animated.View>

      <View style={st.legend}>
        <Text style={st.legendText}>أقل</Text>
        {FILL.map((o, i) => (
          <View key={i} style={[st.legendDot, i === 0 ? st.legendEmpty : { backgroundColor: accent.accent, opacity: o }]} />
        ))}
        <Text style={st.legendText}>أكتر</Text>
      </View>

      {returnDays && returnDays.size ? <Text style={st.returnNote}>النقطة تحت اليوم: يوم رجعت فيه بعد غياب</Text> : null}

      <View style={st.actions}>
        <TouchableOpacity onPress={() => onMonthPress(shown.y, shown.m)} style={[st.action, { backgroundColor: accent.accentSoft }]} accessibilityRole="button">
          <Text style={[st.actionText, { color: accent.accent }]}>حصاد {MONTHS[shown.m]}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onYearPress(shown.y)} style={[st.action, st.actionGap, { backgroundColor: accent.accentSoft }]} accessibilityRole="button">
          <Text style={[st.actionText, { color: accent.accent }]}>مسيرة {toAr(shown.y)}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const st = themed(() => ({
  card: { backgroundColor: colors.surface, borderRadius: radius.card, padding: space[4], marginBottom: space[4] },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: space[3] },
  arrow: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceRaised },
  off: { opacity: 0.35 },
  titleWrap: { flex: 1, alignItems: 'center' },
  title: { ...type.h2, color: colors.text },
  summary: { ...type.caption, color: colors.textMuted },
  week: { flexDirection: 'row' },
  weekDay: { flex: 1, textAlign: 'center', ...type.caption, fontSize: 11, color: colors.textFaint, marginBottom: space[1] },
  cell: { flex: 1, alignItems: 'center', paddingVertical: 3 },
  day: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  fill: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 },
  dayNum: { ...type.label, color: colors.text },
  future: { color: colors.textFaint },
  returnDot: { width: 5, height: 5, borderRadius: 3, marginTop: 2 },
  returnDotSpace: { height: 7 },
  returnNote: { ...type.caption, fontSize: 11, color: colors.textFaint, textAlign: 'center', marginTop: space[1] },
  legend: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: space[3] },
  legendText: { ...type.caption, fontSize: 11, color: colors.textFaint, marginHorizontal: space[1] },
  legendDot: { width: 12, height: 12, borderRadius: 6, marginHorizontal: 2 },
  legendEmpty: { borderWidth: 1, borderColor: colors.hairline },
  actions: { flexDirection: 'row', marginTop: space[4] },
  action: { flex: 1, height: 40, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  actionGap: { marginStart: space[2] },
  actionText: { ...type.label },
}));
