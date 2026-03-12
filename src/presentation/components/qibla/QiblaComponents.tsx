import React from 'react';
import { View, Text, Animated, Image, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { s } from './QiblaStyles';

export const CompassDisk = ({ rotateDisk }: any) => (
  <Animated.View style={[s.ornateDisk, { transform: [{ rotate: rotateDisk }] }]}>
    <Image source={require('../../../../assets/images/qibla_compass_bg.png')} style={s.diskBaseImage} />
    {['N', 'E', 'S', 'W'].map((dir, i) => (
      <View key={dir} style={[s.dirMarkerContainer, { transform: [{ rotate: `${i * 90}deg` }] }]}>
        <Text style={[s.dirMarkerText, dir === 'N' && s.northText]}>{dir}</Text>
        <View style={[s.dirTick, dir === 'N' && s.northTick]} />
      </View>
    ))}
  </Animated.View>
);

export const QiblaPointer = ({ rotateQibla }: any) => (
  <Animated.View style={[s.qiblaPointerWrap, { transform: [{ rotate: rotateQibla }] }]}>
     <View style={s.pointerNeedleContainer}>
        <LinearGradient colors={['#fcd34d', '#b45309']} style={s.pointerNeedle} />
        <View style={s.kaabaIconWrap}>
          <View style={s.kaabaGoldFrame}>
             <View style={s.kaabaBlackBody} />
             <LinearGradient colors={['transparent', '#fcd34d20']} style={StyleSheet.absoluteFill} />
          </View>
        </View>
     </View>
  </Animated.View>
);
