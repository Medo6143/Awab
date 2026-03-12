import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  isUnlocked: boolean;
  progress: number;
  target: number;
}

interface AchievementsState {
  badges: Achievement[];
  streak: number;
  lastLogin?: string;
}

const INITIAL_BADGES: Achievement[] = [
  { id: 'surah_1', title: 'بداية النور', description: 'أتممت أول سورة في رحلة القلب', icon: 'star', isUnlocked: false, progress: 0, target: 1 },
  { id: 'surah_10', title: 'القلب النابض', description: 'أتممت ١٠ سور في رحلة القلب', icon: 'heart', isUnlocked: false, progress: 0, target: 10 },
  { id: 'tasbeeh_1000', title: 'ذاكر لله', description: 'وصلت لـ ١٠٠٠ تسبيحة', icon: 'activity', isUnlocked: false, progress: 0, target: 1000 },
  { id: 'athkar_7', title: 'المحافظ', description: 'قرأت الأذكار لمدة ٧ أيام متتالية', icon: 'sun', isUnlocked: false, progress: 0, target: 7 },
];

const initialState: AchievementsState = {
  badges: INITIAL_BADGES,
  streak: 0,
};

const achievementsSlice = createSlice({
  name: 'achievements',
  initialState,
  reducers: {
    updateAchievementProgress: (state, action: PayloadAction<{ id: string; progress: number }>) => {
      const achievement = state.badges.find(b => b.id === action.payload.id);
      if (achievement && !achievement.isUnlocked) {
        achievement.progress = action.payload.progress;
        if (achievement.progress >= achievement.target) {
          achievement.isUnlocked = true;
          achievement.unlockedAt = new Date().toISOString();
        }
      }
    },
    incrementStreak: (state) => {
      const today = new Date().toDateString();
      if (state.lastLogin !== today) {
        state.streak += 1;
        state.lastLogin = today;
      }
    },
    resetStreak: (state) => {
      state.streak = 0;
    }
  }
});

export const { updateAchievementProgress, incrementStreak, resetStreak } = achievementsSlice.actions;
export default achievementsSlice.reducer;
