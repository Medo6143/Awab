import { registerRootComponent } from 'expo';
import { I18nManager } from 'react-native';

// Force RTL immediately
try {
  I18nManager.allowRTL(true);
  I18nManager.forceRTL(true);
  I18nManager.swapLeftAndRightInRTL(true);
} catch (e) {
  console.warn('I18nManager error:', e);
}

import App from './App';

import TrackPlayer from 'react-native-track-player';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);

// Register the TrackPlayer background playback service
TrackPlayer.registerPlaybackService(() => require('./src/data/services/TrackPlayerService').TrackPlayerService);
