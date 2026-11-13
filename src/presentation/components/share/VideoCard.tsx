import React, { useMemo } from 'react';
import { Image, LayoutChangeEvent, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { FrameBox } from '../../../domain/services/AyahVideo';
import type { LayoutWord } from '../../../domain/services/videoLayout';
import { useShareCardSize } from './shareCardSize';
import { VideoBackground } from './videoBackgrounds';

const LOGO = require('../../../../assets/images/logo.jpg');

/**
 * What the card draws. 'preview' is everything (the clip playing, with `page`'s words). The
 * video captures the still parts on transparent, to lay over the clip: 'shade' (the darkening
 * that keeps the text readable), 'overlay' (logo, surah, reciter, footer) and 'words' (one page
 * of the ayah text).
 */
export type VideoCardMode = 'preview' | 'shade' | 'overlay' | 'words';

/** expo-av is loaded on first use (importing it early binds its native module too soon). */
const av = () => require('expo-av') as typeof import('expo-av');

/** Where the ayah text goes, in units of 1% of the card width. */
export const TEXT_BOX = { side: 8, top: 36, bottom: 32 };

type Props = {
  mode: VideoCardMode;
  background: VideoBackground;
  /** The clip on the phone once downloaded; until then the preview shows its still. */
  clipUri: string | null;
  surahName: string;
  reciterName: string;
  words: LayoutWord[];
  /** Font size, % of the card width. */
  fontU: number;
  /** Words shown (by index) and how far the text moves up to centre this page. */
  page: { words: Set<number>; shift: number } | null;
  /** Each word's box in dp, relative to the text box, in the full (unpaged) layout. */
  onWordsLaid: (boxes: FrameBox[]) => void;
};

/**
 * The 9:16 frame of an ayah video: a nature picture, the app's mark and the surah on top, the
 * reciter's name at the bottom, and the ayah in the middle. The words are separate so a long
 * ayah can be split into pages.
 */
export const VideoCard = ({ mode, background, clipUri, surahName, reciterName, words, fontU, page, onWordsLaid }: Props) => {
  const { w, h } = useShareCardSize();
  const u = w / 100;
  const size = fontU * u;

  // every word reports its box once per layout; report the set when it is complete
  const boxes = useMemo<(FrameBox | undefined)[]>(() => new Array(words.length).fill(undefined), [words, fontU]);
  const onWord = (i: number) => (e: LayoutChangeEvent) => {
    const { x, y, width, height } = e.nativeEvent.layout;
    boxes[i] = { x, y, w: width, h: height };
    if (boxes.every(Boolean)) onWordsLaid([...boxes] as FrameBox[]);
  };

  const showClip = mode === 'preview';
  const showShade = mode === 'preview' || mode === 'shade';
  const showOverlay = mode === 'preview' || mode === 'overlay';
  const showWords = mode === 'preview' || mode === 'words';

  return (
    <View style={{ width: w, height: h, overflow: 'hidden' }}>
      {/* the clip itself is only in the preview: the encoder plays it from the file */}
      {showClip ? (
        clipUri ? (
          React.createElement(av().Video, {
            source: { uri: clipUri }, style: StyleSheet.absoluteFill, resizeMode: av().ResizeMode.COVER,
            shouldPlay: true, isLooping: true, isMuted: true,
          })
        ) : (
          <Image source={background.thumb} resizeMode="cover" style={StyleSheet.absoluteFill} />
        )
      ) : null}
      <View style={[StyleSheet.absoluteFill, !showShade && st.hidden]}>
        <View style={[StyleSheet.absoluteFill, st.dim]} />
        <LinearGradient colors={['rgba(0,0,0,0.55)', 'rgba(0,0,0,0)']} style={[st.abs, { left: 0, right: 0, top: 0, height: 34 * u }]} />
        <LinearGradient colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.6)']} style={[st.abs, { left: 0, right: 0, bottom: 0, height: 36 * u }]} />
      </View>

      <View style={[StyleSheet.absoluteFill, !showOverlay && st.hidden]}>
        <View style={[st.brand, { top: 9 * u, gap: 1.8 * u }]}>
          <Image source={LOGO} style={{ width: 7.5 * u, height: 7.5 * u, borderRadius: 1.8 * u }} />
          <Text allowFontScaling={false} style={[st.brandName, { fontSize: 4.2 * u }]}>أوّاب</Text>
        </View>
        <View style={[st.center, { top: 21 * u }]}>
          <View style={[st.chip, { paddingHorizontal: 4 * u, paddingVertical: 1 * u }]}>
            <Text allowFontScaling={false} style={[st.chipText, { fontSize: 3.6 * u }]}>{surahName}</Text>
          </View>
        </View>
        <Text allowFontScaling={false} style={[st.reciter, { fontSize: 3.6 * u, bottom: 17 * u }]}>بصوت {reciterName}</Text>
        <Text allowFontScaling={false} style={[st.footer, { fontSize: 2.8 * u, bottom: 10 * u }]}>شاركها من تطبيق أوّاب</Text>
      </View>

      <View
        style={[st.abs, { left: TEXT_BOX.side * u, right: TEXT_BOX.side * u, top: TEXT_BOX.top * u, bottom: TEXT_BOX.bottom * u }, !showWords && st.hidden]}
        pointerEvents="none"
      >
        {/* the full layout, moved up so this page sits centred; words of other pages are hidden */}
        <View style={[st.words, { transform: [{ translateY: -(page?.shift ?? 0) }] }]}>
          {words.map((word, i) => (
            <Text
              key={i}
              onLayout={onWord(i)}
              allowFontScaling={false}
              style={[st.word, { fontSize: size, lineHeight: size * 1.9, marginHorizontal: 0.9 * u }, page && !page.words.has(i) && st.hidden]}
            >
              {word.text}
            </Text>
          ))}
        </View>
      </View>
    </View>
  );
};

const SHADOW = { textShadowColor: 'rgba(0,0,0,0.55)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 10 };

const st = StyleSheet.create({
  abs: { position: 'absolute' },
  hidden: { opacity: 0 },
  dim: { backgroundColor: 'rgba(0,0,0,0.32)' },
  // explicit RTL: logo first (on the right), then the name; the preview wrapper is LTR
  brand: { position: 'absolute', left: 0, right: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', direction: 'rtl' },
  brandName: { fontFamily: 'Tajawal_800ExtraBold', color: '#ffffff', ...SHADOW },
  center: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
  chip: { borderRadius: 999, borderWidth: 1, borderColor: 'rgba(255,255,255,0.55)', backgroundColor: 'rgba(0,0,0,0.25)' },
  chipText: { fontFamily: 'Tajawal_700Bold', color: '#ffffff' },
  reciter: { position: 'absolute', left: 0, right: 0, textAlign: 'center', fontFamily: 'Tajawal_700Bold', color: '#ffffff', ...SHADOW },
  footer: { position: 'absolute', left: 0, right: 0, textAlign: 'center', fontFamily: 'Tajawal_500Medium', color: 'rgba(255,255,255,0.8)', ...SHADOW },
  // explicit RTL: the share preview wraps cards in an LTR container for positioning
  words: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', direction: 'rtl' },
  word: { fontFamily: 'Amiri_700Bold', color: '#ffffff', textAlign: 'center', ...SHADOW },
});
