import React, { useState } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { Download, Eraser, Maximize2, ZoomIn, ZoomOut } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { stepZoom, ZoomableHeart } from './ZoomableHeart';
import { HEART_VB_H, HEART_VB_W } from './heartCells';
import { colors, icon, radius, space, themed } from '../../../shared/theme/tokens';
import { toAr } from '../../../shared/utils/format';

const ZOOMS = [1, 1.5, 2, 2.6];

type Props = {
  pulseAnim: Animated.Value;
  completedSurahs: number[];
  progress: number;
  onToggleSurah: (id: number) => void;
  onOpenFullscreen: () => void;
  onDownload: () => void;
  onReset: () => void;
};

/**
 * The heart on the journey screen with its own zoom: the frame keeps its height and the
 * heart grows inside it, so a zoomed heart pans in place (both axes) instead of pushing
 * the page around. Controls: zoom out/in, fullscreen, save as image, reset.
 */
export const HeartViewer = ({ pulseAnim, completedSurahs, progress, onToggleSurah, onOpenFullscreen, onDownload, onReset }: Props) => {
  const { width: screenW } = useWindowDimensions();
  const base = screenW * 0.9;
  const frameH = (base * HEART_VB_H) / HEART_VB_W;
  // free value: the buttons step through ZOOMS, a pinch can land anywhere in between
  const [zoom, setZoom] = useState(1);
  const minZoom = ZOOMS[0];
  const maxZoom = ZOOMS[ZOOMS.length - 1];
  const atMin = zoom <= minZoom + 0.01;
  const atMax = zoom >= maxZoom - 0.01;

  const step = (d: 1 | -1) => {
    const next = stepZoom(ZOOMS, zoom, d);
    if (next !== zoom) { Haptics.selectionAsync(); setZoom(next); }
  };

  return (
    <View style={{ marginBottom: space[5] }}>
      <ZoomableHeart
        frameW={screenW}
        frameH={frameH}
        size={base * zoom}
        minSize={base * minZoom}
        maxSize={base * maxZoom}
        onSizeChange={(s) => setZoom(Math.min(maxZoom, Math.max(minZoom, s / base)))}
        margin={space[8]}
        pulseAnim={pulseAnim}
        completedSurahs={completedSurahs}
        progress={progress}
        onToggleSurah={onToggleSurah}
        onZoomRequest={onOpenFullscreen}
      />

      <View style={st.bar}>
        <Tool label="أصغر" onPress={() => step(-1)} disabled={atMin}>
          <ZoomOut size={icon.size.md} color={atMin ? colors.textFaint : colors.goldText} strokeWidth={icon.stroke} />
        </Tool>
        <Text style={st.zoomText}>{toAr(Math.round(zoom * 100))}٪</Text>
        <Tool label="أكبر" onPress={() => step(1)} disabled={atMax}>
          <ZoomIn size={icon.size.md} color={atMax ? colors.textFaint : colors.goldText} strokeWidth={icon.stroke} />
        </Tool>
        <View style={st.sep} />
        <Tool label="ملء الشاشة" onPress={onOpenFullscreen}>
          <Maximize2 size={icon.size.md} color={colors.goldText} strokeWidth={icon.stroke} />
        </Tool>
        <Tool label="حفظ صورة" onPress={onDownload}>
          <Download size={icon.size.md} color={colors.goldText} strokeWidth={icon.stroke} />
        </Tool>
        <Tool label="تصفير" onPress={onReset} disabled={completedSurahs.length === 0}>
          <Eraser size={icon.size.md} color={completedSurahs.length === 0 ? colors.textFaint : '#ff8a80'} strokeWidth={icon.stroke} />
        </Tool>
      </View>
    </View>
  );
};

const Tool = ({ label, onPress, disabled, children }: { label: string; onPress: () => void; disabled?: boolean; children: React.ReactNode }) => (
  <TouchableOpacity onPress={onPress} disabled={disabled} accessibilityRole="button" accessibilityLabel={label} style={st.tool} activeOpacity={0.7}>
    {children}
    <Text style={[st.toolLabel, disabled && { color: colors.textFaint }]}>{label}</Text>
  </TouchableOpacity>
);

const st = themed(() => ({
  bar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', alignSelf: 'center', gap: space[1], backgroundColor: colors.surface, borderRadius: radius.pill, paddingHorizontal: space[3], paddingVertical: space[1], marginTop: space[3] },
  tool: { alignItems: 'center', justifyContent: 'center', minWidth: 50, paddingVertical: space[1] },
  toolLabel: { fontFamily: 'Tajawal_500Medium', fontSize: 10, color: colors.textMuted, marginTop: 2 },
  zoomText: { fontFamily: 'Tajawal_700Bold', fontSize: 12, color: colors.text, minWidth: 40, textAlign: 'center' },
  sep: { width: 1, height: 26, backgroundColor: colors.hairline, marginHorizontal: space[1] },
}));
