import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Svg, { Defs, LinearGradient, Line, Path, RadialGradient, Rect, Stop } from 'react-native-svg';
import { colors } from '../../../shared/theme/tokens';

const SAJID = require('../../../../assets/images/sajid.png');
const AnimatedPath = Animated.createAnimatedComponent(Path);

// arch geometry in a 220×260 box
const OUTER = 'M18 254 V128 C18 82 60 54 110 14 C160 54 202 82 202 128 V254';
const INNER = 'M34 254 V132 C34 94 68 70 110 36 C152 70 186 94 186 132 V254';
const OUTER_LEN = 560;
const INNER_LEN = 500;
const STAR_SPOTS: [number, number, number][] = [[25, 125, 10], [195, 125, 10], [24, 174, 8], [196, 174, 8], [24, 219, 8], [196, 219, 8], [110, 8, 12]];

const Star = ({ x, y, s }: { x: number; y: number; s: number }) => {
  const h = s / 2;
  return (
    <>
      <Rect x={x - h} y={y - h} width={s} height={s} fill="#b8902f" />
      <Rect x={x - h} y={y - h} width={s} height={s} fill="#b8902f" rotation={45} originX={x} originY={y} />
    </>
  );
};

type Props = { onDone: () => void };

/**
 * Launch animation shown once over the app after the native splash: a gold mihrab draws
 * itself, light falls onto the prostrating figure from the logo, then the name and the
 * verse appear. The native splash uses the same background, so the hand-off is seamless.
 * Tapping skips it.
 */
