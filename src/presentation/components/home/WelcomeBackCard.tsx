import React, { useMemo, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useSelector } from 'react-redux';
import { Sunrise, X } from 'lucide-react-native';
import { RootState } from '../../store';
import { getLocalToday } from '../../store/slices/statsSlice';
import { journeyOf } from '../../../domain/services/returns';
import { colors, icon, radius, space, themed, type } from '../../../shared/theme/tokens';
import { useAccent } from '../../../shared/theme/useAccent';
import { toAr } from '../../../shared/utils/format';

/**
 * A warm word for someone coming back: after a day or more with nothing logged, an invitation
 * to start small; once they log something on that day, «أهلاً بيك تاني». Never a reproach.
 * Closing it hides it until the app is opened again.
 */
export const WelcomeBackCard = ({ onStart }: { onStart: () => void }) => {
  const accent = useAccent();
  const [closed, setClosed] = useState(false);
  const records = useSelector((s: RootState) => s.stats.dailyRecords) || {};
  const today = getLocalToday();
  const journey = useMemo(
    () => journeyOf(Object.keys(records).filter((k) => /^\d{4}-\d{2}-\d{2}$/.test(k)), today),
    [records, today],
  );

  const away = Object.keys(records).length > 0 && journey.streak === 0 && journey.awayDays >= 1;
  if (closed || (!away && !journey.returnedToday)) return null;

  const title = away ? 'وحشتنا' : 'أهلاً بيك تاني';
  const body = away
    ? `${journey.awayDays > 1 ? `بقالك ${toAr(journey.awayDays)} أيام بعيد. ` : ''}ربنا بيفرح برجوع عبده، ابدأ بحاجة صغيرة: ركعتين أو صفحة أو تسبيحة.`
    : 'رجعتك النهارده اتحسبت، ربنا يثبّتك.';

  return (
    <View style={[st.card, { backgroundColor: accent.accentSoft }]}>
      <View style={[st.icon, { backgroundColor: accent.accent }]}>
        <Sunrise size={icon.size.md} color={accent.onAccent} strokeWidth={icon.stroke} />
      </View>
      <View style={st.text}>
        <Text style={st.title}>{title}</Text>
        <Text style={st.body}>{body}</Text>
        {away ? (
          <TouchableOpacity onPress={onStart} style={[st.btn, { backgroundColor: accent.accent }]} accessibilityRole="button">
            <Text style={[st.btnText, { color: accent.onAccent }]}>يلا نبدأ</Text>
          </TouchableOpacity>
        ) : null}
      </View>
      <TouchableOpacity onPress={() => setClosed(true)} hitSlop={10} accessibilityLabel="إخفاء">
        <X size={icon.size.sm} color={colors.textMuted} strokeWidth={icon.stroke} />
      </TouchableOpacity>
    </View>
  );
};

const st = themed(() => ({
  card: { flexDirection: 'row', alignItems: 'flex-start', borderRadius: radius.card, padding: space[4], marginBottom: space[4] },
  icon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  text: { flex: 1, marginHorizontal: space[3] },
  title: { ...type.h2, color: colors.text },
  body: { ...type.body, color: colors.textSoft, marginTop: 2 },
  btn: { alignSelf: 'flex-start', height: 36, paddingHorizontal: space[5], borderRadius: radius.pill, justifyContent: 'center', marginTop: space[3] },
  btnText: { ...type.label },
}));
