import React, { useMemo } from 'react';
import { Animated, View, Dimensions, Text, StyleSheet } from 'react-native';
import Svg, {
  Path, Rect, G, Ellipse, Defs, ClipPath,
  LinearGradient, RadialGradient, Stop,
} from 'react-native-svg';
import { HEART_CELLS } from './heartCells';
import { SURAH_NAMES } from '../../../shared/constants/surahs';

/**
 * AnatomicalHeart — a human heart (anterior view) drawn in SVG.
 *
 * - Ventricles + atria body, aortic arch with its three branches, pulmonary trunk,
 *   superior vena cava, and the main coronary arteries.
 * - The body is tessellated into 114 organic cells (heartCells.ts), one per surah,
 *   ordered top→bottom / right→left. Tapping a cell marks the surah; completed cells
 *   fill with blood, so the heart literally fills as the khatma progresses.
 * - Every non-cell element is `pointerEvents="none"`: react-native-svg hit-tests the
 *   last-drawn element first, so overlays without handlers would otherwise swallow
 *   the taps meant for the cells.
 */

export const HEART_VB_W = 400;
export const HEART_VB_H = 440;

// Ventricles + atria silhouette (apex bottom-left, as seen from the front).
const BODY_D =
  'M200,104 C226,76 296,70 322,112 C350,156 340,214 310,262 ' +
  'C284,304 236,352 170,406 C118,360 70,302 60,232 ' +
  'C48,170 72,110 116,96 C146,86 184,94 200,104 Z';

// Great vessels drawn as thick strokes so they read as tubes.
const AORTA_D = 'M212,112 C214,74 232,48 270,48 C302,48 318,66 322,92';
const AORTA_BRANCHES = ['M244,50 L240,18', 'M264,46 L264,14', 'M284,50 L290,20'];
const PULMONARY_D = 'M176,118 C168,90 150,70 122,60';
const SVC_D = 'M300,108 C304,80 306,56 304,28';

// Coronary arteries.
const LAD: [number, number][] = [
  [204, 118], [206, 142], [202, 168], [206, 196], [200, 224], [204, 252],
  [198, 280], [196, 308], [190, 336], [186, 362], [178, 388],
];
const RCA: [number, number][] = [
  [146, 112], [128, 134], [112, 160], [102, 190], [98, 222], [102, 254],
  [112, 284], [126, 312], [142, 338], [156, 362],
];
const LCX: [number, number][] = [
  [214, 124], [246, 134], [272, 152], [292, 180], [300, 214], [294, 246],
];
const toPath = (pts: [number, number][]) =>
  pts.map((p, i) => (i === 0 ? `M${p[0]},${p[1]}` : `L${p[0]},${p[1]}`)).join(' ');

// ── Per-cell label layout, computed once ────────────────────────────────────
type CellLayout = { id: number; d: string; cx: number; cy: number; lines: string[]; fontSize: number };

const bboxOf = (d: string) => {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const m of d.matchAll(/([ML])([\d.]+),([\d.]+)/g)) {
    const x = +m[2], y = +m[3];
    if (x < minX) minX = x; if (x > maxX) maxX = x;
    if (y < minY) minY = y; if (y > maxY) maxY = y;
  }
  return { w: maxX - minX, h: maxY - minY };
};

const CELL_LAYOUT: CellLayout[] = HEART_CELLS.map((c) => {
  const { w, h } = bboxOf(c.d);
  const name = SURAH_NAMES[c.id - 1] ?? String(c.id);
  // Only "آل عمران" is two words; Arabic words cannot be split mid-word.
  const lines = name.includes(' ') ? name.split(' ') : [name];
  const longest = Math.max(...lines.map((l) => l.length));
  const byHeight = Math.min(w, h) * 0.22;
  const byWidth = (w * 0.86) / (longest * 0.52); // Tajawal Arabic ≈ 0.52em per letter
  const fontSize = Math.max(4.5, Math.min(7.5, byHeight, byWidth));
  return { id: c.id, d: c.d, cx: c.cx, cy: c.cy, lines, fontSize };
});

