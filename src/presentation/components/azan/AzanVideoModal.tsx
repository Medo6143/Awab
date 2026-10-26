import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Modal, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { X } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AudioService } from '../../../data/services/AudioService';
import { verseForPrayer } from '../../../domain/entities/prayerVerses';
import { ADHAN_LINES, adhanLineAt } from '../../../domain/entities/adhan';
import { useDependencies } from '../../providers/DependencyProvider';
import { toAr } from '../../../shared/utils/format';

interface AzanVideoModalProps {
  visible: boolean;
  onClose: () => void;
  prayerName: string;
}

const MOSQUE = require('../../../../assets/images/mosque_bg.png');

/**
 * Follows the adhan being played: the native alarm service when it is the one playing,
 * otherwise the in-app player, otherwise the time since the screen opened. Returns the
 * index of the line being called.
 */
const useAdhanLine = () => {
  const { azanAlarms } = useDependencies();
  const openedAt = useRef(Date.now()).current;
  const [line, setLine] = useState(0);
  useEffect(() => {
    let alive = true;
    const tick = async () => {
      const pos = (await azanAlarms.playbackPosition()) ?? (await AudioService.azanPosition()) ?? (Date.now() - openedAt) / 1000;
      if (alive) setLine(adhanLineAt(pos));
    };
    tick();
    const id = setInterval(tick, 400);
    return () => { alive = false; clearInterval(id); };
  }, [azanAlarms, openedAt]);
  return line;
};

const formatTime = (d: Date) => {
  const h = d.getHours() % 12 || 12;
  const m = d.getMinutes().toString().padStart(2, '0');
  return `${toAr(`${h}:${m}`)} ${d.getHours() < 12 ? 'ص' : 'م'}`;
};

