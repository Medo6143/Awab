import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { useShareCardSize } from './ImageShareModal';
import { STORY_THEMES, StoryTheme, useShareStyle, useShareTextMax } from './storyThemes';
import { AyahShareCard } from './AyahShareCard';
import { DuaShareCard } from './DuaShareCard';
import { toAr } from '../../../shared/utils/format';

const LOGO = require('../../../../assets/icon.png');
const MOSQUE = require('../../../../assets/images/mosque_bg.png');

type ThemeId = keyof typeof STORY_THEMES;

// average glyph advance as a share of font size (see ayahCardLayout)
const AMIRI = 0.19;
const TAJAWAL = 0.5;
const lines = (chars: number, f: number, width: number, adv: number) => Math.max(1, Math.ceil((chars * adv * f) / width));

type Content = {
  label: string;         // chip above the text: surah name or "دعاء"
  text: string;          // ayah (with ﴿ ﴾) or dua
  reference: string;     // line under the text
  tafsirName?: string;
  tafsir?: string;
};

/**
 * Picks the text size (≤ maxU) and whether the tafsir fits, from the room the design
 * leaves in the middle of the card. The tafsir is tried whole, then shortened; the
 * ayah may shrink a little (to 80% of its max) to make room for it.
 */
const fit = (c: Content, maxU: number, u: number, textW: number, roomH: number) => {
  const labelH = 3.2 * u * 1.5 + 1.6 * u + 4 * u;
  const refH = 3.2 * u * 1.5 + 3 * u;
  const mainH = (f: number) => lines(c.text.length, f * u, textW, AMIRI) * f * u * 1.95;
  const tafsirSize = 3.2 * u;
  const tafsirH = (s: string) => 7 * u + 2.8 * u * 1.5 + lines(s.length, tafsirSize, textW, TAJAWAL) * tafsirSize * 1.8;

  let base = 3.4;
  for (let f = maxU; f >= 3.4; f -= 0.2) {
    if (labelH + mainH(f) + refH <= roomH) { base = f; break; }
  }
  if (c.tafsir) {
    const short = c.tafsir.length > 170 ? `${c.tafsir.slice(0, 170).replace(/\s+\S*$/, '')}…` : c.tafsir;
    for (const t of [c.tafsir, short]) {
      for (let f = base; f >= Math.max(3.4, maxU * 0.8); f -= 0.2) {
        if (labelH + mainH(f) + refH + tafsirH(t) <= roomH) return { size: f * u, tafsir: t, tafsirSize };
      }
    }
  }
  return { size: base * u, tafsir: undefined, tafsirSize };
};

