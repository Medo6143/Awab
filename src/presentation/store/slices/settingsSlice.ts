import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AzanSettings, DEFAULT_NOTIFICATION_PREFS, NotificationPrefs } from '../../../domain/entities/notifications';

export type TafsirStyle = 'simple' | 'book' | 'modern';
/** Pixel size of shared images: small 720×1280, medium 1080×1920, high 1440×2560. */
export type ShareImageSize = 'small' | 'medium' | 'high';

interface SettingsState {
  notificationsEnabled: boolean;
  locationEnabled: boolean;
  theme: 'light' | 'dark';
  accentTheme: 'gold' | 'emerald' | 'midnight';
  selectedTafsirId: number;
  tafsirStyle: TafsirStyle;
  tafsirFontSize: number;
  selectedReciterId: string;
  notificationPrefs: NotificationPrefs;
  calculationMethod: number;
  azanSettings: AzanSettings;
  shareImageSize: ShareImageSize;
  tasbeehHaptics: boolean;     // a light buzz on every count
  tasbeehTargetAlert: boolean; // a stronger buzz when the target is reached
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
  notificationPrefs: DEFAULT_NOTIFICATION_PREFS,
  calculationMethod: 5, // Egyptian General Authority of Survey
  azanSettings: {
    type: 'full',
    visualAzanEnabled: true,
  },
  shareImageSize: 'medium',
  tasbeehHaptics: true,
  tasbeehTargetAlert: true,
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
    setShareImageSize: (state, action: PayloadAction<ShareImageSize>) => {
      state.shareImageSize = action.payload;
    },
    // `?? true`: state persisted before these settings existed lacks the keys
    toggleTasbeehHaptics: (state) => {
      state.tasbeehHaptics = !(state.tasbeehHaptics ?? true);
    },
    toggleTasbeehTargetAlert: (state) => {
      state.tasbeehTargetAlert = !(state.tasbeehTargetAlert ?? true);
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
        (state.notificationPrefs as Record<string, unknown>)[key] = !current;
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
    setEncouragementInterval: (state, action: PayloadAction<number>) => {
      if (state.notificationPrefs) {
        state.notificationPrefs.encouragementInterval = action.payload;
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
  setShareImageSize,
  toggleTasbeehHaptics,
  toggleTasbeehTargetAlert, 
  setTafsirFontSize,
  setReciterId,
  toggleNotificationCategory,
  setCalculationMethod,
  setAzanSettings,
  setPrePrayerReminderOffset,
  setDailyWardTime,
  setEncouragementInterval
} = settingsSlice.actions;

export default settingsSlice.reducer;
