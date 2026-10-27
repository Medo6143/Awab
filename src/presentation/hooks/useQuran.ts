import { useCallback, useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useDependencies } from '../providers/DependencyProvider';
import { AyahRef, MushafAyah } from '../../domain/entities/quran';

export const useSurahs = () => {
  const { quran } = useDependencies();
  return useQuery({ queryKey: ['surahs'], queryFn: () => quran.getSurahs(), staleTime: Infinity });
};

/** One Mushaf page: cached instantly when available, otherwise loaded with retry. Neighbours are prefetched. */
export const useMushafPage = (page: number) => {
  const { quran } = useDependencies();
  const [state, setState] = useState<{ page: number; ayahs: MushafAyah[]; loading: boolean; error: boolean }>(() => {
    const cached = quran.peekPage(page);
    return { page, ayahs: cached ?? [], loading: !cached, error: false };
  });
  const [attempt, setAttempt] = useState(0);

  // reset synchronously when the pager reuses this slot for another page
  if (state.page !== page) {
    const cached = quran.peekPage(page);
    setState({ page, ayahs: cached ?? [], loading: !cached, error: false });
  }

  useEffect(() => {
    let alive = true;
    const cached = quran.peekPage(page);
    if (!cached) setState((s) => ({ ...s, loading: true, error: false }));
    quran.getPage(page)
      .then((ayahs) => {
        if (!alive) return;
        setState({ page, ayahs, loading: false, error: false });
        quran.prefetchPage(page + 1);
        quran.prefetchPage(page - 1);
      })
      .catch(() => { if (alive) setState((s) => ({ ...s, loading: false, error: true })); });
    return () => { alive = false; };
  }, [quran, page, attempt]);

  const retry = useCallback(() => setAttempt((a) => a + 1), []);
  return { ayahs: state.ayahs, loading: state.loading, error: state.error, retry };
};

/**
 * Tafsir HTML for one ayah. Only the latest request may update state, so a slow answer
 * for an ayah the user already left never overwrites the current one.
 */
export const useTafsir = (tafsirId: number) => {
  const { tafsir } = useDependencies();
  const [html, setHtml] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const request = useRef(0);
  const lastRef = useRef<AyahRef | null>(null);

  const load = useCallback(async (ref: AyahRef) => {
    const req = ++request.current;
    lastRef.current = ref;
    setLoading(true);
    setError(false);
    setHtml(null);
    try {
      const text = await tafsir.getTafsir(tafsirId, ref);
      if (req === request.current) setHtml(text);
    } catch {
      if (req === request.current) setError(true);
    } finally {
      if (req === request.current) setLoading(false);
    }
  }, [tafsir, tafsirId]);

  const retry = useCallback(() => { if (lastRef.current) load(lastRef.current); }, [load]);
  // closing the sheet forgets the ayah, so a later source change does not fetch in the background
  const cancel = useCallback(() => { request.current++; lastRef.current = null; setLoading(false); }, []);

  // switching the source while the sheet is open reloads the same ayah from the new tafsir
  useEffect(() => { if (lastRef.current) load(lastRef.current); }, [load]);

  return { html, loading, error, load, retry, cancel };
};
