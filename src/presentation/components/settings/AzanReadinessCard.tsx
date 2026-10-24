import React, { useCallback, useEffect, useState } from 'react';
import { AppState, Platform, Text, View } from 'react-native';
import { CircleCheck, CircleAlert, CircleHelp, ShieldCheck } from 'lucide-react-native';
import { s } from './SettingsStyles';
import { Card, PillButton, IconTile } from '../ui';
import { colors, icon } from '../../../shared/theme/tokens';
import { useAzanPermissions, ReadinessItem } from '../../../shared/hooks/useAzanPermissions';
import { toAr } from '../../../shared/utils/format';

/**
 * "جاهزية الأذان": one row per thing the adhan needs on this phone, each with a fix
 * button that opens the exact system page. Re-checks whenever the app comes back
 * to the foreground (the user returns from system settings).
 */
export const AzanReadinessCard = () => {
  const { getReadiness } = useAzanPermissions();
  const [items, setItems] = useState<ReadinessItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  const refresh = useCallback(() => {
    getReadiness().then((list) => { setItems(list); setLoaded(true); }).catch(() => setLoaded(true));
  }, []);

  useEffect(() => {
    refresh();
    const sub = AppState.addEventListener('change', (st) => { if (st === 'active') refresh(); });
    return () => sub.remove();
  }, [refresh]);

  if (Platform.OS !== 'android' || !loaded) return null;

  const missing = items.filter((i) => i.status === 'missing').length;
  const summary = missing === 0 ? 'كل الأذونات المطلوبة متاحة، الأذان جاهز.' : `${toAr(missing)} ${missing === 1 ? 'إذن ناقص' : 'أذونات ناقصة'}، أصلحها ليعمل الأذان في وقته.`;

  return (
    <Card padding={4}>
      <View style={s.labelRow}>
        <ShieldCheck size={icon.size.md} color={missing === 0 ? colors.success : colors.goldText} strokeWidth={icon.stroke} />
        <Text style={[s.subLabel, { color: colors.text }]}>جاهزية الأذان</Text>
      </View>
      <Text style={s.readinessSummary}>{summary}</Text>

      {items.map((item, idx) => {
        const Icon = item.status === 'ok' ? CircleCheck : item.status === 'missing' ? CircleAlert : CircleHelp;
        const tone = item.status === 'ok' ? 'success' : item.status === 'missing' ? 'danger' : 'muted';
        return (
          <View key={item.id}>
            {idx > 0 ? <View style={s.itemDivider} /> : null}
            <View style={s.readinessRow}>
              {item.status !== 'ok' && item.fix ? (
                <PillButton label={item.status === 'missing' ? 'إصلاح' : 'فتح'} size="sm" variant={item.status === 'missing' ? 'primary' : 'ghost'} onPress={() => { item.fix?.(); }} />
              ) : null}
              <View style={s.readinessText}>
                <Text style={s.readinessTitle}>{item.label}</Text>
                <Text style={s.readinessHint}>{item.hint}</Text>
              </View>
              <IconTile icon={Icon} tone={tone as any} />
            </View>
          </View>
        );
      })}
    </Card>
  );
};
