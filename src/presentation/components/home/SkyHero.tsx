import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Defs, Path, RadialGradient, Stop } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { parseClock } from '../../../domain/entities/notifications';
import type { PrayerScheduleTimes } from '../../../domain/entities/prayer';
import { toAr } from '../../../shared/utils/format';
import { colors, space } from '../../../shared/theme/tokens';

export type Phase = 'night' | 'dawn' | 'morning' | 'noon' | 'golden' | 'dusk';

/** Sky colours, top to bottom; the last stop is the app background so the sky melts into the page. */
const SKY: Record<Phase, string[]> = {
  night: ['#05081a', '#0d1430', '#141433', colors.bg],
  dawn: ['#1b2347', '#5b4470', '#c98466', colors.bg],
  morning: ['#1d4f7c', '#3f7fb0', '#7fa9c6', colors.bg],
  noon: ['#215784', '#5a8fb8', '#b9a888', colors.bg],
  golden: ['#1d1631', '#5a3346', '#c06a3c', colors.bg],
  dusk: ['#0f1430', '#2e2550', '#6a3a55', colors.bg],
};

/** The sky follows the prayer that is coming next. */
const PHASE_BY_NEXT: Record<string, Phase> = {
  Fajr: 'night', Sunrise: 'dawn', Dhuhr: 'morning', Asr: 'noon', Maghrib: 'golden', Isha: 'dusk',
};

const ARC_PRAYERS = [
  { key: 'Fajr', ar: 'الفجر' },
  { key: 'Dhuhr', ar: 'الظهر' },
  { key: 'Asr', ar: 'العصر' },
  { key: 'Maghrib', ar: 'المغرب' },
  { key: 'Isha', ar: 'العشاء' },
] as const;

const minutesOf = (t?: string) => {
  const c = parseClock(t);
  return c ? c.hours * 60 + c.minutes : null;
};

/** Point on the quadratic arc for t in [0,1]; t=0 is Fajr on the right (east), t=1 Isha on the left. */
const arcPoint = (t: number, w: number, base: number, peak: number, pad: number) => {
  const p0 = { x: w - pad, y: base };
  const p1 = { x: w / 2, y: peak };
  const p2 = { x: pad, y: base };
  const u = 1 - t;
  return { x: u * u * p0.x + 2 * u * t * p1.x + t * t * p2.x, y: u * u * p0.y + 2 * u * t * p1.y + t * t * p2.y };
};

type Props = {
  greeting: string;
  dateLine: string;
  timings?: PrayerScheduleTimes;
  next?: { name: string; arName: string; time: string; remaining: number } | null;
  donePrayers: Set<string>;
  loading: boolean;
  onPressPrayer?: () => void;
  /** Buttons on the far side of the title (settings, qibla...). */
  actions?: React.ReactNode;
  /** Prayer times next to the names on the arc, and sunrise as a small mark. */
  showTimes?: boolean;
};

/** A round glass button for the sky header. */
export const SkyButton = ({ onPress, label, children }: { onPress: () => void; label: string; children: React.ReactNode }) => (
  <Pressable onPress={onPress} style={st.iconBtn} accessibilityRole="button" accessibilityLabel={label}>
    {children}
  </Pressable>
);

/**
 * The sky itself: gradient for the phase, a few stars when it is dark, and the title row.
 * Shared by home, prayer times and athkar so every sky page has the same colours.
 */
export const SkyBackdrop = ({ phase, title, subtitle, actions, children }: {
  phase: Phase; title: string; subtitle: string; actions?: React.ReactNode; children?: React.ReactNode;
}) => {
  const { width: W } = useWindowDimensions();
  const top = useSafeAreaInsets().top;
  return (
    <View style={{ width: W }}>
      <LinearGradient colors={SKY[phase] as [string, string, ...string[]]} locations={[0, 0.38, 0.68, 1]} style={StyleSheet.absoluteFill} />

      {/* a few stars before dawn and after dusk */}
      {(phase === 'night' || phase === 'dusk' || phase === 'dawn') ? (
        <Svg width={W} height={260} style={StyleSheet.absoluteFill} pointerEvents="none">
          {[[0.12, 70], [0.3, 40], [0.48, 95], [0.66, 55], [0.82, 85], [0.9, 35], [0.22, 120], [0.58, 130]].map(([fx, y], i) => (
            <Circle key={i} cx={fx * W} cy={y + top} r={i % 3 === 0 ? 1.4 : 1} fill="#fff" opacity={phase === 'dawn' ? 0.35 : 0.7} />
          ))}
        </Svg>
      ) : null}

      <View style={[st.head, { paddingTop: top + space[3] }]}>
        <View style={{ flex: 1 }}>
          <Text style={st.greeting} numberOfLines={1}>{title}</Text>
          <Text style={st.date} numberOfLines={1}>{subtitle}</Text>
        </View>
        {actions}
      </View>
      {children}
    </View>
  );
};

/**
 * Home hero: a sky whose colour follows the time of day, the five prayers on the sun's
 * arc (done ones filled, the next one lit), the sun (or moon at night) at the current
 * moment, and the countdown to the next prayer.
 */
