import React, { useEffect, useState } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { X, Volume2 } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AudioService } from '../../../data/services/AudioService';

const { width, height } = Dimensions.get('window');

interface AzanVideoModalProps {
  visible: boolean;
  onClose: () => void;
  prayerName: string;
}

export const AzanVideoModal: React.FC<AzanVideoModalProps> = ({ visible, onClose, prayerName }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleClose = async () => {
    await AudioService.stop();
    onClose();
  };

  return (
    <Modal visible={visible} animationType="fade" transparent statusBarTranslucent>
      <View style={s.container}>
        <Video
          source={require('../../../../assets/video/azan_video.mp4')} 
          style={s.video}
          shouldPlay={visible}
          isLooping
          resizeMode={ResizeMode.COVER}
          isMuted={true} // Audio handled by AudioService
          onError={(error) => console.error('AzanVideoModal: Local Video Error:', error)}
        />
        
        <LinearGradient
          colors={['rgba(0,0,0,0.6)', 'transparent', 'rgba(0,0,0,0.8)']}
          style={s.overlay}
        >
          <View style={s.header}>
            <TouchableOpacity style={s.closeBtn} onPress={handleClose}>
              <X color="#fff" size={28} />
            </TouchableOpacity>
          </View>

          <View style={s.content}>
            <Text style={s.timeText}>
              {currentTime.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
            </Text>
            <View style={s.prayerBadge}>
              <Text style={s.prayerLabel}>حان الآن وقت</Text>
              <Text style={s.prayerName}>{prayerName}</Text>
            </View>
            
            <View style={s.statusRow}>
              <Volume2 color="#d4af37" size={20} />
              <Text style={s.statusText}>صوت الآذان يرفع الآن...</Text>
            </View>
          </View>

          <View style={s.footer}>
            <Text style={s.quote}>"يا أيها الذين آمنوا إذا نودِي للصلاة من يوم الجمعة فاسعوا إلى ذكر الله"</Text>
          </View>
        </LinearGradient>
      </View>
    </Modal>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  video: { width, height, position: 'absolute' },
  videoPlaceholder: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  overlay: { flex: 1, justifyContent: 'space-between', padding: 30, paddingVertical: 60 },
  header: { alignItems: 'flex-end' },
  closeBtn: { width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  content: { alignItems: 'center' },
  timeText: { fontFamily: 'Tajawal_700Bold', fontSize: 64, color: '#fff', marginBottom: 10 },
  prayerBadge: { backgroundColor: 'rgba(212, 175, 55, 0.2)', paddingHorizontal: 30, paddingVertical: 15, borderRadius: 20, borderWidth: 1, borderColor: '#d4af37', alignItems: 'center' },
  prayerLabel: { fontFamily: 'Tajawal_400Regular', fontSize: 16, color: '#d4af37', marginBottom: 5 },
  prayerName: { fontFamily: 'Amiri_700Bold', fontSize: 42, color: '#fff' },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 40 },
  statusText: { fontFamily: 'Tajawal_500Medium', fontSize: 16, color: '#d4af37' },
  footer: { alignItems: 'center' },
  quote: { fontFamily: 'Amiri_400Regular', fontSize: 18, color: '#94a3b8', textAlign: 'center', fontStyle: 'italic' },
});
