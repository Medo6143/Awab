import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronRight, Navigation } from 'lucide-react-native';
import { useLocation } from '../hooks/useLocation';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';

// Qibla Components & Styles
import { CompassDisk, QiblaPointer } from '../components/qibla/QiblaComponents';
import { s } from '../components/qibla/QiblaStyles';

const QiblaScreen = ({ navigation, hideHeader }: any) => {
  const { heading, qiblaDir, error } = useLocation();
  const headingAnim = useRef(new Animated.Value(0)).current;
  const qiblaAnim = useRef(new Animated.Value(0)).current;

  const qiblaRotation = qiblaDir - heading;
  
  useEffect(() => {
    Animated.parallel([
      Animated.timing(headingAnim, { toValue: -heading, duration: 150, useNativeDriver: true }),
      Animated.timing(qiblaAnim, { toValue: qiblaRotation, duration: 150, useNativeDriver: true }),
    ]).start();
  }, [heading, qiblaRotation]);

  useEffect(() => {
    const absDiff = Math.abs(qiblaRotation % 360);
    if ((absDiff < 3 || absDiff > 357) && heading !== 0) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  }, [qiblaRotation]);

  const rotateDisk = headingAnim.interpolate({ inputRange: [-360, 360], outputRange: ['-360deg', '360deg'] });
  const rotateQibla = qiblaAnim.interpolate({ inputRange: [-360, 360], outputRange: ['-360deg', '360deg'] });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0c0805' }}>
      <LinearGradient colors={['#0c0805', '#1a140f']} style={StyleSheet.absoluteFill} />
      {!hideHeader && (
        <View style={s.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}><ChevronRight color="#fcd34d" size={24} /></TouchableOpacity>
          <Text style={s.headerTitle}>اتجاه القبلة</Text>
          <View style={{ width: 44 }} />
        </View>
      )}

      <View style={s.container}>
        {error ? <Text style={s.errorText}>{error}</Text> : (
          <>
            <View style={s.infoCard}>
              <View style={s.infoIconWrap}><Navigation color="#fcd34d" size={18} fill="#fcd34d" /></View>
              <Text style={s.infoText}>القبلة: <Text style={s.goldText}>{Math.round(qiblaDir)}°</Text> من الشمال</Text>
            </View>

            <View style={s.compassWrapper}>
              <View style={[s.glowRing, Math.abs(qiblaRotation % 360) < 5 && s.glowRingActive]} />
              <View style={s.compassContainer}>
                <CompassDisk rotateDisk={rotateDisk} />
                <View style={s.deviceMarkerContainer}><View style={s.deviceMarker} /></View>
                <QiblaPointer rotateQibla={rotateQibla} />
                <View style={s.centerCapOuter}><View style={s.centerCapInner} /></View>
              </View>
            </View>

            <View style={s.statusBanner}>
              <Text style={s.statusText}>{heading === 0 ? 'جاري معايرة الحساسات...' : (Math.abs(qiblaRotation % 360) < 5 || Math.abs(qiblaRotation % 360) > 355 ? 'تم تحديد القبلة بدقة' : 'قم بتدوير الهاتف باتجاه الكعبة')}</Text>
              <View style={s.accuracyBadge}><View style={s.onlinePulse} /><Text style={s.accuracyLabel}>دقة عالية (True North)</Text></View>
            </View>
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

export default QiblaScreen;
