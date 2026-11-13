import React from 'react';
import { ActivityIndicator, Alert, Text, TouchableOpacity, View } from 'react-native';
import { ArchiveRestore, FolderDown, Share2 } from 'lucide-react-native';
import { IconTile } from '../ui';
import type { IconComponent } from '../icons/IslamicIcons';
import { useBackup } from '../../hooks/useBackup';
import { colors, radius, space, themed, type } from '../../../shared/theme/tokens';
import { SettingSection } from './SettingsComponents';

const Row = ({ icon, label, sub, onPress, first, disabled }: { icon: IconComponent; label: string; sub: string; onPress: () => void; first?: boolean; disabled?: boolean }) => (
  <View>
    {!first ? <View style={st.divider} /> : null}
    <TouchableOpacity style={st.row} onPress={onPress} disabled={disabled} activeOpacity={0.7} accessibilityRole="button">
      <IconTile icon={icon} />
      <View style={st.text}>
        <Text style={st.label}>{label}</Text>
        <Text style={st.sub}>{sub}</Text>
      </View>
    </TouchableOpacity>
  </View>
);

const ask = (fileName: string) => new Promise<boolean>((resolve) => {
  Alert.alert(
    'ترجّع النسخة دي؟',
    `${fileName}\n\nاللي على الموبايل دلوقتي (الكاليندر والختمات والإعدادات) هيتبدّل باللي في النسخة.`,
    [
      { text: 'لأ', style: 'cancel', onPress: () => resolve(false) },
      { text: 'رجّعها', style: 'destructive', onPress: () => resolve(true) },
    ],
    { cancelable: true, onDismiss: () => resolve(false) },
  );
});

/**
 * Backup without an account: a file with everything (calendar, khatmas, tasbeeh, reminders,
 * settings) saved to a folder or shared to Drive, and restored from a folder.
 */
export const BackupSettings = () => {
  const { busy, result, save, share, restore } = useBackup();
  return (
    <>
      <SettingSection title="النسخة الاحتياطية">
        <Row first icon={FolderDown} label="احفظ نسخة على الموبايل" sub="اختار فولدر، والأحسن Download" onPress={save} disabled={busy} />
        <Row icon={Share2} label="ابعت نسخة" sub="لـ Google Drive أو لنفسك على واتساب" onPress={share} disabled={busy} />
        <Row icon={ArchiveRestore} label="رجّع نسخة" sub="اختار الفولدر اللي فيه النسخة، وهناخد أحدث واحدة" onPress={() => restore(ask)} disabled={busy} />
      </SettingSection>
      {busy ? <ActivityIndicator color={colors.gold} style={st.status} /> : null}
      {!busy && result ? <Text style={[st.result, { color: result.ok ? colors.success : colors.dangerText }]}>{result.message}</Text> : null}
      <Text style={st.note}>
        كل حاجة في أوّاب محفوظة على موبايلك بس، من غير حساب. لو هتغيّر الموبايل أو تمسح التطبيق، اعمل نسخة الأول ورجّعها بعد ما تنزّله.
      </Text>
    </>
  );
};

const st = themed(() => ({
  divider: { height: 1, backgroundColor: colors.hairline, marginVertical: space[1] },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: space[2] },
  text: { flex: 1, marginStart: space[3] },
  label: { ...type.bodyMedium, color: colors.text },
  sub: { ...type.caption, color: colors.textMuted },
  status: { marginTop: space[3] },
  result: { ...type.label, marginTop: space[3], marginHorizontal: space[1] },
  note: { ...type.caption, color: colors.textFaint, marginTop: space[4], marginHorizontal: space[1], lineHeight: 18, borderRadius: radius.field },
}));
