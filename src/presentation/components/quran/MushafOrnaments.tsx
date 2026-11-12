import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import { colors, MushafPalette } from '../../../shared/theme/tokens';
import { toAr } from '../../../shared/utils/format';
import { SURAH_AYAH_COUNTS } from '../../../shared/constants/surahs';
import type { MushafTheme } from './mushafThemes';

/** Eight-point star (two squares, one turned 45°), the classic Islamic geometric motif. */
export const EightPointStar = ({ size, color, filled = false, strokeWidth = 1.2 }: { size: number; color: string; filled?: boolean; strokeWidth?: number }) => {
  const h = 6.5; // half side in a 20×20 box
  const sq = { x: -h, y: -h, width: 2 * h, height: 2 * h };
  const paint = filled ? { fill: color } : { fill: 'none', stroke: color, strokeWidth };
  return (
    <Svg width={size} height={size} viewBox="-10 -10 20 20">
      <Rect {...sq} {...paint} />
      <Rect {...sq} {...paint} transform="rotate(45)" />
    </Svg>
  );
};

/** A star with a number in it, e.g. the page number under the Mushaf page. */
export const StarBadge = ({ label, size = 34, color = colors.paperQuote, textColor = colors.paperInk }: { label: string; size?: number; color?: string; textColor?: string }) => (
  <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
    <View style={StyleSheet.absoluteFill}>
      <EightPointStar size={size} color={color} />
    </View>
    <Text allowFontScaling={false} style={{ fontFamily: 'Tajawal_700Bold', fontSize: size * 0.34, color: textColor }}>{label}</Text>
  </View>
);

const CORNER = 18;

/**
 * The geometric frame: two hairline gold rules with a filled eight-point star on each
 * corner. The stars sit on the paper colour so they cut the rules cleanly.
 */
export const GeometricFrame = ({ children, paper = colors.paper, gold = '#c9a24a', starColor = '#b8902f' }: { children: React.ReactNode; paper?: string; gold?: string; starColor?: string }) => (
  <View style={[st.outer, { borderColor: gold }]}>
    <View style={[st.inner, { borderColor: gold }]}>{children}</View>
    {(['tl', 'tr', 'bl', 'br'] as const).map((k) => (
      <View
        key={k}
        pointerEvents="none"
        style={[st.corner, { backgroundColor: paper }, k[0] === 't' ? { top: -CORNER / 2 } : { bottom: -CORNER / 2 }, k[1] === 'l' ? { left: -CORNER / 2 } : { right: -CORNER / 2 }]}
      >
        <EightPointStar size={CORNER} color={starColor} filled />
      </View>
    ))}
  </View>
);

const st = StyleSheet.create({
  outer: { flex: 1, borderWidth: 1, borderRadius: 10, padding: 3 },
  inner: { flex: 1, borderWidth: 1, borderRadius: 7, overflow: 'hidden' },
  corner: { position: 'absolute', width: CORNER, height: CORNER, borderRadius: CORNER / 2, zIndex: 2 },
  madaniOuter: { flex: 1, borderWidth: 1 },
  madaniBand: { flex: 1, borderWidth: 1, padding: 6 },
  madaniInner: { flex: 1, borderWidth: 1, overflow: 'hidden' },
  madaniCorner: { position: 'absolute', width: 8, height: 8, transform: [{ rotate: '45deg' }], zIndex: 2 },
  band: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8, marginBottom: 12 },
  bandRule: { flex: 1, height: 1 },
  bandPill: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 20, paddingVertical: 2 },
  bandTitle: { fontFamily: 'Amiri_700Bold', fontSize: 26, textAlign: 'center', writingDirection: 'rtl' },
  plainTitle: { fontFamily: 'Amiri_700Bold', fontSize: 22, textAlign: 'center', marginTop: 8, marginBottom: 8 },
  cartouche: { borderWidth: 2, borderRadius: 6, padding: 3, marginTop: 6, marginBottom: 10 },
  cartoucheInner: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 4, paddingHorizontal: 6, paddingVertical: 4, gap: 6 },
  medallion: { width: 50, borderWidth: 1, borderRadius: 25, paddingVertical: 2, alignItems: 'center' },
  medallionLabel: { fontFamily: 'Tajawal_500Medium', fontSize: 9, lineHeight: 12 },
  medallionValue: { fontFamily: 'Tajawal_700Bold', fontSize: 12, lineHeight: 15 },
  cartoucheTitle: { flex: 1, fontFamily: 'AmiriQuran_400Regular', fontSize: 24, lineHeight: 40, textAlign: 'center', writingDirection: 'rtl' },
});

