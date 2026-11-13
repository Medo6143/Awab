import React, { useEffect, useRef, useState } from 'react';
import { Animated, BackHandler, Easing, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';
import { Bell, Check, MapPin, Mic } from 'lucide-react-native';
import { colors, icon, radius, space, themed, type } from '../../../shared/theme/tokens';
import { useAccent } from '../../../shared/theme/useAccent';
import { PillButton } from '../ui/PillButton';
import { IconTile } from '../ui/IconTile';
import { KaabaIcon, MosqueIcon, QuranStandIcon, TasbihIcon } from '../icons/IslamicIcons';
import type { IconComponent } from '../icons/IslamicIcons';
import { useDependencies } from '../../providers/DependencyProvider';
import { finishOnboarding } from '../../store/slices/settingsSlice';

const SAJID = require('../../../../assets/images/sajid.webp');

const PAGES = [
  {
    title: 'أهلاً بيك في أوّاب',
    body: 'رفيقك في الصلاة والقرآن والذكر، كل يوم وبهدوء.',
  },
  {
    title: 'الأذان في وقته',
    body: 'محتاجين موقعك عشان نحسب مواقيت الصلاة والقبلة صح، والإشعارات عشان يوصلك الأذان والتذكيرات.',
  },
  {
    title: 'القرآن والذكر في جيبك',
    body: 'اقرأ المصحف، وسمّع بصوتك والتطبيق يتابعك، وخلّي الأذكار والتسبيح عادة كل يوم.',
  },
] as const;

/** First page: the prostrating figure from the logo in a soft ring of light. */
const WelcomeArt = () => (
  <View style={st.artWrap}>
    <View style={st.ringOuter} />
    <View style={st.ringInner} />
    <Image source={SAJID} resizeMode="contain" style={st.sajid} />
  </View>
);

/** Second page: the mosque in a large tile, with the clock of the next adhan around it. */
const AdhanArt = () => {
  const accent = useAccent();
  return (
    <View style={st.artWrap}>
      <View style={st.ringOuter} />
      <View style={[st.bigTile, { backgroundColor: accent.accentSoft }]}>
        <MosqueIcon color={accent.accent} size={72} strokeWidth={icon.stroke} />
      </View>
    </View>
  );
};

/** Third page: what the app holds, as a small grid of tiles. */
const FEATURES: { Icon: IconComponent; label: string }[] = [
  { Icon: QuranStandIcon, label: 'المصحف' },
  { Icon: Mic, label: 'التسميع بصوتك' },
  { Icon: TasbihIcon, label: 'الأذكار والسبحة' },
  { Icon: KaabaIcon, label: 'القبلة' },
];
const FeaturesArt = () => (
  <View style={st.grid}>
    {FEATURES.map(({ Icon, label }) => (
      <View key={label} style={st.feature}>
        <IconTile icon={Icon} size="lg" />
        <Text style={st.featureLabel}>{label}</Text>
      </View>
    ))}
  </View>
);

type Ask = 'idle' | 'busy' | 'yes' | 'no';

/** One permission on the second page: what it is for, and a button that asks for it. */
const PermissionRow = ({ Icon, title, hint, state, onAsk }: { Icon: IconComponent; title: string; hint: string; state: Ask; onAsk: () => void }) => {
  const accent = useAccent();
  return (
    <View style={st.permRow}>
      <IconTile icon={Icon} />
      <View style={st.permText}>
        <Text style={st.permTitle}>{title}</Text>
        <Text style={st.permHint}>{hint}</Text>
      </View>
      {state === 'yes' ? (
        <View style={[st.permDone, { backgroundColor: accent.accentSoft }]}>
          <Check color={accent.accent} size={icon.size.md} strokeWidth={icon.stroke} />
        </View>
      ) : (
        <PillButton size="sm" variant="ghost" label={state === 'no' ? 'تاني' : 'اسمح'} loading={state === 'busy'} onPress={onAsk} />
      )}
    </View>
  );
};

/**
 * Three welcome screens on a fresh install: what أوّاب is, the location and notification
 * permissions the adhan needs (asked here, with the reason in front of the user), and what is
 * inside. «تخطي» or the last button ends it; it is not shown again.
 */
export const OnboardingScreen = () => {
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();
  const accent = useAccent();
  const { location, notifications } = useDependencies();
  const [page, setPage] = useState(0);
  const [loc, setLoc] = useState<Ask>('idle');
  const [notif, setNotif] = useState<Ask>('idle');
  const enter = useRef(new Animated.Value(1)).current;
  const dir = useRef(1);

  const go = (to: number) => {
    dir.current = to > page ? 1 : -1;
    enter.setValue(0);
    setPage(to);
  };

  useEffect(() => {
    Animated.timing(enter, { toValue: 1, duration: 380, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, [page, enter]);

  // the system back button steps back through the pages first
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (page === 0) return false;
      go(page - 1);
      return true;
    });
    return () => sub.remove();
  });

  const ask = async (request: () => Promise<boolean>, set: (s: Ask) => void) => {
    set('busy');
    try { set((await request()) ? 'yes' : 'no'); } catch { set('no'); }
  };

  const done = () => dispatch(finishOnboarding());
  const last = page === PAGES.length - 1;
  const { title, body } = PAGES[page];
  // a new page slides in from the side it comes from (the next one from the left, in Arabic)
  const shift = enter.interpolate({ inputRange: [0, 1], outputRange: [-28 * dir.current, 0] });

  return (
    <View style={[st.root, { paddingTop: insets.top + space[2], paddingBottom: insets.bottom + space[5] }]}>
      <View style={st.top}>
        <View style={st.flex} />
        {!last ? (
          <Pressable onPress={done} hitSlop={12} accessibilityRole="button">
            <Text style={st.skip}>تخطي</Text>
          </Pressable>
        ) : null}
      </View>

      <Animated.View style={[st.content, { opacity: enter, transform: [{ translateX: shift }] }]}>
        <View style={st.art}>
          {page === 0 ? <WelcomeArt /> : page === 1 ? <AdhanArt /> : <FeaturesArt />}
        </View>
        <Text style={st.title}>{title}</Text>
        <Text style={st.body}>{body}</Text>
        {page === 1 ? (
          <View style={st.perms}>
            <PermissionRow Icon={MapPin} title="الموقع" hint="للمواقيت والقبلة بس" state={loc} onAsk={() => ask(() => location.requestPermission(), setLoc)} />
            <PermissionRow Icon={Bell} title="الإشعارات" hint="للأذان والتذكيرات" state={notif} onAsk={() => ask(() => notifications.request(), setNotif)} />
          </View>
        ) : null}
      </Animated.View>

      <View style={st.bottom}>
        <View style={st.dots}>
          {PAGES.map((_, i) => (
            <View key={i} style={[st.dot, i === page && [st.dotOn, { backgroundColor: accent.accent }]]} />
          ))}
        </View>
        <PillButton label={last ? 'يلا نبدأ' : 'التالي'} onPress={() => (last ? done() : go(page + 1))} style={st.next} />
      </View>
    </View>
  );
};

