import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RECITER_MAP } from '../../domain/entities/reciters';
import { AyahKey } from '../../domain/services/Audio';
import { RadioStation } from '../../domain/entities/radio';
import { useDependencies } from '../providers/DependencyProvider';
import { RootState } from '../store';
import { setReciterId } from '../store/slices/settingsSlice';
import { setAudioState } from '../store/slices/audioSlice';

export const useAudio = () => {
  const dispatch = useDispatch();
  const { selectedReciterId } = useSelector((state: RootState) => state.settings);
  const state = useSelector((state: RootState) => state.audio);
  const { quranPlayer: player } = useDependencies();

  // keep the player on the reciter chosen in settings
  useEffect(() => {
    player.setReciter(selectedReciterId);
  }, [player, selectedReciterId]);

  // isPlaying / isBuffering / position come from the player itself, through useAudioSync

  const changeReciter = (id: string) => {
    dispatch(setReciterId(id));
  };

  const playSurah = async (surahId: number, surahName?: string) => {
    dispatch(setAudioState({ currentSurahId: surahId, playMode: 'surah', liveStation: null }));
    await player.playSurah(surahId, surahName);
  };

  const playAyah = async (surahId: number, ayahNumber: number, surahName?: string) => {
    dispatch(setAudioState({ currentSurahId: surahId, playMode: 'ayah', liveStation: null }));
    await player.playAyah(surahId, ayahNumber, surahName);
  };

  const playSequence = async (items: AyahKey[], title?: string) => {
    if (items.length === 0) return;
    dispatch(setAudioState({ currentSurahId: items[0].surahId, playMode: 'sequence', liveStation: null }));
    await player.playSequence(items, title, () => {
      dispatch(setAudioState({ playMode: undefined }));
    });
  };

  const playLive = async (station: RadioStation) => {
    const liveStation = { id: station.id, name: station.name, url: station.url };
    dispatch(setAudioState({ currentSurahId: null, playMode: 'live', liveStation }));
    await player.playLive({ url: station.url, title: station.name });
  };

  const togglePlayback = async () => {
    if (state.isPlaying) {
      await player.pause();
      return;
    }
    // a paused live stream resumes from where the buffer stopped, minutes behind the
    // broadcast: start it again at the live point instead
    if (state.playMode === 'live' && state.liveStation) {
      await playLive(state.liveStation);
      return;
    }
    // After an app restart the persisted "current surah" has no queue behind it,
    // so resume() would silently do nothing. Re-load the surah in that case.
    if (state.playMode === 'surah' && state.currentSurahId) {
      if (!(await player.hasQueue())) {
        await playSurah(state.currentSurahId);
        return;
      }
    }
    await player.resume();
  };

  const resumePlayback = async () => {
    await player.resume();
  };

  const seekTo = async (positionMillis: number) => {
    await player.seek(positionMillis);
  };

  const stopPlayback = async () => {
    await player.stop();
    dispatch(setAudioState({ currentSurahId: null, playMode: undefined, liveStation: null }));
  };

  return { 
    ...state, 
    activeReciter: RECITER_MAP[selectedReciterId],
    changeReciter,
    playSurah, 
    playAyah, 
    playSequence, 
    playLive,
    togglePlayback, 
    stopPlayback,
    seekTo,
    resumePlayback
  };
};