/**
 * The Madani border: a thick band between two hairlines, with a small square on each corner,
 * like the printed Madinah mushaf.
 */
const MadaniFrame = ({ children, p }: { children: React.ReactNode; p: MushafPalette }) => (
  <View style={[st.madaniOuter, { borderColor: p.frameDeep }]}>
    <View style={[st.madaniBand, { borderColor: p.frame, backgroundColor: p.band }]}>
      <View style={[st.madaniInner, { borderColor: p.frameDeep, backgroundColor: p.paper }]}>{children}</View>
    </View>
    {(['tl', 'tr', 'bl', 'br'] as const).map((k) => (
      <View
        key={k}
        pointerEvents="none"
        style={[st.madaniCorner, { backgroundColor: p.frameDeep }, k[0] === 't' ? { top: -3 } : { bottom: -3 }, k[1] === 'l' ? { left: -3 } : { right: -3 }]}
      />
    ))}
  </View>
);

/** Two plain rules, no ornament. */
const DoubleFrame = ({ children, p }: { children: React.ReactNode; p: MushafPalette }) => (
  <View style={[st.outer, { borderColor: p.frame, borderWidth: 2 }]}>
    <View style={[st.inner, { borderColor: p.frame }]}>{children}</View>
  </View>
);

/** The border the chosen page design draws around the page. */
export const MushafFrame = ({ theme, children }: { theme: MushafTheme; children: React.ReactNode }) => {
  const p = theme.palette;
  if (theme.frame === 'madani') return <MadaniFrame p={p}>{children}</MadaniFrame>;
  if (theme.frame === 'double') return <DoubleFrame p={p}>{children}</DoubleFrame>;
  if (theme.frame === 'none') return <View style={{ flex: 1 }}>{children}</View>;
  return <GeometricFrame paper={p.paper} gold={p.frame} starColor={p.frameDeep}>{children}</GeometricFrame>;
};

/**
 * The title at the start of a surah, in the page design's style: a ruled band with the name,
 * the Madani cartouche (its order on the right, its ayah count on the left, read RTL), or the
 * name alone.
 */
export const SurahHeader = ({ theme, name, number }: { theme: MushafTheme; name: string; number: number }) => {
  const p = theme.palette;
  if (theme.surahHeader === 'plain') {
    return <Text style={[st.plainTitle, { color: p.muted }]}>{name}</Text>;
  }
  if (theme.surahHeader === 'band') {
    return (
      <View style={st.band}>
        <View style={[st.bandRule, { backgroundColor: p.frame }]} />
        <View style={[st.bandPill, { borderColor: p.frame }]}>
          <Text style={[st.bandTitle, { color: p.ink }]}>{name}</Text>
        </View>
        <View style={[st.bandRule, { backgroundColor: p.frame }]} />
      </View>
    );
  }
  // a plain flexDirection row already runs right to left: children in reading order
  const filled = theme.id === 'green';
  const ink = filled ? p.paper : p.ink;
  return (
    <View style={[st.cartouche, { borderColor: p.frameDeep, backgroundColor: p.band }]}>
      <View style={[st.cartoucheInner, { borderColor: filled ? p.paper : p.frame }]}>
        <View style={[st.medallion, { borderColor: filled ? p.paper : p.frameDeep }]}>
          <Text allowFontScaling={false} style={[st.medallionLabel, { color: ink }]}>ترتيبها</Text>
          <Text allowFontScaling={false} style={[st.medallionValue, { color: ink }]}>{toAr(number)}</Text>
        </View>
        <Text style={[st.cartoucheTitle, { color: ink }]} numberOfLines={1} adjustsFontSizeToFit>{name}</Text>
        <View style={[st.medallion, { borderColor: filled ? p.paper : p.frameDeep }]}>
          <Text allowFontScaling={false} style={[st.medallionLabel, { color: ink }]}>آياتها</Text>
          <Text allowFontScaling={false} style={[st.medallionValue, { color: ink }]}>{toAr(SURAH_AYAH_COUNTS[number - 1] ?? 0)}</Text>
        </View>
      </View>
    </View>
  );
};
