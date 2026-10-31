import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as Haptics from 'expo-haptics';
import { Ayah, mushafAyahText } from '../components/quran/QuranConstants';
import { splitWords } from '../components/tasmee/tasmeeText';
import { plainAyah } from '../../data/quran/ayahSearch';
import { RecitationListener, requestMic } from '../../data/services/RecitationListener';
import { playWord, prefetchWord } from '../../data/services/wordAudio';
import { RecitationFollower, followWords } from '../../domain/services/recitationFollower';

export type VoiceState = 'loading' | 'idle' | 'listening' | 'correcting' | 'repeating' | 'error' | 'noMic';
/** On a mistake: stop and say the right word («صحّحني»), or only mark it and keep going. */
export type VoiceMode = 'correct' | 'mark';

type Handlers = {
  /** `count` mushaf words of the ayah have been heard right. */
  onHeard: (ayah: Ayah, count: number) => void;
  onAyahDone: (ayah: Ayah) => void;
  /** These mushaf words of the ayah were skipped or said wrong. */
  onMistake: (ayah: Ayah, words: number[]) => void;
};

/** Transcribe again once this much new audio has come in (a listen itself takes longer than this). */
const STEP_SECONDS = 0.25;
/** Silence this long after a word that did not match makes it a mistake. */
const STUCK_MS = 1500;
/** Corrections of the same word before moving on anyway. */
const MAX_TRIES = 3;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Voice tasmee on one page: listens without stopping, uncovers the words as they are
 * recited and moves on to the next ayah by itself. On a skipped or wrong word it marks it
 * and, in «correct» mode, stops, says the right word aloud and waits for the reciter to
 * say it right; in «mark» mode it just keeps going.
 *
 * Each listen covers the last few seconds of audio, so it takes the same time however long
 * the reciter goes on. (Cutting the audio by the model's word times instead split words: the
 * times were seconds off, and words said right came out as nonsense.)
 */
