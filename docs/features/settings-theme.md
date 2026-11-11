# Settings and theme («الإعدادات»)

> Status: Shipped · A settings hub with five section pages, plus the light/dark palette and accent-colour system used by the whole app.

## What it does

The hub shows three summary tiles (adhan sound, notifications on/off, number of enabled reminders), one row per section with a one-line hint of its current state, and two links: «الخصوصية» and «عن أوّاب».

| Section id | Title | Controls |
|------------|-------|----------|
| `prayer` | «الصلاة والأذان» | Adhan sound (`AzanSelector`: silent / takbir / full), «مواقيت الصلاة حسب الموقع» switch, calculation method (`PrayerMethodSelector`), Asr method (`AsrMethodSelector`), adhan readiness checklist (`AzanReadinessCard`) |
| `alerts` | «التنبيهات والتذكيرات» | Link to «تذكيراتي» (`التذكيرات`), master notifications switch, eight category switches, wird time chips, encouragement interval chips (`NotificationSettings`) |
| `quran` | «المصحف والتفسير» | Tafsir book, tafsir display style, tafsir font size 12–32 (`TafsirSettings`), preferred reciter (`ReciterSelector`) |
| `tasbeeh` | «المسبحة والعائمة» | Haptic per count, target alert, floating sebha on/off, its scale (0.5–2.0), border, reset button, reminder interval (1–60 min) and colour |
| `look` | «المظهر» | Background mode «فاتح / داكن / حسب الموبايل» (`ThemeModeSelector`), accent colour «ذهبي / زمردي / ليلي» (`ThemeSelector`) |

## How the user reaches it

- Home → gear button in the sky header: 1 tap to the hub, 2 taps to a section.
- Also from the mushaf top bar (`QuranScreen.tsx`) and the tasbeeh screen (`TasbeehScreen.tsx`).
- Route: `الإعدادات`, optional param `{ section?: 'prayer' | 'alerts' | 'quran' | 'tasbeeh' | 'look' }`. A section page is the same screen pushed again with `StackActions.push('الإعدادات', { section })`.

## How it works

**Settings screen.** `SettingsScreen` renders the hub when `route.params.section` is absent and `SectionBody` otherwise. Every control dispatches a `settingsSlice` (or `tasbeehSlice`) action directly; there is no save button. Persisted objects are merged over defaults on read (`DEFAULT_AZAN_SETTINGS`, `DEFAULT_NOTIFICATION_PREFS`) so state saved by older versions keeps working. `AzanReadinessCard` lists what the adhan needs on this phone (notifications, exact alarms, full-screen intent, battery exemption, overlay, plus MIUI and other vendor rows), each with a button that opens the matching system page; it re-checks whenever the app returns to the foreground.

**Palettes.** `src/shared/theme/tokens.ts` holds a `dark` palette and a `light` palette that overrides most keys (mushaf paper colours are the same in both). `colors` is an object of getters: `colors.text` returns the value for the theme currently on screen. `night` is the dark palette regardless of theme, for art that keeps one look. `isLightTheme()` / `setLightTheme()` read and set the module-level flag.

**`themed()`.** Used in place of `StyleSheet.create`. It builds the style object once per theme, lazily, and exposes each key as a getter, so `st.card` is always the current theme's style. Styles are plain objects, not registered stylesheets.

**`ThemeRoot`.** `src/shared/theme/ThemeRoot.tsx` reads `settings.theme` and `useColorScheme()`, sets the light flag during render, calls `SystemUI.setBackgroundColorAsync(colors.bg)` (expo-system-ui) so the native root view matches during keyboard resizes and modal transitions, sets the status bar style, and wraps its children in a `React.Fragment` keyed `light` or `dark`. Changing the key remounts the whole navigation tree in the new colours. `AppNavigation` keeps the last navigation state in a module variable and passes it as `initialState`, so the user stays on the same screen after the remount.

**Accent.** `ACCENTS` has three entries, each with `accent`, `accentText`, `accentSoft`, `onAccent`, in a dark and a light variant:

| Key | Label | `accent` (dark / light) |
|-----|-------|-------------------------|
| `gold` | «ذهبي» | `#d4af37` / `#b8901f` |
| `emerald` | «زمردي» | `#2e8b6a` / `#2e8b6a` |
| `midnight` | «ليلي» | `#4f5bd5` / `#4f5bd5` |

