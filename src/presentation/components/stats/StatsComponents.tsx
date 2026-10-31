import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ChevronLeft, Flame } from 'lucide-react-native';
import { s } from './StatsStyles';
import { Card, SectionTitle, ProgressBar, StatNumber } from '../ui';
import { colors } from '../../../shared/theme/tokens';
import { useAccent } from '../../../shared/theme/useAccent';
import { toAr } from '../../../shared/utils/format';

export const StatCard = ({ value, label }: { value: number | string; label: string }) => (
  <Card style={s.statCard} padding={0}>
    <StatNumber value={value} caption={label} size="h1" />
  </Card>
);

export const WeeklyActivityChart = ({ chartData, maxDhikr }: { chartData: number[]; maxDhikr: number }) => {
  const accent = useAccent();
  const today = new Date().getDay();
  return (
    <View>
      <SectionTitle title="النشاط الأسبوعي" />
      <Card>
        <View style={s.chartContainer}>
          {chartData.map((val, i) => {
            const day = (today - (6 - i) + 7) % 7;
            const isToday = i === 6;
            return (
              <View key={i} style={s.barWrapper}>
                <View style={s.barBackground}>
                  <View style={[s.barFill, { height: `${Math.max(4, (val / maxDhikr) * 100)}%`, backgroundColor: isToday ? accent.accent : accent.accentSoft }]} />
                </View>
                <Text style={[s.barLabel, isToday && { color: accent.accentText }]}>{['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'][day]}</Text>
              </View>
            );
          })}
        </View>
      </Card>
    </View>
  );
};

export const DhikrBreakdownChart = ({ details }: { details: Record<string, number> }) => {
  const data = Object.entries(details || {}).sort((a, b) => b[1] - a[1]);
  const total = data.reduce((acc, curr) => acc + curr[1], 0);
  const max = Math.max(...data.map((d) => d[1]), 1);

  return (
    <View>
      <SectionTitle title="تفاصيل الأذكار" />
      <Card>
        {data.length === 0 ? (
          <Text style={s.emptyInline}>لا توجد أذكار مسجلة بعد</Text>
        ) : (
          <>
            {data.map(([name, count]) => (
              <View key={name} style={s.dhikrBarRow}>
                <Text style={s.dhikrBarLabel} numberOfLines={1}>{name}</Text>
                <ProgressBar progress={count / max} height={10} style={{ flex: 1 }} />
                <Text style={s.dhikrBarValue}>{toAr(count)}</Text>
              </View>
            ))}
            <Text style={s.legendText}>الإجمالي {toAr(total)}</Text>
          </>
        )}
      </Card>
    </View>
  );
};

export const StatusRow = ({ icon, title, sub, last }: { icon: React.ReactNode; title: string; sub: string; last?: boolean }) => (
  <>
    <View style={s.statusRow}>
      {icon}
      <View style={s.statusText}>
        <Text style={s.statusTitle}>{title}</Text>
        <Text style={s.statusSub}>{sub}</Text>
      </View>
    </View>
    {!last ? <View style={s.divider} /> : null}
  </>
);

export const colorsRef = colors;

/** The streak, with the longest one so far. */
export const StreakCard = ({ streak, longest, onPress }: { streak: number; longest: number; onPress: () => void }) => (
  <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={s.streakCard} accessibilityRole="button" accessibilityLabel={`${streak} يوم متتالي، اضغط لعرض التقرير`}>
    <View style={s.streakIcon}><Flame size={26} color={colors.goldText} /></View>
    <View style={{ flex: 1 }}>
      <Text style={s.streakValue}>
        {toAr(streak)}<Text style={s.streakUnit}> {streak === 1 ? 'يوم' : 'يوم متتالي'}</Text>
      </Text>
      <Text style={s.streakSub}>{longest > streak ? `أطول سلسلة: ${toAr(longest)} يوم` : streak > 1 ? 'أطول سلسلة لك حتى الآن' : 'بداية مباركة، استمر'}</Text>
    </View>
    <ChevronLeft size={20} color={colors.gold} />
  </TouchableOpacity>
);

const heat = () => [colors.hairline, colors.goldLineSoft, colors.goldLine, colors.gold];

/** The last 12 weeks, a square per day, darker gold for a fuller day. */
export const Heatmap = ({ levels }: { levels: number[][] }) => (
  <View>
    <SectionTitle title="الاستمرار" />
    <Card>
      <View style={s.heatGrid}>
        {levels.map((week, w) => (
          <View key={w} style={s.heatCol}>
            {week.map((l, d) => <View key={d} style={[s.heatCell, { backgroundColor: l < 0 ? 'transparent' : heat()[l] }]} />)}
          </View>
        ))}
      </View>
      <View style={s.heatLegend}>
        <Text style={s.heatLegendText}>أقل</Text>
        {heat().map((c) => <View key={c} style={[s.heatLegendCell, { backgroundColor: c }]} />)}
        <Text style={s.heatLegendText}>أكثر</Text>
      </View>
    </Card>
  </View>
);
