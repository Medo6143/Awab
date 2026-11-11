# Tasbeeh and floating tasbeeh («المسبحة» / «المسبحة العائمة»)

> Status: Shipped · A bead counter with targets and custom dhikr, plus an Android overlay counter that floats above other apps and stays in sync with it.

## What it does

- Shows a loop of 33 SVG beads. Each tap advances one bead, adds one to the count and logs the dhikr in today's stats.
- Lets the user pick the dhikr phrase (7 built in, more can be added), pick a target (33, 99, 100, 1000 or a custom number) and add a count done outside the app.
- Optionally shows a small native counter over other apps (the "floating sebha"), with its own reset button and a periodic dhikr reminder card.

## How the user reaches it

| Destination | Path from launch | Taps |
|---|---|---|
| Tasbeeh screen | Bottom tab «المسبحة» (route `TabTasbeeh`) | 1 |
| Tasbeeh screen | Home, day stats tile «المسبحة اليوم» | 1 |
| Floating tasbeeh toggle | Home sky button «الإعدادات» → «المسبحة والعائمة» → «تفعيل» | 3 |
| Floating tasbeeh toggle | Tasbeeh tab → «المسبحة العائمة» → «المسبحة والعائمة» → «تفعيل» | 4 |

`TabTasbeeh` is a tab in `src/presentation/navigation/AppNavigation.tsx`. The «المسبحة العائمة» button on the screen navigates to `الإعدادات` without a `section` param, so it opens the settings hub, not the tasbeeh section.

## How it works

**In-app counter**

1. On mount the screen dispatches `syncTasbeehReset`: if `lastResetDate` is not today (local date), `count` goes back to 0. `totalCount` is never reset.
2. A tap dispatches `incrementCount(1)` and `logDhikr({ name: selectedDhikr, count: 1 })`.
3. Wrap rule (in the reducer): when a single tap would take `count` above `target`, `count` becomes 1. So the counter shows the target, and the next tap shows 1.
4. Target alert: if `tasbeehTargetAlert` is on and `count + 1 === target`, a success haptic plus `Vibration.vibrate([0, 100, 50, 100])`.
5. Choosing another dhikr, choosing a target, adding a dhikr or adding a custom target all reset `count` to 0.
6. Manual add («إضافة تسبيح يدوي», the `#` item in the target carousel) adds any positive integer to `count` and `totalCount` and logs it. It does not wrap, so `count` can exceed the target until the next tap.

Defaults: targets `[33, 99, 100, 1000]`, target 33, dhikr «سبحان الله», bead colour `#B8860B`. The count is drawn in the floating bubble colour, unless that colour is too close to the page (lightness above 0.8 in light mode, below 0.2 in dark mode).

**Floating overlay**

1. The toggle in Settings calls `useFloatingSebhaToggle().toggle`: check overlay permission (opens the system page and waits for return, up to 30 s), ask for notification permission on Android 13+, then `initialize → configure → show → setCount` and set `isFloatingActive`.
2. 1.5 s later it reads native diagnostics. If the bubble view does not exist it shows a diagnostic alert (service, permission, bubble, last event, last error); otherwise «تم التفعيل».
3. `FloatingTasbeehController` is mounted once in `App.tsx` and runs `useFloatingSebhaSync`: restores the overlay on launch and when the app returns to the foreground, mirrors config, count and label to native, and turns native events into store actions.
4. Count merge (`reconcileCount`): native ahead → add the difference and log it; native 0 while the app has a count → reset the app (not trusted when stopping); app ahead or native unknown → push the app count to native.
5. Native side (patched library): tap counts and saves to SharedPreferences; the reset part of the view zeroes it; dragging onto the stop target removes the overlay; a reminder card with the current dhikr appears every `reminderInterval` minutes (minimum 1).

## Code map

