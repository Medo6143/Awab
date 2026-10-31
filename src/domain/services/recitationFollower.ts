import { normLetters, plainToMushaf } from './recitationMatch';

/** One plain word of the passage, with the mushaf words it covers; `opens` on a surah's first word. */
export type FollowWord = { ayah: number; plain: string; mushaf: number[]; opens?: boolean };

export type FollowStep =
  /** Words up to (not including) `cursor` have been heard right; `unsure` when words after
   *  them did not match yet (a mistake, if the reciter then falls silent). */
  | { kind: 'progress'; cursor: number; unsure: boolean }
  /** Words `at`..`upto`-1 were skipped or said wrong (usually one); words before were heard right. */
  | { kind: 'mistake'; at: number; upto: number };

/** The passage as plain words in order, each ayah given as [global number, plain text, mushaf words]. */
export const followWords = (ayahs: { number: number; plain: string; mushaf: string[]; opensSurah?: boolean }[]): FollowWord[] =>
  ayahs.flatMap((a) => {
    const map = plainToMushaf(a.plain, a.mushaf);
    return a.plain.split(/\s+/).map(normLetters).filter(Boolean).map((plain, i) => ({ ayah: a.number, plain, mushaf: map[i] ?? [], opens: i === 0 && a.opensSurah }));
  });

/** Words before the cursor a transcript may still contain (the window reaches back this far). */
const BACK = 12;
/** How far past the cursor a heard word may land and still count as the reciter skipping to it. */
const LOOKAHEAD = 6;
/** Share of letters that may differ when words run together or are misheard («ولِيا كرابد» for «إياك نعبد»). */
const CLOSE = 0.45;
/** Heard words after the last one followed that match nothing: this many means something else was said. */
const LOST_AFTER = 4;

const editDistance = (a: string, b: string) => {
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    for (let j = 1; j <= b.length; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    prev = cur;
  }
  return prev[b.length];
};

/**
 * How a word sounds, roughly: through a phone mic the model mixes up letters that sound
 * alike («نصرات» for «الصراط», «المخطوب» for «المغضوب»), so each such group is one letter,
 * and a leading «ال» (often swallowed by the next letter) is dropped.
 */
const SOUND: Record<string, string> = { ط: 'ت', ض: 'د', ص: 'س', ث: 'س', ق: 'ك', غ: 'خ', ح: 'ه', ذ: 'ز', ظ: 'ز' };
const sound = (w: string) => w.replace(/[طضصثقغحذظ]/g, (c) => SOUND[c]);
/** The word without a leading «ال» (and a «و»/«ف» before it), when enough is left. */
const bare = (w: string) => w.replace(/^(و|ف)?ال(?=...)/, '$1');
/** Edit distance between two words as they sound, with or without the article on either side. */
const soundDistance = (h: string, e: string): [dist: number, n: number] => {
  const hs = sound(h), es = sound(e), hb = bare(hs), eb = bare(es);
  let best: [number, number] = [editDistance(hs, es), Math.max(hs.length, es.length)];
  for (const [a, b] of [[hb, eb], [hs, eb], [hb, es]] as const) {
    if (a === hs && b === es) continue;
    const d = editDistance(a, b);
    if (d < best[0]) best = [d, Math.max(a.length, b.length)];
  }
  return best;
};

/**
 * A heard word counts as the expected one when it sounds close: the model writes «إيّك» for
 * «إياك» and «نعبت» for «نعبد». One letter off is allowed (two in long words), so a one-letter
 * slip passes too; skipped and wrong words are what gets marked.
 */
const same = (h: string, e: string) => {
  if (h === e) return true;
  // «الله» is a letter away from «اليه», «الله» from «له»…: the most frequent word is matched exactly
  if (h === 'الله' || e === 'الله') return false;
  // two-letter words («لا», «لم», «له») are only ever themselves: one letter off is another word
  if (Math.max(h.length, e.length) < 3 || Math.abs(h.length - e.length) > 3) return false;
  const [d, n] = soundDistance(h, e);
  return n >= 3 && d <= (n >= 7 ? 2 : 1);
};

/** Letters said for a stretch of words are close to the expected ones (words run together, or misheard). */
const close = (h: string, e: string) => {
  if (!h.length) return false;
  const [d, n] = soundDistance(h, e);
  return d <= Math.max(1, Math.round(n * CLOSE));
};

