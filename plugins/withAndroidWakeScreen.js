const { withMainActivity } = require('@expo/config-plugins');

module.exports = function withAndroidWakeScreen(config) {
  return withMainActivity(config, (config) => {
    let mainActivity = config.modResults.contents;

    // Add necessary imports
    if (!mainActivity.includes('android.view.WindowManager')) {
      mainActivity = mainActivity.replace(
        'import android.os.Bundle',
        'import android.os.Bundle\nimport android.view.WindowManager'
      );
    }

    // Add wake screen flags to onCreate
    const wakeScreenCode = `
    // Wake Screen and Bypass Keyguard for Azan
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
      setShowWhenLocked(true)
      setTurnScreenOn(true)
    } else {
      window.addFlags(
        WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED or
        WindowManager.LayoutParams.FLAG_DISMISS_KEYGUARD or
        WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON
      )
    }
    window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
    `;

    // Only inject if not already present
    if (!mainActivity.includes('setShowWhenLocked(true)')) {
      mainActivity = mainActivity.replace(
        'super.onCreate(null)',
        `${wakeScreenCode}\n    super.onCreate(null)`
      );
    }

    config.modResults.contents = mainActivity;
    return config;
  });
};
