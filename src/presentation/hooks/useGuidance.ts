import { useEffect, useState } from 'react';
import { useDependencies } from '../providers/DependencyProvider';
import { plainAyahs } from '../../data/quran/ayahSearch';
import { parseTafsir, tafsirExcerpt } from '../components/quran/tafsirParser';
import type { VerseRef } from '../../domain/entities/guidance';

/** Tafsir al-Sa'di on quran.com: gentle and explanatory, suited to consolation. */
export const SAADI_TAFSIR_ID = 91;

/**
 * Text of a verse reference: Uthmani from the Quran source, or the bundled plain text
 * when offline (`offline` tells the card to say so).
 */
export const useVerseText = (ref: VerseRef) => {
  const { quran } = useDependencies();
  const to = ref.to ?? ref.from;
  const [state, setState] = useState<{ texts: string[]; offline: boolean; loading: boolean }>({ texts: [], offline: false, loading: true });

  useEffect(() => {
    let alive = true;
    setState((s) => ({ ...s, loading: true }));
    quran.getAyahs(ref.surah, ref.from, to)
      .then((texts) => { if (alive) setState({ texts, offline: false, loading: false }); })
      .catch(() => { if (alive) setState({ texts: plainAyahs(ref.surah, ref.from, to), offline: true, loading: false }); });
    return () => { alive = false; };
  }, [quran, ref.surah, ref.from, to]);

  return state;
};

/** Al-Sa'di's tafsir of a verse: a short excerpt and the full text for "اقرأ المزيد". */
export const useVerseTafsir = (ref: VerseRef, enabled = true) => {
  const { tafsir } = useDependencies();
  const [state, setState] = useState<{ excerpt: string; full: string; loading: boolean; error: boolean }>({ excerpt: '', full: '', loading: enabled, error: false });

  useEffect(() => {
    if (!enabled) return;
    let alive = true;
    setState({ excerpt: '', full: '', loading: true, error: false });
    tafsir.getTafsir(SAADI_TAFSIR_ID, { surah: ref.surah, ayah: ref.from })
      .then((html) => {
        if (!alive) return;
        const blocks = parseTafsir(html);
        const full = blocks.map((b) => b.runs.map((r) => r.text).join('')).join('\n\n').trim();
        setState({ excerpt: tafsirExcerpt(blocks, 260), full, loading: false, error: false });
      })
      .catch(() => { if (alive) setState({ excerpt: '', full: '', loading: false, error: true }); });
    return () => { alive = false; };
  }, [tafsir, ref.surah, ref.from, enabled]);

  return state;
};
