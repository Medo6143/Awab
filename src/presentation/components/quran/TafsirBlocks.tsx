import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, space } from '../../../shared/theme/tokens';
import { toAr } from '../../../shared/utils/format';
import { TafsirBlock, TafsirRun } from './tafsirParser';

type Variant = 'modern' | 'book' | 'simple';

/**
 * Tafsir as numbered sections instead of one wall of text. A section that opens with a
 * quoted ayah phrase shows that phrase as its heading, so each phrase sits with its own
 * explanation; lead-ins ("عن ابن عباس:") are bold and cross-references are small tags.
 */
export const TafsirBlocks = ({ blocks, fontSize, variant, sourceName }: { blocks: TafsirBlock[]; fontSize: number; variant: Variant; sourceName?: string }) => {
  if (!blocks.length) return null;

  return (
    <View>
      <View style={st.header}>
        <View style={st.headerBar} />
        <Text style={st.headerTitle}>{sourceName || 'التفسير'}</Text>
        {blocks.length > 1 ? <Text style={st.headerCount}>{toAr(blocks.length)} فقرات</Text> : null}
      </View>
      {blocks.map((b, i) => (
        <Section key={i} block={b} index={i} count={blocks.length} fontSize={fontSize} variant={variant} />
      ))}
    </View>
  );
};

const Section = ({ block, index, count, fontSize, variant }: { block: TafsirBlock; index: number; count: number; fontSize: number; variant: Variant }) => {
  // A section that opens with a quoted phrase (optionally after a short lead-in) gets it as a heading.
  let runs = block.runs;
  let heading: TafsirRun[] = [];
  const q = runs.findIndex((r) => r.kind === 'quran');
  if (q === 0 || (q === 1 && runs[0].kind === 'lead')) {
    heading = runs.slice(0, q + 1);
    runs = runs.slice(q + 1);
    if (runs[0]) runs = [{ ...runs[0], text: runs[0].text.replace(/^\s+/, '') }, ...runs.slice(1)];
  }
  const body = runs.filter((r) => r.text.trim().length);
  const lineHeight = Math.round(fontSize * 1.85);

  return (
    <View style={[st.section, variant === 'book' && st.sectionBook, variant === 'simple' && st.sectionSimple]}>
      {count > 1 ? (
        <View style={st.badge}><Text style={st.badgeText}>{toAr(index + 1)}</Text></View>
      ) : null}
      <View style={st.sectionBody}>
        {heading.length ? (
          <Text style={st.headingWrap}>
            {heading.map((r, i) =>
              r.kind === 'quran'
                ? <Text key={i} style={[st.quran, { fontSize: fontSize + 2, lineHeight: Math.round((fontSize + 2) * 1.9) }]}>{r.text.trim()}</Text>
                : <Text key={i} style={[st.lead, { fontSize }]}>{r.text.trim() + ' '}</Text>,
            )}
          </Text>
        ) : null}
        {body.length ? (
          <Text style={[st.text, variant === 'book' && st.textBook, { fontSize, lineHeight }]}>
            {body.map((r, i) => {
              if (r.kind === 'quran') return <Text key={i} style={st.quranInline}>{r.text}</Text>;
              if (r.kind === 'lead') return <Text key={i} style={st.lead}>{r.text}</Text>;
              if (r.kind === 'ref') return <Text key={i} style={[st.ref, { fontSize: Math.max(11, fontSize - 4) }]}>{' ' + r.text.replace(/\s+/g, ' ').trim() + ' '}</Text>;
              return <Text key={i}>{r.text}</Text>;
            })}
          </Text>
        ) : null}
      </View>
    </View>
  );
};

const st = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: space[3], marginBottom: space[4] },
  headerBar: { width: 5, height: 24, borderRadius: 3, backgroundColor: colors.gold },
  headerTitle: { fontFamily: 'Tajawal_700Bold', fontSize: 18, color: colors.paperInk, flex: 1 },
  headerCount: { fontFamily: 'Tajawal_500Medium', fontSize: 12, color: colors.paperMuted },

  section: { flexDirection: 'row', gap: space[3], backgroundColor: colors.paperCard, borderRadius: radius.card, padding: space[4], marginBottom: space[3], borderWidth: 1, borderColor: colors.paperBorder },
  sectionBook: { backgroundColor: colors.paperCardBook, borderRadius: radius.field },
  sectionSimple: { backgroundColor: 'transparent', borderWidth: 0, borderRadius: 0, paddingHorizontal: 0, borderBottomWidth: 1, borderBottomColor: colors.paperDivider },
  badge: { width: 26, height: 26, borderRadius: 13, backgroundColor: colors.paperDeep, alignItems: 'center', justifyContent: 'center', marginTop: 3 },
  badgeText: { fontFamily: 'Tajawal_700Bold', fontSize: 13, color: colors.paperInk },
  sectionBody: { flex: 1 },

  headingWrap: { marginBottom: space[2] },
  quran: { fontFamily: 'Amiri_700Bold', color: colors.paperQuote },
  quranInline: { fontFamily: 'Amiri_700Bold', color: colors.paperQuote },
  lead: { fontFamily: 'Tajawal_700Bold', color: colors.paperInk },
  ref: { fontFamily: 'Tajawal_500Medium', color: colors.paperMuted },
  text: { fontFamily: 'Tajawal_400Regular', color: colors.paperInk, textAlign: 'justify' },
  textBook: { fontFamily: 'Amiri_400Regular' },
});
