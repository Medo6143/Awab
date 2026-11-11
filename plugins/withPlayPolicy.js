/**
 * Manifest changes that keep the app inside Google Play's permission policies.
 *
 * - expo-location declares LocationTaskService with foregroundServiceType="location" in its
 *   own manifest. The app never tracks location in the background, so the service is removed:
 *   an unused location foreground service invites questions in review.
 * - WRITE_EXTERNAL_STORAGE (from expo-file-system and expo-media-library) only matters up to
 *   Android 9; saving to the gallery uses MediaStore after that.
 */
const { withAndroidManifest } = require('@expo/config-plugins');

const LOCATION_SERVICE = 'expo.modules.location.services.LocationTaskService';
const WRITE_STORAGE = 'android.permission.WRITE_EXTERNAL_STORAGE';

module.exports = function withPlayPolicy(config) {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults.manifest;
    manifest.$['xmlns:tools'] = manifest.$['xmlns:tools'] || 'http://schemas.android.com/tools';

    const app = manifest.application[0];
    app.service = (app.service || []).filter((s) => s.$['android:name'] !== LOCATION_SERVICE);
    app.service.push({ $: { 'android:name': LOCATION_SERVICE, 'tools:node': 'remove' } });

    manifest['uses-permission'] = (manifest['uses-permission'] || []).filter((p) => p.$['android:name'] !== WRITE_STORAGE);
    manifest['uses-permission'].push({
      $: { 'android:name': WRITE_STORAGE, 'android:maxSdkVersion': '28', 'tools:replace': 'android:maxSdkVersion' },
    });

    return config;
  });
};
