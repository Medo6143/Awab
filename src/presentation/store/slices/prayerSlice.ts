import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface PrayerTimings {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Sunset: string;
  Maghrib: string;
  Isha: string;
  Imsak: string;
  Midnight: string;
}

interface PrayerDate {
  readable: string;
  timestamp: string;
  gregorian: {
    date: string;
    format: string;
    day: string;
    weekday: { en: string; ar?: string };
    month: { number: number; en: string; ar?: string };
    year: string;
  };
  hijri: {
    date: string;
    format: string;
    day: string;
    weekday: { en: string; ar: string };
    month: { number: number; en: string; ar: string };
    year: string;
  };
}

interface PrayerData {
  timings: PrayerTimings;
  date: PrayerDate;
  meta: any;
}

interface PrayerState {
  cachedData: PrayerData | null;
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
    setPrayerData: (state, action: PayloadAction<PrayerData>) => {
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
