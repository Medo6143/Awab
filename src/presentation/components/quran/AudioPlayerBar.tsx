import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, Animated, PanResponder, Dimensions, ImageBackground } from 'react-native';
import { Play, Pause, RotateCcw, RotateCw, X } from 'lucide-react-native';
import Slider from '@react-native-community/slider';
import { LinearGradient } from 'expo-linear-gradient';

const { width: W } = Dimensions.get('window');

interface AudioPlayerBarProps {
  isPlaying: boolean;
  isBuffering: boolean;
  currentPosition: number;
  duration: number;
  onTogglePlayback: () => void;
  onSeek: (value: number) => void;
  onClose: () => void;
  onForward: () => void;
  onBackward: () => void;
  surahName?: string;
  reciterName?: string;
}

export const AudioPlayerBar: React.FC<AudioPlayerBarProps> = ({
  isPlaying, isBuffering, currentPosition, duration,
  onTogglePlayback, onSeek, onClose, onForward, onBackward,
  surahName, reciterName
}) => {
  const pan = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gesture) => {
        // Only start moving if there's significant movement, otherwise let buttons handle taps
        return Math.abs(gesture.dx) > 5 || Math.abs(gesture.dy) > 5;
      },
      onPanResponderGrant: () => {
        pan.setOffset({
          x: (pan.x as any)._value,
          y: (pan.y as any)._value
        });
      },
      onPanResponderMove: Animated.event(
        [null, { dx: pan.x, dy: pan.y }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: () => {
        pan.flattenOffset();
      }
    })
  ).current;

  const formatTime = (millis: number) => {
    const totalSeconds = millis / 1000;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <Animated.View 
      {...panResponder.panHandlers}
      style={[
        s.container,
        {
          transform: [
            { translateX: pan.x },
            { translateY: pan.y }
          ]
        }
      ]}
    >
      <ImageBackground 
        source={require('../../../../assets/images/mosque_bg.png')} 
        style={s.bgImage}
        imageStyle={s.bgImageStyle}
      >
        <LinearGradient 
          colors={['rgba(26, 18, 11, 0.85)', 'rgba(26, 18, 11, 0.95)']} 
          style={s.overlay}
        >
          {/* Progress Slider */}
          <Slider
              style={s.slider}
              minimumValue={0}
              maximumValue={duration || 1}
              value={currentPosition}
              onSlidingComplete={onSeek}
              minimumTrackTintColor="#fbbf24"
              maximumTrackTintColor="rgba(251, 191, 36, 0.2)"
              thumbTintColor="#fbbf24"
          />

          <View style={s.content}>
              <View style={s.info}>
                  <Text style={s.surahText} numberOfLines={1}>{surahName || 'جاري التشغيل...'}</Text>
                  <Text style={s.reciterText} numberOfLines={1}>{reciterName}</Text>
              </View>

              <View style={s.controls}>
                  <TouchableOpacity onPress={onBackward} style={s.subBtn}>
                      <RotateCcw size={22} color="#fbbf24" />
                  </TouchableOpacity>

                  <TouchableOpacity onPress={onTogglePlayback} style={s.mainBtn}>
                      {isBuffering ? (
                          <ActivityIndicator size="small" color="#0c0805" />
                      ) : isPlaying ? (
                          <Pause size={26} color="#0c0805" fill="#0c0805" />
                      ) : (
                          <Play size={26} color="#0c0805" fill="#0c0805" />
                      )}
                  </TouchableOpacity>

                  <TouchableOpacity onPress={onForward} style={s.subBtn}>
                      <RotateCw size={22} color="#fbbf24" />
                  </TouchableOpacity>
              </View>

              <TouchableOpacity onPress={onClose} style={s.closeBtn}>
                  <X size={20} color="#94a3b8" />
              </TouchableOpacity>
          </View>

          <View style={s.timeRow}>
              <Text style={s.timeText}>{formatTime(currentPosition)}</Text>
              <Text style={s.timeText}>{formatTime(duration)}</Text>
          </View>
        </LinearGradient>
      </ImageBackground>
    </Animated.View>
  );
};

const s = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 110,
    left: 10,
    right: 10,
    borderRadius: 15,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#d4af37',
    elevation: 15,
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 10,
    zIndex: 9999,
  },
  bgImage: {
    width: '100%',
  },
  bgImageStyle: {
    opacity: 0.4,
  },
  overlay: {
    paddingTop: 8,
    paddingBottom: 12,
    paddingHorizontal: 15,
  },
  slider: {
    width: '100%',
    height: 30,
    marginTop: -8,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: -4,
  },
  info: {
    flex: 1,
    marginRight: 10,
  },
  surahText: {
    fontFamily: 'Tajawal_700Bold',
    fontSize: 15,
    color: '#fbbf24',
    textAlign: 'right',
  },
  reciterText: {
    fontFamily: 'Tajawal_400Regular',
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'right',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  mainBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fbbf24',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
  },
  subBtn: {
    padding: 8,
  },
  closeBtn: {
    padding: 5,
    marginLeft: 8,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginTop: -2,
  },
  timeText: {
    fontFamily: 'Tajawal_400Regular',
    fontSize: 10,
    color: '#94a3b8',
  }
});
