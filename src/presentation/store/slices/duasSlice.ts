import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Dua } from '../../../domain/entities/types';

interface DuasState {
  personalDuas: Dua[];
  favorites: string[]; // id list
}

const initialState: DuasState = {
  personalDuas: [],
  favorites: [],
};

export const duasSlice = createSlice({
  name: 'duas',
  initialState,
  reducers: {
    addPersonalDua: (state, action: PayloadAction<Dua>) => {
      state.personalDuas.push(action.payload);
    },
    updatePersonalDua: (state, action: PayloadAction<Dua>) => {
      const index = state.personalDuas.findIndex(d => d.id === action.payload.id);
      if (index > -1) {
        state.personalDuas[index] = action.payload;
      }
    },
    deletePersonalDua: (state, action: PayloadAction<string>) => {
      state.personalDuas = state.personalDuas.filter(d => d.id !== action.payload);
    },
    toggleFavorite: (state, action: PayloadAction<string>) => {
      const index = state.favorites.indexOf(action.payload);
      if (index > -1) {
        state.favorites.splice(index, 1);
      } else {
        state.favorites.push(action.payload);
      }
    },
  },
});

export const { addPersonalDua, updatePersonalDua, deletePersonalDua, toggleFavorite } = duasSlice.actions;
export default duasSlice.reducer;
