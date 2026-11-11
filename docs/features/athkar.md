# Morning and evening athkar («الأذكار»)

> Status: Shipped · Two tap-to-count lists of daily athkar (morning and evening) with per-item repetition targets that reset every day.

## What it does

- Shows the morning or the evening list under a sky header (dawn or dusk) with "done X of Y" and a progress bar.
- Each card is one dhikr with its text, its reward note or repetition count, and a ring counter. Tapping counts one repetition.
- Finished items collapse to a single quiet line; the first unfinished item is highlighted as «الذكر الحالي».
- A banner at the end of the list opens the virtues page «فضل الذكر».

## How the user reaches it

| Path from launch | Taps |
|---|---|
| Bottom tab «الأذكار» (route `TabAthkar`) | 1 |
| Home, day stats tile «أذكار الصباح» / «أذكار المساء» (navigates to `TabAthkar`) | 1 |

The same screen is also registered as the stack route `الأذكار` in `src/presentation/navigation/AppNavigation.tsx`. Both routes accept `{ type: 'morning' | 'evening' }`. No code in `src/` currently navigates to the stack route or passes `type`.

## How it works

1. Initial list: `route.params.type` if given, otherwise morning before 15:00 local time and evening from 15:00. Home uses the same split.
2. On mount the screen dispatches `syncDailyReset`: if the calendar day changed since `lastResetDate`, all counts are cleared.
3. A tap on an unfinished card:
   - light haptic;
   - `incrementAthkarCount({ id, target })` (never goes above the target);
   - `logDhikr({ name: item.text, count: 1 })` into today's stats;
   - success haptic when the item reaches its target.
4. Header numbers: `doneItems` is the number of items at their target; the bar is completed repetitions divided by all repetitions in the list.
5. The sky button with the moon or sun switches list; the reset button clears all counts (both lists); a back button appears only on the stack route.
6. When every item is done, an empty-state card says the list is complete.

Content (from `src/shared/constants/athkar.ts`):

| List | Items | Total repetitions |
|---|---|---|
| Morning (`MORNING_ATHKAR`) | 30 | 376 |
| Evening (`EVENING_ATHKAR`) | 30 | 373 |

Four items are shared by both lists with the same ids: Ayat al-Kursi (`q_kursi`, once) and al-Ikhlas, al-Falaq, an-Nas (`q_ikhlas`, `q_falaq`, `q_nas`, three times each). Per-item targets are 1, 3, 4, 7, 10 or 100.

## Code map

| Layer | File | Role |
|---|---|---|
| Screen | `src/presentation/screens/AthkarScreen.tsx` | List, tab choice, tap handling |
| Components | `src/presentation/components/athkar/AthkarComponents.tsx` | `AthkarSky`, `AthkarCard`, the count ring |
| Components | `src/presentation/components/home/SkyHero.tsx` | `SkyBackdrop` and `SkyButton` reused for the header |
| Components | `src/presentation/components/guidance/GuidanceBlocks.tsx` | `VirtueBanner` to the virtues page |
| Content | `src/shared/constants/athkar.ts` | `AthkarItem` type and both lists |
| Store | `src/presentation/store/slices/athkarSlice.ts` | Counts and daily reset |
| Store | `src/presentation/store/slices/statsSlice.ts` | `logDhikr` |
| Notifications | `src/data/notifications/ReminderSchedulers.ts` | `AthkarScheduler` |
| Notifications | `src/data/notifications/expo.ts` | `scheduleDaily` helper |
| Home | `src/presentation/screens/HomeScreen.tsx` | Day stats tile "athkar done" |

## State and storage

Slice `athkar` (persisted via redux-persist, key `root_v6`, AsyncStorage):

| Field | Type | Meaning |
|---|---|---|
| `completionCounts` | `Record<string, number>` | Item id → repetitions done today |
| `lastResetDate` | ISO string or null | Last time counts were cleared |

Each tap also adds to `stats.dailyRecords[today].dhikrCount` and to `dhikrDetails` keyed by the full dhikr text.

## Native, notifications and permissions

- `AthkarScheduler` schedules two daily local notifications through expo-notifications when `notificationPrefs.athkar` is on:

| Id | Time | Channel | Title |
|---|---|---|---|
| `athkar-morning` | 07:00 | `default` | «أذكار الصباح» |
| `athkar-evening` | 17:00 | `default` | «أذكار المساء» |

- The times are fixed in code; they do not follow prayer times and cannot be changed by the user.
- Tapping the notification does not deep-link to the athkar screen. The notification response handler in `src/presentation/hooks/useNotifications.ts` only handles prayer notifications.
- Requires `POST_NOTIFICATIONS` on Android 13+. No native module of the app's own is involved.

## External services

None. All texts are bundled.

## Settings that affect it

| Setting | Where | Effect |
|---|---|---|
| `settings.notificationPrefs.athkar` (default on) | Settings → «التنبيهات والتذكيرات» → «أذكار الصباح والمساء» | Turns the two daily reminders on or off |

There is no setting for the haptics on this screen; they are always on.

## Edge cases and limitations

- The four shared items use the same ids in both lists, so counting Ayat al-Kursi in the morning also shows it done in the evening list until the next daily reset.
- The reset button clears both lists, not only the visible one.
- The daily reset only runs when the Athkar screen mounts. Home reads `completionCounts` directly, so before the screen is opened on a new day, the home tile can still show yesterday's progress.
- The notification time (17:00) and the in-app switch to the evening list (15:00) are different numbers.
- Home subtracts athkar taps from its «المسبحة اليوم» number by matching `dhikrDetails` keys against the athkar texts; the Stats screen does not, so athkar taps are included in its tasbeeh totals.
- The Hijri date in the header comes from the cached prayer data; it is empty until prayer times were loaded once.

## Open issues

- #13 — Zero is displayed as a diamond (◆) in counters (the home «أذكار» tile shows «◆/٣٠»; the Athkar screen itself was not listed in the issue)