export const useVoiceTasmee = (enabled: boolean, mode: VoiceMode, ayahs: Ayah[], revealed: Set<number>, handlers: Handlers) => {
  const [state, setState] = useState<VoiceState>(enabled ? 'loading' : 'idle');
  /** The word to say again after a correction. */
  const [repeat, setRepeat] = useState<string | null>(null);
  const listener = useRef<RecitationListener | null>(null);
  const active = useRef(false);
  const on = useRef(handlers);
  on.current = handlers;

  useEffect(() => {
    if (!enabled) return;
    let alive = true;
    RecitationListener.open().then(
      (l) => { if (alive) { listener.current = l; setState('idle'); } else l.close(); },
      () => alive && setState('error'),
    );
    return () => { alive = false; active.current = false; listener.current?.close(); listener.current = null; };
  }, [enabled]);

  // the page's words, from the first ayah still covered
  const follower = useMemo(() => {
    const list = ayahs.map((a) => ({ number: a.number, plain: plainAyah(a.number), mushaf: splitWords(mushafAyahText(a)), opensSurah: a.numberInSurah === 1 }));
    return new RecitationFollower(followWords(list));
  }, [ayahs]);
  const byNumber = useMemo(() => new Map(ayahs.map((a) => [a.number, a])), [ayahs]);

  /** Follows the page: past ayahs uncovered by hand, back to ayahs covered again to retry. */
  useEffect(() => {
    const words = follower.words;
    const first = words.findIndex((w) => !revealed.has(w.ayah));
    const at = first < 0 ? words.length : first;
    const here = words[follower.cursor]?.ayah;
    const skip = here !== undefined && revealed.has(here);
    const back = at < follower.cursor && words[at].ayah !== here;
    if (skip || back) { follower.moveTo(at); listener.current?.reset(); }
  }, [revealed, follower]);

  /** Loads the audio of the word the reciter says next, so a correction plays it at once. */
  const preload = useCallback((at: number) => {
    if (mode !== 'correct') return;
    const w = follower.words[at];
    const a = w && byNumber.get(w.ayah);
    if (a) prefetchWord(a.surah.number, a.numberInSurah, (w.mushaf[0] ?? 0) + 1);
  }, [mode, follower, byNumber]);

  /** Tells the screen how far the cursor is: done ayahs, and the words heard of the next one. */
  const report = useCallback((from: number, to: number) => {
    const words = follower.words;
    for (let i = from; i < to; i++) {
      const w = words[i];
      const a = byNumber.get(w.ayah);
      if (!a) continue;
      if (i + 1 === words.length || words[i + 1].ayah !== w.ayah) on.current.onAyahDone(a);
      else on.current.onHeard(a, Math.max(...w.mushaf, -1) + 1);
    }
  }, [follower, byNumber]);

  const run = useCallback(async () => {
    const l = listener.current;
    if (!l) return;
    let seen = 0;
    /** The word just corrected, which the reciter says again before going on, and how often. */
    let redo: { at: number; tries: number } | null = null;
    /**
     * A mistake is acted on only when two listens in a row find it. Through a phone mic one
     * listen sometimes comes out garbled («إيّا كنا بدوا…» for «إياك نعبد») and would mark a
     * word said right; a word really skipped stays missing in the next listen too.
     */
    let suspect: number | null = null;
    while (active.current && follower.cursor < follower.words.length) {
      if (l.seconds - seen < STEP_SECONDS) { await sleep(120); continue; }
      const snapshot = l.seconds;
      seen = snapshot;
      const t = Date.now();
      const heard = await l.transcribe().catch(() => [] as string[]);
      if (!active.current) break;

      const before = follower.cursor;
      let step = follower.update(heard);
      // TEMPORARY: what was heard each pass, read from logcat while tuning voice tasmee
      console.log(`[voice] ${snapshot.toFixed(1)}s ${Date.now() - t}ms (mel ${l.timing.melMs} run ${l.timing.runMs}) quiet=${l.quiet} at=${before}«${follower.words[before]?.plain ?? ''}» heard=${heard.join(' ')} -> ${JSON.stringify(step)}`);
      const silentSince = (l.seconds - snapshot) * 1000 <= l.quiet;
      if (step.kind === 'progress' && step.unsure && silentSince && l.quiet >= STUCK_MS) step = follower.giveUp();
      if (step.kind === 'mistake' && suspect !== step.at) {
        suspect = step.at;
        report(before, follower.cursor);              // the words before it were heard right
        continue;
      }
      suspect = null;

      if (step.kind === 'progress') {
        report(before, step.cursor);
        if (redo && step.cursor > redo.at) { redo = null; setRepeat(null); setState('listening'); }
        preload(step.cursor);
        continue;
      }

      report(before, step.at);
      const w = follower.words[step.at];
      const a = byNumber.get(w.ayah);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      if (a) on.current.onMistake(a, w.mushaf);

      if (mode === 'mark') {
        // mark them and keep listening: alignment steps over the words from now on (a run of
        // skipped words is marked at once, not one listen per word)
        for (let k = step.at; k < step.upto; k++) {
          const x = follower.words[k];
          const xa = byNumber.get(x.ayah);
          if (k > step.at && xa) on.current.onMistake(xa, x.mushaf);
          follower.passOver(k);
        }
        report(step.at, step.upto);
        preload(follower.cursor);
        continue;
      }

      // correct: stop, say the right word, then wait for the reciter to say it
      const tries: number = redo && redo.at === step.at ? redo.tries + 1 : 1;
      setState('correcting');
      await l.pause();
      if (a) await playWord(a.surah.number, a.numberInSurah, (w.mushaf[0] ?? 0) + 1);
      if (!active.current) break;
      if (tries >= MAX_TRIES) {
        // said it wrong again and again: move on rather than hold the reciter here
        follower.skipCorrected(step.at);
        report(step.at, step.at + 1);
        redo = null;
        setRepeat(null);
        setState('listening');
      } else {
        follower.moveTo(step.at);
        redo = { at: step.at, tries };
        setRepeat(a ? splitWords(mushafAyahText(a))[w.mushaf[0] ?? 0] ?? null : null);
        setState('repeating');
      }
      await l.start();
      seen = 0;
    }
    active.current = false;
    setRepeat(null);
    await l.pause();
    setState((s) => (s === 'error' ? s : 'idle'));
  }, [follower, byNumber, report, mode, preload]);

  const start = useCallback(async () => {
    const l = listener.current;
    if (!l || active.current) return;
    if (!(await requestMic())) { setState('noMic'); return; }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    active.current = true;
    await l.start();
    setState('listening');
    run();
  }, [follower, run]);

  const stop = useCallback(() => {
    active.current = false;
    listener.current?.pause();
    setState('idle');
  }, []);

  // a new page: stop listening (the reciter starts it again)
  useEffect(() => () => { active.current = false; }, [follower]);

  return { state, start, stop, repeat };
};
