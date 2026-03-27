import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface TasbeehState {
  count: number;
  totalCount: number;
  target: number;
  targets: number[];
  selectedDhikr: string;
  dhikrList: string[];
  lastResetDate: string;
  floatingScale: number;
  floatingBubbleColor: string;
  floatingShowBorder: boolean;
  floatingShowReset: boolean;
  floatingReminderInterval: number; // in minutes
  isFloatingActive: boolean;
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

const getLocalToday = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const initialState: TasbeehState = {
  count: 0,
  totalCount: 0,
  target: DEFAULT_TARGETS[0],
  targets: DEFAULT_TARGETS,
  selectedDhikr: DEFAULT_DHIKR[0],
  dhikrList: DEFAULT_DHIKR,
  lastResetDate: getLocalToday(),
  floatingScale: 1.0,
  floatingBubbleColor: '#B8860B', // Default Gold
  floatingShowBorder: true,
  floatingShowReset: true,
  floatingReminderInterval: 10,
  isFloatingActive: false,
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
      const today = getLocalToday();
      if (state.lastResetDate !== today) {
        state.count = 0;
        state.lastResetDate = today;
      }
    },
    setFloatingScale: (state, action: PayloadAction<number>) => {
      state.floatingScale = action.payload;
    },
    setFloatingBubbleColor: (state, action: PayloadAction<string>) => {
      state.floatingBubbleColor = action.payload;
    },
    toggleFloatingBorder: (state) => {
      state.floatingShowBorder = !state.floatingShowBorder;
    },
    toggleFloatingReset: (state) => {
      state.floatingShowReset = !state.floatingShowReset;
    },
    setFloatingReminderInterval: (state, action: PayloadAction<number>) => {
      state.floatingReminderInterval = action.payload;
    },
    setFloatingActive: (state, action: PayloadAction<boolean>) => {
      state.isFloatingActive = action.payload;
    }
  },
});

export const { 
  incrementCount, resetCount, setTarget, 
  addTarget, setSelectedDhikr, addDhikr, syncTasbeehReset,
  setFloatingScale,
  setFloatingBubbleColor,
  toggleFloatingBorder,
  toggleFloatingReset,
  setFloatingReminderInterval,
  setFloatingActive
} = tasbeehSlice.actions;

export default tasbeehSlice.reducer;
