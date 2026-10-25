import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Download, Eraser, Maximize2, ZoomIn, ZoomOut } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { AnatomicalHeart } from './AnatomicalHeart';
import { HEART_VB_H, HEART_VB_W } from './heartCells';
import { colors, icon, radius, space } from '../../../shared/theme/tokens';
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
  const screenW = Dimensions.get('window').width;
  const base = screenW * 0.9;
  const frameH = (base * HEART_VB_H) / HEART_VB_W;
  const [zi, setZi] = useState(0);
  const zoom = ZOOMS[zi];
  const size = base * zoom;
  const heartH = (size * HEART_VB_H) / HEART_VB_W;
  const contentW = Math.max(screenW, size + space[8]);
  const contentH = Math.max(frameH, heartH + space[6]);

  const hRef = useRef<ScrollView>(null);
  const vRef = useRef<ScrollView>(null);
  // keep the middle of the heart in view when the zoom changes
  useEffect(() => {
    const t = setTimeout(() => {
      hRef.current?.scrollTo({ x: (contentW - screenW) / 2, animated: false });
      vRef.current?.scrollTo({ y: (contentH - frameH) / 2, animated: false });
    }, 0);
    return () => clearTimeout(t);
  }, [zi]);

  const step = (d: number) => {
    const next = Math.max(0, Math.min(ZOOMS.length - 1, zi + d));
    if (next !== zi) { Haptics.selectionAsync(); setZi(next); }
  };

  return (
    <View style={{ marginBottom: space[5] }}>
      <View style={{ height: frameH }}>
        <ScrollView ref={vRef} nestedScrollEnabled scrollEnabled={zoom > 1} showsVerticalScrollIndicator={false}>
          {/* direction:'ltr' so scroll offsets are measured from the left, not flipped by RTL */}
          <ScrollView
            ref={hRef}
            horizontal
            nestedScrollEnabled
            scrollEnabled={zoom > 1}
            showsHorizontalScrollIndicator={false}
            style={{ direction: 'ltr' }}
            contentContainerStyle={{ width: contentW, height: contentH, alignItems: 'center', justifyContent: 'center' }}
          >
            <AnatomicalHeart
              pulseAnim={pulseAnim}
              completedSurahs={completedSurahs}
              progress={progress}
              size={size}
              onToggleSurah={onToggleSurah}
              onZoomRequest={onOpenFullscreen}
            />
          </ScrollView>
        </ScrollView>
      </View>

      <View style={st.bar}>
        <Tool label="أصغر" onPress={() => step(-1)} disabled={zi === 0}>
          <ZoomOut size={icon.size.md} color={zi === 0 ? colors.textFaint : colors.goldText} strokeWidth={icon.stroke} />
        </Tool>
        <Text style={st.zoomText}>{toAr(Math.round(zoom * 100))}٪</Text>
        <Tool label="أكبر" onPress={() => step(1)} disabled={zi === ZOOMS.length - 1}>
          <ZoomIn size={icon.size.md} color={zi === ZOOMS.length - 1 ? colors.textFaint : colors.goldText} strokeWidth={icon.stroke} />
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

const st = StyleSheet.create({
  bar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', alignSelf: 'center', gap: space[1], backgroundColor: colors.surface, borderRadius: radius.pill, paddingHorizontal: space[3], paddingVertical: space[1], marginTop: space[3] },
  tool: { alignItems: 'center', justifyContent: 'center', minWidth: 50, paddingVertical: space[1] },
  toolLabel: { fontFamily: 'Tajawal_500Medium', fontSize: 10, color: colors.textMuted, marginTop: 2 },
  zoomText: { fontFamily: 'Tajawal_700Bold', fontSize: 12, color: colors.text, minWidth: 40, textAlign: 'center' },
  sep: { width: 1, height: 26, backgroundColor: colors.hairline, marginHorizontal: space[1] },
});
