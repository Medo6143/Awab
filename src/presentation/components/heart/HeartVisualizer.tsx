import React from 'react';
import { View, Animated, Dimensions } from 'react-native';
import Svg, { Path, Rect, G, Text as SvgText, Defs, ClipPath, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import { s } from './HeartJourneyStyles';
import { HEART_MAP } from './heartMap';

const { width } = Dimensions.get('window');

// heartSegments: [{ id, name, d, cx, cy, completed }]
// progress: 0..1 overall khatma completion — the heart fills red from the bottom up.
export const HeartVisualizer = ({ pulseAnim, heartSegments, progress = 0 }: any) => {
  const { viewW, viewH, heartD, minY, maxY } = HEART_MAP;
  const clamped = Math.max(0, Math.min(1, progress));
  const fillY = maxY - (maxY - minY) * clamped;

  return (
    <View style={s.heartContainer}>
      <Animated.View style={{ transform: [{ scale: pulseAnim }], width: width * 1.02, height: width * 1.02 }}>
        <Svg width="100%" height="100%" viewBox={`0 0 ${viewW} ${viewH}`}>
          <Defs>
            <ClipPath id="heartClip">
              <Path d={heartD} />
            </ClipPath>
            <SvgLinearGradient id="redFill" x1="0" y1="1" x2="0" y2="0">
              <Stop offset="0%" stopColor="#a5281d" />
              <Stop offset="100%" stopColor="#d94436" />
            </SvgLinearGradient>
          </Defs>

          {/* Cream panel background (matches the reference look) */}
          <Rect x={0} y={0} width={viewW} height={viewH} rx={24} fill="#fbf7f0" />

          {/* Heart base + rising red fill (the "tank"), clipped to the heart outline */}
          <G clipPath="url(#heartClip)">
            <Rect x={0} y={0} width={viewW} height={viewH} fill="#ffffff" />
            <Rect x={0} y={fillY} width={viewW} height={viewH - fillY} fill="url(#redFill)" />
          </G>

          {/* Region borders + surah names */}
          {heartSegments.map((seg: any) => {
            const underFill = seg.completed || seg.cy > fillY;
            return (
              <React.Fragment key={seg.id}>
                <Path d={seg.d} fill="none" stroke="#cfc6b6" strokeWidth={1} />
                <SvgText
                  x={seg.cx}
                  y={seg.cy + 3}
                  fill={underFill ? '#ffffff' : '#8a9797'}
                  fontSize={8.5}
                  fontFamily="Tajawal_700Bold"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  {seg.name}
                </SvgText>
              </React.Fragment>
            );
          })}

          {/* Heart outline */}
          <Path d={heartD} fill="none" stroke="#c9bfae" strokeWidth={1.5} />
        </Svg>
      </Animated.View>
    </View>
  );
};
