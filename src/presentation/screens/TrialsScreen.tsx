import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { ScreenProps } from '../navigation/types';
import { Screen, ScreenHeader } from '../components/ui';
import { HadithCard, SectionHeading, VerseCard } from '../components/guidance/GuidanceBlocks';
import { useDependencies } from '../providers/DependencyProvider';
import { useAudio } from '../hooks/useAudio';
import { TRIAL_ACTIONS, TRIAL_WISDOM, TrialSection } from '../../domain/entities/trials';
import type { VerseRef } from '../../domain/entities/guidance';
import { SURAH_NAMES } from '../../shared/constants/surahs';
import { colors, icon, radius, space, themed, type } from '../../shared/theme/tokens';
import { useAccent } from '../../shared/theme/useAccent';
import { toAr } from '../../shared/utils/format';

/**
 * «الابتلاءات»: why a person is tested, the wisdom in it, and what to do when it comes. Each part
 * is a short word in plain Arabic with its verses (from the mushaf) and authentic hadiths (from
 * the hadith library; a tap opens the full hadith with its explanation).
 */
const TrialsScreen = ({ navigation }: Pick<ScreenProps, 'navigation'>) => {
  const { hadithLibrary } = useDependencies();
  const { playAyah, playSequence } = useAudio();
  const accent = useAccent();

  const listen = (r: VerseRef) => {
    const to = r.to ?? r.from;
    if (to === r.from) playAyah(r.surah, r.from, SURAH_NAMES[r.surah - 1]);
    else playSequence(Array.from({ length: to - r.from + 1 }, (_, i) => ({ surahId: r.surah, ayahNumber: r.from + i })), `سورة ${SURAH_NAMES[r.surah - 1]}`);
  };

  const Part = ({ part, n }: { part: TrialSection; n: number }) => {
    const hadiths = part.hadithIds.map((id) => hadithLibrary.entry(id)).filter((h) => !!h);
    return (
      <View style={st.part}>
        <View style={st.partHead}>
          <View style={[st.num, { backgroundColor: accent.accentSoft }]}><Text style={[st.numText, { color: accent.accent }]}>{toAr(n)}</Text></View>
          <Text style={st.partTitle}>{part.title}</Text>
        </View>
        <Text style={st.body}>{part.body}</Text>
        {part.verses.map((r) => <VerseCard key={`${r.surah}:${r.from}`} verse={r} onListen={() => listen(r)} />)}
        {hadiths.map((h) => (
          <TouchableOpacity key={h!.id} activeOpacity={0.85} onPress={() => navigation.navigate('الحديث', { id: h!.id })} accessibilityRole="button">
            <HadithCard hadith={{ text: h!.title.trim(), source: `${h!.attribution} · ${h!.grade}` }} />
            <View style={st.open}>
              <Text style={[st.openText, { color: accent.accent }]}>الحديث كامل وشرحه</Text>
              <ChevronLeft size={icon.size.sm} color={accent.accent} strokeWidth={icon.stroke} />
            </View>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <Screen scroll header={<ScreenHeader title="الابتلاءات" subtitle="ليه بنتبلي، والحكمة، ونعمل إيه" onBack={() => navigation.goBack()} />}>
      <Text style={st.lead}>
        لو انت في ضيق دلوقتي: انت مش لوحدك، ومش منسي. الصفحة دي بتقولك ليه ربنا بيبتلي عباده، وإيه الخير اللي ممكن يكون مستخبي في اللي انت فيه.
      </Text>

      <SectionHeading title="ليه الابتلاء؟" sub="الحكمة من ورا اللي بيحصل" />
      {TRIAL_WISDOM.map((p, i) => <Part key={p.id} part={p} n={i + 1} />)}

      <SectionHeading title="تعمل إيه وقت البلاء؟" sub="من سنة النبي ﷺ" />
      {TRIAL_ACTIONS.map((p, i) => <Part key={p.id} part={p} n={i + 1} />)}

      <View style={st.help}>
        <Text style={st.helpText}>
          الصبر مش معناه إنك تشيل لوحدك. لو الحزن أو الضيق طوّل وبقى تقيل عليك، اتكلم مع حد بتثق فيه أو مع متخصص؛ طلب المساعدة أخذ بالأسباب، والنبي ﷺ أمرنا نتداوى.
        </Text>
      </View>
    </Screen>
  );
};

const st = themed(() => ({
  lead: { ...type.body, color: colors.textSoft, marginBottom: space[2] },
  part: { marginBottom: space[5] },
  partHead: { flexDirection: 'row', alignItems: 'center', marginBottom: space[2] },
  num: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  numText: { ...type.label },
  partTitle: { ...type.h2, color: colors.text, marginStart: space[3], flex: 1 },
  body: { ...type.body, color: colors.textSoft, marginBottom: space[3] },
  open: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', marginTop: -space[2], marginBottom: space[3], paddingHorizontal: space[2] },
  openText: { ...type.label, marginEnd: space[1] },
  help: { backgroundColor: colors.surface, borderRadius: radius.card, padding: space[4], marginTop: space[2], marginBottom: space[6] },
  helpText: { ...type.body, color: colors.textMuted },
}));

export default TrialsScreen;
