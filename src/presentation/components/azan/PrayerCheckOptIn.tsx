import React, { useEffect, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { ListChecks } from 'lucide-react-native';
import { RootState } from '../../store';
import { setPrayerCheck } from '../../store/slices/settingsSlice';
import { PillButton, Sheet } from '../ui';
import { colors, icon, space, type, themed } from '../../../shared/theme/tokens';
import { useAccent } from '../../../shared/theme/useAccent';

/** Lets the adhan screen finish closing before the sheet slides up. */
const AFTER_ADHAN_MS = 800;

/**
 * The one-time question for «صليت؟», asked right after an adhan screen closes, when the
 * question makes the most sense. «أيوه» turns it on, «لأ، شكرًا» never asks again; closing
 * the sheet without answering asks again after the next adhan.
 */
export const PrayerCheckOptIn = () => {
  const accent = useAccent();
  const dispatch = useDispatch();
  const asked = useSelector((s: RootState) => s.settings.prayerCheck?.asked ?? false);
  const adhanShowing = useSelector((s: RootState) => s.ui.azanModal.visible);
  const wasShowing = useRef(adhanShowing);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const closed = wasShowing.current && !adhanShowing;
    wasShowing.current = adhanShowing;
    if (!closed || asked) return;
    const t = setTimeout(() => setVisible(true), AFTER_ADHAN_MS);
    return () => clearTimeout(t);
  }, [adhanShowing, asked]);

  const answer = (enabled: boolean) => {
    setVisible(false);
    dispatch(setPrayerCheck(enabled ? { enabled: true, asked: true } : { asked: true }));
  };

  return (
    <Sheet visible={visible} title="تحب أسألك بعد كل صلاة؟" onClose={() => setVisible(false)}>
      <View style={st.iconWrap}>
        <ListChecks size={icon.size.xl} color={accent.accentText} strokeWidth={icon.stroke} />
      </View>
      <Text style={st.body}>
        بعد الأذان بنص ساعة هيوصلك سؤال «صليت؟» وتعلّم الصلاة بضغطة، من غير ما تفتح التطبيق.
      </Text>
      <Text style={st.hint}>تقدر تقفلها أو تغيّر الوقت من الإعدادات في أي وقت.</Text>
      <PillButton label="أيوه" onPress={() => answer(true)} style={st.primary} />
      <PillButton label="لأ، شكرًا" variant="ghost" onPress={() => answer(false)} />
    </Sheet>
  );
};

const st = themed(() => ({
  iconWrap: { alignItems: 'center', marginBottom: space[3] },
  body: { ...type.body, color: colors.text, marginBottom: space[2] },
  hint: { ...type.caption, color: colors.textMuted, marginBottom: space[5] },
  primary: { marginBottom: space[2] },
}));
