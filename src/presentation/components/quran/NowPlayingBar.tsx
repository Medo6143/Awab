import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Pause, Play, X } from 'lucide-react-native';
import { colors, elevation, icon, radius, space, type, themed } from '../../../shared/theme/tokens';
import { useAccent } from '../../../shared/theme/useAccent';

export const NOW_PLAYING_BAR_H = 64;

type Props = {
  title: string;
  subtitle?: string;
  isPlaying: boolean;
  isBuffering: boolean;
  /** Shows a «مباشر» tag (radio). */
  live?: boolean;
  onToggle: () => void;
  onStop: () => void;
};

/** The floating bar at the bottom of the listening screens: what plays, play/pause, stop. */
export const NowPlayingBar = ({ title, subtitle, isPlaying, isBuffering, live, onToggle, onStop }: Props) => {
  const accent = useAccent();
  const bottom = useSafeAreaInsets().bottom;
  return (
    <View style={[st.bar, elevation.floating, { bottom: space[3] + bottom }]}>
      <TouchableOpacity
        onPress={onToggle}
        style={[st.play, { backgroundColor: accent.accent }]}
        accessibilityRole="button"
        accessibilityLabel={isPlaying ? 'إيقاف مؤقت' : 'تشغيل'}
      >
        {isBuffering ? (
          <ActivityIndicator size="small" color={accent.onAccent} />
        ) : isPlaying ? (
          <Pause size={icon.size.md} color={accent.onAccent} fill={accent.onAccent} />
        ) : (
          <Play size={icon.size.md} color={accent.onAccent} fill={accent.onAccent} />
        )}
      </TouchableOpacity>
      <View style={st.info}>
        <Text style={st.title} numberOfLines={1}>{title}</Text>
        <View style={st.subRow}>
          {live ? (
            <View style={[st.live, { backgroundColor: colors.dangerSoft }]}>
              <View style={[st.dot, { backgroundColor: colors.dangerText }]} />
              <Text style={[st.liveText, { color: colors.dangerText }]}>مباشر</Text>
            </View>
          ) : null}
          {subtitle ? <Text style={st.sub} numberOfLines={1}>{subtitle}</Text> : null}
        </View>
      </View>
      <TouchableOpacity onPress={onStop} hitSlop={10} accessibilityRole="button" accessibilityLabel="إيقاف">
        <X size={icon.size.md} color={colors.textMuted} strokeWidth={icon.stroke} />
      </TouchableOpacity>
    </View>
  );
};

const st = themed(() => ({
  bar: {
    position: 'absolute', left: space[5], right: space[5], height: NOW_PLAYING_BAR_H,
    flexDirection: 'row', alignItems: 'center', gap: space[3],
    paddingHorizontal: space[3], borderRadius: radius.card, backgroundColor: colors.surfaceRaised,
  },
  play: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1 },
  title: { ...type.bodyMedium, color: colors.text },
  subRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  sub: { ...type.caption, color: colors.textMuted, flexShrink: 1 },
  live: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 6, paddingVertical: 1, borderRadius: radius.pill, marginEnd: space[2] },
  dot: { width: 6, height: 6, borderRadius: 3, marginEnd: 4 },
  liveText: { ...type.caption, fontSize: 11 },
}));
