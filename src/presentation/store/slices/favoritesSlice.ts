import { createSlice, PayloadAction } from '@reduxjs/toolkit';

/** Saved hadiths (library ids) and liked Quran-message cards ("<mood>:<card>"). */
interface FavoritesState {
  hadiths: number[];
  messageCards: string[];
}

const initialState: FavoritesState = { hadiths: [], messageCards: [] };

const toggle = <T,>(list: T[], v: T) => {
  const i = list.indexOf(v);
  if (i >= 0) list.splice(i, 1);
  else list.push(v);
};

export const favoritesSlice = createSlice({
  name: 'favorites',
  initialState,
  reducers: {
    toggleFavoriteHadith: (state, action: PayloadAction<number>) => {
      state.hadiths ??= [];
      toggle(state.hadiths, action.payload);
    },
    toggleLikedCard: (state, action: PayloadAction<string>) => {
      state.messageCards ??= [];
      toggle(state.messageCards, action.payload);
    },
  },
});

export const { toggleFavoriteHadith, toggleLikedCard } = favoritesSlice.actions;
export default favoritesSlice.reducer;
