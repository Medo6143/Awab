import React, { useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Pause, Play, X } from 'lucide-react-native';
import { ScreenProps } from '../navigation/types';
import { Screen, ScreenHeader } from '../components/ui';
import { RecitationList } from '../components/quran/RecitationList';
import { ReciterPickerModal } from '../components/quran/ReciterPickerModal';
import { useAudio } from '../hooks/useAudio';
import { SURAH_NAMES } from '../../shared/constants/surahs';
import { colors, elevation, icon, radius, space, type, themed } from '../../shared/theme/tokens';
import { useAccent } from '../../shared/theme/useAccent';

const BAR_H = 64;

/**
 * Listening on its own, outside the mushaf: pick a reciter and a surah. Same player as the
 * mushaf (useAudio), so what plays here shows there too, with the media notification.
 */
const RecitationsScreen = ({ navigation }: Pick<ScreenProps, 'navigation'>) => {
  const accent = useAccent();
  const bottom = useSafeAreaInsets().bottom;
  const [pickReciter, setPickReciter] = useState(false);
  const { activeReciter, changeReciter, currentSurahId, playMode, isPlaying, isBuffering, playSurah, togglePlayback, stopPlayback } = useAudio();
  const nowPlaying = playMode === 'surah' && currentSurahId ? currentSurahId : null;

  return (
    <Screen padded={false} header={<ScreenHeader title="التلاوات" subtitle="اسمع أي سورة بصوت القارئ اللي تختاره" onBack={() => navigation.goBack()} />}>
      <RecitationList
        reciterName={activeReciter?.name}
        onChangeReciter={() => setPickReciter(true)}
        currentSurahId={nowPlaying}
        isPlaying={isPlaying}
        isBuffering={isBuffering}
        onPressSurah={(n, name) => (nowPlaying === n ? togglePlayback() : playSurah(n, name))}
        bottomInset={(nowPlaying ? BAR_H + space[3] : 0) + space[8] + bottom}
      />

      {nowPlaying ? (
        <View style={[st.bar, elevation.floating, { bottom: space[3] + bottom }]}>
          <TouchableOpacity
            onPress={togglePlayback}
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
            <Text style={st.title} numberOfLines={1}>{`سورة ${SURAH_NAMES[nowPlaying - 1]}`}</Text>
            <Text style={st.sub} numberOfLines={1}>{activeReciter?.name}</Text>
          </View>
          <TouchableOpacity onPress={stopPlayback} hitSlop={10} accessibilityRole="button" accessibilityLabel="إيقاف التلاوة">
            <X size={icon.size.md} color={colors.textMuted} strokeWidth={icon.stroke} />
          </TouchableOpacity>
        </View>
      ) : null}

      <ReciterPickerModal
        visible={pickReciter}
        onClose={() => setPickReciter(false)}
        activeReciter={activeReciter}
        onReciterChange={(id) => { changeReciter(id); setPickReciter(false); }}
      />
    </Screen>
  );
};

const st = themed(() => ({
  bar: {
    position: 'absolute', left: space[5], right: space[5], height: BAR_H,
    flexDirection: 'row', alignItems: 'center', gap: space[3],
    paddingHorizontal: space[3], borderRadius: radius.card, backgroundColor: colors.surfaceRaised,
  },
  play: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1 },
  title: { ...type.bodyMedium, color: colors.text },
  sub: { ...type.caption, color: colors.textMuted },
}));

export default RecitationsScreen;
