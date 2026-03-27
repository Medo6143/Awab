
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type IbadaCategory = 'obligatory' | 'sunnah' | 'voluntary' | 'daily';

export interface IbadaTask {
  id: string;
  name: string;
  category: IbadaCategory;
  isCompleted: boolean;
}

interface IbadaState {
  tasks: IbadaTask[];
  lastResetDate: string; // ISO Date string
}

const INITIAL_TASKS: IbadaTask[] = [
  { id: 'fajr', name: 'صلاة الفجر', category: 'obligatory', isCompleted: false },
  { id: 'dhuhr', name: 'صلاة الظهر', category: 'obligatory', isCompleted: false },
  { id: 'asr', name: 'صلاة العصر', category: 'obligatory', isCompleted: false },
  { id: 'maghrib', name: 'صلاة المغرب', category: 'obligatory', isCompleted: false },
  { id: 'isha', name: 'صلاة العشاء', category: 'obligatory', isCompleted: false },
  { id: 'rawatib', name: 'السنن الرواتب', category: 'sunnah', isCompleted: false },
  { id: 'duha', name: 'صلاة الضحى', category: 'sunnah', isCompleted: false },
  { id: 'witr', name: 'صلاة الوتر', category: 'sunnah', isCompleted: false },
  { id: 'athkar_morning', name: 'أذكار الصباح', category: 'daily', isCompleted: false },
  { id: 'athkar_evening', name: 'أذكار المساء', category: 'daily', isCompleted: false },
  { id: 'quran_reading', name: 'ورد القرآن الكريم', category: 'daily', isCompleted: false },
  { id: 'qiyam_al_layl', name: 'قيام الليل', category: 'sunnah', isCompleted: false },
  { id: 'fasting', name: 'صيام اليوم', category: 'voluntary', isCompleted: false },
  { id: 'sadaqah', name: 'صدقة اليوم', category: 'voluntary', isCompleted: false },
  { id: 'silat_al_rahm', name: 'صلة الرحم', category: 'voluntary', isCompleted: false },
];

const getLocalToday = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const initialState: IbadaState = {
  tasks: INITIAL_TASKS,
  lastResetDate: getLocalToday(),
};

const ibadaSlice = createSlice({
  name: 'ibada',
  initialState,
  reducers: {
    toggleTask: (state, action: PayloadAction<string>) => {
      const task = state.tasks.find(t => t.id === action.payload);
      if (task) {
        task.isCompleted = !task.isCompleted;
      }
    },
    syncIbadaDailyReset: (state) => {
      const today = getLocalToday();
      if (state.lastResetDate !== today) {
        state.tasks = state.tasks.map(t => ({ ...t, isCompleted: false }));
        state.lastResetDate = today;
      }
    },
    // Allows user to add custom spiritual goals
    addCustomTask: (state, action: PayloadAction<{ name: string, category: IbadaCategory }>) => {
      state.tasks.push({
        id: `custom_${Date.now()}`,
        name: action.payload.name,
        category: action.payload.category,
        isCompleted: false
      });
    },
    removeCustomTask: (state, action: PayloadAction<string>) => {
      state.tasks = state.tasks.filter(t => t.id !== action.payload || !t.id.startsWith('custom_'));
    }
  },
});

export const { toggleTask, syncIbadaDailyReset, addCustomTask, removeCustomTask } = ibadaSlice.actions;
export default ibadaSlice.reducer;