export const AnimatedSplash = ({ onDone }: Props) => {
  const { width } = useWindowDimensions();
  const scale = Math.min(1.25, (width * 0.62) / 220);

  const outer = useRef(new Animated.Value(OUTER_LEN)).current;
  const inner = useRef(new Animated.Value(INNER_LEN)).current;
  const deco = useRef(new Animated.Value(0)).current;      // stars, crescent, beam
  const figure = useRef(new Animated.Value(0)).current;
  const glow = useRef(new Animated.Value(0.45)).current;
  const name = useRef(new Animated.Value(0)).current;
  const verse = useRef(new Animated.Value(0)).current;
  const rule = useRef(new Animated.Value(0)).current;
  const exit = useRef(new Animated.Value(1)).current;
  const finished = useRef(false);

  const finish = () => {
    if (finished.current) return;
    finished.current = true;
    Animated.timing(exit, { toValue: 0, duration: 380, easing: Easing.out(Easing.quad), useNativeDriver: true }).start(() => onDone());
  };

  useEffect(() => {
    const ease = Easing.bezier(0.6, 0, 0.3, 1);
    const t = (v: Animated.Value, to: number, duration: number, delay = 0, native = true) =>
      Animated.timing(v, { toValue: to, duration, delay, easing: ease, useNativeDriver: native });

    Animated.parallel([
      t(outer, 0, 1300, 100, false),
      t(inner, 0, 1300, 300, false),
      t(deco, 1, 800, 1000),
      t(figure, 1, 1000, 1300),
      t(name, 1, 700, 1900),
      t(verse, 1, 700, 2200),
      t(rule, 1, 800, 2500),
    ]).start();

    const pulse = Animated.loop(Animated.sequence([
      Animated.timing(glow, { toValue: 1, duration: 1500, useNativeDriver: true }),
      Animated.timing(glow, { toValue: 0.45, duration: 1500, useNativeDriver: true }),
    ]));
    const p = setTimeout(() => pulse.start(), 1700);
    const done = setTimeout(finish, 4300); // name and verse stay ~1.5 s before the fade
    return () => { clearTimeout(p); clearTimeout(done); pulse.stop(); };
  }, []);

  const up = (v: Animated.Value, dist = 10) => ({
    opacity: v,
    transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [dist, 0] }) }],
  });

  return (
    <Animated.View style={[StyleSheet.absoluteFill, st.root, { opacity: exit }]}>
      <Pressable style={st.center} onPress={finish} accessibilityLabel="تخطي">
        <View style={{ width: 220 * scale, height: 260 * scale }}>
          <Svg width="100%" height="100%" viewBox="0 0 220 260">
            <Defs>
              <LinearGradient id="beam" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor="#f3d57a" stopOpacity={0.38} />
                <Stop offset="1" stopColor="#f3d57a" stopOpacity={0} />
              </LinearGradient>
            </Defs>
            <AnimatedPath d={OUTER} fill="none" stroke={colors.gold} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={`${OUTER_LEN}`} strokeDashoffset={outer} />
            <AnimatedPath d={INNER} fill="none" stroke="#8a6d22" strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={`${INNER_LEN}`} strokeDashoffset={inner} />
            <Line x1={26} y1={254} x2={194} y2={254} stroke={colors.gold} strokeWidth={1} opacity={0.5} />
          </Svg>

          {/* beam, stars and crescent fade in as one layer */}
          <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { opacity: deco }]}>
            <Svg width="100%" height="100%" viewBox="0 0 220 260">
              <Path d="M94 58 L126 58 L178 252 L42 252 Z" fill="url(#beam2)" />
              <Defs>
                <LinearGradient id="beam2" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0" stopColor="#f3d57a" stopOpacity={0.38} />
                  <Stop offset="1" stopColor="#f3d57a" stopOpacity={0} />
                </LinearGradient>
              </Defs>
              {STAR_SPOTS.map(([x, y, s]) => <Star key={`${x}-${y}`} x={x} y={y} s={s} />)}
              <Path d="M110 40 a13 13 0 1 0 10.5 20 a10 10 0 1 1 -10.5 -20z" fill="#e9c46a" />
            </Svg>
          </Animated.View>

          {/* light pool under the figure */}
          <Animated.View pointerEvents="none" style={[st.floor, { width: 200 * scale, height: 30 * scale, left: 10 * scale, bottom: 4 * scale, opacity: Animated.multiply(figure, glow) }]}>
            <Svg width="100%" height="100%">
              <Defs>
                <RadialGradient id="pool" cx="50%" cy="50%" r="50%">
                  <Stop offset="0" stopColor={colors.gold} stopOpacity={0.45} />
                  <Stop offset="1" stopColor={colors.gold} stopOpacity={0} />
                </RadialGradient>
              </Defs>
              <Rect width="100%" height="100%" fill="url(#pool)" />
            </Svg>
          </Animated.View>

          <Animated.Image
            source={SAJID}
            resizeMode="contain"
            style={[
              st.figure,
              { width: 172 * scale, height: 105 * scale, left: 24 * scale, bottom: 14 * scale },
              { opacity: figure, transform: [{ translateY: figure.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) }, { scale: figure.interpolate({ inputRange: [0, 1], outputRange: [0.96, 1] }) }] },
            ]}
          />
        </View>

        <Animated.Text allowFontScaling={false} style={[st.name, up(name)]}>أوّاب</Animated.Text>
        <Animated.Text allowFontScaling={false} style={[st.verse, up(verse)]}>﴿ إِنَّهُ أَوَّابٌ ﴾</Animated.Text>
        <Animated.View style={[st.rule, { transform: [{ scaleX: rule }], opacity: rule }]} />
      </Pressable>
    </Animated.View>
  );
};

const st = StyleSheet.create({
  root: { backgroundColor: '#0c0805', zIndex: 100 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  floor: { position: 'absolute' },
  figure: { position: 'absolute' },
  name: { fontFamily: 'Amiri_700Bold', fontSize: 50, lineHeight: 70, color: colors.gold, marginTop: 10 },
  verse: { fontFamily: 'Amiri_400Regular', fontSize: 17, color: '#cfc4b2' },
  rule: { width: 130, height: 1, backgroundColor: colors.gold, marginTop: 18 },
});