const AzanContent = ({ onClose, prayerName }: { onClose: () => void; prayerName: string }) => {
  const { width, height } = useWindowDimensions();
  const { azanAlarms } = useDependencies();
  const verse = verseForPrayer(prayerName);
  const line = useAdhanLine();
  const [now, setNow] = useState(new Date());

  // slow camera move over the mosque, a breathing light in its doorway, a fade per adhan line
  const zoom = useRef(new Animated.Value(0)).current;
  const glow = useRef(new Animated.Value(0)).current;
  const phrase = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 15000);
    const z = Animated.loop(Animated.sequence([
      Animated.timing(zoom, { toValue: 1, duration: 22000, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      Animated.timing(zoom, { toValue: 0, duration: 22000, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
    ]));
    const g = Animated.loop(Animated.sequence([
      Animated.timing(glow, { toValue: 1, duration: 1600, useNativeDriver: true }),
      Animated.timing(glow, { toValue: 0, duration: 1600, useNativeDriver: true }),
    ]));
    z.start(); g.start();
    return () => { clearInterval(t); z.stop(); g.stop(); };
  }, []);

  useEffect(() => {
    phrase.setValue(0);
    Animated.timing(phrase, { toValue: 1, duration: 450, easing: Easing.out(Easing.quad), useNativeDriver: true }).start();
  }, [line]);

  const handleClose = async () => {
    azanAlarms.stop();
    await AudioService.stop();
    onClose();
  };

  const side = Math.max(width, height); // the image is square: cover the screen

  return (
    <View style={s.container}>
      <Animated.Image
        source={MOSQUE}
        resizeMode="cover"
        style={{
          position: 'absolute', width: side, height: side, left: (width - side) / 2, top: (height - side) / 2,
          transform: [
            { scale: zoom.interpolate({ inputRange: [0, 1], outputRange: [1.02, 1.14] }) },
            { translateY: zoom.interpolate({ inputRange: [0, 1], outputRange: [0, -height * 0.02] }) },
          ],
        }}
      />
      <Animated.View pointerEvents="none" style={[s.glow, { opacity: glow.interpolate({ inputRange: [0, 1], outputRange: [0, 0.18] }) }]} />
      <LinearGradient
        colors={['rgba(10,6,16,0.85)', 'rgba(10,6,16,0.1)', 'rgba(10,6,16,0.15)', 'rgba(10,6,16,0.95)']}
        locations={[0, 0.3, 0.5, 0.82]}
        style={StyleSheet.absoluteFill}
      />

      <View style={s.overlay}>
        <TouchableOpacity onPress={handleClose} style={s.closeBtn} accessibilityLabel="إغلاق">
          <X color="#fff" size={22} />
        </TouchableOpacity>

        <View style={s.head}>
          <Text allowFontScaling={false} style={s.label}>حان الآن موعد صلاة</Text>
          <Text allowFontScaling={false} style={s.prayerName}>{prayerName}</Text>
          <Text allowFontScaling={false} style={s.time}>{formatTime(now)}</Text>
        </View>

        <View style={s.phraseWrap}>
          <Animated.Text
            allowFontScaling={false}
            style={[s.phrase, { opacity: phrase, transform: [{ translateY: phrase.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }] }]}
          >
            {ADHAN_LINES[line].text}
          </Animated.Text>
          <View style={s.dots}>
            {ADHAN_LINES.map((_, i) => <View key={i} style={[s.dot, i <= line && s.dotOn]} />)}
          </View>
        </View>

        <View>
          <View style={s.verseCard}>
            {/* no-break spaces keep the brackets glued to the first and last words */}
            <Text allowFontScaling={false} style={s.verse}>{`﴿ ${verse.text} ﴾`}</Text>
            <Text allowFontScaling={false} style={s.verseRef}>{verse.ref}</Text>
          </View>
          <TouchableOpacity onPress={handleClose} style={s.stopBtn} accessibilityRole="button">
            <Text allowFontScaling={false} style={s.stopText}>إيقاف الأذان</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export const AzanVideoModal: React.FC<AzanVideoModalProps> = ({ visible, onClose, prayerName }) => {
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => setShouldRender(true), 500);
      return () => clearTimeout(timer);
    } else {
      setShouldRender(false);
    }
  }, [visible]);

  return (
    <Modal visible={visible} animationType="fade" transparent statusBarTranslucent>
      {shouldRender ? (
        <AzanContent onClose={onClose} prayerName={prayerName} />
      ) : (
        <View style={{ flex: 1, backgroundColor: '#0a0610' }} />
      )}
    </Modal>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0610', overflow: 'hidden' },
  glow: { ...StyleSheet.absoluteFillObject, backgroundColor: '#ffb347' },
  overlay: { flex: 1, justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 56, paddingBottom: 34 },
  closeBtn: { position: 'absolute', top: 52, left: 16, width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(255,255,255,0.16)', alignItems: 'center', justifyContent: 'center', zIndex: 2 },
  head: { alignItems: 'center', marginTop: 12 },
  label: { fontFamily: 'Tajawal_500Medium', fontSize: 15, color: '#f3d57a' },
  prayerName: { fontFamily: 'Amiri_700Bold', fontSize: 58, lineHeight: 92, color: '#fff', textShadowColor: 'rgba(0,0,0,0.6)', textShadowRadius: 12 },
  time: { fontFamily: 'Tajawal_700Bold', fontSize: 20, color: 'rgba(255,255,255,0.85)' },
  phraseWrap: { alignItems: 'center', paddingHorizontal: 8 },
  phrase: { fontFamily: 'Amiri_700Bold', fontSize: 34, lineHeight: 60, color: '#fff', textAlign: 'center', textShadowColor: 'rgba(0,0,0,0.75)', textShadowRadius: 14 },
  dots: { flexDirection: 'row', gap: 6, marginTop: 12 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.25)' },
  dotOn: { backgroundColor: '#d4af37' },
  verseCard: { alignSelf: 'stretch', borderRadius: 20, paddingVertical: 14, paddingHorizontal: 12, backgroundColor: 'rgba(12,8,5,0.72)', borderWidth: 1, borderColor: 'rgba(212,175,55,0.35)' },
  verse: { fontFamily: 'Amiri_700Bold', fontSize: 18, lineHeight: 34, color: '#f5efe6', textAlign: 'center' },
  verseRef: { fontFamily: 'Tajawal_500Medium', fontSize: 12, color: '#c8b99f', textAlign: 'center', marginTop: 4 },
  stopBtn: { marginTop: 14, height: 52, borderRadius: 26, backgroundColor: '#d4af37', alignItems: 'center', justifyContent: 'center' },
  stopText: { fontFamily: 'Tajawal_700Bold', fontSize: 16, color: '#1a140f' },
});
