import { useState, useCallback, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { AudioService, RECITER_MAP } from '../../data/services/AudioService';
import { AudioState } from '../../domain/entities/types';
import { RootState } from '../store';
import { setReciterId } from '../store/slices/settingsSlice';

export const useAudio = () => {
  const dispatch = useDispatch();
  const { selectedReciterId } = useSelector((state: RootState) => state.settings);
  
  const [state, setState] = useState<AudioState>({
    isPlaying: false,
    isBuffering: false,
    currentSurahId: null,
    currentPosition: 0,
    duration: 0,
  });

  // Sync AudioService with Redux setting
  useEffect(() => {
    AudioService.setReciter(selectedReciterId);
  }, [selectedReciterId]);

  const onStatusUpdate = useCallback((status: any) => {
    if (status.isLoaded) {
      setState((prev: AudioState) => ({
        ...prev,
        isPlaying: status.isPlaying,
        isBuffering: status.isBuffering,
        currentPosition: status.positionMillis,
        duration: status.durationMillis || 0,
      }));
    }
  }, []);

  const changeReciter = (id: string) => {
    dispatch(setReciterId(id));
  };

  const playSurah = async (surahId: number) => {
    setState((prev: AudioState) => ({ ...prev, currentSurahId: surahId, isBuffering: true }));
    await AudioService.playSurah(surahId, onStatusUpdate);
  };

  const playAyah = async (surahId: number, ayahNumber: number) => {
    setState((prev: AudioState) => ({ ...prev, currentSurahId: surahId, isBuffering: true }));
    await AudioService.playAyah(surahId, ayahNumber, onStatusUpdate);
  };

  const playSequence = async (items: { surahId: number, ayahNumber: number }[]) => {
    if (items.length === 0) return;
    setState((prev: AudioState) => ({ ...prev, currentSurahId: items[0].surahId, isBuffering: true }));
    await AudioService.playSequence(items, () => {
      setState(prev => ({ ...prev, isPlaying: false, isBuffering: false }));
    });
  };

  const togglePlayback = async () => {
    if (state.isPlaying) {
      await AudioService.pause();
    } else {
      await AudioService.resume();
    }
  };

  const stopPlayback = async () => {
    await AudioService.stop();
    setState({
      isPlaying: false,
      isBuffering: false,
      currentSurahId: null,
      currentPosition: 0,
      duration: 0,
    });
  };

  return { 
    ...state, 
    activeReciter: RECITER_MAP[selectedReciterId],
    changeReciter,
    playSurah, 
    playAyah, 
    playSequence, 
    togglePlayback, 
    stopPlayback 
  };
};