| Layer | File | Role |
|---|---|---|
| Screen | `src/presentation/screens/TasbeehScreen.tsx` | Counter screen, tap handling, haptics |
| Components | `src/presentation/components/tasbeeh/TasbeehComponents.tsx` | `TasbeehCounter`, `TargetCarousel` |
| Components | `src/presentation/components/tasbeeh/SebhaSvg.tsx` | The 33-bead loop drawn with react-native-svg |
| Components | `src/presentation/components/tasbeeh/TasbeehModals.tsx` | `InputModal` and the three input dialogs |
| Components | `src/presentation/components/tasbeeh/TasbeehStyles.ts` | Styles (`mainCount` is the big number) |
| Components | `src/presentation/components/tasbeeh/FloatingTasbeeh.tsx` | Root controller and the settings toggle card |
| Components | `src/presentation/components/settings/SettingsComponents.tsx` | `FloatingTasbeehSettings` (size, colour, border, reset, interval) |
| Hook | `src/presentation/hooks/useFloatingSebha.ts` | Sync and toggle logic |
| Domain | `src/domain/services/FloatingSebha.ts` | Contract, config type, `reconcileCount` |
| Data | `src/data/services/NativeFloatingSebha.ts` | Guarded calls into the `RNFloatingBubble` native module |
| Data | `src/data/services/nativeModules.ts` | Typed accessors for the native modules |
| Data | `src/data/container.ts` | Wires `floatingSebha` into the dependencies |
| Store | `src/presentation/store/slices/tasbeehSlice.ts` | Counter and overlay state |
| Build | `plugins/withFloatingBubble.js` | Declares the overlay service in the manifest |
| Build | `patches/react-native-floating-bubble+1.0.12.patch` | The rewritten Android service, module and views |

## State and storage

Slice `tasbeeh` (persisted with redux-persist under key `root_v6` in AsyncStorage):

| Field | Default | Meaning |
|---|---|---|
| `count` | 0 | Current round; reset daily and on dhikr or target change |
| `totalCount` | 0 | Lifetime total shown in the header |
| `target`, `targets` | 33, `[33, 99, 100, 1000]` | Active target and the list |
| `selectedDhikr`, `dhikrList` | «سبحان الله», 7 phrases | Active phrase and the list |
| `lastResetDate` | today | Local `YYYY-MM-DD` |
| `floatingScale`, `floatingBubbleColor`, `floatingShowBorder`, `floatingShowReset`, `floatingReminderInterval` | 1.0, `#B8860B`, true, true, 10 | Overlay look and reminder minutes |
| `isFloatingActive` | false | Whether the overlay should be shown |

Every count is also written to `stats.dailyRecords[today].dhikrCount` and `dhikrDetails[phrase]`. On the native side the overlay keeps count, config, position and a "should show" flag in SharedPreferences `FloatingBubblePrefs`.

## Native, notifications and permissions

- Library: `react-native-floating-bubble` 1.0.12, heavily patched by `patches/react-native-floating-bubble+1.0.12.patch` (applied by `patch-package` on `postinstall`).
- `SYSTEM_ALERT_WINDOW` ("display over other apps") is declared in `app.json`. It is granted on a system settings page, not a dialog.
- The overlay runs in `com.reactlibrary.FloatingBubbleService`, a foreground service of type `specialUse`, `stopWithTask=false`, `START_STICKY`. It shows an ongoing notification «المسبحة العائمة تعمل» on its own channel, and schedules a restart when the task is swiped away.
- `POST_NOTIFICATIONS` is requested on Android 13+ before enabling; refusal only shows a warning.
- Events to JS: `floating-bubble-press`, `floating-bubble-reset`, `floating-bubble-remove` via `DeviceEventEmitter`.
- iOS and platforms without the module: `isAvailable` is false and the toggle shows an error alert.

## External services

None.

## Settings that affect it

| Setting | Where | Effect |
|---|---|---|
| `settings.tasbeehHaptics` (default on) | Screen header icon, Settings «المسبحة والعائمة» | Haptic on each tap, in the app and in the overlay |
| `settings.tasbeehTargetAlert` (default on) | Settings «المسبحة والعائمة» | Stronger vibration when the target is reached (in-app taps only) |
| Overlay size, colour, border, reset button, reminder interval | Settings «المسبحة والعائمة» | Sent to native while the overlay is active; the colour also tints the in-app beads |

## Edge cases and limitations

- The target alert does not fire for overlay taps or for manual adds.
- The daily reset of `count` only runs when the Tasbeeh screen mounts.
- `src/presentation/components/tasbeeh/TasbeehConstants.ts` exports `DEFAULT_TARGETS` and `DEFAULT_DHIKR` that nothing imports; the slice has its own copies.
- The vendored `react-native-floating-bubble-1.0.12.tgz` in the repo root is ignored by git (the tgz rule in `.gitignore`) and is not referenced by `package.json`, which resolves the package from the npm registry.
- If the overlay permission is revoked, the next launch sets `isFloatingActive` to false.

## Open issues

- #13 — Zero is displayed as a diamond (◆) in counters (the big count uses the display style, Tajawal ExtraBold, with Arabic-Indic digits)
