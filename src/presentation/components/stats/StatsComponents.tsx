import React from 'react';
import { View, Text } from 'react-native';
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
