import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { PrayerDay } from '../../../domain/entities/prayer';

interface PrayerState {
  cachedData: PrayerDay | null;
  lastFetchedDate: string | null; // Format: YYYY-MM-DD
  status: 'idle' | 'loading' | 'failed';
}

const initialState: PrayerState = {
  cachedData: null,
  lastFetchedDate: null,
  status: 'idle',
};

const prayerSlice = createSlice({
  name: 'prayer',
  initialState,
  reducers: {
    setPrayerData: (state, action: PayloadAction<PrayerDay>) => {
      state.cachedData = action.payload;
      // Extract date from gregorian or use current date for fetch tracking
      state.lastFetchedDate = action.payload.date.gregorian.date;
      state.status = 'idle';
    },
    setLoading: (state) => {
      state.status = 'loading';
    },
    setFailed: (state) => {
      state.status = 'failed';
    },
  },
});

export const { setPrayerData, setLoading, setFailed } = prayerSlice.actions;
export default prayerSlice.reducer;
