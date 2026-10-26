import React, { useRef } from 'react';
import { Animated, Image, StyleSheet, Text, View } from 'react-native';
import { AnatomicalHeart } from '../heart/AnatomicalHeart';
import { formatDate, khatmaTitle, MODE_NOUN } from '../heart/khatmaFormat';
import type { HeartMode } from '../../store/slices/quranSlice';
import { toAr } from '../../../shared/utils/format';
import { colors } from '../../../shared/theme/tokens';
import { shareCardSize } from './ImageShareModal';

const LOGO = require('../../../../assets/icon.png');

type Props = {
  completedSurahs: number[];
  mode: HeartMode;
  number: number;              // which khatma this heart belongs to
  startedAt: string | null;
  finishedAt?: string | null;  // set for a finished khatma
};

/** 9:16 card of a heart (current or finished khatma) with its number and dates. */
export const HeartShareCard = ({ completedSurahs, mode, number, startedAt, finishedAt }: Props) => {
  const { w, h } = shareCardSize();
  const u = w / 100;
  const still = useRef(new Animated.Value(1)).current; // no pulse in a picture
  const done = completedSurahs.length;

  return (
    <View style={[st.card, { width: w, height: h, padding: 7 * u }]}>
      <View style={[st.frame, { top: 3.5 * u, left: 3.5 * u, right: 3.5 * u, bottom: 3.5 * u, borderRadius: 4 * u }]} />

      <View style={{ alignItems: 'center' }}>
        <Text allowFontScaling={false} style={[st.title, { fontSize: 7 * u }]}>نور القرآن في قلبي</Text>
        <Text allowFontScaling={false} style={[st.sub, { fontSize: 3.8 * u, marginTop: 1.4 * u }]}>
          {khatmaTitle(number)} · {MODE_NOUN[mode]}
        </Text>
        {!finishedAt ? (
          <Text allowFontScaling={false} style={[st.muted, { fontSize: 3.2 * u, marginTop: 0.8 * u }]}>{toAr(done)} سورة من ١١٤</Text>
        ) : null}
      </View>

      <View style={{ alignItems: 'center' }}>
        <AnatomicalHeart pulseAnim={still} completedSurahs={completedSurahs} progress={done / 114} size={w * 0.8} />
      </View>

      <View style={[st.dates, { borderRadius: 3 * u, paddingVertical: 2.6 * u, paddingHorizontal: 4 * u }]}>
        <DateCell label="البداية" value={startedAt ? formatDate(startedAt) : '—'} u={u} />
        <View style={st.divider} />
        <DateCell label="النهاية" value={finishedAt ? formatDate(finishedAt) : 'لم تكتمل بعد'} u={u} />
      </View>

      <View style={[st.brand, { gap: 2.2 * u }]}>
        <Image source={LOGO} style={{ width: 8 * u, height: 8 * u, borderRadius: 2 * u }} />
        <Text allowFontScaling={false} style={[st.brandName, { fontSize: 4.2 * u }]}>أوّاب</Text>
      </View>
    </View>
  );
};

const DateCell = ({ label, value, u }: { label: string; value: string; u: number }) => (
  <View style={{ flex: 1, alignItems: 'center' }}>
    <Text allowFontScaling={false} style={[st.muted, { fontSize: 3 * u }]}>{label}</Text>
    <Text allowFontScaling={false} style={[st.dateValue, { fontSize: 3.8 * u, marginTop: 0.6 * u }]}>{value}</Text>
  </View>
);

const st = StyleSheet.create({
  // explicit: the share preview wraps cards in an LTR container for positioning
  card: { backgroundColor: colors.bg, justifyContent: 'space-between', direction: 'rtl' },
  frame: { position: 'absolute', borderWidth: 1.2, borderColor: colors.goldLine },
  title: { fontFamily: 'Tajawal_800ExtraBold', color: colors.text },
  sub: { fontFamily: 'Tajawal_700Bold', color: colors.gold },
  muted: { fontFamily: 'Tajawal_500Medium', color: colors.textMuted },
  dates: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface },
  divider: { width: 1, alignSelf: 'stretch', backgroundColor: colors.goldLine },
  dateValue: { fontFamily: 'Tajawal_700Bold', color: colors.text },
  brand: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  brandName: { fontFamily: 'Tajawal_800ExtraBold', color: colors.gold },
});
