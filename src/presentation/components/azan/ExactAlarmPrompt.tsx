import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { useSelector } from 'react-redux';
import { AlarmClock } from 'lucide-react-native';
import { RootState } from '../../store';
import { PillButton, Sheet } from '../ui';
import { colors, icon, space, type, themed } from '../../../shared/theme/tokens';
import { useAccent } from '../../../shared/theme/useAccent';

/** Waits this long after launch so the sheet does not land on top of the notification dialog. */
const SHOW_AFTER_MS = 3000;

/**
 * Asks once per app session for «المنبهات والتذكيرات» when the adhan is on but Android does not
 * allow exact alarms (a new install on Android 14+). Without it the adhan falls back to a plain
 * notification that Android may deliver late.
 */
export const ExactAlarmPrompt = ({ granted, onAllow }: { granted: boolean | null; onAllow: () => void }) => {
  const accent = useAccent();
  const enabled = useSelector((s: RootState) => s.settings.notificationsEnabled);
  const azanType = useSelector((s: RootState) => s.settings.azanSettings?.type ?? 'full');
  const [ready, setReady] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), SHOW_AFTER_MS);
    return () => clearTimeout(t);
  }, []);

  const visible = ready && !dismissed && granted === false && enabled && azanType !== 'none';
  const close = () => setDismissed(true);

  return (
    <Sheet visible={visible} title="عشان الأذان يرن في وقته" onClose={close}>
      <View style={st.iconWrap}>
        <AlarmClock size={icon.size.xl} color={accent.accentText} strokeWidth={icon.stroke} />
      </View>
      <Text style={st.body}>
        أندرويد محتاج إذن «المنبهات والتذكيرات» عشان أوّاب يرفع الأذان في الدقيقة بالظبط ويصحّي الموبايل حتى لو كان نايم.
      </Text>
      <Text style={st.hint}>من غيره هيوصلك إشعار عادي، وممكن يتأخر كام دقيقة.</Text>
      <PillButton label="فعّل المنبهات" onPress={() => { close(); onAllow(); }} style={st.primary} />
      <PillButton label="مش دلوقتي" variant="ghost" onPress={close} style={st.secondary} />
    </Sheet>
  );
};

const st = themed(() => ({
  iconWrap: { alignItems: 'center', marginBottom: space[3] },
  body: { ...type.body, color: colors.text, marginBottom: space[2] },
  hint: { ...type.caption, color: colors.textMuted, marginBottom: space[5] },
  primary: { marginBottom: space[2] },
  secondary: {},
}));
