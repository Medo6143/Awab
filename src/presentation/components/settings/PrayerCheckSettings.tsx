import React from 'react';
import { Text, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { CirclePause, ListChecks } from 'lucide-react-native';
import { RootState } from '../../store';
import { setPrayerCheck } from '../../store/slices/settingsSlice';
import { Chip } from '../ui';
import { ItemRow, SettingSection } from './SettingsComponents';
import { s } from './SettingsStyles';
import { space, type, colors, themed } from '../../../shared/theme/tokens';
import { toAr } from '../../../shared/utils/format';
import { DEFAULT_PRAYER_CHECK, EXCUSED_DAYS, PRAYER_CHECK_DELAYS, isExcused } from '../../../domain/entities/prayerCheck';

const DAY_MS = 24 * 60 * 60 * 1000;

/** «صليت؟» after the adhan: on/off, how long after, and the «معذورة» pause. */
export const PrayerCheckSettings = () => {
  const dispatch = useDispatch();
  const settings = { ...DEFAULT_PRAYER_CHECK, ...useSelector((st: RootState) => st.settings.prayerCheck) };
  const excused = isExcused(settings, Date.now());
  const until = settings.excusedUntil ? new Date(settings.excusedUntil) : null;

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
}));
