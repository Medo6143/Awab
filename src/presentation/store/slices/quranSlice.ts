import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface QuranState {
  progress: Record<number, number>; // surahId -> completedAyahs count
  completedSurahs: number[]; // surahIds marked as fully read
  bookmarks: number[]; // bookmarked global ayah numbers
  currentSurah: number;
  currentPage: number; // current Mushaf page (1-604)
  bookmarkedPages: number[]; // bookmarked page numbers
  khatmaCount: number; // number of times Quran was finished
}

const initialState: QuranState = {
  progress: {},
  completedSurahs: [],
  bookmarks: [],
  currentSurah: 1,
  currentPage: 1,
  bookmarkedPages: [],
  khatmaCount: 0,
};

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
    toggleSurahCompleted: (state, action: PayloadAction<number>) => {
      if (!state.completedSurahs) state.completedSurahs = [];
      const surahId = action.payload;
      const idx = state.completedSurahs.indexOf(surahId);
      if (idx >= 0) state.completedSurahs.splice(idx, 1);
      else state.completedSurahs.push(surahId);
    },
    setCompletedSurahs: (state, action: PayloadAction<number[]>) => {
      state.completedSurahs = action.payload;
    },
    finishKhatma: (state) => {
      state.khatmaCount = (state.khatmaCount || 0) + 1;
      state.completedSurahs = [];
    }
  },
});

export const { 
  updateProgress, toggleBookmark, setCurrentSurah, 
  setCurrentPage, togglePageBookmark, toggleSurahCompleted,
  setCompletedSurahs, finishKhatma
} = quranSlice.actions;
export default quranSlice.reducer;
