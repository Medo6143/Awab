import React, { useMemo } from 'react';
import { Animated, View, Dimensions, Text, StyleSheet } from 'react-native';
import Svg, { Path, Rect, G, Ellipse, Defs, ClipPath, LinearGradient, RadialGradient, Stop } from 'react-native-svg';
import { HEART_CELLS, HEART_VB_W, HEART_VB_H } from './heartCells';
import { SURAH_NAMES } from '../../../shared/constants/surahs';

export { HEART_VB_W, HEART_VB_H };

/**
 * AnatomicalHeart — a human heart (front view, with its great vessels) built entirely
 * out of 114 cells, one per surah (heartCells.ts). Tapping a cell marks the surah and
 * the cell fills with blood, so the heart fills as the khatma progresses.
 *
 * Layers, bottom to top:
 *  1. seams: every cell drawn in a dark fibre colour with a stroke as wide as the gaps
 *     between cells, so the cells read as one muscle with thin seams, not as tiles;
 *  2. cells: the only hittable layer (react-native-svg hit-tests the last-drawn element
 *     first, so everything above is pointerEvents="none");
 *  3. a soft sheen clipped to the heart, then the name labels as RN <Text>.
 */

const SEAM = '#24060a';
const SEAM_WIDTH = 3;

// ── Per-cell label layout, computed once ────────────────────────────────────
type CellLayout = { id: number; d: string; cx: number; cy: number; lines: string[]; fontSize: number };

const CELL_LAYOUT: CellLayout[] = HEART_CELLS.map((c) => {
  const name = SURAH_NAMES[c.id - 1] ?? String(c.id);
  // Only "آل عمران" has two words; stack it when its cell is narrow.
  const lines = name.includes(' ') && c.w < 40 ? name.split(' ') : [name];
  const longest = Math.max(...lines.map((l) => l.length));
  const byHeight = (c.h * 0.42) / lines.length;
  const byWidth = (c.w * 0.86) / (longest * 0.52); // Tajawal Arabic ≈ 0.52em per letter
  const fontSize = Math.max(3.5, Math.min(8, byHeight, byWidth));
  return { id: c.id, d: c.d, cx: c.cx, cy: c.cy, lines, fontSize };
});

// ── Memoised cell + label ───────────────────────────────────────────────────
const LONG_PRESS_MS = 400;
const MOVE_SLOP = 10; // px a finger may wander before the touch counts as a drag

/**
 * Touches are handled with raw responder props instead of onPress/onLongPress.
 * react-native-svg routes those through the legacy Touchable mixin, which measures the
 * element to build its press rect; under the new architecture that measurement fails,
 * so the first finger move "leaves" the cell and the long press is cancelled.
 * Here: hold → zoom, short tap → toggle, drag → let the ScrollView take over.
 */
const HeartCell = React.memo(
  ({ id, d, done, onToggle, onZoom }: { id: number; d: string; done: boolean; onToggle?: (id: number) => void; onZoom?: () => void }) => {
    const touch = React.useRef<{ x: number; y: number; timer: ReturnType<typeof setTimeout> | null; long: boolean; moved: boolean } | null>(null);
    const clear = () => { if (touch.current?.timer) clearTimeout(touch.current.timer); touch.current = null; };
    React.useEffect(() => clear, []);
    const interactive = !!(onToggle || onZoom);
    return (
      <Path
        d={d}
        fill={done ? 'url(#blood)' : 'url(#muscle)'}
        onStartShouldSetResponder={() => interactive}
        onResponderTerminationRequest={() => true}
        onResponderGrant={(e) => {
          clear();
          const t = { x: e.nativeEvent.pageX, y: e.nativeEvent.pageY, timer: null as ReturnType<typeof setTimeout> | null, long: false, moved: false };
          if (onZoom) t.timer = setTimeout(() => { t.long = true; onZoom(); }, LONG_PRESS_MS);
          touch.current = t;
        }}
        onResponderMove={(e) => {
          const t = touch.current;
          if (!t || t.moved) return;
          if (Math.abs(e.nativeEvent.pageX - t.x) > MOVE_SLOP || Math.abs(e.nativeEvent.pageY - t.y) > MOVE_SLOP) {
            t.moved = true;
            if (t.timer) clearTimeout(t.timer);
          }
        }}
        onResponderRelease={() => {
          const t = touch.current;
          if (t && !t.long && !t.moved) onToggle?.(id);
          clear();
        }}
        onResponderTerminate={clear}
      />
    );
  },
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
            style={{ fontFamily: 'Tajawal_700Bold', fontSize: fs, lineHeight: lineH, color: done ? '#fff5f5' : '#e3b3b9', opacity: done ? 1 : 0.92, textAlign: 'center', includeFontPadding: false }}
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
  labels?: boolean;                     // surah names; off for thumbnails
};

