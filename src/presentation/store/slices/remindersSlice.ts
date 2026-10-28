import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Reminder } from '../../../domain/entities/reminders';

interface RemindersState {
  list: Reminder[];
}

const initialState: RemindersState = { list: [] };

export const remindersSlice = createSlice({
  name: 'reminders',
  initialState,
  reducers: {
    /** Adds the reminder, or replaces the one with the same id. */
    saveReminder: (state, action: PayloadAction<Reminder>) => {
      const i = state.list.findIndex((r) => r.id === action.payload.id);
      if (i >= 0) state.list[i] = action.payload;
      else state.list.push(action.payload);
    },
    removeReminder: (state, action: PayloadAction<string>) => {
      state.list = state.list.filter((r) => r.id !== action.payload);
    },
    toggleReminder: (state, action: PayloadAction<string>) => {
      const r = state.list.find((x) => x.id === action.payload);
      if (r) r.enabled = !r.enabled;
    },
  },
});

export const { saveReminder, removeReminder, toggleReminder } = remindersSlice.actions;
export default remindersSlice.reducer;
