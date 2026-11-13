# Share cards («مشاركة كصورة»)

> Status: Shipped · Ayahs, duas, hadiths and the heart progress can be rendered as a 1080×1920 story image, then shared through the system sheet or saved to the gallery. An ayah can also be shared as an MP4 with the chosen reciter's recitation («فيديو»).

## What it does

- Opens a full-screen preview of a 9:16 card with the app's logo and name.
- Two actions: «مشاركة» (system share sheet, e.g. WhatsApp status) and «حفظ في المعرض».
- For an ayah (mushaf tafsir sheet, Quran messages) there are three: «حفظ», «صورة» and «فيديو». «فيديو» opens the ayah video: a nature clip to choose (it plays in the preview), the ayah over it with the chosen reciter's recitation (all ayahs of a Quran-messages verse), and «شارك الفيديو».
- For text cards, a picker under the preview chooses one of five designs and one of three text sizes; the choice is remembered.

## How the user reaches it

There is no route for it; it is a modal opened from other screens.

| Feature | Trigger | Card | Taps from launch |
|---|---|---|---|
| Mushaf tafsir sheet | Share in the tafsir bottom sheet | `AyahShare` | Not verified (see `docs/features/mushaf.md`) |
| Duas (`الأدعية`) | Share icon on a dua or on the dua of the day | `DuaShare` | 2 |
| Quran messages (`رسائل_القرآن`) | «مشاركة كصورة» under the verse, hadith or dua | `AyahShare` / `DuaShare` | 3 |
| Hadith detail (`الحديث`) | «مشاركة كصورة» | `HadithShare` | 3 |
| Heart journey (`نور_القلب`) | Share the current heart | `HeartShareCard` | Not verified |
| Khatmat (`الختمات`) | Share a finished khatma | `HeartShareCard` | Not verified |

## How it works

**Rendering and capture** (`ImageShareModal`)

1. `useShareCardSize` returns the card size in dp: `1080 / PixelRatio` by `1920 / PixelRatio`, so the captured bitmap is exactly 1080×1920 px on any density.
2. The card is mounted at full size inside a wrapper that is scaled down for the preview (to fit the width, and 54% of the screen height with a toolbar or 66% without).
3. `captureRef` from `react-native-view-shot` captures the inner view as a PNG temp file (`format: 'png'`, `quality: 1`, `result: 'tmpfile'`).
4. Share: `expo-sharing` `shareAsync(uri, { mimeType: 'image/png' })` after `isAvailableAsync`.
5. Save: `expo-media-library` `requestPermissionsAsync(true)` (write-only), then `saveToLibraryAsync(uri)`.
6. Every capture is a new temp file (about 0.5 MB per the code comment). They are released with `releaseCapture` when the modal closes or unmounts, not right after sharing, because the receiving app may still be reading the file.

**Designs** (`settings.shareCardStyle`)

| Id | Name | Rendered by |
|---|---|---|
| `gold` (default) | هادئ ذهبي | `StoryCard` |
| `paper` | ورق المصحف | `StoryCard` |
| `night` | ليل الجامع (mosque photo, stars, crescent) | `StoryCard` |
| `mihrab` | المحراب (double arch) | `StoryCard` |
| `classic` | الكلاسيكي | `AyahShareCard` / `DuaShareCard` |

**Text size** (`settings.shareTextSize`): the largest size the main text may take, as a percentage of the card width.

| Size | Story designs | Classic |
|---|---|---|
| `small` | 4.6 | 5.6 |
| `medium` (default) | 5.6 | 7 |
| `large` | 6.8 | 8.4 |

**Fitting text**

- Line counts are estimated from an average glyph advance (0.19 em for Amiri, 0.5 em for Tajawal); nothing is measured on screen.
- Story designs (`fit` in `src/presentation/components/share/StoryCard.tsx`): start at the maximum and step down by 0.2 to a floor of 3.4 until label, text and reference fit. If there is a tafsir or explanation, try it whole, then cut to 170 characters; the main text may shrink to 80% of its maximum to make room; otherwise the tafsir is dropped.
- Classic (`layoutAyahCard`): same idea with a floor of 3; the tafsir excerpt is shown only if it fits.
- All card text uses `allowFontScaling={false}`, so the system font size does not change the image.