export const AnatomicalHeart = ({ pulseAnim, completedSurahs, progress, size, onToggleSurah, onZoomRequest, labels = true }: Props) => {
  const width = size ?? Dimensions.get('window').width * 0.9;
  const height = (width * HEART_VB_H) / HEART_VB_W;
  const scale = width / HEART_VB_W; // viewBox units → px, for the RN label overlay
  const clamped = Math.max(0, Math.min(1, progress));
  const glowOpacity = Math.round((0.35 * (0.3 + clamped * 0.7)) * 20) / 20;
  const doneSet = useMemo(() => new Set(completedSurahs), [completedSurahs]);

  // Static layers never change: build them once.
  const seams = useMemo(() => (
    <G pointerEvents="none">
      {HEART_CELLS.map((c) => (
        <Path key={c.id} d={c.d} fill={SEAM} stroke={SEAM} strokeWidth={SEAM_WIDTH} strokeLinejoin="round" pointerEvents="none" />
      ))}
    </G>
  ), []);
  const clip = useMemo(() => (
    <ClipPath id="heartClip">
      {HEART_CELLS.map((c) => <Path key={c.id} d={c.d} />)}
    </ClipPath>
  ), []);

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View style={{ width, height, transform: [{ scale: pulseAnim }] }}>
        <Svg width="100%" height="100%" viewBox={`0 0 ${HEART_VB_W} ${HEART_VB_H}`}>
          <Defs>
            {clip}
            {/* objectBoundingBox gradients: each cell gets its own light-to-shadow fall-off */}
            <LinearGradient id="muscle" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor="#7a2530" />
              <Stop offset="0.55" stopColor="#5a1820" />
              <Stop offset="1" stopColor="#3a0d13" />
            </LinearGradient>
            <LinearGradient id="blood" x1="0" y1="1" x2="0" y2="0">
              <Stop offset="0" stopColor="#8f1420" />
              <Stop offset="0.6" stopColor="#c8232f" />
              <Stop offset="1" stopColor="#e23c43" />
            </LinearGradient>
            <RadialGradient id="sheen" cx="38%" cy="30%" r="60%">
              <Stop offset="0" stopColor="#ffffff" stopOpacity={0.18} />
              <Stop offset="1" stopColor="#ffffff" stopOpacity={0} />
            </RadialGradient>
            <RadialGradient id="glow" cx="50%" cy="55%" r="50%">
              <Stop offset="0" stopColor="#c8232f" stopOpacity={glowOpacity} />
              <Stop offset="1" stopColor="#c8232f" stopOpacity={0} />
            </RadialGradient>
          </Defs>

          <Ellipse cx={HEART_VB_W / 2} cy={HEART_VB_H * 0.55} rx={HEART_VB_W * 0.48} ry={HEART_VB_H * 0.45} fill="url(#glow)" pointerEvents="none" />
          {seams}

          {/* the only hittable layer */}
          {CELL_LAYOUT.map((cell) => (
            <HeartCell key={cell.id} id={cell.id} d={cell.d} done={doneSet.has(cell.id)} onToggle={onToggleSurah} onZoom={onZoomRequest} />
          ))}

          <G clipPath="url(#heartClip)" pointerEvents="none">
            <Rect x={0} y={0} width={HEART_VB_W} height={HEART_VB_H} fill="url(#sheen)" pointerEvents="none" />
          </G>
        </Svg>
        {/* direction:'ltr' — under forced RTL Android swaps left/right, which would mirror every label. */}
        {labels ? (
          <View pointerEvents="none" style={[StyleSheet.absoluteFill, { direction: 'ltr' }]}>
            {CELL_LAYOUT.map((cell) => (
              <HeartLabel key={`l${cell.id}`} cx={cell.cx} cy={cell.cy} lines={cell.lines} fontSize={cell.fontSize} done={doneSet.has(cell.id)} scale={scale} />
            ))}
          </View>
        ) : null}
      </Animated.View>
    </View>
  );
};

export default AnatomicalHeart;