`useAccent()` (`src/shared/theme/useAccent.ts`) reads `settings.accentTheme` and returns the entry, falling back to gold; `getAccent(key)` is the non-hook form. An accent change is an ordinary Redux update: components that call `useAccent()` re-render, nothing is remounted.

**Known gap: the accent is only partly applied.** Under `src/presentation` there are 234 direct `colors.gold*` reads in 57 files, against 25 `useAccent()` / `getAccent()` calls in 20 files (Grep, this branch). `colors.gold*` is always gold, so with «زمردي» or «ليلي» selected only the parts built on the UI primitives (`IconTile`, `Chip`, `PillButton`, `Progress`, `SectionTitle`, `StatNumber`), the tab bar and a few screens change colour. Heaviest direct users: `GuidanceBlocks.tsx` (19), `DailyMessageCard.tsx` (12), `WirdCard.tsx`, `ReminderEditor.tsx`, `TasbeehStyles.ts`, `QuranScreen.tsx` (11 each). The accent picker itself highlights the selected swatch with `colors.goldSoft`, and the navigation theme's `primary` is `colors.gold`. Because `themed()` styles are built per theme, not per accent, moving these to the accent means passing the colour inline or adding the accent to the style cache.

## Code map

| Layer | File | Role |
|-------|------|------|
| Screen | `src/presentation/screens/SettingsScreen.tsx` | Hub, `Summary`, `SectionBody`, section hints |
| Component | `src/presentation/components/settings/SettingsComponents.tsx` | `SettingSection`, `ItemRow`, `Stepper`, all selectors, `FloatingTasbeehSettings` |
| Component | `src/presentation/components/settings/AzanReadinessCard.tsx` | Adhan permission checklist |
| Constants | `src/presentation/components/settings/SettingsConstants.ts` | `TAFSIR_LIST`, `STYLES_LIST`, `THEME_LIST` |
| Constants | `src/presentation/components/settings/AzanConstants.ts` | `AZAN_TYPES` (and unused `MUEZZINS`) |
| Styles | `src/presentation/components/settings/SettingsStyles.ts` | Shared settings styles |
| Hook | `src/shared/hooks/useAzanPermissions.ts` | Readiness checks and fix actions |
| Store | `src/presentation/store/slices/settingsSlice.ts` | All settings fields and actions |
| Store | `src/presentation/store/slices/tasbeehSlice.ts` | Floating sebha options |
| Theme | `src/shared/theme/tokens.ts` | Palettes, `colors`, `themed`, `ACCENTS`, spacing, type, radius |
| Theme | `src/shared/theme/ThemeRoot.tsx` | Picks the palette, remounts the tree, native background |
| Theme | `src/shared/theme/useAccent.ts` | `useAccent`, `getAccent` |
| Theme | `src/shared/theme/constants.ts` | Re-exports for older imports |
| Domain | `src/domain/entities/notifications.ts` | `NotificationPrefs`, `AzanSettings` and their defaults |
| Navigation | `src/presentation/navigation/types.ts` | `SettingsSection` type |

## State and storage

All of `settings` is persisted (redux-persist, AsyncStorage key `persist:root_v6`).