// ── Memoised cell + label ───────────────────────────────────────────────────
const HeartCell = React.memo(
  ({ id, d, done, onToggle, onZoom }: { id: number; d: string; done: boolean; onToggle?: (id: number) => void; onZoom?: () => void }) => (
    <Path
      d={d}
      fill={done ? 'url(#blood)' : 'transparent'}
      stroke={done ? '#ff8f95' : '#6b2a30'}
      strokeOpacity={done ? 0.55 : 0.35}
      strokeWidth={0.8}
      onPress={onToggle ? () => onToggle(id) : undefined}
      onLongPress={onZoom}
      delayLongPress={400}
    />
  ),
);

/**
 * Labels are React Native <Text>, not SVG <Text>: react-native-svg on Android renders
 * glyphs one by one without Arabic shaping (letters come out disconnected and reversed).
 * They are absolutely positioned over the SVG in the same coordinate space and ignore touches.
 */
const HeartLabel = React.memo(
  ({ cx, cy, lines, fontSize, done, scale }: { cx: number; cy: number; lines: string[]; fontSize: number; done: boolean; scale: number }) => {
    const fs = fontSize * scale;
    const boxW = fs * 7.5;
    const lineH = fs * 1.15;
    const boxH = lineH * lines.length;
    return (
      <View pointerEvents="none" style={{ position: 'absolute', left: cx * scale - boxW / 2, top: cy * scale - boxH / 2, width: boxW, height: boxH, alignItems: 'center', justifyContent: 'center' }}>
        {lines.map((line, i) => (
          <Text
            key={i}
            numberOfLines={1}
            allowFontScaling={false}
            style={{ fontFamily: 'Tajawal_700Bold', fontSize: fs, lineHeight: lineH, color: done ? '#fff5f5' : '#b58a90', opacity: done ? 0.95 : 0.9, textAlign: 'center', includeFontPadding: false }}
          >
            {line}
          </Text>
        ))}
      </View>
    );
  },
);

type Props = {
  pulseAnim: Animated.Value;
  completedSurahs: number[];
  progress: number;                     // 0..1
  size?: number;                        // rendered width
  onToggleSurah?: (id: number) => void; // tap a cell to mark/unmark that surah
  onZoomRequest?: () => void;           // long-press on a cell
};

