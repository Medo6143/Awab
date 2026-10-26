import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, GestureResponderEvent, NativeTouchEvent, PanResponder, ScrollView, View } from 'react-native';
import { AnatomicalHeart } from './AnatomicalHeart';
import { HEART_VB_H, HEART_VB_W } from './heartCells';

type Props = {
  /** Visible frame the heart pans inside. */
  frameW: number;
  frameH: number;
  /** Rendered heart width; larger than frameW means zoomed in. */
  size: number;
  /** Pinch limits for `size`. Pinch is off unless `onSizeChange` is given. */
  minSize?: number;
  maxSize?: number;
  /** A pinch ended: the heart should be re-rendered at this width. */
  onSizeChange?: (size: number) => void;
  pulseAnim: Animated.Value;
  completedSurahs: number[];
  progress: number;
  onToggleSurah?: (id: number) => void;
  onZoomRequest?: () => void;
  /** Breathing room around the heart when it is larger than the frame. */
  margin?: number;
};

/** Steps through zoom levels from a free (pinched) value: the next level up or down. */
export const stepZoom = (levels: readonly number[], current: number, dir: 1 | -1) => {
  const next = dir > 0 ? levels.find((l) => l > current + 0.01) : [...levels].reverse().find((l) => l < current - 0.01);
  return next ?? current;
};

const distance = (t: NativeTouchEvent[]) => Math.hypot(t[0].pageX - t[1].pageX, t[0].pageY - t[1].pageY);

/**
 * The heart inside a fixed frame, pannable on both axes once it is larger than the
 * frame. Two fingers pinch-zoom it: while pinching the view is only scaled (cheap, around
 * the point between the fingers); on release the heart is re-rendered at the new size so
 * its labels stay sharp, and the pinched point is kept under the fingers. One-finger taps
 * and scrolling are untouched. Shared by the journey screen and the full-screen view.
 */
export const ZoomableHeart = ({
  frameW, frameH, size, minSize, maxSize, onSizeChange,
  pulseAnim, completedSurahs, progress, onToggleSurah, onZoomRequest, margin = 24,
}: Props) => {
  const heartH = (size * HEART_VB_H) / HEART_VB_W;
  const contentW = Math.max(frameW, size + margin);
  const contentH = Math.max(frameH, heartH + margin);
  const pannable = contentW > frameW || contentH > frameH;

  const hRef = useRef<ScrollView>(null);
  const vRef = useRef<ScrollView>(null);
  const frameRef = useRef<View>(null);
  const scroll = useRef({ x: 0, y: 0 });
  const frameOrigin = useRef({ x: 0, y: 0 });
  // set by a pinch: keep this frame point fixed when the new size is laid out
  const focus = useRef<{ fx: number; fy: number; ratio: number } | null>(null);

  const pinchScale = useRef(new Animated.Value(1)).current;
  const pinchOrigin = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;

  useEffect(() => {
    // wait one frame so the new content size is laid out before scrolling
    const t = setTimeout(() => {
      const f = focus.current;
      focus.current = null;
      const maxX = Math.max(0, contentW - frameW);
      const maxY = Math.max(0, contentH - frameH);
      const x = f ? (scroll.current.x + f.fx) * f.ratio - f.fx : maxX / 2;
      const y = f ? (scroll.current.y + f.fy) * f.ratio - f.fy : maxY / 2;
      hRef.current?.scrollTo({ x: Math.min(maxX, Math.max(0, x)), animated: false });
      vRef.current?.scrollTo({ y: Math.min(maxY, Math.max(0, y)), animated: false });
      pinchScale.setValue(1); // drop the preview only once the real size is drawn
    }, 0);
    return () => clearTimeout(t);
  }, [contentW, contentH, frameW, frameH, pinchScale]);

  const pinch = useMemo(() => {
    if (!onSizeChange) return null;
    let d0 = 0;
    let s = 1;
    let fx = 0;
    let fy = 0;
    const lo = (minSize ?? size) / size;
    const hi = (maxSize ?? size) / size;
    const twoFingers = (e: GestureResponderEvent) => e.nativeEvent.touches.length === 2;
    return PanResponder.create({
      // claim only two-finger touches, before the ScrollViews and the heart cells see them
      onStartShouldSetPanResponderCapture: twoFingers,
      onMoveShouldSetPanResponderCapture: twoFingers,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: (e) => {
        const t = e.nativeEvent.touches;
        d0 = t.length === 2 ? distance(t) : 0;
        s = 1;
        if (t.length === 2) {
          fx = (t[0].pageX + t[1].pageX) / 2 - frameOrigin.current.x;
          fy = (t[0].pageY + t[1].pageY) / 2 - frameOrigin.current.y;
          pinchOrigin.setValue({ x: fx, y: fy });
        }
      },
      onPanResponderMove: (e) => {
        const t = e.nativeEvent.touches;
        if (t.length !== 2) return;
        if (!d0) { d0 = distance(t); return; }
        s = Math.min(hi, Math.max(lo, distance(t) / d0));
        pinchScale.setValue(s);
      },
      onPanResponderRelease: () => {
        if (Math.abs(s - 1) < 0.02) { pinchScale.setValue(1); return; }
        focus.current = { fx, fy, ratio: s };
        onSizeChange(size * s);
      },
      onPanResponderTerminate: () => pinchScale.setValue(1),
    });
  }, [onSizeChange, minSize, maxSize, size, pinchScale, pinchOrigin]);

  // scale around the pinch point: move it to the origin, scale, move it back
  const half = { x: frameW / 2, y: frameH / 2 };
  const previewTransform = [
    { translateX: Animated.multiply(Animated.subtract(pinchOrigin.x, half.x), Animated.subtract(1, pinchScale)) },
    { translateY: Animated.multiply(Animated.subtract(pinchOrigin.y, half.y), Animated.subtract(1, pinchScale)) },
    { scale: pinchScale },
  ];

  return (
    <View
      ref={frameRef}
      style={{ width: frameW, height: frameH, overflow: 'hidden' }}
      onLayout={() => frameRef.current?.measureInWindow((x, y) => { frameOrigin.current = { x, y }; })}
      {...(pinch?.panHandlers ?? {})}
    >
      <Animated.View style={{ flex: 1, transform: previewTransform }}>
        <ScrollView
          ref={vRef}
          nestedScrollEnabled
          scrollEnabled={pannable}
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={32}
          onScroll={(e) => { scroll.current.y = e.nativeEvent.contentOffset.y; }}
        >
          {/* direction:'ltr' so the horizontal offset is measured from the left, not flipped by RTL */}
          <ScrollView
            ref={hRef}
            horizontal
            nestedScrollEnabled
            scrollEnabled={pannable}
            showsHorizontalScrollIndicator={false}
            scrollEventThrottle={32}
            onScroll={(e) => { scroll.current.x = e.nativeEvent.contentOffset.x; }}
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
      </Animated.View>
    </View>
  );
};
