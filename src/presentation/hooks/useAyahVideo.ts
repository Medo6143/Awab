import { useCallback, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import { useDependencies } from '../providers/DependencyProvider';
import type { AyahKey } from '../../domain/services/Audio';
import type { AyahVideoInput, AyahVideoProgress } from '../../domain/services/AyahVideo';
import { DEFAULT_RECITER_ID, RECITER_MAP } from '../../domain/entities/reciters';

/**
 * Makes ayah videos with the reciter chosen in settings, reports their progress, and deletes
 * the files it made once `releaseAll` is called (or the caller unmounts).
 */
export const useAyahVideo = () => {
  const { ayahVideo } = useDependencies();
  const reciterId = useSelector((s: RootState) => s.settings.selectedReciterId) ?? DEFAULT_RECITER_ID;
  const reciterName = (RECITER_MAP[reciterId] ?? RECITER_MAP[DEFAULT_RECITER_ID]).name;
  const [progress, setProgress] = useState<AyahVideoProgress | null>(null);
  /** Length of the last video, as soon as it is known. */
  const [durationMs, setDurationMs] = useState<number | null>(null);
  const made = useRef<string[]>([]);

  const make = useCallback(async (frames: Pick<AyahVideoInput, 'videoUri' | 'shadeUri' | 'overlayUri' | 'pages'>, ayahs: AyahKey[]) => {
    setDurationMs(null);
    setProgress({ stage: 'audio', fraction: 0 });
    try {
      const res = await ayahVideo.make({ ...frames, ayahs, reciterId }, (p) => {
        setProgress(p);
        if (p.durationMs) setDurationMs(p.durationMs);
      });
      made.current.push(res.uri);
      setDurationMs(res.durationMs);
      return res;
    } finally {
      setProgress(null);
    }
  }, [ayahVideo, reciterId]);

  const releaseAll = useCallback(() => {
    made.current.forEach((u) => { ayahVideo.release(u); });
    made.current = [];
    setDurationMs(null);
  }, [ayahVideo]);

  useEffect(() => () => {
    made.current.forEach((u) => { ayahVideo.release(u); });
    made.current = [];
  }, [ayahVideo]);

  return { make, progress, durationMs, releaseAll, reciterName };
};
