import React, { useEffect, useRef, useMemo } from 'react';
import { View, Animated, StyleSheet, Text } from 'react-native';
import Svg, { Path, G } from 'react-native-svg';

interface HeartProgressProps {
  progress: number; // 0 to 1 (representing completed surahs / 114)
  size?: number;
}

/**
 * A sophisticated Human Heart SVG Progress component.
 * It simulates 114 Surah zones that turn "Bloody Red" as progress increases.
 * Includes a continuous beating animation.
 */
const HeartProgress: React.FC<HeartProgressProps> = ({ progress, size = 220 }) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Heart beating animation
  useEffect(() => {
    const startBeating = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };
    startBeating();
  }, [pulseAnim]);

  // Calculate deep red color based on progress
  const bloodColor = "#8B0000"; // Deep Bloody Red
  const emptyColor = "#2b1f15"; // Dark substrate

  // Anatomical Human Heart SVG Paths (Complex Multi-layer)
  const renderAnatomicalHeart = () => {
    return (
      <G transform="translate(-12, -12) scale(0.045)">
        {/* Main Body - Right Ventricle/Atrium */}
        <Path
          d="M410.9,411.3c21.8,4.2,43.7,8.8,65.6,12.7c31.1,5.6,62,11.9,93.4,14.6c28,2.4,56,4.6,84.1,4c32.5-0.7,65.1-4.7,96.6-13.4 c26.2-7.2,50.8-19.3,71.2-37c22.5-19.5,38.6-45,45.5-73.8c7.3-30.8,4.1-63.5-8.4-92.8c-12.7-29.6-35.1-53.7-62.8-70 c-23.7-14-50.6-21.7-78.1-23.9c-29.6-2.4-59.5,0.7-88.6,6c-24,4.4-47.5,10.2-70.9,16.6c-25.1,6.8-50.1,14.1-75.1,21.3 c-24.8,7.1-49.7,14-74.6,20.5c-22,5.8-44.2,11.2-66.5,15.7c-25.4,5.1-51,9-76.8,11.5c-29.5,2.9-59.2,3.8-88.9,3 c-31.9-0.9-63.8-4.3-95.2-10.7c-26.4-5.4-51.7-13.9-74.8-27c-22-12.5-40.3-30.4-53.2-51.5c-12.4-20.2-19.5-43.1-20.8-66.7"
          fill={emptyColor}
          stroke="#451a03"
          strokeWidth="2"
        />
        
        {/* Aorta & Pulmonary Arteries (Upper Structures) */}
        <Path
          d="M320,100c-10-30-50-40-70-10c0,0-10,20,10,40s20,30,20,30"
          fill="#5a3d2b"
          stroke="#451a03"
        />
        <Path
          d="M380,80c20-30,60-20,70,10c0,0,5,25-15,45s-30,30-30,30"
          fill="#5a3d2b"
          stroke="#451a03"
        />

        {/* Dynamic Blood Fill Layer */}
        <Path
          d="M410.9,411.3c21.8,4.2,43.7,8.8,65.6,12.7c31.1,5.6,62,11.9,93.4,14.6c28,2.4,56,4.6,84.1,4c32.5-0.7,65.1-4.7,96.6-13.4 c26.2-7.2,50.8-19.3,71.2-37c22.5-19.5,38.6-45,45.5-73.8c7.3-30.8,4.1-63.5-8.4-92.8c-12.7-29.6-35.1-53.7-62.8-70 c-23.7-14-50.6-21.7-78.1-23.9c-29.6-2.4-59.5,0.7-88.6,6c-24,4.4-47.5,10.2-70.9,16.6c-25.1,6.8-50.1,14.1-75.1,21.3 c-24.8,7.1-49.7,14-74.6,20.5c-22,5.8-44.2,11.2-66.5,15.7c-25.4,5.1-51,9-76.8,11.5c-29.5,2.9-59.2,3.8-88.9,3 c-31.9-0.9-63.8-4.3-95.2-10.7c-26.4-5.4-51.7-13.9-74.8-27c-22-12.5-40.3-30.4-53.2-51.5c-12.4-20.2-19.5-43.1-20.8-66.7"
          fill={bloodColor}
          opacity={progress}
        />

        {/* Veins (Visual Texture) */}
        <Path
          d="M500,400 Q550,300 600,200"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="3"
          fill="none"
        />
        <Path
          d="M400,380 Q350,280 300,180"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="3"
          fill="none"
        />
      </G>
    );
  };

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Animated.View style={{ transform: [{ scale: pulseAnim }], width: '100%', height: '100%' }}>
        <Svg width="100%" height="100%" viewBox="0 0 24 24">
          {renderAnatomicalHeart()}
        </Svg>
      </Animated.View>
      
      {/* Percentage Center Text */}
      <View style={styles.textOverlay}>
        <Text style={styles.percentText}>{Math.round(progress * 100)}%</Text>
        <Text style={styles.labelSub}>إيمان</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#8B0000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.6,
    shadowRadius: 25,
    elevation: 20,
    backgroundColor: 'rgba(139, 0, 0, 0.05)',
    borderRadius: 150,
  },
  textOverlay: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  percentText: {
    fontFamily: 'Tajawal_700Bold',
    fontSize: 28,
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  labelSub: {
    fontFamily: 'Tajawal_400Regular',
    fontSize: 14,
    color: '#fcd34d',
    marginTop: -4,
  }
});

export default HeartProgress;
