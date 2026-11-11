import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RECITER_MAP } from '../../domain/entities/reciters';
import { AyahKey } from '../../domain/services/Audio';
import { useDependencies } from '../providers/DependencyProvider';
import { RootState } from '../store';
import { setReciterId } from '../store/slices/settingsSlice';
import { setAudioState } from '../store/slices/audioSlice';
import { usePlaybackState, useProgress, State } from 'react-native-track-player';

export const useAudio = () => {
  const dispatch = useDispatch();
  const { selectedReciterId } = useSelector((state: RootState) => state.settings);
  const state = useSelector((state: RootState) => state.audio);
  const { quranPlayer: player } = useDependencies();

  // keep the player on the reciter chosen in settings
  useEffect(() => {
    player.setReciter(selectedReciterId);
  }, [player, selectedReciterId]);

  const { state: playbackState } = usePlaybackState();
  const progress = useProgress();

  // Sync TrackPlayer state to Redux
  useEffect(() => {
    const isPlaying = playbackState === State.Playing;
    const isBuffering = playbackState === State.Buffering || playbackState === State.Loading;
    
    dispatch(setAudioState({
      isPlaying,
      isBuffering,
      currentPosition: progress.position * 1000,
      duration: progress.duration * 1000,
    }));
  }, [playbackState, progress.position, progress.duration, dispatch]);

  const changeReciter = (id: string) => {
    dispatch(setReciterId(id));
  };

  const playSurah = async (surahId: number, surahName?: string) => {
    dispatch(setAudioState({ currentSurahId: surahId, isBuffering: true, playMode: 'surah' }));
    await player.playSurah(surahId, surahName);
  };

  const playAyah = async (surahId: number, ayahNumber: number, surahName?: string) => {
    dispatch(setAudioState({ currentSurahId: surahId, isBuffering: true, playMode: 'ayah' }));
    await player.playAyah(surahId, ayahNumber, surahName);
  };

  const playSequence = async (items: AyahKey[], title?: string) => {
    if (items.length === 0) return;
    dispatch(setAudioState({ currentSurahId: items[0].surahId, isBuffering: true, playMode: 'sequence' }));
    await player.playSequence(items, title, () => {
      dispatch(setAudioState({ isPlaying: false, isBuffering: false, playMode: undefined }));
    });
  };

  const togglePlayback = async () => {
    if (state.isPlaying) {
      await player.pause();
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
    dispatch(setAudioState({
      isPlaying: false,
      isBuffering: false,
      currentSurahId: null,
      currentPosition: 0,
      duration: 0,
      playMode: undefined,
    }));
  };

  return { 
    ...state, 
    activeReciter: RECITER_MAP[selectedReciterId],
    changeReciter,
    playSurah, 
    playAyah, 
    playSequence, 
    togglePlayback, 
    stopPlayback,
    seekTo,
    resumePlayback
  };
};