**Wrappers**

- `AyahShare`: surah name, «﴿ ayah ﴾», ayah number, tafsir name and excerpt (a leading quoted ayah in the excerpt is stripped).
- `DuaShare`: label «دعاء», text, source.
- `HadithShare`: label «حديث شريف», text, `grade · attribution`, explanation as «الشرح».
- `HeartShareCard`: title, khatma number and mode, surahs done out of 114, the heart drawing, start and end dates. No design or size choice.

## Code map

| Layer | File | Role |
|---|---|---|
| Modal | `src/presentation/components/share/ImageShareModal.tsx` | Preview, capture, share, save, `useShareCardSize` |
| Picker | `src/presentation/components/share/ShareStylePicker.tsx` | Design and text-size chips |
| Themes | `src/presentation/components/share/storyThemes.ts` | `STORY_THEMES`, size table, `useShareStyle`, `useShareTextMax` |
| Card | `src/presentation/components/share/StoryCard.tsx` | Four story designs; `AyahShare`, `DuaShare`, `HadithShare` |
| Card | `src/presentation/components/share/AyahShareCard.tsx` | Classic ayah card |
| Card | `src/presentation/components/share/DuaShareCard.tsx` | Classic dua card |
| Card | `src/presentation/components/share/HeartShareCard.tsx` | Heart / khatma card |
| Layout | `src/presentation/components/share/ayahCardLayout.ts` | `layoutAyahCard` for the classic cards |
| Store | `src/presentation/store/slices/settingsSlice.ts` | `shareCardStyle`, `shareTextSize` |
| Callers | `src/presentation/components/quran/TafsirBottomSheet.tsx`, `src/presentation/screens/DuaScreen.tsx`, `src/presentation/screens/QuranMessagesScreen.tsx`, `src/presentation/screens/HadithDetailScreen.tsx`, `src/presentation/screens/HeartJourneyScreen.tsx`, `src/presentation/screens/KhatmatScreen.tsx` | Open the modal |
| Assets | `assets/icon.png`, `assets/images/mosque_bg.png` | Logo; background of the `night` design |
| Video | `src/presentation/components/share/VideoCard.tsx`, `videoBackgrounds.ts`, `src/presentation/hooks/useAyahVideo.ts` | The video frame, its pictures, making the video |
| Video | `src/domain/services/AyahVideo.ts`, `src/domain/services/videoLayout.ts`, `src/data/services/NativeAyahVideo.ts`, `native/android/java/video/` | Contract, word layout, download and native encoder |
| Assets | `assets/video-backgrounds/` | A still of each nature clip, for the picker (Pexels ids in `videoBackgrounds.ts`) |
| Clips | GitHub release `video-backgrounds-v1` of the repo, via `ReleaseVideoBackgrounds` (`VideoBackgrounds` in `src/domain/services/`) | The 12 clips (720×1280 H.264, 2–11 MB), downloaded when picked and kept in the app's documents |

