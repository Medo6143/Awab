import React from 'react';
import { Alert, Text, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { CirclePause, Eye, ListChecks } from 'lucide-react-native';
import { RootState } from '../../store';
import { setPrayerCheck } from '../../store/slices/settingsSlice';
import { Chip, PillButton } from '../ui';
import { ItemRow, SettingSection } from './SettingsComponents';
import { s } from './SettingsStyles';
import { space, type, colors, icon, themed } from '../../../shared/theme/tokens';
import { toAr } from '../../../shared/utils/format';
import { DEFAULT_PRAYER_CHECK, EXCUSED_DAYS, PRAYER_CHECK_DELAYS, isExcused, prayerCheckCopy } from '../../../domain/entities/prayerCheck';
import { useDependencies } from '../../providers/DependencyProvider';
import { useAccent } from '../../../shared/theme/useAccent';

const DAY_MS = 24 * 60 * 60 * 1000;

/** «صليت؟» after the adhan: on/off, how long after, and the «معذورة» pause. */
export const PrayerCheckSettings = () => {
  const dispatch = useDispatch();
  const settings = { ...DEFAULT_PRAYER_CHECK, ...useSelector((st: RootState) => st.settings.prayerCheck) };
  const excused = isExcused(settings, Date.now());
  const until = settings.excusedUntil ? new Date(settings.excusedUntil) : null;
  const { prayerChecks } = useDependencies();
  const accent = useAccent();
  const tryIt = async () => {
    const shown = await prayerChecks.preview(prayerCheckCopy('الظهر'));
    if (!shown) Alert.alert('محتاج إذن الظهور فوق التطبيقات', 'عشان السؤال يظهر فوق الشاشة، اسمح لأوّاب «بالظهور فوق التطبيقات» من إعدادات الموبايل. من غيره هيجيلك كإشعار.');
  };

  return (
    <SettingSection title="«صليت؟» بعد الأذان">
      <ItemRow
        first
        icon={ListChecks}
        label="اسألني «صليت؟» بعد الأذان"
        sub="وعلّم الصلاة من الإشعار من غير ما تفتح التطبيق"
        value={settings.enabled}
        // turning it on here also counts as the answer to the one-time question
        onValueChange={() => dispatch(setPrayerCheck({ enabled: !settings.enabled, asked: true }))}
      />
      {settings.enabled ? (
        <>
          <View style={s.itemDivider} />
          <View style={st.delayBlock}>
            <Text style={st.delayLabel}>بعد الأذان بـ</Text>
            <View style={st.chips}>
              {PRAYER_CHECK_DELAYS.map((d) => (
                <Chip
                  key={d}
                  size="sm"
                  label={`${toAr(d)} دقيقة`}
                  selected={settings.delayMinutes === d}
                  onPress={() => dispatch(setPrayerCheck({ delayMinutes: d }))}
                  style={st.chip}
                />
              ))}
            </View>
          </View>
          <ItemRow
            icon={CirclePause}
            label="معذورة"
            sub={excused && until
              ? `السؤال واقف لحد ${toAr(`${until.getDate()}/${until.getMonth() + 1}`)}، وبيرجع لوحده`
              : `يوقف السؤال، ويرجع لوحده بعد ${toAr(EXCUSED_DAYS)} أيام`}
            value={excused}
            onValueChange={() => dispatch(setPrayerCheck({ excusedUntil: excused ? null : Date.now() + EXCUSED_DAYS * DAY_MS }))}
          />
          <View style={s.itemDivider} />
          <View style={st.delayBlock}>
            <Text style={st.delayLabel}>السؤال بيظهر فوق الشاشة وإنت شغال على الموبايل، ولو الشاشة مقفولة بيجيلك كإشعار</Text>
            <PillButton label="جرّب السؤال" variant="ghost" size="sm" icon={<Eye size={icon.size.sm} color={accent.accentText} strokeWidth={icon.stroke} />} onPress={tryIt} style={st.tryBtn} />
          </View>
        </>
      ) : null}
    </SettingSection>
  );
};

const st = themed(() => ({
  delayBlock: { paddingHorizontal: space[4], paddingVertical: space[3] },
  delayLabel: { ...type.caption, color: colors.textMuted, marginBottom: space[2] },
  chips: { flexDirection: 'row', flexWrap: 'wrap' },
  chip: { marginEnd: space[2], marginBottom: space[1] },
  tryBtn: { alignSelf: 'flex-start' },
}));