/** Background art of each design, drawn behind the content. */
const Decor = ({ id, t, w, h, u }: { id: ThemeId; t: StoryTheme; w: number; h: number; u: number }) => {
  const H = h / u; // card height in u
  if (id === 'gold') {
    return <View style={[st.abs, { top: 4.5 * u, left: 4.5 * u, right: 4.5 * u, bottom: 4.5 * u, borderWidth: 1.2, borderColor: t.line, borderRadius: 3 * u }]} />;
  }
  if (id === 'paper') {
    const corner = 3 * u;
    return (
      <>
        <View style={[st.abs, { top: 4.5 * u, left: 4.5 * u, right: 4.5 * u, bottom: 4.5 * u, borderWidth: 2, borderColor: t.line, borderRadius: 1.2 * u }]} />
        <View style={[st.abs, { top: 6.5 * u, left: 6.5 * u, right: 6.5 * u, bottom: 6.5 * u, borderWidth: 1, borderColor: t.line, opacity: 0.55 }]} />
        {[[4.5, 4.5], [4.5, 95.5], [H - 4.5, 4.5], [H - 4.5, 95.5]].map(([y, x]) => (
          <View key={`${y}-${x}`} style={[st.abs, { top: y * u - corner / 2, left: x * u - corner / 2, width: corner, height: corner, backgroundColor: t.line, transform: [{ rotate: '45deg' }] }]} />
        ))}
      </>
    );
  }
  if (id === 'night') {
    return (
      <>
        <Image source={MOSQUE} resizeMode="cover" style={[st.abs, { left: 0, top: h - w, width: w, height: w }]} />
        <LinearGradient colors={[t.bg, 'rgba(27,20,38,0)']} style={[st.abs, { left: 0, right: 0, top: h - w, height: w * 0.45 }]} />
        <LinearGradient colors={['rgba(10,6,16,0)', 'rgba(10,6,16,0.85)']} style={[st.abs, { left: 0, right: 0, bottom: 0, height: 22 * u }]} />
        <Svg width={w} height={h * 0.4} viewBox={`0 0 100 ${H * 0.4}`} style={st.abs}>
          {[[16, 30], [80, 24], [64, 46], [28, 58], [88, 60], [44, 20]].map(([x, y]) => <Circle key={`${x}-${y}`} cx={x} cy={y} r={0.35} fill="#fff" opacity={0.7} />)}
          <Path d="M73 12a5 5 0 1 0 4 8 4 4 0 1 1-4-8z" fill={t.accent} />
        </Svg>
      </>
    );
  }
  // mihrab: a double arch around the text, with a small lamp
  const bottom = H - 11;
  return (
    <Svg width={w} height={h} viewBox={`0 0 100 ${H}`} style={st.abs}>
      <Path d={`M13 ${bottom}V84C13 58 37 46 50 31C63 46 87 58 87 84V${bottom}`} fill="rgba(212,175,55,0.05)" stroke={t.line} strokeWidth={0.5} />
      <Path d={`M19 ${bottom}V86C19 63 40 52 50 40C60 52 81 63 81 86V${bottom}`} fill="none" stroke={t.line} strokeOpacity={0.4} strokeWidth={0.3} />
      <Path d={`M10 ${bottom}H90`} stroke={t.line} strokeWidth={0.4} />
      <Path d="M50 46V52" stroke={t.line} strokeWidth={0.3} />
      <Circle cx={50} cy={54} r={1.6} fill={t.line} />
    </Svg>
  );
};

/** 9:16 story image in one of the four designs: logo, label, text, reference, tafsir. */
export const StoryCard = ({ themeId, content }: { themeId: ThemeId; content: Content }) => {
  const { w, h } = useShareCardSize();
  const u = w / 100;
  const t = STORY_THEMES[themeId];
  const maxU = useShareTextMax('story');

  const arch = themeId === 'mihrab';
  const sidePad = arch ? 22 * u : 12 * u;
  const top = arch ? 58 * u : 24 * u;      // content starts under the brand (and inside the arch)
  // above the footer; the night design keeps the text in the sky, off the mosque's minarets
  const bottom = arch ? 19 * u : themeId === 'night' ? 66 * u : 18 * u;
  const textW = w - sidePad * 2;
  const { size, tafsir, tafsirSize } = fit(content, maxU, u, textW, h - top - bottom);

  return (
    <View style={[st.card, { width: w, height: h, backgroundColor: t.bg }]}>
      <Decor id={themeId} t={t} w={w} h={h} u={u} />

      <View style={[st.brand, { top: 8.5 * u, gap: 2 * u }]}>
        <Image source={LOGO} style={{ width: 9 * u, height: 9 * u, borderRadius: 2.2 * u }} />
        <Text allowFontScaling={false} style={[st.brandName, { color: t.accent, fontSize: 4.6 * u }]}>أوّاب</Text>
      </View>

      <View style={[st.middle, { top, bottom, left: sidePad, right: sidePad }]}>
        <View style={[st.chip, { borderColor: t.line, paddingHorizontal: 3.6 * u, paddingVertical: 0.8 * u, marginBottom: 4 * u }]}>
          <Text allowFontScaling={false} style={[st.chipText, { color: t.accent, fontSize: 3.2 * u }]}>{content.label}</Text>
        </View>
        <Text allowFontScaling={false} style={[st.main, { color: t.text, fontSize: size, lineHeight: size * 1.95 }]}>{content.text}</Text>
        <Text allowFontScaling={false} style={[st.ref, { color: t.accent, fontSize: 3.2 * u, marginTop: 3 * u }]}>{content.reference}</Text>

        {tafsir ? (
          <View style={{ alignItems: 'center', marginTop: 5 * u }}>
            <View style={{ width: 16 * u, height: 1, backgroundColor: t.line, marginBottom: 2 * u }} />
            <Text allowFontScaling={false} style={[st.tafsirName, { color: t.accent, fontSize: 2.8 * u }]}>{content.tafsirName || 'التفسير'}</Text>
            <Text allowFontScaling={false} style={[st.tafsir, { color: t.muted, fontSize: tafsirSize, lineHeight: tafsirSize * 1.8 }]}>{tafsir}</Text>
          </View>
        ) : null}
      </View>

      <Text allowFontScaling={false} style={[st.footer, { color: t.muted, fontSize: 2.6 * u, bottom: 7.5 * u }]}>شاركها من تطبيق أوّاب</Text>
    </View>
  );
};

