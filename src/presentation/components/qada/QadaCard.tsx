import React, { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Check, Minus, Plus } from 'lucide-react-native';
import { RootState } from '../../store';
import { addOwed, madeUpOne, removeOwed } from '../../store/slices/qadaSlice';
import { PRAYER_IDS } from '../../../domain/entities/notifications';
import { PRAYER_NAMES_AR } from '../../../domain/entities/reminders';
import { colors, icon, radius, space, themed, type } from '../../../shared/theme/tokens';
import { useAccent } from '../../../shared/theme/useAccent';
import { toAr } from '../../../shared/utils/format';

/**
 * Missed prayers to make up, quietly: how many of each are left, «قضيت واحدة» to tick one off,
 * and + to add more (or a whole day at once). Nobody else sees it.
 */
export const QadaCard = () => {
  const accent = useAccent();
  const dispatch = useDispatch();
  const owed = useSelector((s: RootState) => s.qada?.owed);
  const madeUp = useSelector((s: RootState) => s.qada?.madeUp ?? 0);
  const total = PRAYER_IDS.reduce((n, id) => n + (owed?.[id] ?? 0), 0);
  const [editing, setEditing] = useState(false);
  const open = editing || total > 0;

  if (!open) {
    return (
      <View style={st.card}>
        <Text style={st.lead}>لو عليك صلوات فايتة، سجّلها هنا وعلّم عليها وانت بتقضيها. محدش بيشوفها غيرك.</Text>
        <TouchableOpacity onPress={() => setEditing(true)} style={[st.pill, { backgroundColor: accent.accentSoft }]} accessibilityRole="button">
          <Plus size={icon.size.sm} color={accent.accent} strokeWidth={icon.stroke} />
          <Text style={[st.pillText, { color: accent.accent }]}>سجّل صلوات فايتة</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={st.card}>
      <View style={st.head}>
        <View style={st.flex}>
          <Text style={st.total}>{total ? `فاضل ${toAr(total)} صلاة` : 'مفيش صلوات فايتة'}</Text>
          {madeUp > 0 ? <Text style={st.sub}>قضيت {toAr(madeUp)} لحد دلوقتي، ربنا يتقبّل</Text> : null}
        </View>
        <TouchableOpacity onPress={() => dispatch(addOwed({}))} style={[st.pill, { backgroundColor: accent.accentSoft }]} accessibilityRole="button" accessibilityLabel="زوّد يوم كامل">
          <Plus size={icon.size.sm} color={accent.accent} strokeWidth={icon.stroke} />
          <Text style={[st.pillText, { color: accent.accent }]}>يوم كامل</Text>
        </TouchableOpacity>
      </View>

      {PRAYER_IDS.map((id) => {
        const n = owed?.[id] ?? 0;
        return (
          <View key={id} style={st.row}>
            <Text style={st.name}>{PRAYER_NAMES_AR[id]}</Text>
            <Text style={[st.count, !n && st.zero]}>{toAr(n)}</Text>
            <View style={st.flex} />
            <TouchableOpacity
              onPress={() => dispatch(madeUpOne(id))}
              disabled={!n}
              style={[st.done, { backgroundColor: n ? accent.accent : colors.surfaceRaised }]}
              accessibilityRole="button"
              accessibilityLabel={`قضيت ${PRAYER_NAMES_AR[id]}`}
            >
              <Check size={icon.size.sm} color={n ? accent.onAccent : colors.textFaint} strokeWidth={icon.stroke} />
              <Text style={[st.doneText, { color: n ? accent.onAccent : colors.textFaint }]}>قضيت</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => dispatch(removeOwed(id))} disabled={!n} style={[st.round, !n && st.off]} accessibilityLabel={`شيل واحدة من ${PRAYER_NAMES_AR[id]}`}>
              <Minus size={icon.size.sm} color={colors.textMuted} strokeWidth={icon.stroke} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => dispatch(addOwed({ prayer: id }))} style={st.round} accessibilityLabel={`زوّد ${PRAYER_NAMES_AR[id]}`}>
              <Plus size={icon.size.sm} color={colors.textMuted} strokeWidth={icon.stroke} />
            </TouchableOpacity>
          </View>
        );
      })}
    </View>
  );
};

const st = themed(() => ({
  card: { backgroundColor: colors.surface, borderRadius: radius.card, padding: space[4], marginBottom: space[4] },
  flex: { flex: 1 },
  lead: { ...type.body, color: colors.textSoft, marginBottom: space[3] },
  pill: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', height: 34, paddingHorizontal: space[3], borderRadius: radius.pill },
  pillText: { ...type.label, marginStart: space[1] },
  head: { flexDirection: 'row', alignItems: 'center', marginBottom: space[2] },
  total: { ...type.h2, color: colors.text },
  sub: { ...type.caption, color: colors.textMuted },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: space[2] },
  name: { ...type.bodyMedium, color: colors.text, width: 64 },
  count: { ...type.h2, color: colors.text, minWidth: 28 },
  zero: { color: colors.textFaint },
  done: { flexDirection: 'row', alignItems: 'center', height: 34, paddingHorizontal: space[3], borderRadius: radius.pill },
  doneText: { ...type.label, marginStart: space[1] },
  round: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceRaised, marginStart: space[2] },
  off: { opacity: 0.4 },
}));
