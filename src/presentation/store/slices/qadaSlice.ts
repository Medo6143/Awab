import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { PRAYER_IDS, PrayerId } from '../../../domain/entities/notifications';

/**
 * Missed obligatory prayers still to make up («القضاء»), per prayer, and how many were made up
 * so far. Private to the phone like the rest; nothing here is shown anywhere else.
 */
interface QadaState {
  owed: Record<PrayerId, number>;
  madeUp: number;
}

const zero = () => Object.fromEntries(PRAYER_IDS.map((id) => [id, 0])) as Record<PrayerId, number>;

const initialState: QadaState = { owed: zero(), madeUp: 0 };

export const qadaSlice = createSlice({
  name: 'qada',
  initialState,
  reducers: {
    /** Adds missed prayers of one kind (or of all five, a whole day, when `prayer` is omitted). */
    addOwed: (state, action: PayloadAction<{ prayer?: PrayerId; count?: number }>) => {
      const n = Math.max(1, Math.floor(action.payload.count ?? 1));
      const ids = action.payload.prayer ? [action.payload.prayer] : PRAYER_IDS;
      ids.forEach((id) => { state.owed[id] = (state.owed[id] ?? 0) + n; });
    },
    /** One prayer of this kind was made up. */
    madeUpOne: (state, action: PayloadAction<PrayerId>) => {
      if ((state.owed[action.payload] ?? 0) <= 0) return;
      state.owed[action.payload] -= 1;
      state.madeUp += 1;
    },
    /** Takes one off without counting it as made up (entered by mistake). */
    removeOwed: (state, action: PayloadAction<PrayerId>) => {
      state.owed[action.payload] = Math.max(0, (state.owed[action.payload] ?? 0) - 1);
    },
  },
});

export const { addOwed, madeUpOne, removeOwed } = qadaSlice.actions;
export default qadaSlice.reducer;