export const SkyHero = ({ greeting, dateLine, timings, next, donePrayers, loading, onPressPrayer, actions, showTimes }: Props) => {
  const { width } = useWindowDimensions();
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  const phase: Phase = next ? PHASE_BY_NEXT[next.name] ?? 'night' : 'night';
  const night = phase === 'night';

  const W = width;
  const H = 150;
  const base = 128;
  const peak = 6;
  const pad = 34;

  const arc = useMemo(() => {
    const fajr = minutesOf(timings?.Fajr);
    const isha = minutesOf(timings?.Isha);
    if (fajr == null || isha == null || isha <= fajr) return null;
    const tOf = (m: number) => Math.max(0, Math.min(1, (m - fajr) / (isha - fajr)));
    const points = ARC_PRAYERS.map((p) => {
      const m = minutesOf(timings?.[p.key]);
      return { ...p, ...(m == null ? arcPoint(0, W, base, peak, pad) : arcPoint(tOf(m), W, base, peak, pad)) };
    });
    const nowM = now.getHours() * 60 + now.getMinutes();
    const body = arcPoint(tOf(nowM), W, base, peak, pad);
    const sr = minutesOf(timings?.Sunrise);
    const sunrise = sr == null ? null : arcPoint(tOf(sr), W, base, peak, pad);
    return { points, body, sunrise };
  }, [timings, now, W]);

  const hours = next ? Math.floor(next.remaining / 60) : 0;
  const mins = next ? next.remaining % 60 : 0;
  const countdown = next ? (hours ? `${toAr(hours)}:${toAr(String(mins).padStart(2, '0'))}` : `${toAr(mins)} د`) : '—';

  return (
    <SkyBackdrop phase={phase} title={greeting} subtitle={dateLine} actions={actions}>

      <Pressable onPress={onPressPrayer} disabled={!onPressPrayer} accessibilityRole="button" accessibilityLabel={next ? `الصلاة القادمة ${next.arName}` : 'مواقيت الصلاة'}>
        {/* direction ltr: the arc is drawn in absolute coordinates (Fajr east on the right) */}
        <View style={{ direction: 'ltr' }}>
          <Svg width={W} height={H}>
            <Defs>
              <RadialGradient id="glow" cx="50%" cy="50%" r="50%">
                <Stop offset="0" stopColor={night ? '#dfe6ff' : '#ffd27a'} stopOpacity={0.55} />
                <Stop offset="1" stopColor={night ? '#dfe6ff' : '#ffd27a'} stopOpacity={0} />
              </RadialGradient>
            </Defs>
            <Path d={`M${W - pad} ${base} Q${W / 2} ${peak} ${pad} ${base}`} fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth={1.2} strokeDasharray="3 6" />
            {arc?.points.map((p) => {
              const isNext = next?.name === p.key;
              const done = donePrayers.has(p.key);
              return (
                <React.Fragment key={p.key}>
                  <Circle cx={p.x} cy={p.y} r={isNext ? 6 : 4.5} fill={isNext ? '#ffd27a' : done ? '#fff' : 'transparent'} stroke={isNext ? '#ffd27a' : '#fff'} strokeOpacity={0.8} strokeWidth={1.4} />
                </React.Fragment>
              );
            })}
            {showTimes && arc?.sunrise ? <Circle cx={arc.sunrise.x} cy={arc.sunrise.y} r={3} fill="#fff" opacity={0.5} /> : null}
            {arc && !night ? (
              <>
                <Circle cx={arc.body.x} cy={arc.body.y} r={22} fill="url(#glow)" />
                <Circle cx={arc.body.x} cy={arc.body.y} r={9} fill="#ffd27a" />
              </>
            ) : null}
            {night ? (
              // crescent high in the night sky
              <Path d={`M${W * 0.25} 26 a14 14 0 1 0 11 22 a11 11 0 1 1 -11 -22z`} fill="#e8eeff" opacity={0.9} />
            ) : null}
          </Svg>
          {/* names are RN Text: react-native-svg does not join Arabic letters */}
          {arc?.points.map((p) => {
            const isNext = next?.name === p.key;
            const below = p.y > base - 20;
            return (
              <Text
                key={`l${p.key}`}
                style={[st.arcLabel, isNext && st.arcLabelNext, { left: p.x - 40, top: below ? p.y + 8 : p.y - (showTimes ? 38 : 24) }]}
              >
                {p.ar}
                {showTimes && timings?.[p.key] ? `\n${toAr(String(timings[p.key]).slice(0, 5))}` : ''}
              </Text>
            );
          })}
        </View>

        <View style={st.count}>
          <Text style={st.countLabel}>{next ? `باقي على ${next.arName}` : loading ? 'جارٍ تحميل المواقيت…' : 'مواقيت الصلاة'}</Text>
          <Text style={st.countValue}>{countdown}</Text>
          {next ? <Text style={st.countAt}>{toAr(next.time)}</Text> : null}
        </View>
      </Pressable>
    </SkyBackdrop>
  );
};

const st = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', gap: space[2], paddingHorizontal: 20 },
  greeting: { fontFamily: 'Tajawal_800ExtraBold', fontSize: 22, color: '#fff' },
  date: { fontFamily: 'Tajawal_500Medium', fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  iconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.14)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center' },
  arcLabel: { position: 'absolute', width: 80, textAlign: 'center', fontFamily: 'Tajawal_500Medium', fontSize: 11, color: 'rgba(255,255,255,0.8)' },
  arcLabelNext: { fontFamily: 'Tajawal_700Bold', color: '#ffd27a' },
  count: { alignItems: 'center', marginTop: -space[2], paddingBottom: space[6] },
  countLabel: { fontFamily: 'Tajawal_500Medium', fontSize: 14, color: 'rgba(255,255,255,0.8)' },
  countValue: { fontFamily: 'Tajawal_800ExtraBold', fontSize: 52, lineHeight: 64, color: '#fff', textShadowColor: 'rgba(0,0,0,0.35)', textShadowRadius: 12 },
  countAt: { fontFamily: 'Tajawal_500Medium', fontSize: 13, color: 'rgba(255,255,255,0.7)' },
});
