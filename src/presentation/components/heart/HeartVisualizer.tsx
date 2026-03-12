import React from 'react';
import { View, Animated, Dimensions } from 'react-native';
import Svg, { Path, G, Defs, RadialGradient, Stop, LinearGradient as SvgLinearGradient, ClipPath } from 'react-native-svg';
import { s } from './HeartJourneyStyles';
import { HEART_ANATOMY_BODY } from './HeartJourneyConstants';

const { width } = Dimensions.get('window');

export const HeartVisualizer = ({ pulseAnim, heartSegments }: any) => (
  <View style={s.heartContainer}>
    <Animated.View style={{ transform: [{ scale: pulseAnim }], width: width * 1.1, height: width * 1.1 }}>
      <Svg width="100%" height="100%" viewBox="0 0 24 30">
        <Defs>
          <RadialGradient id="chamberGrad" cx="50%" cy="50%" rx="50%" ry="50%">
            <Stop offset="0%" stopColor="#2b1f15" />
            <Stop offset="100%" stopColor="#1a140f" />
          </RadialGradient>
          <SvgLinearGradient id="aortaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
             <Stop offset="0%" stopColor="#451a03" />
             <Stop offset="100%" stopColor="#2b1f15" />
          </SvgLinearGradient>
          <ClipPath id="heartClip">
            <Path d={HEART_ANATOMY_BODY} />
          </ClipPath>
        </Defs>

        <G>
          <Path
            d="M10 2 C10 1, 14 1, 14 2 L14 8 C14 9, 10 9, 10 8 Z"
            fill="url(#aortaGrad)"
          />
          <Path
            d={HEART_ANATOMY_BODY}
            fill="url(#chamberGrad)"
            stroke="#451a03"
            strokeWidth="0.1"
          />
          <G clipPath="url(#heartClip)">
            {heartSegments.map((seg: any) => (
              <G key={seg.id}>
                <Path
                  d={seg.d}
                  fill={seg.completed ? "#8B0000" : "transparent"}
                />
              </G>
            ))}
          </G>
          <Path
            d={HEART_ANATOMY_BODY}
            fill="none"
            stroke="rgba(255,100,100,0.15)"
            strokeWidth="0.2"
          />
        </G>
      </Svg>
    </Animated.View>
  </View>
);
