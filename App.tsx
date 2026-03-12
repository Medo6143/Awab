import React, { useEffect } from 'react';
import { I18nManager } from 'react-native';
import { Provider, useDispatch } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { store, persistor } from './src/presentation/store';
import AppNavigation from './src/presentation/navigation/AppNavigation';
import { 
  useFonts, 
  Tajawal_400Regular,
  Tajawal_500Medium,
  Tajawal_700Bold,
  Tajawal_800ExtraBold
} from '@expo-google-fonts/tajawal';
import { Amiri_400Regular, Amiri_700Bold } from '@expo-google-fonts/amiri';
import { Lateef_400Regular, Lateef_700Bold } from '@expo-google-fonts/lateef';
import * as SplashScreen from 'expo-splash-screen';

import './global.css'; // NativeWind

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

import { syncDailyReset } from './src/presentation/store/slices/athkarSlice';
import { useNotifications } from './src/presentation/hooks/useNotifications';
import { AzanVideoModal } from './src/presentation/components/azan/AzanVideoModal';
import { hideAzanModal } from './src/presentation/store/slices/uiSlice';
import { RootState } from './src/presentation/store';
import { useSelector } from 'react-redux';
import { NotificationService } from './src/data/services/NotificationService';

const Bootstrapper = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useDispatch();
  const { azanModal } = useSelector((state: RootState) => state.ui);
  useNotifications();
  
  useEffect(() => {
    dispatch(syncDailyReset());
    // Emergency: Purge all notifications on first boot to clear leaked alarms
    NotificationService.cancelAll();
  }, [dispatch]);

  return (
    <>
      {children}
      <AzanVideoModal 
        visible={azanModal.visible} 
        prayerName={azanModal.prayerName} 
        onClose={() => dispatch(hideAzanModal())} 
      />
    </>
  );
};

import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function App() {
  const [fontsLoaded] = useFonts({
    Tajawal_400Regular,
    Tajawal_500Medium,
    Tajawal_700Bold,
    Tajawal_800ExtraBold,
    Amiri_400Regular,
    Amiri_700Bold,
    Lateef_400Regular,
    Lateef_700Bold
  });

  useEffect(() => {
    // Force RTL layout for Arabic safely
    try {
      if (I18nManager && !I18nManager.isRTL) {
        if (typeof I18nManager.allowRTL === 'function') {
          I18nManager.allowRTL(true);
        }
        if (typeof I18nManager.forceRTL === 'function') {
          I18nManager.forceRTL(true);
        }
      }
    } catch (error) {
      console.warn('I18nManager setup failed:', error);
    }
  }, []);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <Bootstrapper>
            <QueryClientProvider client={queryClient}>
              <AppNavigation />
            </QueryClientProvider>
          </Bootstrapper>
        </PersistGate>
      </Provider>
    </SafeAreaProvider>
  );
}
