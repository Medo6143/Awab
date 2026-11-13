import React, { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenProps } from '../navigation/types';
import { Screen, ScreenHeader } from '../components/ui';
import { RecitationList } from '../components/quran/RecitationList';
import { ReciterPickerModal } from '../components/quran/ReciterPickerModal';
import { NOW_PLAYING_BAR_H, NowPlayingBar } from '../components/quran/NowPlayingBar';
import { useAudio } from '../hooks/useAudio';
import { SURAH_NAMES } from '../../shared/constants/surahs';
import { space } from '../../shared/theme/tokens';

/**
 * Listening on its own, outside the mushaf: pick a reciter and a surah. Same player as the
 * mushaf (useAudio), so what plays here shows there too, with the media notification.
 */
const RecitationsScreen = ({ navigation }: Pick<ScreenProps, 'navigation'>) => {
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
        bottomInset={(nowPlaying ? NOW_PLAYING_BAR_H + space[3] : 0) + space[8] + bottom}
      />

      {nowPlaying ? (
        <NowPlayingBar
          title={`سورة ${SURAH_NAMES[nowPlaying - 1]}`}
          subtitle={activeReciter?.name}
          isPlaying={isPlaying}
          isBuffering={isBuffering}
          onToggle={togglePlayback}
          onStop={stopPlayback}
        />
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

export default RecitationsScreen;