export const AnatomicalHeart = ({ pulseAnim, completedSurahs, progress, size, onToggleSurah, onZoomRequest }: Props) => {
  const width = size ?? Dimensions.get('window').width * 0.9;
  const height = (width * HEART_VB_H) / HEART_VB_W;
  const scale = width / HEART_VB_W; // viewBox units → px, for the RN label overlay
  const clamped = Math.max(0, Math.min(1, progress));
  const glowOpacity = Math.round((0.35 * (0.3 + clamped * 0.7)) * 20) / 20;
  const doneSet = useMemo(() => new Set(completedSurahs), [completedSurahs]);

  // Static anatomy layers never change: build them once.
  const vessels = useMemo(() => (
    <G pointerEvents="none">
      <Path d={SVC_D} stroke="url(#vein)" strokeWidth={26} strokeLinecap="round" fill="none" pointerEvents="none" />
      <Path d={SVC_D} stroke="#9fa3e6" strokeWidth={4} strokeLinecap="round" fill="none" opacity={0.35} transform="translate(-6,0)" pointerEvents="none" />
      <Path d={AORTA_D} stroke="#7a141c" strokeWidth={38} strokeLinecap="round" fill="none" pointerEvents="none" />
      <Path d={AORTA_D} stroke="url(#artery)" strokeWidth={30} strokeLinecap="round" fill="none" pointerEvents="none" />
      <Path d={AORTA_D} stroke="#ff8a8f" strokeWidth={5} strokeLinecap="round" fill="none" opacity={0.3} transform="translate(-7,-4)" pointerEvents="none" />
      {AORTA_BRANCHES.map((d, i) => (
        <G key={i} pointerEvents="none">
          <Path d={d} stroke="#7a141c" strokeWidth={16} strokeLinecap="round" fill="none" pointerEvents="none" />
          <Path d={d} stroke="url(#artery)" strokeWidth={10} strokeLinecap="round" fill="none" pointerEvents="none" />
        </G>
      ))}
      <Path d={PULMONARY_D} stroke="#2b2d66" strokeWidth={32} strokeLinecap="round" fill="none" pointerEvents="none" />
      <Path d={PULMONARY_D} stroke="url(#vein)" strokeWidth={24} strokeLinecap="round" fill="none" pointerEvents="none" />
      <Path d={PULMONARY_D} stroke="#b4b7f0" strokeWidth={4} strokeLinecap="round" fill="none" opacity={0.3} transform="translate(-5,-5)" pointerEvents="none" />
      <Path d={BODY_D} fill="#1a0507" transform="translate(6,10)" opacity={0.5} pointerEvents="none" />
    </G>
  ), []);

  const coronaries = useMemo(() => (
    <G pointerEvents="none">
      <Path d={BODY_D} fill="none" stroke="#120305" strokeWidth={3} pointerEvents="none" />
      {[LAD, RCA, LCX].map((v, i) => (
        <Path key={i} d={toPath(v)} stroke="#f0656c" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" fill="none" opacity={0.55} pointerEvents="none" />
      ))}
    </G>
  ), []);

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View style={{ width, height, transform: [{ scale: pulseAnim }] }}>
        <Svg width="100%" height="100%" viewBox={`0 0 ${HEART_VB_W} ${HEART_VB_H}`}>
          <Defs>
            <ClipPath id="bodyClip"><Path d={BODY_D} /></ClipPath>
            <LinearGradient id="muscle" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor="#5a1a22" />
              <Stop offset="0.55" stopColor="#3f0f16" />
              <Stop offset="1" stopColor="#2a090e" />
            </LinearGradient>
            <LinearGradient id="blood" x1="0" y1="1" x2="0" y2="0">
              <Stop offset="0" stopColor="#8f1420" />
              <Stop offset="0.6" stopColor="#c8232f" />
              <Stop offset="1" stopColor="#e23c43" />
            </LinearGradient>
            <RadialGradient id="sheen" cx="38%" cy="32%" r="55%">
              <Stop offset="0" stopColor="#ffffff" stopOpacity={0.22} />
              <Stop offset="1" stopColor="#ffffff" stopOpacity={0} />
            </RadialGradient>
            <RadialGradient id="glow" cx="50%" cy="55%" r="50%">
              <Stop offset="0" stopColor="#c8232f" stopOpacity={glowOpacity} />
              <Stop offset="1" stopColor="#c8232f" stopOpacity={0} />
            </RadialGradient>
            <LinearGradient id="artery" x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0" stopColor="#b8303a" />
              <Stop offset="0.5" stopColor="#e05a62" />
              <Stop offset="1" stopColor="#8e1c26" />
            </LinearGradient>
            <LinearGradient id="vein" x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0" stopColor="#3a3d8a" />
              <Stop offset="0.5" stopColor="#6b6fc4" />
              <Stop offset="1" stopColor="#2b2d66" />
            </LinearGradient>
          </Defs>

          <Ellipse cx={200} cy={240} rx={190} ry={200} fill="url(#glow)" pointerEvents="none" />
          {vessels}

          <G clipPath="url(#bodyClip)">
            <Rect x={0} y={0} width={HEART_VB_W} height={HEART_VB_H} fill="url(#muscle)" pointerEvents="none" />

            {/* the only hittable layer */}
            {CELL_LAYOUT.map((cell) => (
              <HeartCell key={cell.id} id={cell.id} d={cell.d} done={doneSet.has(cell.id)} onToggle={onToggleSurah} onZoom={onZoomRequest} />
            ))}

            <Rect x={0} y={0} width={HEART_VB_W} height={HEART_VB_H} fill="url(#sheen)" pointerEvents="none" />
          </G>

          {coronaries}
        </Svg>
        {/* direction:'ltr' — under forced RTL Android swaps left/right, which would mirror every label. */}
        <View pointerEvents="none" style={[StyleSheet.absoluteFill, { direction: 'ltr' }]}>
          {CELL_LAYOUT.map((cell) => (
            <HeartLabel key={`l${cell.id}`} cx={cell.cx} cy={cell.cy} lines={cell.lines} fontSize={cell.fontSize} done={doneSet.has(cell.id)} scale={scale} />
          ))}
        </View>
      </Animated.View>
    </View>
  );
};

export default AnatomicalHeart;