**Ayah video** (`ImageShareModal` prop `video`, issue #28)

The video has its own look, not the image card's: a real nature clip playing on a loop (12 from Pexels, free licence: clouds, sea, sunsets, waterfalls, forest, desert, mountains), the app's mark and the surah on top, «بصوت <reciter>» at the bottom, and the ayah in the middle, still. The clips are not in the APK: picking one downloads it once from the repo's `video-backgrounds-v1` release (the hint shows the percentage) and «شارك الفيديو» waits for it.

1. «فيديو» switches the modal to `VideoCard`. Its words are separate `<Text>`s (`ayahWords` in `src/domain/services/videoLayout.ts`, each ayah followed by «﴿n﴾»); each reports its box with `onLayout`, and `paginate` splits them into pages that fit the text box.
2. «شارك الفيديو» captures the still parts on transparent: `shade` (the darkening and the top and bottom gradients), `overlay` (logo, surah, reciter, footer) and one `words` image per page (only that page's words, moved up to be centred).
3. `useAyahVideo` calls `ayahVideo.make` (`AyahVideoMaker`, implemented by `NativeAyahVideo`) with those images, every word's box in 1080×1920 pixels, its ayah and its weight (letters without diacritics), and the reciter from `settings.selectedReciterId`.
4. `NativeAyahVideo` downloads each ayah's MP3 from everyayah.com (`ayahAudioUrl`) into `cache/ayah-video/`, calls the native `AyahVideo.encode(specJson)`, then deletes the MP3s.
5. Native (`native/android/java/video/`): `AyahVideoEncoder` decodes the MP3s into one AAC track and notes where each ayah starts and how long it lasts. A word's time is its weight's share of its ayah's recitation; it is used only to know when the next page starts. `BackgroundVideo` decodes the clip with MediaCodec onto a SurfaceTexture and starts it again at its end; `FrameRenderer` draws 24 fps frames with OpenGL ES: the clip's frame (cropped to fill 9:16) fading in from black, the shade over it; the overlay and the first page fade in over 0.8 s and then stay still; on a long ayah each next page cross-fades in (0.5 s) when its first word is recited. `MediaMuxer` writes the MP4. 1080×1920 at 6 Mbps, or 720×1280 when the phone has no encoder for the larger size. The video runs 0.9 s past the recitation.
6. The MP4 goes to `expo-sharing` as `video/mp4`, and is deleted when the modal closes, like the PNGs.
7. A video longer than 90 s (a WhatsApp status) is still made whole; the hint under the buttons says WhatsApp will ask to trim it.

Page changes are timed by letters, not by listening to the recitation, so a page can turn a little before or after its first word is said.

Errors: no download → «تعذّر تحميل التلاوة»; no encoder → «الفيديو مش مدعوم على الموبايل ده»; anything else → «تعذّر تجهيز الفيديو».

## State and storage

- `settings.shareCardStyle` (`'classic' | 'gold' | 'paper' | 'night' | 'mihrab'`, default `gold`) and `settings.shareTextSize` (`'small' | 'medium' | 'large'`, default `medium`), persisted with the settings slice (redux-persist, key `root_v6`).
- Captured PNGs are temp files, deleted when the modal closes. A saved image is a copy in the device gallery.

## Native, notifications and permissions

- Libraries: `react-native-view-shot` 4.0.3, `expo-sharing`, `expo-media-library`.
- Gallery: write-only permission is requested at the moment of saving. `app.json` blocks `READ_EXTERNAL_STORAGE` and all `READ_MEDIA_*` permissions and configures the media-library plugin with no granular permissions: the app never reads the gallery.
- Sharing needs no permission.

## External services

None for images: the image is built on the device; where it goes is decided in the system share sheet. The ayah video downloads the recitation from everyayah.com; the video itself is built on the device.

## Settings that affect it

- `shareCardStyle` and `shareTextSize`, changed only from `ShareStylePicker` inside the share modal. There is no entry for them on the Settings screen.
- The app theme (light or dark) does not change the cards: classic and heart cards always use the dark `night` palette, story designs use their own colours.

## Edge cases and limitations

- With the `classic` design, `HadithShare` falls back to `DuaShareCard`: the label reads «دعاء» and the explanation is left out.
- Text fitting is an estimate. The middle area clips overflow (`overflow: 'hidden'`), so an unusually wide text could be cut rather than shrunk further.
- The `night` design reserves the lower part of the card for the mosque image, so long texts get smaller there than in other designs.
- Cards set `direction: 'rtl'` themselves because the preview wrapper is `ltr` for positioning under forced RTL.
- Other "share" actions in the app are plain text, not images: long press on a dua's share icon, the text share in the tafsir sheet, and the daily report.
- If sharing is unavailable on the device, an alert is shown and nothing is captured.

## Open issues

None.
