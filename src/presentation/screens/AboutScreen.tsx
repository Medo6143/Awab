import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import Constants from 'expo-constants';
import { ScreenProps } from '../navigation/types';
import { Screen, ScreenHeader } from '../components/ui';
import { toAr } from '../../shared/utils/format';
import { colors, radius, space, type } from '../../shared/theme/tokens';

const LOGO = require('../../../assets/icon.png');

const FEATURES = [
  'مواقيت الصلاة والأذان كالمنبّه، مع اتجاه القبلة',
  'المصحف الشريف مع التفسير والتلاوة والبحث في الآيات',
  'رحلة ختم القرآن وحفظه، وسجل الختمات',
  'الأذكار والأدعية والمسبحة والمسبحة العائمة',
  'مكتبة الأحاديث الصحيحة مع شرحها',
  'رسائل من القرآن تواسيك فيما تمرّ به',
];

const SOURCES = [
  ['نص المصحف', 'alquran.cloud'],
  ['التفسير', 'quran.com (السعدي، ابن كثير، الطبري، القرطبي، الميسّر)'],
  ['الأحاديث وشرحها', 'موسوعة الأحاديث النبوية (hadeethenc.com)'],
  ['مراجعة الأحاديث', 'الدرر السنية (dorar.net)'],
  ['مواقيت الصلاة', 'aladhan.com'],
  ['التلاوات', 'mp3quran.net · everyayah.com'],
];

const AboutScreen = ({ navigation }: Pick<ScreenProps, 'navigation'>) => {
  const version = Constants.expoConfig?.version ?? '1.0.0';
  return (
    <Screen scroll header={<ScreenHeader title="عن التطبيق" onBack={() => navigation.goBack()} />}>
      <View style={st.hero}>
        <Image source={LOGO} style={st.logo} />
        <Text style={st.name}>أوّاب</Text>
        <Text style={st.verse}>﴿ إِنَّهُ أَوَّابٌ ﴾</Text>
        <Text style={st.version}>الإصدار {toAr(version)}</Text>
      </View>

      <Text style={st.lead}>رفيقك اليومي مع القرآن والصلاة والذكر. الأوّاب هو الرجّاع إلى الله، كثير التوبة والذكر.</Text>

      <Text style={st.heading}>ما يقدّمه أوّاب</Text>
      <View style={st.card}>
        {FEATURES.map((f) => (
          <View key={f} style={st.item}>
            <View style={st.dot} />
            <Text style={st.itemText}>{f}</Text>
          </View>
        ))}
      </View>

      <Text style={st.heading}>المصادر</Text>
      <View style={st.card}>
        {SOURCES.map(([k, v], i) => (
          <View key={k} style={[st.source, i > 0 && st.divider]}>
            <Text style={st.sourceKey}>{k}</Text>
            <Text style={st.sourceVal}>{v}</Text>
          </View>
        ))}
      </View>

      <Text style={st.footer}>الآيات من نص المصحف، والأحاديث صحيحة أو حسنة فقط. نسأل الله أن ينفع به.</Text>
    </Screen>
  );
};

const st = StyleSheet.create({
  hero: { alignItems: 'center', paddingVertical: space[4] },
  logo: { width: 96, height: 96, borderRadius: 24 },
  name: { fontFamily: 'Amiri_700Bold', fontSize: 40, lineHeight: 64, color: colors.gold, marginTop: space[2] },
  verse: { fontFamily: 'Amiri_400Regular', fontSize: 17, color: colors.textSoft },
  version: { ...type.caption, color: colors.textFaint, marginTop: space[2] },
  lead: { ...type.body, color: colors.textSoft, lineHeight: 26, textAlign: 'center', marginBottom: space[2] },
  heading: { ...type.h2, color: colors.text, marginTop: space[5], marginBottom: space[3] },
  card: { backgroundColor: colors.surface, borderRadius: radius.card, padding: space[4] },
  item: { flexDirection: 'row', alignItems: 'flex-start', gap: space[3], marginBottom: space[2] },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.gold, marginTop: 9 },
  itemText: { ...type.body, color: colors.textSoft, flex: 1, lineHeight: 25 },
  source: { paddingVertical: space[2] },
  divider: { borderTopWidth: 1, borderTopColor: colors.hairline },
  sourceKey: { ...type.label, color: colors.gold },
  sourceVal: { ...type.body, color: colors.textSoft, marginTop: 2 },
  footer: { ...type.caption, color: colors.textFaint, textAlign: 'center', marginTop: space[6] },
});

export default AboutScreen;