type AyahProps = { ayahText: string; surahName: string; ayahNumber: number; tafsirName?: string; tafsirExcerpt?: string };

/** The ayah share image in the design chosen in the share screen. */
export const AyahShare = (p: AyahProps) => {
  const { style } = useShareStyle();
  if (style === 'classic') return <AyahShareCard {...p} />;
  return (
    <StoryCard
      themeId={style}
      content={{
        label: p.surahName,
        text: `﴿ ${p.ayahText.trim()} ﴾`,
        reference: `الآية ${toAr(p.ayahNumber)}`,
        tafsirName: p.tafsirName,
        // the excerpt often opens by quoting the ayah in braces; the card already shows it
        tafsir: p.tafsirExcerpt?.replace(/^\s*[{﴿(][^}﴾)]*[}﴾)]\s*/, '').trim() || undefined,
      }}
    />
  );
};

/** A hadith share image: the text, its grade and source, and a line of its explanation. */
export const HadithShare = ({ text, grade, attribution, explanation }: { text: string; grade: string; attribution: string; explanation?: string }) => {
  const { style } = useShareStyle();
  const source = [grade, attribution].filter(Boolean).join(' · ');
  if (style === 'classic') return <DuaShareCard text={text} source={source} />;
  return (
    <StoryCard
      themeId={style}
      content={{ label: 'حديث شريف', text: text.trim(), reference: source, tafsirName: 'الشرح', tafsir: explanation?.trim() || undefined }}
    />
  );
};

/** The dua share image in the design chosen in the share screen. */
export const DuaShare = ({ text, source }: { text: string; source: string }) => {
  const { style } = useShareStyle();
  if (style === 'classic') return <DuaShareCard text={text} source={source} />;
  return <StoryCard themeId={style} content={{ label: 'دعاء', text: text.trim(), reference: source }} />;
};

const st = StyleSheet.create({
  // explicit RTL: the share preview wraps cards in an LTR container for positioning
  card: { overflow: 'hidden', direction: 'rtl' },
  abs: { position: 'absolute' },
  brand: { position: 'absolute', left: 0, right: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  brandName: { fontFamily: 'Tajawal_800ExtraBold' },
  middle: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  chip: { borderWidth: 1, borderRadius: 999 },
  chipText: { fontFamily: 'Tajawal_700Bold' },
  main: { fontFamily: 'Amiri_700Bold', textAlign: 'center' },
  ref: { fontFamily: 'Tajawal_500Medium', textAlign: 'center' },
  tafsirName: { fontFamily: 'Tajawal_700Bold', marginBottom: 1, textAlign: 'center' },
  tafsir: { fontFamily: 'Tajawal_500Medium', textAlign: 'center' },
  footer: { position: 'absolute', left: 0, right: 0, fontFamily: 'Tajawal_500Medium', textAlign: 'center' },
});
