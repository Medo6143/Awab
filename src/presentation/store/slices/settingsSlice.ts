import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type TafsirStyle = 'simple' | 'book' | 'modern';

interface SettingsState {
  notificationsEnabled: boolean;
  locationEnabled: boolean;
  theme: 'light' | 'dark';
  accentTheme: 'gold' | 'emerald' | 'midnight';
  selectedTafsirId: number;
  tafsirStyle: TafsirStyle;
  tafsirFontSize: number;
  selectedReciterId: string;
  notificationPrefs: {
    prayers: boolean;
    athkar: boolean;
    qiyam: boolean;
    duha: boolean;
    ramadan: boolean;
    dailyReminder: boolean;
    prePrayerReminderEnabled: boolean;
    prePrayerReminderOffset: number; // in minutes
    dailyWardEnabled: boolean;
    dailyWardTime: string; // HH:mm
  };
  calculationMethod: number;
  azanSettings: {
    type: 'none' | 'takbir' | 'full';
    visualAzanEnabled: boolean;
  };
}

const initialState: SettingsState = {
  notificationsEnabled: true,
  locationEnabled: true,
  theme: 'dark',
  accentTheme: 'gold',
  selectedTafsirId: 91, // Default: Tafsir al-Sa'di (Arabic)
  tafsirStyle: 'modern',
  tafsirFontSize: 18,
  selectedReciterId: 'alafasy',
  notificationPrefs: {
    prayers: true,
    athkar: true,
    qiyam: true,
    duha: true,
    ramadan: true,
    dailyReminder: true,
    prePrayerReminderEnabled: true,
    prePrayerReminderOffset: 10,
    dailyWardEnabled: true,
    dailyWardTime: '05:00',
  },
  calculationMethod: 5, // Egyptian General Authority of Survey
  azanSettings: {
    type: 'full',
    visualAzanEnabled: true,
  },
};

export const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    toggleNotifications: (state) => {
      state.notificationsEnabled = !state.notificationsEnabled;
    },
    toggleLocation: (state) => {
      state.locationEnabled = !state.locationEnabled;
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
    },
    setAccentTheme: (state, action: PayloadAction<'gold' | 'emerald' | 'midnight'>) => {
      state.accentTheme = action.payload;
    },
    setTafsirId: (state, action: PayloadAction<number>) => {
      state.selectedTafsirId = action.payload;
    },
    setTafsirStyle: (state, action: PayloadAction<TafsirStyle>) => {
      state.tafsirStyle = action.payload;
    },
    setTafsirFontSize: (state, action: PayloadAction<number>) => {
      state.tafsirFontSize = action.payload;
    },
    setReciterId: (state, action: PayloadAction<string>) => {
      state.selectedReciterId = action.payload;
    },
    toggleNotificationCategory: (state, action: PayloadAction<keyof SettingsState['notificationPrefs']>) => {
      if (!state.notificationPrefs) {
        state.notificationPrefs = initialState.notificationPrefs;
      }
      const key = action.payload;
      const current = state.notificationPrefs[key];
      if (typeof current === 'boolean') {
        (state.notificationPrefs as any)[key] = !current;
      }
    },
    setCalculationMethod: (state, action: PayloadAction<number>) => {
      state.calculationMethod = action.payload;
    },
    setAzanSettings: (state, action: PayloadAction<{ type?: 'none' | 'takbir' | 'full', visualAzanEnabled?: boolean }>) => {
      state.azanSettings = { ...state.azanSettings, ...action.payload };
    },
    setPrePrayerReminderOffset: (state, action: PayloadAction<number>) => {
      if (state.notificationPrefs) {
        state.notificationPrefs.prePrayerReminderOffset = action.payload;
      }
    },
    setDailyWardTime: (state, action: PayloadAction<string>) => {
      if (state.notificationPrefs) {
        state.notificationPrefs.dailyWardTime = action.payload;
      }
    },
  },
});

export const { 
  toggleNotifications, 
  toggleLocation, 
  setTheme, 
  setAccentTheme,
  setTafsirId, 
  setTafsirStyle, 
  setTafsirFontSize,
  setReciterId,
  toggleNotificationCategory,
  setCalculationMethod,
  setAzanSettings,
  setPrePrayerReminderOffset,
  setDailyWardTime
} = settingsSlice.actions;

export default settingsSlice.reducer;