| Field | Default | Changed in | Notes |
|-------|---------|------------|-------|
| `notificationsEnabled` | `true` | alerts | Off cancels every scheduled notification |
| `locationEnabled` | `true` | prayer | Stored only; nothing reads it (see Edge cases) |
| `theme` | `'dark'` | look | `'light' \| 'dark' \| 'system'` |
| `accentTheme` | `'gold'` | look | `'gold' \| 'emerald' \| 'midnight'` |
| `selectedTafsirId` | `91` (al-Sa'di) | quran, mushaf tafsir switcher | Others: 14, 15, 90, 16 |
| `tafsirStyle` | `'modern'` | quran | `'simple' \| 'book' \| 'modern'` |
| `tafsirFontSize` | `18` | quran | Steps of 2, 12–32 |
| `selectedReciterId` | `'alafasy'` | quran, audio | |
| `notificationPrefs` | `DEFAULT_NOTIFICATION_PREFS` | alerts | See next table |
| `calculationMethod` | `5` | nowhere | Legacy; unused, superseded by `prayerMethod` |
| `prayerMethod` | undefined, read as `'auto'` | prayer | `'auto'` or an Aladhan method id |
| `azanSettings.type` | `'full'` | prayer | `'none' \| 'takbir' \| 'full'` |
| `azanSettings.visualAzanEnabled` | `true` | nowhere | Read by `useNotifications`; no UI |
| `shareCardStyle` | `'gold'` | share style picker | `classic, gold, paper, night, mihrab` |
| `shareTextSize` | `'medium'` | share style picker | `small, medium, large` |
| `tasbeehHaptics` | `true` | tasbeeh | |
| `asrMethod` | `'auto'` | prayer | `'auto' \| 'shafii' \| 'hanafi'` |
| `tasbeehTargetAlert` | `true` | tasbeeh | |

`notificationPrefs`:

| Key | Default | UI |
|-----|---------|----|
| `prayers`, `athkar`, `qiyam`, `duha` | `true` | switch |
| `dailyWardEnabled` / `dailyWardTime` | `true` / `'05:00'` | switch / chips 01:00, 05:00, 10:00, 16:00, 21:00, 23:00 |
| `encouragementEnabled` / `encouragementInterval` | `true` / `3` h | switch / chips 1, 2, 3, 4, 6, 8 |
| `prePrayerReminderEnabled` / `prePrayerReminderOffset` | `true` / `10` min | switch / none (action exists, never dispatched) |
| `dailyReminder` | `true` | switch «تذكير يومي منوّع» |
| `ramadan` | `true` | none |

Floating sebha options live in `tasbeeh`: `floatingScale` 1.0, `floatingBubbleColor` `#B8860B`, `floatingShowBorder` true, `floatingShowReset` true, `floatingReminderInterval` 10.

The theme flag and the saved navigation state are module variables, not persisted; they are rebuilt from `settings.theme` at launch.

## Native, notifications and permissions

- Any change to `notificationPrefs`, `azanSettings`, `notificationsEnabled` or the reciter makes `useNotifications` cancel and reschedule everything.
- `AzanReadinessCard` calls the native `AzanModule` and `OemBatteryModule` to check and open: notification permission, exact alarms, full-screen intent, battery optimisation exemption, draw-over-apps, MIUI lock-screen switches. Android only; it renders nothing elsewhere.
- The floating sebha toggle needs the draw-over-apps permission.
- `ThemeRoot` sets the native root background through expo-system-ui and the status bar style through expo-status-bar.

## External services

None. Changing the calculation or Asr method triggers a new prayer-times request (see `prayer-times.md`).

## Settings that affect it

`theme` and `accentTheme` style the settings pages themselves. With `notificationsEnabled` off, the category switches are hidden. Wird time and encouragement interval chips appear only when their switch is on.

## Edge cases and limitations

- **Dead switch:** «مواقيت الصلاة حسب الموقع» toggles `locationEnabled`, which no other code reads. Location is requested regardless.
- **Dead switch:** «تذكير يومي منوّع» toggles `notificationPrefs.dailyReminder`; no scheduler in `src/data/notifications` reads it. `ramadan` is likewise unread.
- `AZAN_TYPES` offers three sound types only; the `MUEZZINS` list in `AzanConstants.ts` (four islamcan.com URLs) is not imported anywhere.
- The global overlays (adhan modal, reminder alarm, animated splash) are mounted outside `ThemeRoot`, so they are not remounted on a theme switch; they pick up new colours on their next render.
- `themed()` caches by light/dark only. A style that should follow the accent cannot live in it.
- A plain `StyleSheet.create` block that reads `colors.*` freezes the value at module load; only `themed()` styles and values read during render follow the theme.
- With `system` mode, the theme follows the phone setting live through `useColorScheme()`.
- Opening a section with an unknown `section` param would throw (`SECTIONS.find(...)!`); only the hub pushes it today.

## Open issues

- #6 — Theme: selected accent color is not applied across the whole app (the 234 direct `colors.gold*` reads above).
- #9 — UX: reminders are buried inside Settings. «تذكيراتي» is reached via Home → Settings → «التنبيهات والتذكيرات» → «تذكيراتي» (3 taps).
- #20 — UI polish found in the UX pass. Includes the hub summary tiles: `Summary` renders plain `View`s styled like cards, with no `onPress`.
