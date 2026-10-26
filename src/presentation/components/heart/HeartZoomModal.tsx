import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Modal, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Maximize2, Minimize2 } from 'lucide-react-native';
import { ZoomableHeart } from './ZoomableHeart';
import { SURAH_NAMES } from '../../../shared/constants/surahs';
import { toAr } from './HeartJourneyConstants';
import { s } from './HeartJourneyStyles';
import { colors } from '../../../shared/theme/tokens';

type Props = {
  visible: boolean;
  onClose: () => void;
  completedSurahs: number[];
  progress: number;
  onToggleSurah: (id: number) => void;
};

/**
 * Full-screen, pannable 2.6× view of the heart so the 114 surah names are legible.
 * Taps still toggle the surah; a caption confirms what was tapped.
 */
export const HeartZoomModal = ({ visible, onClose, completedSurahs, progress, onToggleSurah }: Props) => {
  const { width: W } = useWindowDimensions();
  const [frameH, setFrameH] = useState(0);
  const [zoomed, setZoomed] = useState(true);
  const [last, setLast] = useState<{ id: number; done: boolean } | null>(null);
  const staticPulse = useRef(new Animated.Value(1)).current;
  const captionOpacity = useRef(new Animated.Value(0)).current;

  const size = zoomed ? W * 2.6 : W * 0.92;

  const toggle = useCallback((id: number) => {
    const nowDone = !completedSurahs.includes(id);
    onToggleSurah(id);
    setLast({ id, done: nowDone });
  }, [completedSurahs, onToggleSurah]);

  useEffect(() => {
    if (!last) return;
    captionOpacity.setValue(1);
    const anim = Animated.timing(captionOpacity, { toValue: 0, duration: 400, delay: 1800, useNativeDriver: true });
    anim.start();
    return () => anim.stop();
  }, [last, captionOpacity]);

  useEffect(() => { if (!visible) setLast(null); }, [visible]);

  return (
    <Modal visible={visible} animationType="fade" statusBarTranslucent onRequestClose={onClose}>
      <SafeAreaView style={s.zoomRoot}>
        <View style={s.zoomHeader}>
          <TouchableOpacity onPress={onClose} style={s.backBtn} accessibilityLabel="إغلاق">
            <X color={colors.goldText} size={22} />
          </TouchableOpacity>
          <Text style={s.zoomTitle}>القلب · عرض مكبّر</Text>
          <TouchableOpacity onPress={() => setZoomed((z) => !z)} style={s.backBtn} accessibilityLabel={zoomed ? 'ملاءمة الشاشة' : 'تكبير'}>
            {zoomed ? <Minimize2 color={colors.goldText} size={22} /> : <Maximize2 color={colors.goldText} size={22} />}
          </TouchableOpacity>
        </View>

        <View style={{ flex: 1 }} onLayout={(e) => setFrameH(e.nativeEvent.layout.height)}>
          {frameH > 0 ? (
            <ZoomableHeart
              frameW={W}
              frameH={frameH}
              size={size}
              pulseAnim={staticPulse}
              completedSurahs={completedSurahs}
              progress={progress}
              onToggleSurah={toggle}
            />
          ) : null}
        </View>

        <Text style={s.zoomHint}>اسحب للتنقّل • اضغط على السورة لتحديدها</Text>

        {last && (
          <Animated.View pointerEvents="none" style={[s.zoomCaption, { opacity: captionOpacity }]}>
            <Text style={s.zoomCaptionText}>
              {toAr(last.id)} · {SURAH_NAMES[last.id - 1]} — {last.done ? 'تم' : 'غير مكتملة'}
            </Text>
          </Animated.View>
        )}
      </SafeAreaView>
    </Modal>
  );
};
