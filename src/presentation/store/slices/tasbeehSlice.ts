import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface TasbeehState {
  count: number;
  totalCount: number;
  target: number;
  targets: number[];
  selectedDhikr: string;
  dhikrList: string[];
  lastResetDate: string;
}

const DEFAULT_TARGETS = [33, 99, 100, 1000];
const DEFAULT_DHIKR = [
  "سبحان الله",
  "الحمد لله",
  "لا إله إلا الله",
  "الله أكبر",
  "أستغفر الله",
  "لا حول ولا قوة إلا بالله",
  "اللهم صل وسلم على نبينا محمد"
];

const initialState: TasbeehState = {
  count: 0,
  totalCount: 0,
  target: DEFAULT_TARGETS[0],
  targets: DEFAULT_TARGETS,
  selectedDhikr: DEFAULT_DHIKR[0],
  dhikrList: DEFAULT_DHIKR,
  lastResetDate: new Date().toDateString(),
};

const tasbeehSlice = createSlice({
  name: 'tasbeeh',
  initialState,
  reducers: {
    incrementCount: (state, action: PayloadAction<number>) => {
      const amount = action.payload;
      state.count += amount;
      state.totalCount += amount;
      
      // If we exceed target, we cycle back (legacy behavior from component)
      if (state.count > state.target && amount === 1) {
        state.count = 1;
      }
    },
    resetCount: (state) => {
      state.count = 0;
    },
    setTarget: (state, action: PayloadAction<number>) => {
      state.target = action.payload;
    },
    addTarget: (state, action: PayloadAction<number>) => {
      if (!state.targets.includes(action.payload)) {
        state.targets = [...state.targets, action.payload].sort((a, b) => a - b);
      }
    },
    setSelectedDhikr: (state, action: PayloadAction<string>) => {
      state.selectedDhikr = action.payload;
    },
    addDhikr: (state, action: PayloadAction<string>) => {
      if (!state.dhikrList.includes(action.payload)) {
        state.dhikrList = [action.payload, ...state.dhikrList];
      }
    },
    syncTasbeehReset: (state) => {
      const today = new Date().toDateString();
      if (state.lastResetDate !== today) {
        state.count = 0;
        state.lastResetDate = today;
      }
    }
  },
});

export const { 
  incrementCount, resetCount, setTarget, 
  addTarget, setSelectedDhikr, addDhikr, syncTasbeehReset 
} = tasbeehSlice.actions;

export default tasbeehSlice.reducer;
