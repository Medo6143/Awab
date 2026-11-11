# Owwab feature docs

One document per feature of the Owwab app (Expo SDK 54, React Native 0.81, Android, Arabic UI, forced RTL). The code is the source of truth; each doc was written from the files it lists.

Screens live in `src/presentation/screens/` and routes are registered in `src/presentation/navigation/AppNavigation.tsx`. Tab routes use stable ids (`TabHome`, `TabPrayer`, `TabQuran`, `TabTasbeeh`, `TabAthkar`); stack routes keep Arabic names.

## Feature index

| Feature | Arabic label | Status | Doc | Entry screen | Open issues |
|---------|--------------|--------|-----|--------------|-------------|
| Home dashboard | «الرئيسية» | Shipped | [home.md](home.md) | `HomeScreen.tsx` · tab `TabHome` | #13, #17 (tab bar / navigation, tracked here), #6 (partly) |
| Prayer times | «الصلاة» | Shipped | [prayer-times.md](prayer-times.md) | `PrayerHubScreen.tsx` · tab `TabPrayer`; `PrayerTimesScreen.tsx` · route `الصلاة` | None |
| Adhan | «الأذان» | Shipped | [adhan.md](adhan.md) | No route: global `AzanVideoModal` mounted in `App.tsx`; settings in `SettingsScreen.tsx` section `prayer` | #11, #14 |
| Qibla | «القبلة» | Shipped | [qibla.md](qibla.md) | `QiblaScreen.tsx` · route `القبلة` | None |
| Nearest mosque | «المساجد» | In progress (only on branch `feat/nearest-mosque`) | [nearest-mosque.md](nearest-mosque.md) | `MosquesScreen.tsx` · route `المساجد` | None |
| Mushaf | «القرآن» | Shipped | [mushaf.md](mushaf.md) | `QuranScreen.tsx` · tab `TabQuran` | #7, #8, #16 |
| Quran audio | Not verified (inside the mushaf) | Shipped | [quran-audio.md](quran-audio.md) | `QuranScreen.tsx` · tab `TabQuran` (no screen of its own) | #5, #10, #15 |
| Tasmee (recital check) | «التسميع» | Shipped | [tasmee.md](tasmee.md) | `TasmeeScreen.tsx` · route `التسميع` | None |
| Khatmat and heart journey | «نور القلب» · «الختمات» | Shipped | [khatmat-heart-journey.md](khatmat-heart-journey.md) | `HeartJourneyScreen.tsx` · route `نور_القلب`; `KhatmatScreen.tsx` · route `الختمات` | #19 |
| Tasbeeh | «المسبحة» | Shipped | [tasbeeh.md](tasbeeh.md) | `TasbeehScreen.tsx` · tab `TabTasbeeh` | #13 |
| Athkar | «الأذكار» | Shipped | [athkar.md](athkar.md) | `AthkarScreen.tsx` · tab `TabAthkar` and route `الأذكار` | None |
| Duas and virtues | «الأدعية» · «الفضائل» | Shipped | [duas-virtues.md](duas-virtues.md) | `DuaScreen.tsx` · route `الأدعية`; `VirtuesScreen.tsx` · route `الفضائل` | None |
| Hadith library | «الأحاديث» | Shipped | [hadith.md](hadith.md) | `HadithLibraryScreen.tsx` · route `الأحاديث`; `HadithDetailScreen.tsx` · route `الحديث` | None |
| Quran messages | «رسائل القرآن» | Shipped | [quran-messages.md](quran-messages.md) | `QuranMessagesScreen.tsx` · route `رسائل_القرآن` | None |
| Ibada to-do | «العبادات» | Shipped | [ibada-todo.md](ibada-todo.md) | `IbadaTodoScreen.tsx` · route `العبادات` | None |
| Reminders | «تذكيراتي» | Shipped | [reminders.md](reminders.md) | `RemindersScreen.tsx` · route `التذكيرات` | #9, #12, #18 |
| Notifications | «التنبيهات» | Shipped | [notifications.md](notifications.md) | No route: `SettingsScreen.tsx` section `alerts`; scheduling in `src/data/notifications/` | None |
| Zakat | «الزكاة» | Shipped | [zakat.md](zakat.md) | `ZakatScreen.tsx` · route `الزكاة` | None |
| Stats | «الإحصائيات» | Shipped | [stats.md](stats.md) | `StatsScreen.tsx` · route `الإحصائيات` | None |
| Settings and theme | «الإعدادات» · «المظهر» | Shipped | [settings-theme.md](settings-theme.md) | `SettingsScreen.tsx` · route `الإعدادات` (param `section`) | #6, #20 |
| Home-screen widget | Not verified (no in-app label) | Shipped | [widget.md](widget.md) | No route: `native/android/java/widget/PrayerWidgetProvider.kt` | None |
| Share cards | Not verified | Shipped | [share-cards.md](share-cards.md) | No route: `src/presentation/components/share/ImageShareModal.tsx` | None |
| About, privacy and splash | «عن أوّاب» · «الخصوصية» | Shipped | [about-privacy-splash.md](about-privacy-splash.md) | `AboutScreen.tsx` · route `عن_التطبيق`; `PrivacyScreen.tsx` · route `الخصوصية`; `AnimatedSplash` in `App.tsx` | None |

