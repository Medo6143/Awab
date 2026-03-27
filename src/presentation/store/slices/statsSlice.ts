import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface DayStats {
  prayers: string[]; // IDs of completed prayers/tasks
  dhikrCount: number; // Total count for the day
  dhikrDetails: Record<string, number>; // Specific dhikr -> count
  quranPages: number[]; // Array of unique page numbers read today
  minutesSpent: number; // Optional: for future use
}

interface StatsState {
  dailyRecords: Record<string, DayStats>; // YYYY-MM-DD -> Stats
}

const initialState: StatsState = {
  dailyRecords: {},
};

const getLocalToday = (d = new Date()) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const statsSlice = createSlice({
  name: 'stats',
  initialState,
  reducers: {
    logPrayer: (state, action: PayloadAction<{ prayerId: string; isCompleted: boolean }>) => {
      if (!state.dailyRecords) state.dailyRecords = {};
      
      const d = new Date();
      // For night prayers before 6 AM, log them as part of the previous day
      if ((action.payload.prayerId === 'qiyam_al_layl' || action.payload.prayerId === 'qiyan_al_layl') && d.getHours() < 6) {
        d.setDate(d.getDate() - 1);
      }
      const today = getLocalToday(d);

      if (!state.dailyRecords[today]) {
        state.dailyRecords[today] = { prayers: [], dhikrCount: 0, dhikrDetails: {}, quranPages: [], minutesSpent: 0 };
      }
      
      const { prayerId, isCompleted } = action.payload;
      const prayers = state.dailyRecords[today].prayers;
      
      if (isCompleted && !prayers.includes(prayerId)) {
        prayers.push(prayerId);
      } else if (!isCompleted) {
        state.dailyRecords[today].prayers = prayers.filter(id => id !== prayerId);
      }
    },
    logDhikr: (state, action: PayloadAction<{ name: string; count: number }>) => {
      if (!state.dailyRecords) state.dailyRecords = {};
      const today = getLocalToday();
      if (!state.dailyRecords[today]) {
        state.dailyRecords[today] = { prayers: [], dhikrCount: 0, dhikrDetails: {}, quranPages: [], minutesSpent: 0 };
      }
      const { name, count } = action.payload;
      state.dailyRecords[today].dhikrCount += count;
      
      if (!state.dailyRecords[today].dhikrDetails) {
        state.dailyRecords[today].dhikrDetails = {};
      }
      
      state.dailyRecords[today].dhikrDetails[name] = (state.dailyRecords[today].dhikrDetails[name] || 0) + count;
    },
    logQuranPage: (state, action: PayloadAction<number>) => {
      if (!state.dailyRecords) state.dailyRecords = {};
      const today = getLocalToday();
      if (!state.dailyRecords[today]) {
        state.dailyRecords[today] = { prayers: [], dhikrCount: 0, dhikrDetails: {}, quranPages: [], minutesSpent: 0 };
      }
      const page = action.payload;
      if (!state.dailyRecords[today].quranPages.includes(page)) {
        state.dailyRecords[today].quranPages.push(page);
      }
    },
    setDailyRecord: (state, action: PayloadAction<{ date: string; stats: DayStats }>) => {
      state.dailyRecords[action.payload.date] = action.payload.stats;
    }
  },
});

export const { logPrayer, logDhikr, logQuranPage, setDailyRecord } = statsSlice.actions;
export default statsSlice.reducer;
