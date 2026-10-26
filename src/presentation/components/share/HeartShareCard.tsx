import React, { useRef } from 'react';
import { Animated, Image, StyleSheet, Text, View } from 'react-native';
import { AnatomicalHeart } from '../heart/AnatomicalHeart';
import { toAr } from '../../../shared/utils/format';
import { colors } from '../../../shared/theme/tokens';
import { shareCardSize } from './ImageShareModal';

const LOGO = require('../../../../assets/icon.png');

/** 9:16 card of the user's heart with their progress, for saving or sharing. */
export const HeartShareCard = ({ completedSurahs, khatmaCount }: { completedSurahs: number[]; khatmaCount: number }) => {
  const { w, h } = shareCardSize();
  const u = w / 100;
  const still = useRef(new Animated.Value(1)).current; // no pulse in a picture
  const done = completedSurahs.length;

  return (
    <View style={[st.card, { width: w, height: h, padding: 7 * u }]}>
      <View style={[st.frame, { top: 3.5 * u, left: 3.5 * u, right: 3.5 * u, bottom: 3.5 * u, borderRadius: 4 * u }]} />

      <View style={{ alignItems: 'center' }}>
        <Text allowFontScaling={false} style={[st.title, { fontSize: 7 * u }]}>نور القرآن في قلبي</Text>
        <Text allowFontScaling={false} style={[st.sub, { fontSize: 3.6 * u, marginTop: 1.4 * u }]}>
          {toAr(done)} سورة من ١١٤{khatmaCount > 0 ? ` · ${toAr(khatmaCount)} ختمة` : ''}
        </Text>
      </View>

      <View style={{ alignItems: 'center' }}>
        <AnatomicalHeart pulseAnim={still} completedSurahs={completedSurahs} progress={done / 114} size={w * 0.86} />
      </View>

      <View style={[st.brand, { gap: 2.2 * u }]}>
        <Image source={LOGO} style={{ width: 9 * u, height: 9 * u, borderRadius: 2.2 * u }} />
        <Text allowFontScaling={false} style={[st.brandName, { fontSize: 4.4 * u }]}>أوّاب</Text>
      </View>
    </View>
  );
};

const st = StyleSheet.create({
  // explicit: the share preview wraps cards in an LTR container for positioning
  card: { backgroundColor: colors.bg, justifyContent: 'space-between', direction: 'rtl' },
  frame: { position: 'absolute', borderWidth: 1.2, borderColor: colors.goldLine },
  title: { fontFamily: 'Tajawal_800ExtraBold', color: colors.text },
  sub: { fontFamily: 'Tajawal_700Bold', color: colors.gold },
  brand: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  brandName: { fontFamily: 'Tajawal_800ExtraBold', color: colors.gold },
});