Notes:

- Statuses other than nearest-mosque are "Shipped" because the screen and route exist in `AppNavigation.tsx` on this branch; individual docs may refine this.
- #17 (bottom tabs change position depending on the active tab) is a navigation issue in `src/presentation/navigation/GlassTabBar.tsx`, not a Home bug. It is listed on the Home row because there is no navigation doc.
- #13 (zero shown as ◆) is listed on both Tasbeeh and Home because both render the counter.
- #6 (accent colour) is owned by Settings and theme; Home is one of the affected screens.
- Docs other than `home.md`, `settings-theme.md` and `about-privacy-splash.md` are written separately; a link may be dead until its file lands.

## Open issues by number

| Issue | Title | Feature doc |
|-------|-------|-------------|
| #5 | Mushaf: stop button does not work after playing an ayah or a page | quran-audio |
| #6 | Theme: selected accent color is not applied across the whole app | settings-theme (home affected) |
| #7 | Mushaf: font size control | mushaf |
| #8 | Mushaf: multiple page designs to choose from | mushaf |
| #9 | UX: reminders are buried inside Settings | reminders (settings-theme affected) |
| #10 | UX: recitations are only reachable from inside the mushaf | quran-audio |
| #11 | Adhan and reminder sounds are too quiet | adhan |
| #12 | Qiyam al-layl sound is cut off before it finishes | reminders |
| #13 | Zero is displayed as a diamond (◆) in counters | tasbeeh, home |
| #14 | Adhan notification covers the full-screen adhan | adhan |
| #15 | Full-surah recitation stays on the loading spinner (needs check on a real phone) | quran-audio |
| #16 | Mushaf top bar: six unlabeled icons, and ayah playback is not discoverable | mushaf |
| #17 | Bottom tabs change position depending on the active tab | home (navigation) |
| #18 | Qiyam al-layl is configured in two different places | reminders |
| #19 | Khatmat is only reachable from Heart Journey, not from the mushaf | khatmat-heart-journey |
| #20 | UI polish found in the UX pass | settings-theme |

## Feature doc template

Every feature doc uses the same structure: an H1 `# <Feature name> (<Arabic UI label>)`, a one-line blockquote `> Status: Shipped · one-sentence summary`, then these H2 headings in this order:

1. `## What it does`
2. `## How the user reaches it` — path and number of taps from launch; route name
3. `## How it works`
4. `## Code map` — table: Layer | File | Role
5. `## State and storage` — Redux slice fields, AsyncStorage keys, what is persisted
6. `## Native, notifications and permissions`
7. `## External services` — host, what is sent, what comes back; "None" if none
8. `## Settings that affect it`
9. `## Edge cases and limitations`
10. `## Open issues` — GitHub issue numbers as "#N — title"; "None" if none

Rules: 60–150 lines, plain prose, tables where they help, no emojis. Every path in backticks must exist on disk and be repo-relative with forward slashes. Anything that cannot be confirmed from code is written as "Not verified".
