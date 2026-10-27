import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { ScreenProps } from '../navigation/types';
import { Screen, ScreenHeader } from '../components/ui';
import { HadithCard, SectionHeading, SupplicationCard, VerseCard } from '../components/guidance/GuidanceBlocks';
import { VIRTUES } from '../../domain/entities/virtues';
import { colors, space, type } from '../../shared/theme/tokens';

/** "فضل الدعاء" / "فضل الذكر": verses (from the Quran source) and verified hadiths. */
const VirtuesScreen = ({ navigation, route }: ScreenProps<'الفضائل'>) => {
  const topic = VIRTUES[route.params?.topic ?? 'dua'];
  return (
    <Screen scroll header={<ScreenHeader title={topic.title} subtitle={topic.subtitle} onBack={() => navigation.goBack()} />}>
      {topic.sections.map((sec) => (
        <React.Fragment key={sec.title}>
          <SectionHeading title={sec.title} sub={sec.sub} />
          {sec.intro ? <Text style={st.intro}>{sec.intro}</Text> : null}
          {sec.verses.map((v) => <VerseCard key={`${v.surah}:${v.from}`} verse={v} />)}
          {sec.hadiths.map((h) => <HadithCard key={h.source + h.text.slice(0, 12)} hadith={h} />)}
          {sec.duas?.map((d) => <SupplicationCard key={d.source + d.text.slice(0, 12)} dua={d} />)}
        </React.Fragment>
      ))}
      <Text style={st.note}>الآيات من نص المصحف، والأحاديث صحيحة أو حسنة مع مصادرها، روجعت على موسوعة الدرر السنية.</Text>
    </Screen>
  );
};

const st = StyleSheet.create({
  intro: { ...type.body, color: colors.textSoft, lineHeight: 26, marginBottom: space[3] },
  note: { ...type.caption, color: colors.textFaint, textAlign: 'center', marginTop: space[6] },
});

export default VirtuesScreen;
