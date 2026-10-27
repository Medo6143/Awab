import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BellRing, Database, Globe, MapPin, ShieldCheck, Trash2 } from 'lucide-react-native';
import { ScreenProps } from '../navigation/types';
import { Screen, ScreenHeader } from '../components/ui';
import { colors, icon, radius, space, type } from '../../shared/theme/tokens';

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
      'يُستخدم موقعك لحساب مواقيت الصلاة واتجاه القبلة فقط.',
      'تُرسل الإحداثيات إلى خدمة مواقيت الصلاة (aladhan.com) لحساب مواقيت مدينتك، ويحدد نظام الهاتف اسم الدولة لاختيار طريقة الحساب المناسبة.',
      'يمكنك إيقاف «مواقيت الصلاة حسب الموقع» من الإعدادات في أي وقت.',
    ],
  },
  {
    icon: Globe,
    title: 'الخدمات التي يتصل بها التطبيق',
    body: [
      'نص المصحف: alquran.cloud',
      'التفسير: quran.com',
      'الأحاديث وشرحها: hadeethenc.com',
      'التلاوات الصوتية: mp3quran.net و everyayah.com',
      'هذه الطلبات تجلب المحتوى فقط ولا تتضمن أي بيانات شخصية، وكثير من المحتوى يُحفظ بعدها ليعمل دون إنترنت.',
    ],
  },
  {
    icon: BellRing,
    title: 'الأذونات ولماذا نطلبها',
    body: [
      'الإشعارات والمنبّهات الدقيقة: لرفع الأذان والتذكيرات في وقتها.',
      'الظهور على شاشة القفل وفوق التطبيقات: لتظهر شاشة الأذان كالمنبّه، وللمسبحة العائمة.',
      'الاستثناء من توفير البطارية: حتى لا يوقف النظام الأذان أثناء النوم.',
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
  </Screen>
);

const st = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.card, padding: space[4], marginBottom: space[3] },
  head: { flexDirection: 'row', alignItems: 'center', gap: space[3], marginBottom: space[2] },
  iconWrap: { width: 38, height: 38, borderRadius: radius.tile, backgroundColor: colors.goldSoft, alignItems: 'center', justifyContent: 'center' },
  title: { ...type.bodyMedium, fontFamily: 'Tajawal_700Bold', color: colors.text, flex: 1 },
  body: { ...type.body, color: colors.textSoft, lineHeight: 25, marginTop: space[1] },
});

export default PrivacyScreen;
