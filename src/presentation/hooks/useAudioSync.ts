import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useDependencies } from '../providers/DependencyProvider';
import { setAudioState } from '../store/slices/audioSlice';

/**
 * Mirrors the recitation player's state into the store. Mounted once, at the app root, so the
 * play / pause / loading buttons follow the real audio wherever it was started or stopped from.
 */
export const useAudioSync = () => {
  const dispatch = useDispatch();
  const { quranPlayer } = useDependencies();

  useEffect(() => {
    let last = '';
    return quranPlayer.subscribe((status) => {
      // whole seconds: the position ticks several times a second and every change re-renders the mushaf
      const next = {
        isPlaying: status.isPlaying,
        isBuffering: status.isBuffering,
        currentPosition: Math.floor(status.positionMillis / 1000) * 1000,
        duration: status.durationMillis,
      };
      const key = JSON.stringify(next);
      if (key === last) return;
      last = key;
      dispatch(setAudioState(next));
    });
  }, [quranPlayer, dispatch]);
};
