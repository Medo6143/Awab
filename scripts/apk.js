#!/usr/bin/env node
/**
 * Builds the release APK for one target and installs it.
 *   npm run apk:emu    → x86_64 only (the Android emulator), installs on the running emulator
 *   npm run apk:phone  → arm64 + armv7 (real phones), installs on the USB-connected phone
 * Run `npx expo prebuild --platform android` first after changing app.json or plugins.
 */
const { execSync, spawnSync } = require('child_process');
const path = require('path');

const target = process.argv[2];
const ABIS = { emu: 'x86_64', phone: 'armeabi-v7a,arm64-v8a' };
if (!ABIS[target]) {
  console.error('usage: node scripts/apk.js <emu|phone>');
  process.exit(1);
}

const root = path.resolve(__dirname, '..');
const androidDir = path.join(root, 'android');
const gradle = `"${path.join(androidDir, process.platform === 'win32' ? 'gradlew.bat' : 'gradlew')}"`;
const sdk = process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT || (process.platform === 'win32' ? 'D:/Android/Sdk' : '');
const adb = sdk ? path.join(sdk, 'platform-tools', process.platform === 'win32' ? 'adb.exe' : 'adb') : 'adb';

console.log(`Building release APK for ${target} (${ABIS[target]})…`);
const build = spawnSync(gradle, ['app:assembleRelease', '-q', `-PreactNativeArchitectures=${ABIS[target]}`], {
  cwd: androidDir,
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, NODE_OPTIONS: '--max-old-space-size=4096' },
});
if (build.status !== 0) process.exit(build.status ?? 1);

// pick the device: an emulator for `emu`, a physical phone for `phone`
const devices = execSync(`"${adb}" devices`).toString()
  .split('\n').slice(1).map((l) => l.trim().split('\t')).filter(([id, st]) => id && st === 'device').map(([id]) => id);
const device = devices.find((id) => (target === 'emu' ? id.startsWith('emulator-') : !id.startsWith('emulator-')));
if (!device) {
  console.error(`Built, but no ${target === 'emu' ? 'emulator' : 'phone'} is connected. APK: android/app/build/outputs/apk/release/app-release.apk`);
  process.exit(1);
}

const apk = path.join(androidDir, 'app', 'build', 'outputs', 'apk', 'release', 'app-release.apk');
console.log(`Installing on ${device}…`);
const install = spawnSync(`"${adb}"`, ['-s', device, 'install', '-r', `"${apk}"`], { stdio: 'inherit', shell: true });
process.exit(install.status ?? 1);
