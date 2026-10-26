import React, { useEffect, useRef, useState } from 'react';
import { Alert, Modal, PixelRatio, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSelector } from 'react-redux';
import { captureRef, releaseCapture } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import { Download, Share2, X } from 'lucide-react-native';
import { IconButton, PillButton } from '../ui';
import { colors, icon, space, type } from '../../../shared/theme/tokens';
import { useAccent } from '../../../shared/theme/useAccent';
import { toAr } from '../../../shared/utils/format';
import type { RootState } from '../../store';
import type { ShareImageSize } from '../../store/slices/settingsSlice';

/** Story format (9:16) at the width chosen in Settings. */
export const SHARE_WIDTH_PX: Record<ShareImageSize, number> = { small: 720, medium: 1080, high: 1440 };

/**
 * Cards lay themselves out in dp at exactly the chosen number of pixels, so the capture is
 * drawn natively at that size (sharp at every setting) rather than scaled afterwards.
 */
export const useShareCardSize = () => {
  const size = useSelector((s: RootState) => s.settings.shareImageSize) ?? 'medium';
  const pxW = SHARE_WIDTH_PX[size] ?? SHARE_WIDTH_PX.medium;
  const pxH = Math.round((pxW * 16) / 9);
  const r = PixelRatio.get();
  return { w: pxW / r, h: pxH / r, pxW, pxH };
};

type Props = {
  visible: boolean;
  title: string;
  onClose: () => void;
  /** Rendered at full story size; the modal scales the preview down to fit. */
  children: React.ReactNode;
};

/**
 * Preview + share/save for an image card. Sharing hands a PNG to the system sheet, so the
 * user can pick WhatsApp → "My status" (or any app); saving writes it to the gallery.
 */
export const ImageShareModal = ({ visible, title, onClose, children }: Props) => {
  const accent = useAccent();
  const ref = useRef<View>(null);
  const [busy, setBusy] = useState<'share' | 'save' | null>(null);
  const { width, height } = useWindowDimensions();
  const { w, h, pxW, pxH } = useShareCardSize();
  const scale = Math.min((width - space[8] * 2) / w, (height * 0.66) / h);

  // Every capture is a ~0.5 MB temp PNG. Keep them until the preview closes (a receiving app
  // such as WhatsApp may still be reading a shared file after the share sheet returns),
  // then delete them all.
  const captures = useRef<string[]>([]);
  const capture = async () => {
    const uri = await captureRef(ref, { format: 'png', quality: 1, result: 'tmpfile' });
    captures.current.push(uri);
    return uri;
  };
  const releaseAll = () => {
    captures.current.forEach((u) => { try { releaseCapture(u); } catch {} });
    captures.current = [];
  };
  useEffect(() => { if (!visible) releaseAll(); }, [visible]);
  useEffect(() => releaseAll, []);

  const onShare = async () => {
    setBusy('share');
    try {
      if (!(await Sharing.isAvailableAsync())) { Alert.alert('المشاركة غير متاحة على هذا الجهاز'); return; }
      const uri = await capture();
      await Sharing.shareAsync(uri, { mimeType: 'image/png', dialogTitle: title, UTI: 'public.png' });
    } catch {
      Alert.alert('تعذّر إنشاء الصورة', 'حاول مرة أخرى.');
    } finally { setBusy(null); }
  };

  const onSave = async () => {
    setBusy('save');
    try {
      // write-only: the app never reads the gallery, so it asks for no read permission
      const perm = await MediaLibrary.requestPermissionsAsync(true);
      if (!perm.granted) { Alert.alert('لا يوجد إذن', 'اسمح لأوّاب بحفظ الصور من إعدادات الهاتف.'); return; }
      const uri = await capture();
      await MediaLibrary.saveToLibraryAsync(uri); // copies the file into the gallery
      Alert.alert('تم الحفظ', 'الصورة محفوظة في معرض الصور.');
    } catch {
      Alert.alert('تعذّر حفظ الصورة', 'حاول مرة أخرى.');
    } finally { setBusy(null); }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <View style={st.backdrop}>
        <View style={st.top}>
          <Text style={st.title}>{title}</Text>
          <IconButton onPress={onClose} label="إغلاق">
            <X size={icon.size.md} color={colors.text} strokeWidth={icon.stroke} />
          </IconButton>
        </View>

        {/* direction:'ltr' + explicit offsets: under forced RTL `left` and a "top left" origin flip sides */}
        <View style={{ width: w * scale, height: h * scale, borderRadius: 18, overflow: 'hidden', direction: 'ltr' }}>
          {/* full-size card, scaled for preview; captureRef draws the card itself at full size */}
          <View style={{ width: w, height: h, position: 'absolute', top: 0, left: 0, transform: [{ translateX: -(w - w * scale) / 2 }, { translateY: -(h - h * scale) / 2 }, { scale }] }}>
            <View ref={ref} collapsable={false} style={{ width: w, height: h }}>
              {children}
            </View>
          </View>
        </View>

        <View style={st.actions}>
          <PillButton label="حفظ في المعرض" variant="ghost" icon={<Download size={icon.size.sm} color={accent.accentText} strokeWidth={icon.stroke} />} loading={busy === 'save'} disabled={!!busy} onPress={onSave} />
          <PillButton label="مشاركة" icon={<Share2 size={icon.size.sm} color={accent.onAccent} strokeWidth={icon.stroke} />} loading={busy === 'share'} disabled={!!busy} onPress={onShare} />
        </View>
        <Text style={st.hint}>اختر واتساب ثم «حالتي» لنشرها كحالة · {toAr(pxW)}×{toAr(pxH)}</Text>
      </View>
    </Modal>
  );
};

const st = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: colors.glassOpaque, alignItems: 'center', justifyContent: 'center', paddingHorizontal: space[5] },
  top: { position: 'absolute', top: space[10], left: space[5], right: space[5], flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { ...type.h2, color: colors.text },
  actions: { flexDirection: 'row', gap: space[3], marginTop: space[6] },
  hint: { ...type.caption, color: colors.textMuted, marginTop: space[3] },
});
