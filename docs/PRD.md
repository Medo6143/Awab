# Owwab (أوّاب) — product requirements

| | |
|---|---|
| Product | Owwab, an Arabic companion app for daily worship |
| Platform | Android (APK from `owwab.vercel.app`; not on Google Play) |
| Version described | 1.0.0, `master` (including nearest mosque, merged in #21) |
| Last updated | November 2026 |
| Related | [Architecture](ARCHITECTURE.md) · [Structure](STRUCTURE.md) · [Features](features/README.md) |

## 1. Summary

Owwab puts a Muslim's daily worship in one app: prayer times and an adhan that really wakes the phone, the mushaf with tafsir and recitation, memorisation checking by voice, athkar, tasbeeh, duas, hadith, and reminders the user builds for their own habits.

It is free, has no ads and no account, and keeps the user's data on the phone.

## 2. Problem

- Prayer and Quran apps are usually several apps, most with ads or subscriptions, and many ask for an account.
- On many Android phones (Xiaomi, Oppo, Huawei and similar) the adhan and alarms from such apps are killed by battery savers, so they do not fire when the phone is asleep.
- A normal alarm for Fajr or qiyam is dismissed with one tap and the user goes back to sleep.
- Checking memorisation needs another person.

## 3. Audience

From the TikTok account's analytics, which is the only audience data the product has:

- 76–96% in Egypt, so the interface and tone are Egyptian Arabic.
- Mostly 18–34, mostly women.
- 99% of viewers are not followers: people meet the app cold, with no context.

Primary user: an Arabic-speaking adult who prays and wants help being consistent, on a mid-range Android phone with an aggressive battery saver.

## 4. Principles

1. **Free, no ads, no account.** Nothing is locked.
2. **Data stays on the phone.** No analytics or tracking. The network is used only to fetch content (Quran pages, tafsir, hadith details, prayer times, recitation audio).
3. **Real recitation only.** Quran and adhan audio are recordings of real reciters, never synthetic voices.
4. **The app does not judge.** Voice checking follows the words; it does not grade tajweed and does not replace a teacher.
5. **Works when the phone is asleep.** Adhan and alarms must fire with the screen locked and the app closed.
6. **Arabic first.** Right-to-left throughout, Egyptian Arabic copy, Arabic-Indic digits.
7. **One calm look.** Dark and light modes, one accent colour, no clutter.

## 5. Features and status

| Area | Feature | Status | Doc |
|---|---|---|---|
| Home | Dashboard, daily wird, day stats, daily report | Shipped | [home](features/home.md) |
| Prayer | Prayer times, calculation methods | Shipped | [prayer-times](features/prayer-times.md) |
| Prayer | Adhan over the lock screen | Shipped | [adhan](features/adhan.md) |
| Prayer | Qibla | Shipped | [qibla](features/qibla.md) |
| Prayer | Home-screen widget | Shipped | [widget](features/widget.md) |
| Prayer | Nearest mosque | Shipped, data source open | [nearest-mosque](features/nearest-mosque.md) |
| Quran | Mushaf: pages, index, search, bookmarks, tafsir | Shipped | [mushaf](features/mushaf.md) |
| Quran | Recitation audio: ayah, page, full surah | Shipped, with known bugs | [quran-audio](features/quran-audio.md) |
| Quran | Tasmee (voice memorisation check) | Shipped | [tasmee](features/tasmee.md) |
| Quran | Khatmat and Heart Journey | Shipped | [khatmat-heart-journey](features/khatmat-heart-journey.md) |
| Quran | Quran messages and the daily message | Shipped | [quran-messages](features/quran-messages.md) |
| Dhikr | Tasbeeh and the floating tasbeeh | Shipped | [tasbeeh](features/tasbeeh.md) |
| Dhikr | Athkar | Shipped | [athkar](features/athkar.md) |
| Dhikr | Duas and virtues | Shipped | [duas-virtues](features/duas-virtues.md) |
| Knowledge | Hadith library | Shipped | [hadith](features/hadith.md) |
| Habits | Ibada checklist | Shipped | [ibada-todo](features/ibada-todo.md) |
| Habits | Custom reminders and alarms | Shipped, with known bugs | [reminders](features/reminders.md) |
| Habits | Notification categories | Shipped | [notifications](features/notifications.md) |
| Habits | Stats | Shipped | [stats](features/stats.md) |
| Tools | Zakat calculator | Shipped | [zakat](features/zakat.md) |
| App | Settings, theme mode, accent colour | Shipped, with known bugs | [settings-theme](features/settings-theme.md) |
| App | Share cards | Shipped | [share-cards](features/share-cards.md) |
| App | Splash, about, privacy | Shipped | [about-privacy-splash](features/about-privacy-splash.md) |
| Quran | Mushaf font size control | Planned (#7) | — |
| Quran | Choice of mushaf page designs | Planned (#8) | — |

## 6. Requirements

Each requirement has an id so issues and commits can refer to it. "Met" describes the code today.

### Prayer and adhan

| Id | Requirement | Acceptance | Met |
|---|---|---|---|
| PR-1 | The user sees today's five prayer times for their location and the time left to the next prayer. | Times match the chosen calculation method; the countdown updates. | Yes |
| PR-2 | The user can choose the calculation method and the Asr method. | Changing either recalculates the times and reschedules the adhan. | Yes |
| PR-3 | The adhan sounds at the prayer's minute with the screen locked, the app closed, and after a reboot. | Fires within the minute on a phone left idle overnight; survives reboot. | Yes |
| PR-4 | The adhan is loud enough to be heard like a phone alarm. | Audible from another room at normal alarm volume. | **No** (#11) |
| PR-5 | The adhan screen shows the prayer name and one clear way to stop it. | Nothing covers the screen; one stop control. | **No** (#14) |
| PR-6 | The app tells the user which permissions are missing for the adhan to work, and opens the right system screen. | Readiness card shows every missing permission. | Yes |
| PR-7 | The user sees the qibla direction. | Arrow follows the phone's heading. | Yes |
| PR-8 | The user can find the nearest mosque and get walking directions. | Lists real nearby mosques, including small ones. | **No**: on `master`, but the Nominatim fallback misses small and unnamed mosques until the data source is settled (#22) |

### Quran

| Id | Requirement | Acceptance | Met |
|---|---|---|---|
| QU-1 | The user reads the mushaf page by page and returns to where they stopped. | Last page is restored on reopening. | Yes |
| QU-2 | The user can jump by surah, juz or a searched ayah, and keep bookmarks. | All four reach the right page. | Yes |
| QU-3 | The user can read the tafsir of an ayah and choose the tafsir source and text size. | Tafsir opens from the ayah. | Yes |
| QU-4 | The user can play an ayah or the current page, and stop it at any moment. | One control starts and stops; its state matches the audio. | **No** (#5) |
| QU-5 | The user can listen to a full surah by the reciter they chose, with controls on the lock screen. | Starts within a few seconds; controls work. | Not verified (#15) |
| QU-6 | Listening is reachable without entering the mushaf index. | An entry outside the mushaf. | **No** (#10) |
| QU-7 | The user can change the size of the mushaf text. | Size persists; no clipping. | **No** (#7) |
| QU-8 | The user can pick the look of the mushaf page. | Choice persists in light and dark. | **No** (#8) |
| QU-9 | The user recites from memory and the app follows along, marking wrong words. | Works offline after the model is downloaded; audio never leaves the phone. | Yes |
| QU-10 | Mushaf actions are understandable without guessing. | Labelled or self-explanatory controls; ayah actions visible. | **No** (#16) |

### Dhikr and content

| Id | Requirement | Acceptance | Met |
|---|---|---|---|
| DH-1 | The user counts tasbeeh with a target, and the count is kept. | Count survives closing the app. | Yes |
| DH-2 | The user can count from a floating bubble over other apps. | Bubble appears after the overlay permission is granted. | Yes |
| DH-3 | The user goes through morning and evening athkar with a count per dhikr. | Progress resets each day. | Yes |
| DH-4 | Counters show numbers clearly, including zero. | Zero reads as a digit. | **No** (#13) |
| DH-5 | The user browses duas, hadith and Quran messages, saves favourites, and shares them as images. | Share produces an image. | Yes |

### Habits and reminders

| Id | Requirement | Acceptance | Met |
|---|---|---|---|
| HB-1 | The user creates a reminder for any act of worship: at a clock time or relative to a prayer, on chosen days, as a notification or a full-screen alarm. | Fires as configured. | Yes |
| HB-2 | An alarm-style reminder cannot be dismissed with one tap: the user slides to confirm, and can snooze. | Slide to stop; snooze 5, 10 or 15 minutes. | Yes |
| HB-3 | Reminder sounds are loud and play in full. | Not cut off; alarm-level volume. | **No** (#11, #12) |
| HB-4 | Reminders are easy to find. | Reachable in at most two taps from launch. | **No** (#9) |
| HB-5 | Each kind of reminder is configured in one place. | No duplicate settings. | **No** (#18) |
| HB-6 | The user ticks off daily acts of worship and sees their history. | Checklist and stats agree. | Yes |

### App

| Id | Requirement | Acceptance | Met |
|---|---|---|---|
| AP-1 | The user chooses light, dark or follow-the-phone, applied at once. | No restart. | Yes |
| AP-2 | The user chooses an accent colour and the whole app follows it. | No screen keeps the old colour. | **No** (#6) |
| AP-3 | Main navigation is predictable. | Tabs keep their positions and are labelled. | **No** (#17) |
| AP-4 | The app explains what it stores and what it sends. | Privacy screen matches the code. | **No** (see section 9) |
| AP-5 | Every switch in settings does something. | No dead settings. | **No** (see section 9) |

## 7. Non-functional requirements

| Area | Requirement |
|---|---|
| Reliability | Adhan and alarm-style reminders fire in Doze, with the app killed, and after reboot, on phones with aggressive battery savers. |
| Offline | Mushaf text search, athkar, duas, tasbeeh, hadith index, Quran messages and tasmee (after the model download) work without a network. Prayer times, tafsir, hadith details and recitation audio need one. |
| Privacy | No account, no analytics, no ads SDK. Microphone audio is processed on the device. Location is used for prayer times, qibla and mosques. |
| Language and layout | Arabic, forced right-to-left, Arabic-Indic digits. |
| Appearance | Light and dark modes; text stays readable in both. |
| Size | The APK is about 76 MB (arm64). Growth should be justified. |
| Compatibility | Android phones, arm64. Minimum Android version: not verified. |
| Quality gate | `npx tsc --noEmit -p .` passes. There are no automated tests yet. |

## 8. Known problems and roadmap

Order of work, most harmful first.

| Order | Issue | What | Why here |
|---|---|---|---|
| 1 | #5 | Stop button does not work after playing an ayah or page | Blocks a core action; cause is known |
| 2 | #11, #12 | Adhan and reminder sounds too quiet; qiyam sound cut off | The adhan and alarm are the heart of the app |
| 3 | #14 | Notification covers the full-screen adhan | Same area as 2 |
| 4 | #15 | Full-surah recitation stuck loading | Needs checking on a real phone first |
| 5 | #6 | Accent colour not applied everywhere | Visible inconsistency |
| 6 | #9, #10, #17, #18, #19 | Reminders and recitations hard to find; tabs shift; qiyam in two places; khatmat hidden | One navigation rework |
| 7 | #13, #16, #20 | Zero shown as a diamond; unlabeled mushaf bar; small polish | Low risk |
| 8 | #7 | Mushaf font size | New feature |
| 9 | #8 | Mushaf page designs | New feature, builds on #7 |
| — | — | Nearest mosque | Waiting for a data-source decision (see below) |

## 9. Findings without an issue yet

Found while reading the code for these docs. Each is described in the linked feature doc with file and line. None has been verified on a device unless stated.

| Area | Finding | Doc |
|---|---|---|
| Privacy | The privacy screen does not mention the microphone, the 157 MB speech-model download from GitHub, or `audio.qurancdn.com`. With nearest mosque it would also be wrong about where location goes. | [about-privacy-splash](features/about-privacy-splash.md) |
| Settings | Three switches do nothing: «مواقيت الصلاة حسب الموقع», «تذكير يومي منوّع», and the unused `calculationMethod` field. | [settings-theme](features/settings-theme.md) |
| Adhan | The "takbir only" adhan type is not implemented: the full adhan always plays. | [adhan](features/adhan.md) |
| Adhan | A launch within 3 minutes of a prayer can start a second, in-app adhan while the native one is playing. | [adhan](features/adhan.md) |
| Notifications | Encouragement messages collide: at the default 3-hour spacing two of the ten repeat, and at 6 or 8 hours several fire in the same minute. | [notifications](features/notifications.md) |
| Reminders | Every app launch reschedules alarms and cancels pending snoozes. | [reminders](features/reminders.md) |
| Prayer times | The cache key ignores location, so a same-day change of city keeps the old times. | [prayer-times](features/prayer-times.md) |
| Qibla | A phone without a compass stays on the "calibrate" message forever. | [qibla](features/qibla.md) |
| Zakat | The gold price is a hard-coded placeholder (3500 EGP per gram), and Arabic-Indic digits in the input count as zero. | [zakat](features/zakat.md) |
| Home | "Pages read" counts pages opened, so flipping pages completes the wird; the "daily" message is random on every open. | [home](features/home.md) |
| Athkar | Four items share ids between the morning and evening lists, so counting one marks the other; the daily reset only runs when the athkar screen opens. | [athkar](features/athkar.md) |
| Tasmee | Revealing an ayah without reciting it counts as correct; a debug log writes every transcript to logcat. | [tasmee](features/tasmee.md) |
| Heart Journey | Old tasmee marks survive a finished or reset hifz round. | [khatmat-heart-journey](features/khatmat-heart-journey.md) |
| Stats | "Last 30 days" sums the last 30 records, not 30 calendar days; the month report can never reach its top feedback. | [stats](features/stats.md) |
| Mushaf | Saved ayat have no list (only saved pages are shown); pages are not cached, so reading needs a network. | [mushaf](features/mushaf.md) |
| Startup | The app waits for the audio player to set up with no timeout; if it hangs, the app stays on the splash. | [about-privacy-splash](features/about-privacy-splash.md) |

## 10. Open questions

1. **Nearest mosque data source.** OpenStreetMap (Overpass) is refused from the user's network and from Vercel, and Nominatim only returns named mosques. Options: Google Places (needs an API key and a billing card), or just open Google Maps with a "mosque" search.
2. **Adhan recording rights.** The bundled adhan comes from islamcan.com and its licence is unknown. TikTok removed the sound of a video that used it.
3. **Google Play.** The app is distributed as an APK only. Play would require a privacy policy URL, a declaration for exact alarms and full-screen intents, and review of the overlay and microphone permissions.
4. **iOS.** Out of scope; the adhan and alarm design depends on Android features.
5. **Tests.** No automated tests exist. Which parts to cover first (prayer scheduling, recitation matching) is undecided.

## 11. Out of scope

- Accounts, sync between devices, cloud backup.
- Social features, leaderboards, community content.
- Ads, subscriptions, in-app purchases.
- Grading tajweed or presenting the app as a teacher or a religious authority.
- Languages other than Arabic.

## 12. Success metrics (proposed)

The app has no analytics, by principle, so none of these is measured today. They are proposals for what could be counted without tracking users.

| Metric | Source that respects the principles |
|---|---|
| APK downloads per week | Vercel request logs for `owwab.apk` |
| Visits to the landing page from TikTok | Vercel analytics, aggregate only |
| Reported adhan or alarm failures | GitHub issues and TikTok comments |
| Open bugs older than 30 days | GitHub issues |
| Crash-free launches | Not measurable without a crash reporter; decide whether an opt-in one is acceptable |
