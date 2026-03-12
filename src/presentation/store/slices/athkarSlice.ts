import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AthkarCount {
  id: string;
  count: number;
}

interface AthkarState {
  completionCounts: Record<string, number>; // itemId -> count
  lastResetDate: string | null; // ISO string
}

const initialState: AthkarState = {
  completionCounts: {},
  lastResetDate: null,
};

export const athkarSlice = createSlice({
  name: 'athkar',
  initialState,
  reducers: {
    incrementAthkarCount: (state, action: PayloadAction<{ id: string; target: number }>) => {
      const { id, target } = action.payload;
      const current = state.completionCounts[id] || 0;
      if (current < target) {
        state.completionCounts[id] = current + 1;
      }
    },
    resetAthkarCounts: (state) => {
      state.completionCounts = {};
      state.lastResetDate = new Date().toISOString();
    },
    syncDailyReset: (state) => {
      const today = new Date().toDateString();
      const lastReset = state.lastResetDate ? new Date(state.lastResetDate).toDateString() : null;
      
      if (today !== lastReset) {
        state.completionCounts = {};
        state.lastResetDate = new Date().toISOString();
      }
    },
  },
});

export const { incrementAthkarCount, resetAthkarCounts, syncDailyReset } = athkarSlice.actions;
export default athkarSlice.reducer;
