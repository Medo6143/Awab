import React, { useEffect, useRef } from 'react';
import { View, Text, Animated } from 'react-native';
import { MapPinOff } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useLocation } from '../hooks/useLocation';
import { Screen, ScreenHeader, StatNumber, Chip, EmptyState } from '../components/ui';
import { CompassDisk, QiblaPointer } from '../components/qibla/QiblaComponents';
import { s } from '../components/qibla/QiblaStyles';
import { colors } from '../../shared/theme/tokens';
import { toAr } from '../../shared/utils/format';

const ACCURACY_LABEL: Record<string, string> = { high: 'دقة عالية', medium: 'دقة متوسطة', low: 'دقة منخفضة', unknown: 'معايرة' };

const QiblaScreen = ({ navigation, hideHeader, tab }: any) => {
  const { heading, qiblaDir, accuracy, error } = useLocation();
  const headingAnim = useRef(new Animated.Value(0)).current;
  const qiblaAnim = useRef(new Animated.Value(0)).current;
  const prevHeadingRaw = useRef(0);
  const prevQiblaRaw = useRef(0);

  const shortest = (current: number, previousRaw: number) => {
    let diff = current - (previousRaw % 360);
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;
    return previousRaw + diff;
  };

  const qiblaRotation = (qiblaDir - heading + 360) % 360;
  const delta = Math.min(qiblaRotation, 360 - qiblaRotation);
  const aligned = heading !== 0 && delta < 5;

  useEffect(() => {
    const targetHeading = shortest(-heading, prevHeadingRaw.current);
    const targetQibla = shortest(qiblaRotation, prevQiblaRaw.current);
    prevHeadingRaw.current = targetHeading;
    prevQiblaRaw.current = targetQibla;
    Animated.parallel([
      Animated.timing(headingAnim, { toValue: targetHeading, duration: 100, useNativeDriver: true }),
      Animated.timing(qiblaAnim, { toValue: targetQibla, duration: 100, useNativeDriver: true }),
    ]).start();
  }, [heading, qiblaRotation]);

  useEffect(() => {
    if (aligned) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, [aligned]);

  const rotateDisk = headingAnim.interpolate({ inputRange: [-10000, 10000], outputRange: ['-10000deg', '10000deg'] });
  const rotateQibla = qiblaAnim.interpolate({ inputRange: [-10000, 10000], outputRange: ['-10000deg', '10000deg'] });

  const status = heading === 0 ? 'حرّك الهاتف على شكل ∞ للمعايرة' : aligned ? 'أنت تواجه القبلة' : 'أدر الهاتف نحو الكعبة';

  return (
    <Screen
      scroll
      tab={tab}
      edges={hideHeader ? [] : ['top']}
      header={!hideHeader ? <ScreenHeader title="اتجاه القبلة" onBack={() => navigation.goBack()} /> : undefined}
    >
      {error ? (
        <EmptyState icon={MapPinOff} title="الموقع غير متاح" message="فعّل خدمة الموقع ثم افتح الشاشة مرة أخرى لتحديد اتجاه القبلة." />
      ) : (
        <View style={s.container}>
          <View style={s.compassWrapper}>
            <View style={[s.ring, aligned && s.ringAligned]} />
            <View style={s.compassContainer}>
              <CompassDisk rotateDisk={rotateDisk} />
              <View style={s.deviceMarkerContainer}><View style={s.deviceMarker} /></View>
              <QiblaPointer rotateQibla={rotateQibla} />
              <View style={s.centerCapOuter}><View style={s.centerCapInner} /></View>
            </View>
          </View>

          <Text style={[s.statusText, aligned && { color: colors.goldText }]}>{status}</Text>

          <View style={s.statsRow}>
            <StatNumber value={`${toAr(Math.round(qiblaDir))}°`} caption="اتجاه القبلة من الشمال" size="h1" />
            <StatNumber value={`${toAr(Math.round(delta))}°`} caption="الانحراف الحالي" size="h1" color={aligned ? colors.success : undefined} />
          </View>

          <View style={s.chipsRow}>
            <Chip label={ACCURACY_LABEL[accuracy] ?? 'معايرة'} selected={accuracy === 'high'} size="sm" />
            <Chip label="الشمال الحقيقي" size="sm" />
          </View>
          <Text style={s.hint}>ابتعد عن المعادن والمغناطيس للحصول على قراءة أدق</Text>
        </View>
      )}
    </Screen>
  );
};

export default QiblaScreen;
