import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../../shared/theme/tokens';
import { Ayah, mushafAyahText, toAr } from '../quran/QuranConstants';
import { s as q } from '../quran/QuranStyles';
import { TasmeeHelp, firstLetter, splitWords } from './tasmeeText';

/** Gold mixed over the paper, opaque, clearly darker than the paperDeep strips. */
const CURRENT_STRIP = '#e0c069';

export type AyahState = 'outside' | 'hidden' | 'current' | 'revealed';

type Props = {
  ayahs: Ayah[];
  stateOf: (a: Ayah) => AyahState;
  /** Words of the current ayah shown by «تلميح». */
  shown: number;
  help: TasmeeHelp;
  /** global ayah number -> indexes of the words marked wrong */
  marked: Record<number, number[]>;
  onWordPress: (a: Ayah, word: number) => void;
};

/**
 * A mushaf page for tasmee. Ayahs keep their exact place in the flowing text: a hidden ayah
 * is the same words in transparent ink on a paper strip, so revealing it changes the colour
 * only and nothing on the page moves. Revealed words can be tapped to mark a mistake.
 */
export const TasmeePage = ({ ayahs, stateOf, shown, help, marked, onWordPress }: Props) => {
  const groups = useMemo(() => {
    const out: { surah: number; name: string; ayahs: Ayah[] }[] = [];
    for (const a of ayahs) {
      const last = out[out.length - 1];
      if (!last || last.surah !== a.surah.number) out.push({ surah: a.surah.number, name: a.surah.name, ayahs: [a] });
      else last.ayahs.push(a);
    }
    return out;
  }, [ayahs]);

  return (
    <View>
      {groups.map((g) => (
        <View key={g.surah} style={q.surahGroup}>
          {g.ayahs[0]?.numberInSurah === 1 ? (
            <View style={q.surahBand}>
              <View style={q.surahBandRule} />
              <View style={q.surahBandPill}><Text style={q.surahBandTitle}>{g.name}</Text></View>
              <View style={q.surahBandRule} />
            </View>
          ) : null}
          {g.surah !== 9 && g.ayahs[0]?.numberInSurah === 1 ? (
            <View style={q.basmalaContainer}><Text style={q.mushafBasmala}>بِسۡمِ ٱللَّهِ ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ</Text></View>
          ) : null}
          <Text style={q.textFlow}>
            {/* words are direct children of the flowing text: Android only routes a press to a
                nested Text one level down, so wrapping words per ayah made them untappable */}
            {g.ayahs.flatMap((a) => {
              const text = mushafAyahText(a);
              if (!text) return [];
              const state = stateOf(a);
              return [
                ...ayahWords(a.number, text, state, state === 'current' ? shown : 0, help, marked[a.number], (w) => onWordPress(a, w)),
                ' ',
                <Text key={`${a.number}-end`} style={[q.ayaEnd, state === 'outside' && st.faded]}>{'۝' + toAr(a.numberInSurah)}</Text>,
                ' ',
              ];
            })}
          </Text>
        </View>
      ))}
    </View>
  );
};

const ayahWords = (
  n: number, text: string, state: AyahState, shown: number, help: TasmeeHelp, marked: number[] | undefined, onWordPress: (w: number) => void,
): React.ReactNode[] => {
  if (state === 'outside') return [<Text key={n} style={st.faded}>{text}</Text>];
  const words = splitWords(text);
  const gap = (i: number) => (i < words.length - 1 ? ' ' : '');
  if (state === 'revealed') {
    // the space after a word is part of its tap target, so a tap between two words still lands
    return words.map((w, i) => (
      <Text key={`${n}-${i}`} onPress={() => onWordPress(i)} suppressHighlighting>
        <Text style={marked?.includes(i) ? st.mistake : undefined}>{w}</Text>{gap(i)}
      </Text>
    ));
  }
  // hidden / current: the words drawn in the strip's colour on the strip
  const strip = state === 'current' ? st.current : st.hidden;
  return words.map((w, i) => {
    const key = `${n}-${i}`;
    // words already said (voice) or given as a hint; a voice mistake shows before the ayah ends
    if (i < shown || (help === 'firstWord' && i === 0)) return <Text key={key} style={strip}><Text style={marked?.includes(i) ? st.mistake : st.hint}>{w}</Text>{gap(i)}</Text>;
    if (help === 'firstLetter') {
      const head = firstLetter(w);
      return <Text key={key} style={strip}><Text style={st.hint}>{head}</Text>{w.slice(head.length)}{gap(i)}</Text>;
    }
    return <Text key={key} style={strip}>{w}{gap(i)}</Text>;
  });
};

const st = StyleSheet.create({
  // opacity does not apply to nested Text on Android: fade with the colour instead
  faded: { color: 'rgba(39,25,0,0.32)' },
  // Android ignores a transparent colour on nested Text, so the ink takes the strip's own
  // colour instead. The current strip is opaque gold mixed over the paper for the same reason.
  hidden: { color: colors.paperDeep, backgroundColor: colors.paperDeep },
  current: { color: CURRENT_STRIP, backgroundColor: CURRENT_STRIP },
  hint: { color: colors.paperInk },
  mistake: { color: colors.danger, backgroundColor: colors.dangerSoft, textDecorationLine: 'underline' },
});
