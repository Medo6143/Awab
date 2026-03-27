import { useCallback, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { AudioService, RECITER_MAP } from '../../data/services/AudioService';
import { AudioState } from '../../domain/entities/types';
import { RootState } from '../store';
import { setReciterId } from '../store/slices/settingsSlice';
import { setAudioState } from '../store/slices/audioSlice';
import { usePlaybackState, useProgress, State } from 'react-native-track-player';

export const useAudio = () => {
  const dispatch = useDispatch();
  const { selectedReciterId } = useSelector((state: RootState) => state.settings);
  const state = useSelector((state: RootState) => state.audio);
  
  // Sync AudioService with Redux setting
  useEffect(() => {
    AudioService.setReciter(selectedReciterId);
  }, [selectedReciterId]);

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

  const onStatusUpdate = useCallback((status: any) => {
    // Only used for Azan (expo-av) now
    if (status.isLoaded) {
      dispatch(setAudioState({
        isPlaying: status.isPlaying,
        isBuffering: status.isBuffering,
        currentPosition: status.positionMillis,
        duration: status.durationMillis || 0,
      }));
    }
  }, [dispatch]);

  const changeReciter = (id: string) => {
    dispatch(setReciterId(id));
  };

  const playSurah = async (surahId: number, surahName?: string) => {
    dispatch(setAudioState({ currentSurahId: surahId, isBuffering: true, playMode: 'surah' }));
    await AudioService.playSurah(surahId, surahName);
  };

  const playAyah = async (surahId: number, ayahNumber: number, surahName?: string) => {
    dispatch(setAudioState({ currentSurahId: surahId, isBuffering: true, playMode: 'ayah' }));
    await AudioService.playAyah(surahId, ayahNumber, surahName);
  };

  const playSequence = async (items: { surahId: number, ayahNumber: number }[], title?: string) => {
    if (items.length === 0) return;
    dispatch(setAudioState({ currentSurahId: items[0].surahId, isBuffering: true, playMode: 'sequence' }));
    await AudioService.playSequence(items, title, () => {
      dispatch(setAudioState({ isPlaying: false, isBuffering: false, playMode: undefined }));
    });
  };

  const togglePlayback = async () => {
    if (state.isPlaying) {
      await AudioService.pause();
    } else {
      await AudioService.resume();
    }
  };

  const resumePlayback = async () => {
    await AudioService.resume();
  };

  const seekTo = async (positionMillis: number) => {
    await AudioService.seek(positionMillis);
  };

  const stopPlayback = async () => {
    await AudioService.stop();
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
