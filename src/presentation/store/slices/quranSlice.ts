import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { DEFAULT_WIRD, WirdMode, WirdState } from '../../../domain/entities/wird';

/** The heart tracks two journeys through the 114 surahs. */
export type HeartMode = 'reading' | 'hifz';

/** A finished khatma, kept for the log. Dates are ISO strings. */
export interface Khatma {
  id: string;
  mode: HeartMode;
  number: number;
  startedAt: string | null; // unknown for progress made before dates were recorded
  finishedAt: string;
}

/** Last self-check of one ayah in tasmee (memorization recital). */
export interface TasmeeMark {
  ok: boolean;
  at: string; // ISO date of the recital
}

interface QuranState {
  progress: Record<number, number>; // surahId -> completedAyahs count
  completedSurahs: number[]; // surahIds marked as fully read
  bookmarks: number[]; // bookmarked global ayah numbers
  currentSurah: number;
  currentPage: number; // current Mushaf page (1-604)
  bookmarkedPages: number[]; // bookmarked page numbers
  khatmaCount: number; // reading khatmat finished, including ones from before the log existed
  memorizedSurahs: number[]; // surahIds memorized in the current hifz round
  khatmat: Khatma[];
  khatmaStartedAt: Partial<Record<HeartMode, string>>; // when the current round got its first surah
  wird: WirdState;
  tasmee: Record<number, Record<number, TasmeeMark>>; // surahId -> ayah -> last result
}

const initialState: QuranState = {
  progress: {},
  completedSurahs: [],
  bookmarks: [],
  currentSurah: 1,
  currentPage: 1,
  bookmarkedPages: [],
  khatmaCount: 0,
  memorizedSurahs: [],
  khatmat: [],
  khatmaStartedAt: {},
  wird: DEFAULT_WIRD,
  tasmee: {},
};

const listOf = (state: QuranState, mode: HeartMode) =>
  mode === 'reading' ? (state.completedSurahs ??= []) : (state.memorizedSurahs ??= []);

const setList = (state: QuranState, mode: HeartMode, ids: number[]) => {
  if (mode === 'reading') state.completedSurahs = ids;
  else state.memorizedSurahs = ids;
};

/** The current round starts with its first marked surah. */
const markStarted = (state: QuranState, mode: HeartMode, now: string) => {
  state.khatmaStartedAt ??= {};
  if (listOf(state, mode).length === 0) delete state.khatmaStartedAt[mode];
  else state.khatmaStartedAt[mode] ??= now;
};

/** Number of the khatma in progress: one after the finished ones (older counts included). */
export const finishedCount = (state: Pick<QuranState, 'khatmat' | 'khatmaCount'>, mode: HeartMode) => {
  const logged = (state.khatmat ?? []).filter((k) => k.mode === mode).length;
  return mode === 'reading' ? Math.max(logged, state.khatmaCount || 0) : logged;
};

const stamped = <T,>(payload: T) => ({ payload: { ...payload, now: new Date().toISOString() } });

export const quranSlice = createSlice({
  name: 'quran',
  initialState,
  reducers: {
    updateProgress: (state, action: PayloadAction<{ surahId: number; completedAyahs: number }>) => {
      const { surahId, completedAyahs } = action.payload;
      state.progress[surahId] = completedAyahs;
    },
    toggleBookmark: (state, action: PayloadAction<number>) => {
      const ayahNumber = action.payload;
      const idx = state.bookmarks.indexOf(ayahNumber);
      if (idx >= 0) state.bookmarks.splice(idx, 1);
      else state.bookmarks.push(ayahNumber);
    },
    setCurrentSurah: (state, action: PayloadAction<number>) => {
      state.currentSurah = action.payload;
    },
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    togglePageBookmark: (state, action: PayloadAction<number>) => {
      if (!state.bookmarkedPages) state.bookmarkedPages = [];
      const page = action.payload;
      const idx = state.bookmarkedPages.indexOf(page);
      if (idx >= 0) state.bookmarkedPages.splice(idx, 1);
      else state.bookmarkedPages.push(page);
    },
    toggleSurahCompleted: {
      reducer: (state, action: PayloadAction<{ mode: HeartMode; id: number; now: string }>) => {
        const { mode, id, now } = action.payload;
        const list = listOf(state, mode);
        const idx = list.indexOf(id);
        if (idx >= 0) list.splice(idx, 1);
        else list.push(id);
        markStarted(state, mode, now);
      },
      prepare: (p: { mode: HeartMode; id: number }) => stamped(p),
    },
    setCompletedSurahs: {
      reducer: (state, action: PayloadAction<{ mode: HeartMode; ids: number[]; now: string }>) => {
        const { mode, ids, now } = action.payload;
        setList(state, mode, ids);
        markStarted(state, mode, now);
      },
      prepare: (p: { mode: HeartMode; ids: number[] }) => stamped(p),
    },
    // `??=`: state persisted before the wird existed lacks it
    setWirdGoal: (state, action: PayloadAction<{ pages: number; mode: WirdMode }>) => {
      state.wird = { ...(state.wird ?? DEFAULT_WIRD), ...action.payload };
    },
    /** The goal for one day in "daily" mode. */
    setTodayWird: (state, action: PayloadAction<{ date: string; pages: number }>) => {
      (state.wird ??= { ...DEFAULT_WIRD }).today = action.payload;
    },
    /** "زوّد": more pages for today only, on top of the goal. */
    addWirdToday: (state, action: PayloadAction<{ date: string; pages: number }>) => {
      const w = (state.wird ??= { ...DEFAULT_WIRD });
      const prev = w.extra?.date === action.payload.date ? w.extra.pages : 0;
      w.extra = { date: action.payload.date, pages: Math.max(0, prev + action.payload.pages) };
    },
    /**
     * Results of one tasmee session. When every ayah of the surah has passed, the surah
     * joins the hifz heart, so memorizing is earned by reciting, not only by a tap.
     */
    recordTasmee: {
      reducer: (state, action: PayloadAction<{ surah: number; total: number; results: { ayah: number; ok: boolean }[]; now: string }>) => {
        const { surah, total, results, now } = action.payload;
        const marks = ((state.tasmee ??= {})[surah] ??= {});
        for (const r of results) marks[r.ayah] = { ok: r.ok, at: now };
        const all = total > 0 && Array.from({ length: total }, (_, i) => marks[i + 1]?.ok).every(Boolean);
        const list = listOf(state, 'hifz');
        if (all && !list.includes(surah)) {
          list.push(surah);
          markStarted(state, 'hifz', now);
        }
      },
      prepare: (p: { surah: number; total: number; results: { ayah: number; ok: boolean }[] }) => stamped(p),
    },
    finishKhatma: {
      reducer: (state, action: PayloadAction<{ mode: HeartMode; now: string }>) => {
        const { mode, now } = action.payload;
        state.khatmat ??= [];
        state.khatmaStartedAt ??= {};
        const number = finishedCount(state, mode) + 1;
        state.khatmat.push({ id: now, mode, number, startedAt: state.khatmaStartedAt[mode] ?? null, finishedAt: now });
        if (mode === 'reading') state.khatmaCount = number;
        setList(state, mode, []);
        delete state.khatmaStartedAt[mode];
      },
      prepare: (mode: HeartMode) => stamped({ mode }),
    },
  },
});

export const { 
  updateProgress, toggleBookmark, setCurrentSurah, 
  setCurrentPage, togglePageBookmark, toggleSurahCompleted,
  setCompletedSurahs, finishKhatma, setWirdGoal, setTodayWird, addWirdToday, recordTasmee
} = quranSlice.actions;
export default quranSlice.reducer;
