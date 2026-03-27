<div align="center">

# 🕌 Owwab — أواب

**A production-grade Islamic companion app built for Android with React Native & Native Kotlin/Java.**

*Helping Muslims manage their daily 'Ibadah — from accurate Azan alerts to spiritual habit tracking.*

[![React Native](https://img.shields.io/badge/React%20Native-0.81-blue?logo=react)](https://reactnative.dev)
[![Expo](https://img.shields.io/badge/Expo-54-black?logo=expo)](https://expo.dev)
[![Platform](https://img.shields.io/badge/Platform-Android-green?logo=android)](https://android.com)
[![Language](https://img.shields.io/badge/Language-TypeScript%20%7C%20Kotlin%20%7C%20Java-orange)](https://www.typescriptlang.org)

</div>

---

## 📖 Table of Contents
- [Overview](#-overview)
- [Why This Project Matters](#-why-this-project-matters)
- [Features](#-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Installation](#-installation)
- [Challenges & Engineering Solutions](#-challenges--engineering-solutions)
- [Performance](#-performance-considerations)
- [Future Roadmap](#-future-roadmap)
- [Author](#-author)

---

## 🌍 Overview

**أواب** (Owwab — meaning "one who returns to Allah") is a full-featured, offline-capable Islamic Android app built with a production mindset. It bridges the gap between JavaScript-driven UI and native Android system services to solve real-world problems that most Islamic apps fail to address — like reliable Azan in battery saver mode, floating Tasbeeh overlays that survive app restarts, and accurate geolocation-based prayer times.

This is not a wrapper around a web view. It is a deeply integrated native Android application where each core feature required custom Kotlin/Java native modules registered within the React Native bridge.

---

## 💡 Why This Project Matters

Most Islamic apps on the market are either:
- Web-views dressed as native apps with unreliable background Azan, or
- Closed-source legacy apps with no modern UX.

Owwab was built to prove that a **small, focused team can deliver a modern, production-ready Islamic app** using the React Native ecosystem — without sacrificing native Android reliability. Every major feature here required solving a non-trivial engineering challenge.

From a portfolio perspective, this project demonstrates:
- Deep understanding of the **Android lifecycle and background execution model**.
- Ability to write and bridge **custom native modules** in Kotlin/Java.
- Production-level **state management architecture** using Redux Toolkit.
- Real-world **debugging of complex concurrency issues** (Doze Mode, Foreground Services, permission flows).

---

## ✨ Features

### 🕒 Prayer Times & Azan
Prayer times are computed locally on-device using the device's GPS coordinates — no internet required after the first location fix. The app calculates Fajr, Dhuhr, Asr, Maghrib, and Isha for every day of the year and schedules all five Azans in advance.

The Azan system is powered by a **fully native Android AlarmManager** implementation written in Java, bypassing JavaScript timers which are unreliable in the background. When an alarm fires, it triggers a `BroadcastReceiver` that spawns a `ForegroundService` to play the Azan audio — even on locked devices.

### 📿 Tasbeeh & Floating Bubble
The digital Tasbeeh provides a full-screen counter with haptic feedback, custom goals, and session logging. The signature feature is the **Floating Tasbeeh Bubble** — a system-level overlay that stays above all other apps, allowing the user to do Tasbeeh while browsing, reading, or doing anything else on the phone.

The bubble state (count, color, label) persists through app restarts via native `SharedPreferences`, and is bidirectionally synced with Redux state when the app is opened.

### 📖 Quran Reader & Audio
A full Quran reader with Uthmanic script fonts (Amiri & Lateef). An integrated audio player built on `react-native-track-player` supports background playback with media notification controls, allowing the user to listen to their favorite Qari while the screen is off.

### 🧭 Qibla Direction Compass
A live, sensor-driven compass that uses the device's magnetometer via `expo-sensors` to point accurately toward the Kaaba. The direction is calculated from the user's GPS coordinates against the fixed coordinates of Makkah.

### ☑️ Ibadah Tracker
A daily checklist of acts of worship — Fard prayers, Sunnah prayers, Quran, Adhkar, etc. The system logs completion data and provides visual statistics charts to track spiritual consistency over time.

### 🧮 Zakat Calculator
A comprehensive Zakat calculator supporting Gold, Silver, cash, and investments. Uses current thresholds (Nisab) and calculates the obligatory 2.5% with a clean, step-by-step UI.

### 📲 Home Screen Widget
A native Android home screen widget that displays the next prayer name and its countdown timer, built with `RemoteViews` and updated via a custom widget manager.

### 🔔 Athkar & Dua Collection
Curated morning, evening, and situational Adhkar with an intuitive carousel. Each Dhikr card shows the Arabic text, transliteration, and count target.

---

## 🏛 Architecture

Owwab follows **Clean Architecture** principles, separating concerns into distinct layers:

```
┌────────────────────────────────────────────┐
│             Presentation Layer             │
│   Screens / Components / Redux Store       │
└───────────────────┬────────────────────────┘
                    │
┌───────────────────▼────────────────────────┐
│              Domain Layer                  │
│   Business Logic / Use Cases / Interfaces  │
└───────────────────┬────────────────────────┘
                    │
┌───────────────────▼────────────────────────┐
│               Data Layer                   │
│   Services / Native Modules / AsyncStorage │
└────────────────────────────────────────────┘
```

**Key decisions:**

- **No business logic in components.** All computation (prayer time calculation, Zakat logic) is isolated in the `domain/` and `data/` layers.
- **Native code only where necessary.** JavaScript handles all UI and state. Native Kotlin/Java is reserved exclusively for tasks that JavaScript cannot reliably perform: scheduling exact alarms, running foreground services, and drawing system overlays.
- **Redux as the single source of truth.** All features — Tasbeeh count, prayer notification settings, Athkar selections — are managed through Redux slices with persistence via `redux-persist`.

---

## 🛠 Tech Stack

| Technology | Purpose | Why Chosen |
|---|---|---|
| **React Native 0.81** | Core UI framework | Cross-platform UI with native performance |
| **Expo SDK 54** | Build tooling & native APIs | Managed workflow simplifies device APIs |
| **NativeWind / Tailwind** | Styling | Utility-first CSS brings design consistency |
| **Redux Toolkit** | State management | Industry-standard, predictable state container |
| **Redux Persist** | State persistence | Automatically hydrates state from AsyncStorage |
| **react-native-track-player** | Background audio | Only library with true background playback + lock screen controls |
| **AsyncStorage** | Key-value persistence | Lightweight, offline-first storage |
| **Kotlin / Java** | Native Android modules | Required for `AlarmManager`, `ForegroundService`, System Overlays |
| **expo-sensors** | Magnetometer / Qibla | Direct hardware access for compass |
| **expo-location** | GPS prayer times | Accurate geolocation with background permission |

---

## 📁 Project Structure

```
owwab/
├── src/
│   ├── data/                   # Services, API integrations, native module wrappers
│   │   └── services/
│   │       ├── AudioService.ts         # Track player management
│   │       ├── NotificationService.ts  # Permission + notification utilities
│   │       ├── PrayerTimeService.ts    # Prayer time calculation logic
│   │       └── LocationService.ts      # GPS location service
│   │
│   ├── domain/                 # Business rules (pure functions, no side effects)
│   │
│   ├── presentation/           # UI layer
│   │   ├── screens/            # Full-page screens (HomeScreen, QuranScreen, etc.)
│   │   ├── components/         # Reusable UI components
│   │   ├── hooks/              # Custom React hooks (useLocation, usePrayers, etc.)
│   │   └── store/              # Redux store, slices, and selectors
│   │
│   ├── shared/                 # Utilities, theme constants, helpers
│   └── types/                  # TypeScript type definitions and declarations
│
├── android/                    # Android native project
│   └── app/src/main/java/
│       └── com/.../owwab/
│           ├── AzanModule.java        # Native AlarmManager scheduler
│           ├── AzanReceiver.java      # BroadcastReceiver for alarm events
│           ├── AzanService.java       # ForegroundService for audio playback
│           ├── MainActivity.kt        # App entry point
│           └── widget/                # Home screen widget implementation
│
├── assets/                     # Fonts, images, Azan audio
├── App.tsx                     # Root component, navigation setup
├── app.json                    # Expo configuration
└── package.json
```

---

## ⚙️ Installation

### Prerequisites
- Node.js >= 18
- Android Studio (with an AVD or a physical device on Android 8+)
- Java Development Kit (JDK 17)

### Setup

```bash
# 1. Clone the repository
git clone https://github.com/your-username/owwab.git
cd owwab

# 2. Install JavaScript dependencies
npm install

# 3. Apply patches for library compatibility
npx patch-package

# 4. Build and run on Android
npx expo run:android
```

> **Note:** The Azan system and Floating Bubble require a **physical Android device** to test. Emulators do not support `setExactAndAllowWhileIdle` alarms or System Overlay permissions reliably.

### Required Permissions (auto-requested on first run)
| Permission | Used For |
|---|---|
| `ACCESS_FINE_LOCATION` | GPS-based prayer time calculation |
| `SCHEDULE_EXACT_ALARM` | Reliable, to-the-second Azan scheduling |
| `FOREGROUND_SERVICE` | Running Azan audio when app is in background |
| `SYSTEM_ALERT_WINDOW` | Drawing the Floating Tasbeeh Bubble overlay |
| `POST_NOTIFICATIONS` | Showing persistent notification for Foreground Service (Android 13+) |

---

## ⚔️ Challenges & Engineering Solutions

This section documents the hardest problems encountered and the reasoning behind each solution. These are real engineering trade-offs, not textbook answers.

---

### Challenge 1: Azan Reliability in Doze Mode

**The Problem:**
Android's Doze Mode and Battery Optimization aggressively suspend background processes, including `setTimeout`, `setInterval`, and `expo-notifications` scheduled triggers. In testing, expo-notifications-based Azans were delayed by up to 15 minutes when the phone was idle.

**The Approach Tried First (❌ Failed):**
`expo-notifications` with `scheduleNotificationAsync` — silently dropped in Doze Mode on Samsung and Xiaomi devices.

**The Solution (✅):**
A fully native implementation using Java:

```java
// AzanModule.java — called from JavaScript via the React Native bridge
alarmManager.setExactAndAllowWhileIdle(
    AlarmManager.RTC_WAKEUP,
    triggerTimeMs,
    pendingIntent // → fires AzanReceiver
);
```

`setExactAndAllowWhileIdle` is the **only Android API** guaranteed to fire at the exact time even during Doze. The `BroadcastReceiver` then starts a `ForegroundService` which plays the Azan audio using `MediaPlayer` with `USAGE_ALARM` audio attributes — ensuring it overrides silent/vibrate mode just like a system alarm.

On Android 12+, the app also requests `SCHEDULE_EXACT_ALARM` permission and guides the user to the system settings page if it hasn't been granted.

---

### Challenge 2: Floating Tasbeeh Bubble — Persistence & State Sync

**The Problem:**
The floating bubble is drawn at the system level using `SYSTEM_ALERT_WINDOW`. When the user closes the app (or Android kills it), the JavaScript bridge dies. The bubble's native service survives, but any counts tapped while the app is dead have no way to reach Redux.

**The Solution (✅):**
**Bidirectional dual-source state management:**
1. Every tap in the native bubble increments a counter in Android `SharedPreferences` immediately.
2. When the user re-opens the app, `FloatingTasbeehController` (a render-less component at the root) calls `getSavedTasbeehCount()` via the Native Module bridge and reconciles with the Redux state:

```typescript
// On app foreground
const nativeCount = await RNFloatingBubble.getSavedTasbeehCount();
if (nativeCount > currentReduxCount) {
  dispatch(incrementCount(nativeCount - currentReduxCount));
}
```

This ensures **zero data loss** even after a force-kill or device restart.

---

### Challenge 3: React Native New Architecture (Bridgeless Mode) Compatibility

**The Problem:**
Migrating to React Native 0.81's New Architecture (bridgeless mode) broke `react-native-track-player`. The app would hang on the splash screen with a `TurboModule ParsingException` because several `@ReactMethod` functions in the library's native code had incorrect return-type signatures for the new bridge.

**The Solution (✅):**
Applied a `.patch` file via `patch-package` that corrected all offending `@ReactMethod` signatures in the library's Kotlin source to explicitly return `Unit` (void) — the format required by TurboModules. This approach avoids forking the library and keeps the patch auditable and reproducible across `npm install` runs.

---

### Challenge 4: Floating Bubble System Overlay Permission Flow (Android 11+)

**The Problem:**
`Settings.ACTION_REQUEST_SCHEDULE_EXACT_ALARM` and `Settings.ACTION_MANAGE_OVERLAY_PERMISSION` both redirect the user to system settings pages. There is no callback when the user returns. The app had no way to know if permission was actually granted.

**The Solution (✅):**
Using an `AppState` listener to detect when the app returns to the foreground, then re-checking permission programmatically:

```typescript
const waitForReturn = () => new Promise<void>((resolve) => {
  const sub = AppState.addEventListener('change', (nextState) => {
    if (nextState === 'active') {
      sub.remove();
      setTimeout(resolve, 500); // let system state settle
    }
  });
  setTimeout(() => { sub.remove(); resolve(); }, 30000); // safety fallback
});

await safeRequestPermission(); // opens settings
await waitForReturn();
const granted = await safeCheckPermission(); // re-check after returning
```

---

## ⚡ Performance Considerations

- **Prayer time calculation is done once per day** and cached. No repeated GPS lookups or network calls.
- **Redux Persist** uses selective persistence — heavy state (Quran pages, audio tracks) is not persisted to AsyncStorage, only lightweight user preferences and counters.
- **Audio service** uses `react-native-track-player` which runs on a dedicated native thread, keeping the JS thread free and the UI at 60fps during playback.
- **Tasbeeh count updates** to the native bubble are debounced to avoid flooding the Native Bridge with calls on rapid taps.
- **Lazy loading** applies to the Quran screen — Surah data is loaded on demand, not at app startup.

---

## 🔮 Future Roadmap

| Feature | Status |
|---|---|
| iOS Support (limited Azan features) | Planned |
| Hadith of the Day (daily notification) | Planned |
| Hijri Calendar & Islamic Events | Planned |
| Cloud Sync for Tasbeeh history | Planned |
| Offline Quran audio download | Planned |
| Multiple Azan reciter support | In Progress |
| Apple Watch / WearOS Tasbeeh | Research Stage |

---

## 👤 Author

**Mohamed Wael**

A software developer passionate about building meaningful, technically rigorous mobile applications. This project represents a deep dive into Android's native layer, React Native's bridge architecture, and the challenges of delivering reliable background services on a fragmented Android ecosystem.

> *"The best of deeds are those done consistently, even if they are small."*
> — Prophet Muhammad ﷺ

---

<div align="center">

Built with ❤️ for the Muslim community.

*If this project helped you or inspired you — a ⭐ on GitHub goes a long way.*

</div>
