import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, Pressable, StyleSheet, View } from 'react-native';
import Svg, {
  Circle, Defs, Ellipse, G, LinearGradient, Path, RadialGradient, Stop,
} from 'react-native-svg';

/**
 * SebhaSvg — a realistic prayer-bead loop (مسبحة) drawn with react-native-svg.
 *
 * - 33 round beads strung on a thread, with 2 separator discs (فواصل) and an
 *   elongated "imam" bead that closes the loop and carries the tassel (شرابة).
 * - Every tap advances the loop by exactly one bead (spring rotation), the bead
 *   that lands under the thumb glows, so it feels like sliding a real bead.
 * - Colors are derived from the accent so the beads look like polished wood,
 *   amber, onyx, etc. depending on the user's theme.
 */

const VB = 320;          // viewBox width (square ring)
const VB_H = 392;        // extra height for the imam + tassel
const CX = VB / 2;
const CY = VB / 2;
const RING_R = 128;

type Props = {
  size: number;                 // rendered width in px
  count: number;                // current dhikr count (drives rotation)
  beads?: number;               // beads on the loop, default 33
  accentColor?: string;         // base bead colour
  onPress?: () => void;
  children?: React.ReactNode;   // content rendered in the centre (count, label)
};

// ── colour helpers ───────────────────────────────────────────────────────────
const hexToRgb = (hex: string) => {
  const h = hex.replace('#', '');
  const v = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const n = parseInt(v, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
};
const clamp = (n: number) => Math.max(0, Math.min(255, Math.round(n)));
const shade = (hex: string, amt: number) => {
  // amt > 0 lightens toward white, amt < 0 darkens toward black (−1..1)
  const { r, g, b } = hexToRgb(hex);
  const t = amt > 0 ? 255 : 0;
  const p = Math.abs(amt);
  const mix = (c: number) => clamp(c + (t - c) * p);
  return `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`;
};

export const SebhaSvg = ({ size, count, beads = 33, accentColor = '#B8860B', onPress, children }: Props) => {
  const base = accentColor === '#000000' ? '#2b2b2b' : accentColor;
  const palette = useMemo(() => ({
    hi: shade(base, 0.72),
    mid: shade(base, 0.12),
    body: base,
    low: shade(base, -0.38),
    rim: shade(base, -0.62),
    thread: shade(base, -0.72),
    tassel: shade(base, -0.2),
  }), [base]);

  const step = 360 / beads;
  const beadR = Math.min(13, (2 * Math.PI * RING_R) / beads / 2 - 1.2);

  // Rotation: one bead per count. Keep it monotonic so a reset spins back smoothly.
  const rot = useRef(new Animated.Value(0)).current;
  const prevCount = useRef(count);
  useEffect(() => {
    const delta = count - prevCount.current;
    prevCount.current = count;
    if (Math.abs(delta) > 12) {
      // Manual add / reset: don't spin 1000 beads, just settle on the right phase.
      rot.setValue(count * step);
      return;
    }
    Animated.spring(rot, {
      toValue: count * step,
      useNativeDriver: true,
      speed: 18,
      bounciness: 6,
    }).start();
  }, [count, step, rot]);

  const rotate = rot.interpolate({ inputRange: [0, 360], outputRange: ['0deg', '-360deg'] });

  // Bead positions on the ring; index 0 sits at the bottom, next to the imam.
  const beadNodes = useMemo(() => {
    const nodes = [];
    for (let i = 0; i < beads; i++) {
      const angle = (Math.PI / 2) + (i * 2 * Math.PI) / beads; // start at bottom
      const x = CX + RING_R * Math.cos(angle);
      const y = CY + RING_R * Math.sin(angle);
      const isSeparator = beads === 33 && (i === 11 || i === 22);
      nodes.push({ x, y, isSeparator, key: i });
    }
    return nodes;
  }, [beads]);

  const height = (size * VB_H) / VB;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="المسبحة، اضغط للتسبيح"
      style={{ width: size, height, alignItems: 'center' }}
    >
      {/* Rotating bead ring */}
      <Animated.View style={{ width: size, height: size, transform: [{ rotate }] }}>
        <Svg width={size} height={size} viewBox={`0 0 ${VB} ${VB}`}>
          <Defs>
            <RadialGradient id="bead" cx="35%" cy="32%" r="70%">
              <Stop offset="0" stopColor={palette.hi} />
              <Stop offset="0.35" stopColor={palette.mid} />
              <Stop offset="0.8" stopColor={palette.body} />
              <Stop offset="1" stopColor={palette.rim} />
            </RadialGradient>
            <RadialGradient id="sep" cx="40%" cy="35%" r="75%">
              <Stop offset="0" stopColor="#f5e6c8" />
              <Stop offset="0.6" stopColor="#c9a86a" />
              <Stop offset="1" stopColor="#6b4a1e" />
            </RadialGradient>
          </Defs>

          {/* thread */}
          <Circle cx={CX} cy={CY} r={RING_R} stroke={palette.thread} strokeWidth={2.2} fill="none" />
          <Circle cx={CX} cy={CY} r={RING_R} stroke={palette.hi} strokeWidth={0.6} fill="none" opacity={0.25} />

          {beadNodes.map((b) => (
            <G key={b.key}>
              {/* drop shadow */}
              <Circle cx={b.x + 1.5} cy={b.y + 2.5} r={b.isSeparator ? beadR * 0.75 : beadR} fill="#000" opacity={0.35} />
              {b.isSeparator ? (
                <Ellipse cx={b.x} cy={b.y} rx={beadR * 0.78} ry={beadR * 0.55} fill="url(#sep)" stroke="#4a3312" strokeWidth={0.6} />
              ) : (
                <>
                  <Circle cx={b.x} cy={b.y} r={beadR} fill="url(#bead)" />
                  {/* specular highlight */}
                  <Ellipse cx={b.x - beadR * 0.32} cy={b.y - beadR * 0.38} rx={beadR * 0.3} ry={beadR * 0.18} fill="#fff" opacity={0.55} />
                  {/* thread hole */}
                  <Circle cx={b.x} cy={b.y} r={beadR * 0.12} fill={palette.rim} opacity={0.6} />
                </>
              )}
            </G>
          ))}
        </Svg>
      </Animated.View>

      {/* Static overlay: active-bead glow, imam bead, tassel */}
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <Svg width={size} height={height} viewBox={`0 0 ${VB} ${VB_H}`}>
          <Defs>
            <RadialGradient id="glow" cx="50%" cy="50%" r="50%">
              <Stop offset="0" stopColor="#fde68a" stopOpacity={0.9} />
              <Stop offset="0.5" stopColor="#f59e0b" stopOpacity={0.35} />
              <Stop offset="1" stopColor="#f59e0b" stopOpacity={0} />
            </RadialGradient>
            <LinearGradient id="imam" x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0" stopColor={palette.rim} />
              <Stop offset="0.35" stopColor={palette.hi} />
              <Stop offset="0.6" stopColor={palette.body} />
              <Stop offset="1" stopColor={palette.rim} />
            </LinearGradient>
            <LinearGradient id="cap" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#f7e3a1" />
              <Stop offset="1" stopColor="#9a7320" />
            </LinearGradient>
          </Defs>

          {/* glow where the thumb "pushes" the bead (bottom of the ring) */}
          <Circle cx={CX} cy={CY + RING_R} r={beadR * 2.6} fill="url(#glow)" />

          {/* imam bead (elongated) hanging from the bottom of the loop */}
          <Ellipse cx={CX + 1.5} cy={CY + RING_R + 34} rx={12} ry={22} fill="#000" opacity={0.35} />
          <Ellipse cx={CX} cy={CY + RING_R + 32} rx={11} ry={21} fill="url(#imam)" stroke={palette.rim} strokeWidth={0.8} />
          <Ellipse cx={CX - 3.5} cy={CY + RING_R + 20} rx={2.6} ry={6} fill="#fff" opacity={0.45} />

          {/* metal cap */}
          <Path
            d={`M ${CX - 7} ${CY + RING_R + 52} h 14 a 3 3 0 0 1 3 3 v 3 a 3 3 0 0 1 -3 3 h -14 a 3 3 0 0 1 -3 -3 v -3 a 3 3 0 0 1 3 -3 z`}
            fill="url(#cap)" stroke="#5c4410" strokeWidth={0.6}
          />

          {/* tassel threads */}
          {[-10, -7, -4, -1.5, 1.5, 4, 7, 10].map((dx, i) => (
            <Path
              key={i}
              d={`M ${CX} ${CY + RING_R + 60} q ${dx * 0.6} 22 ${dx} 46`}
              stroke={i % 2 === 0 ? palette.tassel : palette.low}
              strokeWidth={1.8}
              strokeLinecap="round"
              fill="none"
              opacity={0.95}
            />
          ))}
        </Svg>
      </View>

      {/* Centre content (count, dhikr, target) */}
      <View pointerEvents="none" style={[StyleSheet.absoluteFill, { height: size, alignItems: 'center', justifyContent: 'center' }]}>
        {children}
      </View>
    </Pressable>
  );
};

export default SebhaSvg;
