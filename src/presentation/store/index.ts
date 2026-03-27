import { configureStore, combineReducers } from '@reduxjs/toolkit';
import {
  persistStore,
  persistReducer,
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

const STORE_VERSION = 6;

const persistConfig = {
  key: 'root_v6',     // Incremented version for stats and tasbeeh
  version: STORE_VERSION,
  storage: AsyncStorage,
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
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

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
