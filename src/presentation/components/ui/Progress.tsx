import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { colors, radius, type, themed } from '../../../shared/theme/tokens';
import { useAccent } from '../../../shared/theme/useAccent';
import { toAr } from '../../../shared/utils/format';

const clamp01 = (n: number) => (Number.isFinite(n) ? Math.max(0, Math.min(1, n)) : 0);

export const ProgressBar = ({ progress, height = 6, color, style }: { progress: number; height?: number; color?: string; style?: object }) => {
  const accent = useAccent();
  return (
    <View style={[styles.track, { height, borderRadius: height / 2 }, style]} accessibilityRole="progressbar">
      <View style={[styles.fill, { width: `${clamp01(progress) * 100}%`, backgroundColor: color ?? accent.accent, borderRadius: height / 2 }]} />
    </View>
  );
};

type RingProps = {
  progress: number;
  size?: number;
  stroke?: number;
  label?: string;       // text inside the ring (defaults to percentage)
  caption?: string;     // text under the ring
  icon?: React.ReactNode;
  color?: string;
};

export const ProgressRing = ({ progress, size = 84, stroke = 8, label, caption, icon, color }: RingProps) => {
  const accent = useAccent();
  const p = clamp01(progress);
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <View style={{ alignItems: 'center' }}>
      <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
        <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
          <Circle cx={size / 2} cy={size / 2} r={r} stroke={colors.surfaceRaised} strokeWidth={stroke} fill="none" />
          <Circle
            cx={size / 2} cy={size / 2} r={r}
            stroke={color ?? accent.accent} strokeWidth={stroke} fill="none"
            strokeLinecap="round"
            strokeDasharray={`${c} ${c}`}
            strokeDashoffset={c * (1 - p)}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </Svg>
        {icon ? icon : <Text style={styles.ringLabel}>{label ?? `${toAr(Math.round(p * 100))}٪`}</Text>}
      </View>
      {caption ? <Text style={styles.caption}>{caption}</Text> : null}
    </View>
  );
};

const styles = themed(() => ({
  track: { width: '100%', backgroundColor: colors.surfaceRaised, overflow: 'hidden' },
  fill: { height: '100%' },
  ringLabel: { ...type.label, color: colors.text },
  caption: { ...type.caption, color: colors.textMuted, marginTop: 6 },
  _r: { borderRadius: radius.pill },
}));
