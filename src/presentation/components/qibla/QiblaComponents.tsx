import React from 'react';
import { View, Text, Animated, Image } from 'react-native';
import { s } from './QiblaStyles';

const diskImage = require('../../../../assets/images/qibla_compass_bg.png');

export const CompassDisk = ({ rotateDisk }: { rotateDisk: Animated.AnimatedInterpolation<string> }) => (
  <Animated.View style={[s.disk, { transform: [{ rotate: rotateDisk }] }]}>
    <Image source={diskImage} style={s.diskImage} />
    {['N', 'E', 'S', 'W'].map((dir, i) => (
      <View key={dir} style={[s.dirMarkerContainer, { transform: [{ rotate: `${i * 90}deg` }] }]}>
        <Text style={[s.dirMarkerText, dir === 'N' && s.northText]}>{dir}</Text>
        <View style={[s.dirTick, dir === 'N' && s.northTick]} />
      </View>
    ))}
  </Animated.View>
);

export const QiblaPointer = ({ rotateQibla }: { rotateQibla: Animated.AnimatedInterpolation<string> }) => (
  <Animated.View style={[s.pointerWrap, { transform: [{ rotate: rotateQibla }] }]}>
    <View style={s.needleContainer}>
      <View style={s.kaabaFrame}><View style={s.kaabaBody} /></View>
      <View style={s.needle} />
    </View>
  </Animated.View>
);
