import { configureStore, combineReducers } from '@reduxjs/toolkit';
import {
  persistStore,
  persistReducer,
  createMigrate,
  FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER
} from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import settingsReducer from './slices/settingsSlice';
import quranReducer from './slices/quranSlice';
import duasReducer from './slices/duasSlice';
import athkarReducer from './slices/athkarSlice';
import achievementsReducer from './slices/achievementsSlice';
import ibadaReducer from './slices/ibadaSlice';
import statsReducer from './slices/statsSlice';
import tasbeehReducer from './slices/tasbeehSlice';
import uiReducer from './slices/uiSlice';
import prayerReducer from './slices/prayerSlice';
import audioReducer from './slices/audioSlice';
import favoritesReducer from './slices/favoritesSlice';
import remindersReducer from './slices/remindersSlice';
import qadaReducer from './slices/qadaSlice';
import { migrations } from './migrations';

export const STORE_VERSION = 8; // 8: welcome screens, skipped for users who had the app before
// 7: qiyam al-layl moved from a settings toggle to «تذكيراتي» (#18)

const persistConfig = {
  key: 'root_v6',     // Incremented version for stats and tasbeeh
  version: STORE_VERSION,
  migrate: createMigrate(migrations, { debug: false }),
  storage: AsyncStorage,
  // Session-only state: an open azan screen or a "playing" flag must not come back
  // after the app was killed (the azan screen reappeared on every launch).
  blacklist: ['ui', 'audio'],
};

const rootReducer = combineReducers({
  settings: settingsReducer,
  quran: quranReducer,
  duas: duasReducer,
  athkar: athkarReducer,
  achievements: achievementsReducer,
  ibada: ibadaReducer,
  stats: statsReducer,
  tasbeeh: tasbeehReducer,
  ui: uiReducer,
  prayer: prayerReducer,
  audio: audioReducer,
  favorites: favoritesReducer,
  reminders: remindersReducer,
  qada: qadaReducer,
});

/** Session-only slices: never in a backup, never replaced by one. */
const SESSION_KEYS = ['ui', 'audio', '_persist'];

/** What a backup holds: every persisted slice. */
export const backupState = (state: RootState): Record<string, unknown> =>
  Object.fromEntries(Object.entries(state).filter(([k]) => !SESSION_KEYS.includes(k)));

const RESTORE = 'backup/restore';

/**
 * The action that puts a backup's slices in place of the current ones. `version` is the store
 * version it was saved under; the migrations since then run first, as on a normal update.
 */
export const restoreBackup = (saved: Record<string, unknown>, version: number) => {
  let state = saved as unknown as Parameters<(typeof migrations)[number]>[0];
  for (let v = version + 1; v <= STORE_VERSION; v++) {
    const migrate = migrations[v];
    if (migrate) state = migrate(state) as typeof state;
  }
  const payload = Object.fromEntries(Object.entries(state as object).filter(([k]) => !SESSION_KEYS.includes(k)));
  return { type: RESTORE, payload };
};

const appReducer: typeof rootReducer = (state, action) => {
  if (action.type === RESTORE && state) {
    const payload = (action as unknown as { payload: Partial<RootState> }).payload;
    return rootReducer({ ...state, ...payload }, action);
  }
  return rootReducer(state, action);
};

const persistedReducer = persistReducer(persistConfig, appReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

// Use the non-persisted rootReducer type so selectors are typed correctly
export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;
