import React, { useEffect, useState } from 'react';
import { I18nManager, View, Text, StyleSheet } from 'react-native';
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
SplashScreen.preventAutoHideAsync().catch(() => {});

const queryClient = new QueryClient();

import { syncDailyReset } from './src/presentation/store/slices/athkarSlice';
import { useNotifications } from './src/presentation/hooks/useNotifications';
import { AzanVideoModal } from './src/presentation/components/azan/AzanVideoModal';
import { hideAzanModal } from './src/presentation/store/slices/uiSlice';
import { RootState } from './src/presentation/store';
import { useSelector } from 'react-redux';
import { NotificationService } from './src/data/services/NotificationService';
import { FloatingTasbeehController } from './src/presentation/components/tasbeeh/FloatingTasbeeh';
import { initializeTrackPlayer } from './src/data/services/TrackPlayerService';

// ────────── Error Boundary ──────────
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('❌ App Error Boundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={errorStyles.container}>
          <Text style={errorStyles.icon}>⚠️</Text>
          <Text style={errorStyles.title}>حدث خطأ غير متوقع</Text>
          <Text style={errorStyles.message}>
            {this.state.error?.message || 'خطأ غير معروف'}
          </Text>
          <Text style={errorStyles.hint}>أعد فتح التطبيق أو امسح بيانات الكاش</Text>
        </View>
      );
    }
    return this.props.children;
  }
}

const errorStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0c0805', justifyContent: 'center', alignItems: 'center', padding: 20 },
  icon: { fontSize: 48, marginBottom: 16 },
  title: { fontSize: 20, color: '#fcd34d', fontWeight: 'bold', marginBottom: 8 },
  message: { fontSize: 14, color: '#ef4444', textAlign: 'center', marginBottom: 12 },
  hint: { fontSize: 13, color: '#94a3b8', textAlign: 'center' },
});

// ────────────────────────────────────

const Bootstrapper = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useDispatch();
  const { azanModal } = useSelector((state: RootState) => state.ui);
  useNotifications();
  
  useEffect(() => {
    dispatch(syncDailyReset());
  }, [dispatch]);

  return (
    <>
      {children}
      <AzanVideoModal 
        visible={azanModal.visible} 
        prayerName={azanModal.prayerName} 
        onClose={() => dispatch(hideAzanModal())} 
      />
      <FloatingTasbeehController />
    </>
  );
};

import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    Tajawal_400Regular,
    Tajawal_500Medium,
    Tajawal_700Bold,
    Tajawal_800ExtraBold,
    Amiri_400Regular,
    Amiri_700Bold,
    Lateef_400Regular,
    Lateef_700Bold
  });

  // Timeout safety: if fonts haven't loaded after 8 seconds, proceed anyway
  const [fontTimedOut, setFontTimedOut] = useState(false);
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!fontsLoaded) {
        console.warn('⏰ Font loading timed out after 8s — proceeding without custom fonts');
        setFontTimedOut(true);
      }
    }, 8000);
    return () => clearTimeout(timeout);
  }, [fontsLoaded]);

  useEffect(() => {
    // Initialize Notification Handler safely
    try {
      NotificationService.init();
    } catch (e) {
      console.warn('NotificationService.init() failed:', e);
    }

    // RTL is forced at the native level (MainApplication.kt)
    // This is just a safety net in case it wasn't set
    try {
      if (I18nManager && !I18nManager.isRTL) {
        I18nManager.allowRTL(true);
        I18nManager.forceRTL(true);
        // Note: forceRTL requires app restart to take effect
      }
    } catch (error) {
      console.warn('I18nManager setup failed:', error);
    }
  }, []);

  const [playerReady, setPlayerReady] = useState(false);
  useEffect(() => {
    async function setup() {
      try {
        await initializeTrackPlayer();
        console.log('App: TrackPlayer ready');
      } catch (e) {
        console.warn('App: TrackPlayer setup failed:', e);
      } finally {
        setPlayerReady(true);
      }
    }
    setup();
  }, []);

  // Log font error if it happens
  useEffect(() => {
    if (fontError) {
      console.error('❌ Font loading error:', fontError);
    }
  }, [fontError]);

  const isReady = (fontsLoaded || fontTimedOut || !!fontError) && playerReady;

  useEffect(() => {
    if (isReady) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [isReady]);

  if (!isReady) {
    return null;
  }

  return (
    <ErrorBoundary>
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
    </ErrorBoundary>
  );
}