/**
 * A reciter who goes back over a phrase («إياك نعبد وإياك نعبد») is not reciting it twice: the
 * Quran never says a word three times running, nor a run of two or three words twice running,
 * so such repeats are dropped and the phrase is followed once.
 */
const dropLoops = (words: string[]): string[] => {
  const out: string[] = [];
  for (const w of words) {
    out.push(w);
    const c = out.length;
    if (c >= 3 && out[c - 1] === out[c - 2] && out[c - 2] === out[c - 3]) { out.pop(); continue; }
    for (let n = 2; n <= 3; n++) {
      if (c >= 2 * n && out.slice(c - n).every((x, d) => x === out[c - 2 * n + d])) { out.length = c - n; break; }
    }
  }
  return out;
};

/**
 * What reciters say before a surah or a passage without it being part of the text: the
 * isti'adha and the basmala (outside al-Fatiha, the basmala is not an ayah). Their words are
 * dropped from what was heard, unless the text around the cursor has them (an-Naml 30).
 */
const PREAMBLES = ['اعوذ بالله من الشيطان الرجيم', 'بسم الله الرحمن الرحيم'].map((p) => p.split(' ').map(normLetters));
const dropPreambles = (heard: string[], due: string[]): string[] => {
  const out: string[] = [];
  for (let k = 0; k < heard.length;) {
    let run = 0;
    for (const p of PREAMBLES) {
      // the text due next IS this preamble (an-Naml 30 has the basmala): nothing to drop
      if (due.some((d) => same(d, p[0])) && due.some((d) => same(d, p[1]))) continue;
      // it shares words with the text due («الرحمن الرحيم» before al-Fatiha): only three of its
      // words in order are surely the preamble; otherwise two are enough
      const need = due.some((d) => p.some((w) => same(d, w))) ? 3 : 2;
      // the window may open in the middle of the preamble, so it may start at any of its words;
      // the model also runs its words together («بسمالله»), so letters are compared, not words
      for (let o = 0; o + need <= p.length; o++) {
        if (o > 0 && k > 0) break;
        // the span of heard words closest to the preamble (not the longest within tolerance, which
        // swallowed the word after it: «بسم الله الرحمن الرحيم الم» is the basmala, then «الم»)
        let best = Infinity;
        for (let m = k + 1; m <= heard.length; m++) {
          const said = sound(heard.slice(k, m).join(''));
          for (let n = p.length - o; n >= need; n--) {
            const target = sound(p.slice(o, o + n).join(''));
            if (Math.abs(said.length - target.length) > 3) continue;
            const d = editDistance(said, target);
            if (d <= Math.max(1, Math.round(target.length * 0.2)) && d < best) { best = d; run = m - k; }
          }
        }
        if (run) break;
      }
      // the first word alone at the window's edge («بسم» just started)
      if (!run && need === 2 && k + 1 === heard.length && heard[k] === p[0]) run = 1;
    }
    if (run) k += run;
    else out.push(heard[k++]);
  }
  return out;
};

/**
 * Index pairs [heard, expected] of a longest common subsequence under `same`. Expected
 * words before `pivot` were already said.
 */
const align = (h: string[], e: string[], pivot: number): [number, number][] => {
  const n = h.length, m = e.length;
  const dp = Array.from({ length: n + 1 }, () => new Uint16Array(m + 1));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) dp[i][j] = same(h[i], e[j]) ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
  }
  const out: [number, number][] = [];
  // when the word due next was also said just before («تبارك الذي» … «الذي خلق», «الصراط» …
  // «صراط»), a heard copy of it goes to the one due when that loses nothing; elsewhere words go
  // to the earliest. Only for the very word due: «ومن شر» comes three times in al-Falaq
  for (let i = 0, j = 0; i < n && j < m;) {
    if (j < pivot && pivot < m && same(h[i], e[pivot]) && dp[i][j + 1] === dp[i][j]) j++;
    else if (same(h[i], e[j]) && dp[i][j] === dp[i + 1][j + 1] + 1) { out.push([i, j]); i++; j++; }
    else if (dp[i + 1][j] >= dp[i][j + 1]) i++;
    else j++;
  }
  return out;
};

/**
 * Follows a recitation through the passage from transcripts of the last few seconds of
 * audio. A transcript is placed against the words around the cursor: words it shares with
 * the ones already followed anchor it, and the words after them move the cursor on.
 *
 * A word is judged wrong once the reciter has moved past it: a later word is heard, or several
 * words in a row match nothing. A mismatch at the end of a transcript may still be half-said,
 * so it waits for the next one. Words heard right are never taken back, so the cursor only
 * moves forward. One garbled listen can look like a mistake, so callers confirm it with the next.
 */
