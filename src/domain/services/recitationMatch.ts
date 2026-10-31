/**
 * Text helpers for following a recitation. What was heard is compared with the plain text
 * of each ayah (letters only, see normLetters), and the result is carried over to the
 * mushaf's Uthmani words letter by letter, because the two texts do not always split the
 * same way (Uthmani «يَٰٓأَيُّهَا» is plain «يا أيها»).
 */

const MARKS = /[ً-ٰٟۖ-ۭـ]/g; // tashkeel, Quranic marks, tatweel

/** Letters only, spelling-insensitive: one alef, ya/alef maqsura, ta/ha, hamza seats. */
export const normLetters = (s: string) =>
  s.replace(MARKS, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .replace(/[^ء-ي]/g, '');

const words = (s: string) => s.split(/\s+/).map(normLetters).filter(Boolean);

/** Index pairs of a longest common subsequence of `a` and `b`. */
const lcs = <T>(a: T[], b: T[]): [number, number][] => {
  const n = a.length, m = b.length;
  const dp = Array.from({ length: n + 1 }, () => new Uint16Array(m + 1));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  const out: [number, number][] = [];
  for (let i = 0, j = 0; i < n && j < m;) {
    if (a[i] === b[j]) { out.push([i, j]); i++; j++; }
    else if (dp[i + 1][j] >= dp[i][j + 1]) i++;
    else j++;
  }
  return out;
};

/**
 * For each plain word, the mushaf words that share its letters. `mushaf` is the ayah as
 * the page splits it (pause signs glued to their word, so they carry no letters of their own).
 */
export const plainToMushaf = (plain: string, mushaf: string[]): number[][] => {
  const letters = (ws: string[]) => ws.flatMap((w, i) => Array.from(normLetters(w), (c) => ({ c, i })));
  const p = letters(plain.split(/\s+/).filter((w) => normLetters(w)));
  const u = letters(mushaf);
  const map: Set<number>[] = [];
  for (const [i, j] of lcs(p.map((x) => x.c), u.map((x) => x.c))) (map[p[i].i] ??= new Set()).add(u[j].i);
  const count = words(plain).length;
  return Array.from({ length: count }, (_, i) => [...(map[i] ?? [])].sort((x, y) => x - y));
};
