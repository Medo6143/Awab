import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { ChevronLeft } from 'lucide-react-native';
import { toAr } from '../../../shared/utils/format';
import { colors, radius, space, type } from '../../../shared/theme/tokens';

const Ring = ({ progress, size = 44 }: { progress: number; size?: number }) => {
  const r = (size - 6) / 2;
  const c = 2 * Math.PI * r;
  const p = Math.max(0, Math.min(1, progress));
  return (
    <Svg width={size} height={size}>
      <Circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,0.1)" strokeWidth={4} fill="none" />
      <Circle cx={size / 2} cy={size / 2} r={r} stroke={colors.gold} strokeWidth={4} fill="none" strokeLinecap="round"
        strokeDasharray={`${c * p} ${c}`} transform={`rotate(-90 ${size / 2} ${size / 2})`} />
    </Svg>
  );
};

/** "أكمل وردك": back to the mushaf page you stopped on. */
export const ContinueCard = ({ surahName, page, onPress }: { surahName: string; page: number; onPress: () => void }) => (
  <TouchableOpacity activeOpacity={0.8} style={st.continue} onPress={onPress} accessibilityRole="button" accessibilityLabel={`أكمل وردك، ${surahName} صفحة ${page}`}>
    <Ring progress={page / 604} />
    <View style={{ flex: 1 }}>
      <Text style={st.continueTitle}>أكمل وردك</Text>
      <Text style={st.continueSub}>{surahName} · صفحة {toAr(page)} من ٦٠٤</Text>
    </View>
    <ChevronLeft size={20} color={colors.gold} />
  </TouchableOpacity>
);

export type DayStat = { key: string; label: string; value: number; total?: number; onPress: () => void };

/** Three numbers for today, each opening its section. */
export const DayStats = ({ items }: { items: DayStat[] }) => (
  <View style={st.stats}>
    {items.map((s) => (
      <TouchableOpacity key={s.key} activeOpacity={0.8} style={st.stat} onPress={s.onPress} accessibilityRole="button" accessibilityLabel={`${s.label} ${s.value}${s.total ? ` من ${s.total}` : ''}`}>
        <Text style={st.statLabel} numberOfLines={1}>{s.label}</Text>
        <Text style={st.statValue}>
          {toAr(s.value)}
          {s.total ? <Text style={st.statTotal}>/{toAr(s.total)}</Text> : null}
        </Text>
        {s.total ? (
          <View style={st.bar}><View style={[st.barFill, { width: `${Math.min(100, (s.value / s.total) * 100)}%` }]} /></View>
        ) : null}
      </TouchableOpacity>
    ))}
  </View>
);

const st = StyleSheet.create({
  continue: {
    flexDirection: 'row', alignItems: 'center', gap: space[3],
    backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: radius.card, padding: space[4],
  },
  continueTitle: { ...type.bodyMedium, fontFamily: 'Tajawal_700Bold', color: colors.text },
  continueSub: { ...type.caption, color: colors.textMuted, marginTop: 2 },
  stats: { flexDirection: 'row', gap: space[2], marginTop: space[2] },
  stat: {
    flex: 1, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: radius.card, padding: space[3],
  },
  statLabel: { ...type.caption, color: colors.textMuted },
  statValue: { fontFamily: 'Tajawal_800ExtraBold', fontSize: 22, color: colors.text, marginTop: 2 },
  statTotal: { fontFamily: 'Tajawal_500Medium', fontSize: 13, color: colors.textMuted },
  bar: { height: 3, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.1)', marginTop: space[2], overflow: 'hidden' },
  barFill: { height: 3, borderRadius: 2, backgroundColor: colors.gold },
});