const st = themed(() => ({
  root: { ...StyleSheet.absoluteFillObject, backgroundColor: colors.bg, paddingHorizontal: space[6] },
  flex: { flex: 1 },
  top: { flexDirection: 'row', alignItems: 'center', minHeight: 32 },
  skip: { ...type.bodyMedium, color: colors.textMuted },
  content: { flex: 1, justifyContent: 'center' },
  art: { alignItems: 'center', justifyContent: 'center', marginBottom: space[8], minHeight: 220 },
  artWrap: { width: 220, height: 220, alignItems: 'center', justifyContent: 'center' },
  ringOuter: { position: 'absolute', width: 220, height: 220, borderRadius: 110, backgroundColor: colors.goldSoft, opacity: 0.5 },
  ringInner: { position: 'absolute', width: 160, height: 160, borderRadius: 80, backgroundColor: colors.goldSoft },
  sajid: { width: 180, height: 110 },
  bigTile: { width: 140, height: 140, borderRadius: 40, alignItems: 'center', justifyContent: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', width: 280, justifyContent: 'center' },
  feature: { width: 130, alignItems: 'center', marginHorizontal: space[1], marginBottom: space[5] },
  featureLabel: { ...type.label, color: colors.textSoft, marginTop: space[2] },
  title: { ...type.h1, color: colors.text },
  body: { ...type.body, color: colors.textMuted, marginTop: space[2] },
  perms: { marginTop: space[6] },
  permRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card,
    borderRadius: radius.card, padding: space[3], marginBottom: space[3],
  },
  permText: { flex: 1, marginHorizontal: space[3] },
  permTitle: { ...type.bodyMedium, color: colors.text },
  permHint: { ...type.caption, color: colors.textMuted },
  permDone: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  bottom: { alignItems: 'center' },
  dots: { flexDirection: 'row', marginBottom: space[5] },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.ring, marginHorizontal: 3 },
  dotOn: { width: 22 },
  next: { alignSelf: 'stretch' },
}));
