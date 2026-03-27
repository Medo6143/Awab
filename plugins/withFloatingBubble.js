const { withAndroidManifest } = require('@expo/config-plugins');

module.exports = function withFloatingBubble(config) {
  return withAndroidManifest(config, (config) => {
    const androidManifest = config.modResults;
    const mainApplication = androidManifest.manifest.application[0];

    // Ensure the service is declared in the manifest
    if (!mainApplication.service) {
      mainApplication.service = [];
    }

    const serviceName = 'com.reactlibrary.FloatingBubbleService';
    const existingService = mainApplication.service.find(
      (s) => s.$['android:name'] === serviceName
    );

    if (!existingService) {
      mainApplication.service.push({
        $: {
          'android:name': serviceName,
          'android:foregroundServiceType': 'specialUse',
          'android:stopWithTask': 'false',
          'android:exported': 'false',
        },
        'property': [
          {
            $: {
              'android:name': 'android.app.PROPERTY_SPECIAL_USE_FGS_REASON',
              'android:value': 'Floating Tasbeeh counter and dhikr reminders that must remain active over other apps.',
            },
          },
        ],
      });
    }

    return config;
  });
};