export class RecitationFollower {
  cursor = 0;
  /** Words marked wrong and passed over without stopping. */
  private passed = new Set<number>();

  /** `needNext`: a skip counts only once the word after the one it landed on is heard too. */
  constructor(readonly words: FollowWord[], private needNext = true) {}

  /** Marks the word at `at` wrong and keeps following after it, without stopping the audio. */
  passOver(at: number) {
    this.passed.add(at);
    this.cursor = Math.max(this.cursor, at + 1);
  }

  /** Moves past a word the reciter was corrected on. */
  skipCorrected(at: number) {
    this.cursor = Math.max(this.cursor, at + 1);
  }

  /** Moves to `at`: past an ayah uncovered by hand, back to one being recited again, or to a word to say again. */
  moveTo(at: number) {
    this.cursor = at;
  }

  /** `transcript`: the words heard in the last few seconds, as text or one entry per word. */
  update(transcript: string | string[]): FollowStep {
    const raw = typeof transcript === 'string' ? transcript.split(/\s+/) : transcript;
    const exp = this.words;
    const c = this.cursor;
    const due = exp.slice(c, c + LOOKAHEAD).map((w) => w.plain);
    // the isti'adha and basmala come before a surah, or before the first words of a session;
    // in the middle of a surah their words are the text («فاستعذ بالله من الشيطان الرجيم»)
    const opening = c < 3 || exp.slice(Math.max(0, c - 2), c + 1).some((w) => w.opens);
    const loops = dropLoops(raw.map(normLetters).filter(Boolean));
    const heard = opening ? dropPreambles(loops, due) : loops;
    const from = Math.max(0, c - BACK);
    const to = Math.min(exp.length, c + heard.length + LOOKAHEAD);
    const pairs = align(heard, exp.slice(from, to).map((w) => w.plain), c - from).map(([k, j]): [number, number] => [k, from + j]);

    let i = c;
    let lastK = -1;                                   // the last heard word placed so far
    let p = 0;
    for (; p < pairs.length && pairs[p][1] < c; p++) lastK = pairs[p][0]; // already followed
    for (; p < pairs.length; p++) {
      const [k, e] = pairs[p];
      while (i < e && this.passed.has(i)) i++;
      if (e < i) continue;
      if (e === i) { i++; lastK = k; continue; }
      // expected words i..e-1 were not heard as such: run together or misheard, or really missing
      const between = heard.slice(lastK + 1, k).join('');
      const gap = exp.slice(i, e).filter((_, d) => !this.passed.has(i + d)).map((w) => w.plain).join('');
      if (close(between, gap)) { i = e + 1; lastK = k; continue; }
      // the reciter carried on past words not heard (a garbled listen can look like this too,
      // so callers confirm it with the next listen)
      const sure = !this.needNext || e + 1 >= exp.length || (p + 1 < pairs.length && pairs[p + 1][1] === e + 1);
      if (sure) return this.mistake(i, e);
      this.cursor = Math.max(this.cursor, i);
      return { kind: 'progress', cursor: this.cursor, unsure: true };
    }
    while (i < exp.length && this.passed.has(i)) i++;
    this.cursor = Math.max(this.cursor, i);

    // what was said after the last word followed
    const tail = heard.slice(lastK + 1);
    if (tail.length >= LOST_AFTER && i < exp.length) return this.mistake(i);
    // a tail that is the next words run together, or misheard, counts too
    if (tail.length && i < exp.length) {
      const said = tail.join('');
      for (let n = 1; n <= 3 && i + n <= exp.length; n++) {
        if (close(said, exp.slice(i, i + n).map((w) => w.plain).join(''))) {
          this.cursor = i + n;
          return { kind: 'progress', cursor: this.cursor, unsure: false };
        }
      }
    }
    // a scrap of a word (at the window's edge, or half-said) is not a word said wrong
    return { kind: 'progress', cursor: this.cursor, unsure: tail.join('').length >= 4 };
  }

  /** The word at the cursor, when the reciter fell silent on a word that did not match. */
  giveUp(): FollowStep {
    return this.mistake(this.cursor);
  }

  private mistake(at: number, upto = at + 1): FollowStep {
    this.cursor = Math.max(this.cursor, at);
    return { kind: 'mistake', at, upto: Math.max(upto, at + 1) };
  }
}
