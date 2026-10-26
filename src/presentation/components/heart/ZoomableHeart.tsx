import React, { useEffect, useRef } from 'react';
import { Animated, ScrollView, View } from 'react-native';
import { AnatomicalHeart } from './AnatomicalHeart';
import { HEART_VB_H, HEART_VB_W } from './heartCells';

type Props = {
  /** Visible frame the heart pans inside. */
  frameW: number;
  frameH: number;
  /** Rendered heart width; larger than frameW means zoomed in. */
  size: number;
  pulseAnim: Animated.Value;
  completedSurahs: number[];
  progress: number;
  onToggleSurah?: (id: number) => void;
  onZoomRequest?: () => void;
  /** Breathing room around the heart when it is larger than the frame. */
  margin?: number;
};

/**
 * The heart inside a fixed frame, pannable on both axes once it is larger than the
 * frame, and re-centred whenever `size` changes. Shared by the journey screen and the
 * full-screen view so pan/zoom/RTL behaviour lives in one place.
 */
export const ZoomableHeart = ({ frameW, frameH, size, pulseAnim, completedSurahs, progress, onToggleSurah, onZoomRequest, margin = 24 }: Props) => {
  const heartH = (size * HEART_VB_H) / HEART_VB_W;
  const contentW = Math.max(frameW, size + margin);
  const contentH = Math.max(frameH, heartH + margin);
  const pannable = contentW > frameW || contentH > frameH;

  const hRef = useRef<ScrollView>(null);
  const vRef = useRef<ScrollView>(null);
  useEffect(() => {
    // wait one frame so the new content size is laid out before scrolling to its middle
    const t = setTimeout(() => {
      hRef.current?.scrollTo({ x: (contentW - frameW) / 2, animated: false });
      vRef.current?.scrollTo({ y: (contentH - frameH) / 2, animated: false });
    }, 0);
    return () => clearTimeout(t);
  }, [contentW, contentH, frameW, frameH]);

  return (
    <View style={{ width: frameW, height: frameH }}>
      <ScrollView ref={vRef} nestedScrollEnabled scrollEnabled={pannable} showsVerticalScrollIndicator={false}>
        {/* direction:'ltr' so the horizontal offset is measured from the left, not flipped by RTL */}
        <ScrollView
          ref={hRef}
          horizontal
          nestedScrollEnabled
          scrollEnabled={pannable}
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
            onZoomRequest={onZoomRequest}
          />
        </ScrollView>
      </ScrollView>
    </View>
  );
};
