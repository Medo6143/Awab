import React from 'react';
import { Linking, StyleSheet, Text, View } from 'react-native';
import { BellRing, Database, ExternalLink, Globe, MapPin, Mic, ShieldCheck, Trash2 } from 'lucide-react-native';
import { ScreenProps } from '../navigation/types';
import { PillButton, Screen, ScreenHeader } from '../components/ui';

/** The full policy, the same page the Play listing links to. */
const POLICY_URL = 'https://owwab.vercel.app/privacy.html';
import { colors, icon, radius, space, type, themed } from '../../shared/theme/tokens';

type Section = { icon: typeof ShieldCheck; title: string; body: string[] };

/**
 * What the app does with data, written from what the code actually does: no accounts,
 * no analytics, everything stored on the device; the only things sent out are the
 * requests each feature needs (listed with the service they go to).
 */
const SECTIONS: Section[] = [
  {
    icon: ShieldCheck,
    title: 'باختصار',
    body: [
      'لا يحتاج أوّاب إلى حساب أو تسجيل، ولا يجمع اسمك أو بريدك أو رقمك.',
      'لا يحتوي التطبيق على إعلانات ولا أدوات تتبّع أو تحليلات.',
    ],
  },
  {
    icon: Database,
    title: 'ما يُحفظ على جهازك فقط',
    body: [
      'إعداداتك، وتقدّمك في الختمة والحفظ، وعدّاد المسبحة، والأذكار والعبادات، والأدعية الشخصية، والأحاديث والآيات المحفوظة.',
      'هذه البيانات تبقى على هاتفك ولا تُرسل إلى أي خادم.',
    ],
  },
  {
    icon: MapPin,
    title: 'الموقع',
    body: [
      'يُستخدم موقعك أثناء استخدام التطبيق فقط، لمواقيت الصلاة واتجاه القبلة وأقرب مسجد.',
      'تُرسل الإحداثيات إلى خدمة مواقيت الصلاة (aladhan.com)، ويحدد نظام الهاتف اسم الدولة لاختيار طريقة الحساب المناسبة.',
      'زر «أقرب مسجد» يفتح خرائط جوجل خارج التطبيق على المساجد حولك، وموقعك في الرابط، فقط عند الضغط عليه.',
      'يمكنك إيقاف «مواقيت الصلاة حسب الموقع» من الإعدادات في أي وقت.',
    ],
  },
  {
    icon: Mic,
    title: 'الميكروفون',
    body: [
      'يُطلب فقط عند تشغيل التسميع بالصوت، ليسمع تلاوتك ويقارنها بالآيات.',
      'يحدث ذلك كله على هاتفك؛ لا يُسجَّل صوتك ولا يُحفظ ولا يُرسل إلى أي جهة.',
    ],
  },
  {
    icon: Globe,
    title: 'الخدمات التي يتصل بها التطبيق',
    body: [
      'نص المصحف: alquran.cloud',
      'التفسير: quran.com',
      'الأحاديث وشرحها: hadeethenc.com',
      'التلاوات الصوتية: mp3quran.net و everyayah.com و qurancdn.com',
      'نموذج التسميع بالصوت (مرة واحدة): github.com',
      'هذه الطلبات تجلب المحتوى فقط ولا تتضمن أي بيانات شخصية، وكثير من المحتوى يُحفظ بعدها ليعمل دون إنترنت.',
    ],
  },
  {
    icon: BellRing,
    title: 'الأذونات ولماذا نطلبها',
    body: [
      'الإشعارات والمنبّهات الدقيقة: لرفع الأذان والتذكيرات في وقتها.',
      'الظهور على شاشة القفل وفوق التطبيقات: لتظهر شاشة الأذان كالمنبّه، وللمسبحة العائمة.',
      'الاستثناء من توفير البطارية (اختياري): حتى لا يوقف النظام الأذان أثناء النوم.',
      'الموقع والميكروفون: كما في الأقسام السابقة.',
      'حفظ الصور: لحفظ صور المشاركة في المعرض فقط، والتطبيق لا يقرأ صورك.',
    ],
  },
  {
    icon: Trash2,
    title: 'حذف بياناتك',
    body: ['لأن بياناتك كلها على جهازك، يكفي مسح بيانات التطبيق من إعدادات الهاتف أو حذفه لإزالتها تمامًا.'],
  },
];

const PrivacyScreen = ({ navigation }: Pick<ScreenProps, 'navigation'>) => (
  <Screen scroll header={<ScreenHeader title="الخصوصية" subtitle="بياناتك ملكك" onBack={() => navigation.goBack()} />}>
    {SECTIONS.map((sec) => {
      const Icon = sec.icon;
      return (
        <View key={sec.title} style={st.card}>
          <View style={st.head}>
            <View style={st.iconWrap}><Icon size={icon.size.md} color={colors.gold} strokeWidth={icon.stroke} /></View>
            <Text style={st.title}>{sec.title}</Text>
          </View>
          {sec.body.map((p) => <Text key={p} style={st.body}>{p}</Text>)}
        </View>
      );
    })}
    <PillButton
      label="سياسة الخصوصية كاملة"
      variant="ghost"
      icon={<ExternalLink size={icon.size.sm} color={colors.goldText} strokeWidth={icon.stroke} />}
      onPress={() => Linking.openURL(POLICY_URL).catch(() => {})}
      style={{ marginBottom: space[4] }}
    />
  </Screen>
);

const st = themed(() => ({
  card: { backgroundColor: colors.surface, borderRadius: radius.card, padding: space[4], marginBottom: space[3] },
  head: { flexDirection: 'row', alignItems: 'center', gap: space[3], marginBottom: space[2] },
  iconWrap: { width: 38, height: 38, borderRadius: radius.tile, backgroundColor: colors.goldSoft, alignItems: 'center', justifyContent: 'center' },
  title: { ...type.bodyMedium, fontFamily: 'Tajawal_700Bold', color: colors.text, flex: 1 },
  body: { ...type.body, color: colors.textSoft, lineHeight: 25, marginTop: space[1] },
}));

export default PrivacyScreen;
