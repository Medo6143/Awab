import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import { colors } from '../../../shared/theme/tokens';

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
export const StarBadge = ({ label, size = 34, color = colors.goldDeep, textColor = colors.paperInk }: { label: string; size?: number; color?: string; textColor?: string }) => (
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
});
