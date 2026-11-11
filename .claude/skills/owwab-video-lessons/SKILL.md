---
name: owwab-video-lessons
description: "What the أوّاب (Owwab) TikTok videos taught us, with the real numbers. Use before writing any hook, script or caption for an Owwab video, and when checking a finished cut against the analytics. Covers who actually watches (Egyptian women 18–34, 99% non-followers), why every past video lost viewers at second 2, the five mistakes to never repeat, the checklist a new video must pass, and how to pull a video's numbers from TikTok Studio to compare. Pattern-based: it raises the odds, it does not promise virality."
---

# Owwab video lessons

The account posted 12 Owwab videos on 29–30 Oct 2026. The best reached 567 views, the
worst 16. None went anywhere. The numbers below are from TikTok Studio, not guesses.

## 1. Who watches (from the three top videos)

| | Alarm (20 s) | Grandpa & Nour (1:45) | Heart (22 s) |
|---|---|---|---|
| Views | 567 | 534 | 444 |
| Average watch | 2.85 s | 4.69 s | 3.47 s |
| Watched to the end | 2.4% | 0.3% | 1.6% |
| Where most left | 0:02 | 0:02 | 0:02 |
| Egypt | 76% | 91% | 96% |
| Age 18–24 / 25–34 | 52% / 35% | 52% / 34% | 55% / 33% |
| Female | 52% | 65% | 77% |
| Non-followers | 99% | 99% | 96% |
| From For You / search | 71% / 27% | 92% / 4% | 94% / 1% |

What this means:
- The viewer is a young Egyptian woman scrolling For You. Write in Egyptian Arabic, to her.
- TikTok did show the videos to strangers. The account is not shadow-limited: viewers
  swiped at second 2. The hook is the whole problem.
- Search is real demand. Queries that reached the videos: «منبه لصلاة الفجر»,
  «كيف احط صوت منبه لصلاة الفجر», «تطبيق لقيام الليل», «تطبيق ختم القرآن»,
  «برنامج للتسبيح والاذكار يظهروا على الشاشة باستمرار», «تطبيق مسبحه»,
  «شاشة الاذان». Put these words in the caption, on screen and in the spoken line.
- The account's older videos are about programming (React, frontend), so TikTok has
  no clear idea who the Owwab videos are for. A renamed channel with one topic helps.

## 2. The five mistakes (never again)

1. **Frame 1 looked like an ad.** 10 of 11 videos opened on cartoon mascots under a big
   yellow headline, or on the app UI inside a phone frame, or on a black frame. Viewers
   recognise an ad in one second and swipe. The only native-looking opener (real hands,
   a lamp, a room) was `pov_fajr`.
2. **Every video was a feature tour.** Grandpa & Nour listed 8 features in 1:45; nothing
   escalated, so there was no moment to wait for. One idea, one payoff per video.
3. **Same TTS voices, same cartoon set, same end card** in 8–9 videos. It reads as
   templated, and TikTok shows templated repeats to fewer people. Quran must be a real
   reciter's voice, never TTS. Hadith or «ربنا يكرمك» in a machine voice sounds hollow.
4. **Asset slips.** Instagram Reels UI inside a TikTok video, the same café stock shot in
   two videos, one file at 720p, frame 0 black (so the default cover was black), a URL end
   card nobody can tap.
5. **Posting pattern.** 12 videos in 36 hours, four at once. The later ones got 16–52
   views because the early test audiences were split. One video a day; A/B only the
   first 3 seconds, on different days.

## 3. The checklist a new video must pass before export

- [ ] Frame 0 is mid-action and story-like: a person, a hand, a screen already doing
      something. No title card, no logo, no black frame, no mascot standing still.
- [ ] One idea and one payoff. Say the payoff in one sentence; if you need «and», cut.
- [ ] The viewer is addressed in Egyptian Arabic, as a young woman scrolling at night.
- [ ] 15–40 s. A twist or reveal between 40% and 60% of the length.
- [ ] Quran audio is a real reciter. No mistakes staged on purpose in an ayah.
- [ ] Any AI voice or AI character is labelled as AI-generated at upload.
- [ ] No religious engagement bait («اكتب آمين», «شير وخد ثواب»), no claims the app
      checks tajweed, no competitor named, nobody presented as a sheikh.
- [ ] Last frame ≈ first frame so it loops. No end card, no URL on screen. App name and
      link live in the caption and pinned comment only.
- [ ] One CTA: send or save. Not «تابعنا».
- [ ] 1080×1920, H.264, yuv420p, 30 fps, custom cover chosen, no third-party UI.
- [ ] Caption: first line = hook + a search phrase from §1; 4–5 niche hashtags; no #fyp.
- [ ] Posted alone that day, 8–11 pm Egypt time.

## 4. How to read the numbers after posting (24 h and 72 h)

Open TikTok Studio in Claude in Chrome (the user signs in; never in the in-app browser,
it is a separate profile):

1. `https://www.tiktok.com/tiktokstudio/content` lists posts with views/likes/comments.
2. `https://www.tiktok.com/tiktokstudio/analytics/<videoId>` gives average watch time,
   watched-full %, the retention drop point («Most viewers stopped watching at 0:0X»),
   traffic source and search queries. `get_page_text` after a 4 s wait returns it all.
3. `…/analytics/<videoId>/viewers` gives age, gender, country, follower share.

Judge against the past, not against hopes:

| Signal | Past videos | "The hook worked" | "TikTok will widen it" |
|---|---|---|---|
| Average watch | 3–5 s | ≥ 8 s | ≥ 12 s |
| Watched full | 1–2% | ≥ 10% | ≥ 20% |
| Drop point | 0:02 | ≥ 0:05 | past the twist |
| Sends + saves per 100 views | ~0 | ≥ 1 | ≥ 3 |

Compare two hooks only on the same body posted on different days. Keep the opener that
holds more viewers at 3 s, then iterate the body.

## 5. Assets and tools that exist

- Pixar-style art of نور and جدّو: `videos/ad2/scenes/*.png` (mouth coordinates in
  `videos/ad2/scenes.json`). Any new character must match this style.
- App screen recordings: `videos/ad2/clips/`, `landing/media/*.mp4`.
- Renderer: the `viral-ad-video` skill (`rigscenes.js`, `scenes.js`, `montage.js`,
  edge-tts voices `ar-EG-ShakirNeural` / `ar-EG-SalmaNeural`).
- Motion graphics in code: the `vox-explainer`, `launch-video`, `motion-effects`,
  `animated-chart`, `milestone-reveal` and `reel-export` skills.
- The phone blocks `adb input`; screen recordings need the user to tap. `adb` is at
  `D:/Android/Sdk/platform-tools/adb.exe`.
