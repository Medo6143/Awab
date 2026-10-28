import { toAr } from '../../shared/utils/format';

/**
 * The daily Quran wird, counted in mushaf pages. "fixed" repeats the same goal every day;
 * "daily" asks for the day's goal each day. Either way the reader can add more for today.
 */
export type WirdMode = 'fixed' | 'daily';

export interface WirdState {
  pages: number;   // the fixed daily goal
  mode: WirdMode;
  /** The goal chosen for one day in "daily" mode. */
  today?: { date: string; pages: number } | null;
  /** Pages added on top of the goal for one day ("زوّد"). */
  extra?: { date: string; pages: number } | null;
}

export const DEFAULT_WIRD: WirdState = { pages: 5, mode: 'fixed', today: null, extra: null };

/** Quick picks; a hizb is ten pages and a juz twenty in the Madani mushaf. */
export const WIRD_PRESETS = [
  { pages: 1, label: 'صفحة' },
  { pages: 2, label: 'صفحتين' },
  { pages: 5, label: '٥ صفحات' },
  { pages: 10, label: 'حزب' },
  { pages: 20, label: 'جزء' },
] as const;

/** Today's goal in pages, or null when the reader hasn't picked one yet in "daily" mode. */
export const wirdGoal = (w: WirdState | undefined, date: string): number | null => {
  const s = { ...DEFAULT_WIRD, ...w };
  const base = s.mode === 'daily' ? (s.today?.date === date ? s.today.pages : null) : s.pages;
  if (base == null) return null;
  return base + (s.extra?.date === date ? s.extra.pages : 0);
};

/** Pages as Arabic words where it reads better ("صفحتين", "حزب"). */
export const pagesLabel = (n: number) =>
  WIRD_PRESETS.find((p) => p.pages === n)?.label ?? `${toAr(n)} ${n >= 3 && n <= 10 ? 'صفحات' : 'صفحة'}`;
