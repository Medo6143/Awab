import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { toAr } from '../../../shared/utils/format';
import { colors, radius, space, type, themed } from '../../../shared/theme/tokens';

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

const st = themed(() => ({
  stats: { flexDirection: 'row', gap: space[2], marginTop: space[2] },
  stat: {
    flex: 1, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.cardBorder,
    borderRadius: radius.card, padding: space[3],
  },
  statLabel: { ...type.caption, color: colors.textMuted },
  statValue: { fontFamily: 'Tajawal_800ExtraBold', fontSize: 22, color: colors.text, marginTop: 2 },
  statTotal: { fontFamily: 'Tajawal_500Medium', fontSize: 13, color: colors.textMuted },
  bar: { height: 3, borderRadius: 2, backgroundColor: colors.cardBorder, marginTop: space[2], overflow: 'hidden' },
  barFill: { height: 3, borderRadius: 2, backgroundColor: colors.gold },
}));
