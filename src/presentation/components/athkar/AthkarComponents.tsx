import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { CheckCircle2 } from 'lucide-react-native';
import { AthkarItem } from '../../../shared/constants/athkar';
import { SkyBackdrop } from '../home/SkyHero';
import { toAr } from '../../../shared/utils/format';
import { colors, radius, space, type, themed } from '../../../shared/theme/tokens';

export type AthkarTab = 'morning' | 'evening';

/**
 * The home sky over the athkar: dawn with the sun rising on its arc for the morning,
 * the dusk sky with stars and a crescent for the evening, then how many are done.
 */
export const AthkarSky = ({ tab, subtitle, actions, doneItems, totalItems, progress }: {
  tab: AthkarTab; subtitle: string; actions: React.ReactNode; doneItems: number; totalItems: number; progress: number;
}) => {
  const { width: W } = useWindowDimensions();
  const morning = tab === 'morning';
  return (
    <SkyBackdrop phase={morning ? 'dawn' : 'dusk'} title={morning ? 'أذكار الصباح' : 'أذكار المساء'} subtitle={subtitle} actions={actions}>
      {/* direction ltr: drawn in absolute coordinates */}
      <View style={{ direction: 'ltr' }}>
        <Svg width={W} height={78}>
          {morning ? (
            <>
              <Path d={`M34 72 Q${W / 2} -6 ${W - 34} 72`} fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth={1.2} strokeDasharray="3 6" />
              <Circle cx={W * 0.72} cy={34} r={22} fill="#ffd27a" opacity={0.22} />
              <Circle cx={W * 0.72} cy={34} r={9} fill="#ffd27a" />
            </>
          ) : (
            <>
              <Circle cx={W * 0.28} cy={34} r={24} fill="#dfe6ff" opacity={0.1} />
              <Path d={`M${W * 0.28 - 4} 18 a14 14 0 1 0 11 22 a11 11 0 1 1 -11 -22z`} fill="#e8eeff" opacity={0.92} />
            </>
          )}
        </Svg>
      </View>
      <View style={st.count}>
        <Text style={st.countLabel}>أتممت</Text>
        <Text style={st.countValue}>
          {toAr(doneItems)}<Text style={st.countOf}> من {toAr(totalItems)}</Text>
        </Text>
        <View style={st.bar}><View style={[st.barFill, { width: `${Math.round(progress * 100)}%` }]} /></View>
      </View>
    </SkyBackdrop>
  );
};

const CountRing = ({ count, target, size = 46 }: { count: number; target: number; size?: number }) => {
  const r = (size - 6) / 2;
  const c = 2 * Math.PI * r;
  const p = Math.min(1, count / target);
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,0.12)" strokeWidth={3} fill="none" />
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={colors.gold} strokeWidth={3} fill="none" strokeLinecap="round"
          strokeDasharray={`${c * p} ${c}`} transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      </Svg>
      <Text style={st.ringText}>{toAr(count)}/{toAr(target)}</Text>
    </View>
  );
};

/** Done: one quiet line. Current: the gold card. The rest: full text to read along. */
export const AthkarCard = ({ item, currentCount, isCurrent, onToggle }: {
  item: AthkarItem; currentCount: number; isCurrent: boolean; onToggle: (item: AthkarItem) => void;
}) => {
  const done = currentCount >= item.count;
  const label = `${item.text}. ${toAr(currentCount)} من ${toAr(item.count)}`;

  if (done) {
    return (
      <View style={st.doneRow} accessibilityLabel={`${label}. تم`}>
        <CheckCircle2 size={18} color={colors.success} />
        <Text style={st.doneText} numberOfLines={1}>{item.text}</Text>
        <Text style={st.doneCount}>{toAr(item.count)}/{toAr(item.count)}</Text>
      </View>
    );
  }

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => onToggle(item)}
      style={[st.card, isCurrent && st.cardCurrent]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      {isCurrent ? <Text style={st.currentTag}>الذكر الحالي</Text> : null}
      <Text style={st.text}>{item.text}</Text>
      <View style={st.cardFoot}>
        <Text style={st.reward} numberOfLines={isCurrent ? undefined : 2}>
          {item.reward ?? (item.count > 1 ? `${toAr(item.count)} مرات` : 'مرة واحدة')}
        </Text>
        <CountRing count={currentCount} target={item.count} />
      </View>
    </TouchableOpacity>
  );
};

const st = themed(() => ({
  count: { alignItems: 'center', marginTop: -space[2], paddingBottom: space[6] },
  countLabel: { fontFamily: 'Tajawal_500Medium', fontSize: 14, color: 'rgba(255,255,255,0.8)' },
  countValue: { fontFamily: 'Tajawal_800ExtraBold', fontSize: 48, lineHeight: 60, color: '#fff', textShadowColor: 'rgba(0,0,0,0.35)', textShadowRadius: 12 },
  countOf: { fontFamily: 'Tajawal_500Medium', fontSize: 18, color: 'rgba(255,255,255,0.7)' },
  bar: { width: '60%', height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.18)', marginTop: space[2], overflow: 'hidden' },
  barFill: { height: 4, borderRadius: 2, backgroundColor: colors.gold },

  doneRow: {
    flexDirection: 'row', alignItems: 'center', gap: space[2], marginBottom: space[2],
    backgroundColor: colors.card, borderWidth: 1, borderColor: colors.card,
    borderRadius: radius.card, paddingHorizontal: space[3], paddingVertical: space[3],
  },
  doneText: { ...type.caption, color: colors.textMuted, flex: 1 },
  doneCount: { ...type.caption, color: colors.textMuted },

  card: {
    marginBottom: space[2], backgroundColor: colors.card, borderWidth: 1, borderColor: colors.cardBorder,
    borderRadius: radius.card, padding: space[4],
  },
  cardCurrent: { backgroundColor: colors.surfaceRaised, borderColor: colors.goldLine },
  currentTag: { ...type.caption, color: colors.gold, marginBottom: space[1] },
  text: { fontFamily: 'Amiri_700Bold', fontSize: 20, color: colors.text, lineHeight: 38 },
  cardFoot: { flexDirection: 'row', alignItems: 'center', gap: space[3], marginTop: space[3] },
  reward: { ...type.caption, color: colors.textMuted, flex: 1, lineHeight: 18 },
  ringText: { fontFamily: 'Tajawal_700Bold', fontSize: 12, color: colors.goldText },
}));
