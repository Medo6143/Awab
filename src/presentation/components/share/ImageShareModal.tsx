import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Image, Modal, PixelRatio, ScrollView, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { captureRef, releaseCapture } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import { ChevronRight, Download, Film, Image as ImageIcon, Share2, X } from 'lucide-react-native';
import { IconButton, PillButton, ProgressBar } from '../ui';
import { colors, icon, radius, space, type, themed } from '../../../shared/theme/tokens';
import { useAccent } from '../../../shared/theme/useAccent';
import { toAr } from '../../../shared/utils/format';
import { useAyahVideo } from '../../hooks/useAyahVideo';
import { useDependencies } from '../../providers/DependencyProvider';
import { AyahVideoError, AyahVideoFailure, FrameBox, VideoPage } from '../../../domain/services/AyahVideo';
import { ayahWords, paginate, videoFontU } from '../../../domain/services/videoLayout';
import { TEXT_BOX, VideoCard, VideoCardMode } from './VideoCard';
import { VIDEO_BACKGROUNDS } from './videoBackgrounds';
import { useShareCardSize } from './shareCardSize';

export { SHARE_PX_W, SHARE_PX_H, useShareCardSize } from './shareCardSize';

/** A WhatsApp status takes at most 90 seconds of video. */
const STATUS_LIMIT_MS = 90 * 1000;

/** The ayahs a video recites, with their text (shown word by word). */
export type ShareVideo = { surahName: string; ayahs: { surahId: number; ayahNumber: number; text: string }[] };

type Props = {
  visible: boolean;
  title: string;
  onClose: () => void;
  /** Rendered at full story size; the modal scales the preview down to fit. */
  children: React.ReactNode;
  /** Optional controls between the preview and the buttons (e.g. design picker). */
  toolbar?: React.ReactNode;
  /** Adds «فيديو»: the ayahs over a moving nature picture, with the recitation. */
  video?: ShareVideo;
};

const VIDEO_ERRORS: Record<AyahVideoFailure, [string, string]> = {
  network: ['تعذّر تحميل التلاوة', 'اتأكد إن النت شغال وحاول تاني.'],
  unsupported: ['الفيديو مش مدعوم على الموبايل ده', 'تقدر تشاركها كصورة.'],
  encode: ['تعذّر تجهيز الفيديو', 'حاول تاني.'],
};

const nextFrame = () => new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(r, 40))));

const clock = (ms: number) => {
  const s = Math.round(ms / 1000);
  return toAr(`${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`);
};

/**
 * Preview + share/save for an image card. Sharing hands a PNG to the system sheet, so the
 * user can pick WhatsApp → "My status" (or any app); saving writes it to the gallery. With
 * `video`, «فيديو» switches to the ayah video: a nature picture to choose, and «شارك الفيديو».
 */
export const ImageShareModal = ({ visible, title, onClose, children, toolbar, video }: Props) => {
  const accent = useAccent();
  const ref = useRef<View>(null);
  const [busy, setBusy] = useState<'share' | 'save' | 'video' | 'video-save' | null>(null);
  /** The last video made, so saving it after sharing it (or the other way) does not make it again. */
  const lastVideo = useRef<{ key: string; uri: string } | null>(null);
  const [mode, setMode] = useState<'image' | 'video'>('image');
  const ayahVideo = useAyahVideo();
  const { width, height } = useWindowDimensions();
  const { w, h } = useShareCardSize();
  const scale = Math.min((width - space[8] * 2) / w, (height * (toolbar || video ? 0.54 : 0.66)) / h);

  // ── the video's frame ──
  const [bgIndex, setBgIndex] = useState(() => Math.floor(Math.random() * VIDEO_BACKGROUNDS.length));
  const { videoBackgrounds } = useDependencies();
  /** The chosen clip's file once on the phone; while it downloads, how far it got. */
  const [clip, setClip] = useState<{ id: string; uri: string | null; progress: number; failed?: boolean }>({ id: '', uri: null, progress: 0 });
  const bgId = VIDEO_BACKGROUNDS[bgIndex].id;
  useEffect(() => {
    if (mode !== 'video' || !visible) return;
    let alive = true;
    setClip({ id: bgId, uri: null, progress: 0 });
    (async () => {
      try {
        const uri = (await videoBackgrounds.localUri(bgId))
          ?? (await videoBackgrounds.download(bgId, (p) => { if (alive) setClip((c) => (c.id === bgId ? { ...c, progress: p } : c)); }));
        if (alive) setClip({ id: bgId, uri, progress: 1 });
      } catch {
        if (alive) setClip({ id: bgId, uri: null, progress: 0, failed: true });
      }
    })();
    return () => { alive = false; };
  }, [bgId, mode, visible, videoBackgrounds]);
  const clipReady = clip.id === bgId && !!clip.uri;
  const [cardMode, setCardMode] = useState<VideoCardMode>('preview');
  const [pageIndex, setPageIndex] = useState(0);
  const [boxes, setBoxes] = useState<FrameBox[] | null>(null);
  // callers build `video` inline on every render: key the words on its content, or the word
  // boxes would be thrown away (and never measured again) on each parent render
  const videoKey = video ? JSON.stringify(video.ayahs) : '';
  const words = useMemo(
    () => (video ? ayahWords(video.ayahs.map((a) => ({ text: a.text, number: a.ayahNumber })), (n) => toAr(n)) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [videoKey],
  );
  const fontU = videoFontU(words.length);
  useEffect(() => { setBoxes(null); }, [words]);
  const u = w / 100;
  const pages = useMemo(
    () => (boxes && boxes.length === words.length ? paginate(boxes, h - (TEXT_BOX.top + TEXT_BOX.bottom) * u) : []),
    [boxes, words, h, u],
  );
  const shownPage = pages[pageIndex] ?? pages[0];
  const pageProp = useMemo(() => (shownPage ? { words: new Set(shownPage.words), shift: shownPage.shift } : null), [shownPage]);

  // Every capture is a temp PNG. Keep them until the preview closes (a receiving app such as
  // WhatsApp may still be reading a shared file after the share sheet returns), then delete
  // them all. Videos follow the same rule.
  const captures = useRef<string[]>([]);
  const capture = async () => {
    const uri = await captureRef(ref, { format: 'png', quality: 1, result: 'tmpfile' });
    captures.current.push(uri);
    return uri;
  };
  const releaseAll = () => {
    captures.current.forEach((c) => { try { releaseCapture(c); } catch {} });
    captures.current = [];
  };
  useEffect(() => {
    if (!visible) { releaseAll(); ayahVideo.releaseAll(); lastVideo.current = null; setMode('image'); }
  }, [visible]);
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

  /** Draws one part of the video frame, waits for it to reach the screen, and captures it. */
  const capturePart = async (part: VideoCardMode, page = 0) => {
    setPageIndex(page);
    setCardMode(part);
    await nextFrame();
    return capture();
  };

  /** Makes the video (or reuses the one just made for the same ayah and background). */
  const makeVideo = async (): Promise<string | null> => {
    if (!video || !boxes || pages.length === 0 || !clip.uri) return null;
    const key = `${bgId}|${videoKey}|${ayahVideo.reciterName}`;
    if (lastVideo.current?.key === key) return lastVideo.current.uri;
    {
      const shadeUri = await capturePart('shade');
      const overlayUri = await capturePart('overlay');
      const r = PixelRatio.get();
      const pad = 0.6 * u;
      const framePages: VideoPage[] = [];
      for (let i = 0; i < pages.length; i++) {
        const uri = await capturePart('words', i);
        framePages.push({
          uri,
          words: pages[i].words.map((k) => {
            const b = boxes[k];
            return {
              x: Math.max(0, (TEXT_BOX.side * u + b.x - pad) * r),
              y: Math.max(0, (TEXT_BOX.top * u + b.y - pages[i].shift - pad / 2) * r),
              w: (b.w + pad * 2) * r,
              h: (b.h + pad) * r,
              ayah: words[k].ayah,
              weight: words[k].weight,
            };
          }),
        });
      }
      setPageIndex(0);
      setCardMode('preview');
      const { uri } = await ayahVideo.make(
        { videoUri: clip.uri, shadeUri, overlayUri, pages: framePages },
        video.ayahs.map(({ surahId, ayahNumber }) => ({ surahId, ayahNumber })),
      );
      lastVideo.current = { key, uri };
      return uri;
    }
  };

  const onVideo = async (target: 'share' | 'save') => {
    setBusy(target === 'share' ? 'video' : 'video-save');
    try {
      if (target === 'share' && !(await Sharing.isAvailableAsync())) { Alert.alert('المشاركة غير متاحة على هذا الجهاز'); return; }
      if (target === 'save') {
        // write-only: the app never reads the gallery
        const perm = await MediaLibrary.requestPermissionsAsync(true);
        if (!perm.granted) { Alert.alert('لا يوجد إذن', 'اسمح لأوّاب بحفظ الفيديو من إعدادات الموبايل.'); return; }
      }
      const uri = await makeVideo();
      if (!uri) return;
      if (target === 'share') {
        await Sharing.shareAsync(uri, { mimeType: 'video/mp4', dialogTitle: title, UTI: 'public.mpeg-4' });
      } else {
        await MediaLibrary.saveToLibraryAsync(uri); // copies the file into the gallery
        Alert.alert('اتحفظ الفيديو', 'هتلاقيه في معرض الصور.');
      }
    } catch (e) {
      const [head, body] = VIDEO_ERRORS[e instanceof AyahVideoError ? e.reason : 'encode'];
      Alert.alert(head, body);
    } finally {
      setPageIndex(0);
      setCardMode('preview');
      setBusy(null);
    }
  };
  const making = busy === 'video' || busy === 'video-save';

  const p = ayahVideo.progress;
  const progressLabel = !p ? 'تجهيز الفيديو…'
    : p.stage === 'audio' ? `تحميل التلاوة ${toAr(Math.round(p.fraction * 100))}٪`
    : `تجهيز الفيديو ${toAr(Math.round(p.fraction * 100))}٪`;
  // downloading is the first quarter of the bar, encoding the rest
  const progressValue = !p ? 0 : p.stage === 'audio' ? p.fraction * 0.25 : 0.25 + p.fraction * 0.75;
  const tooLong = ayahVideo.durationMs != null && ayahVideo.durationMs > STATUS_LIMIT_MS;
  const inVideo = mode === 'video' && !!video;
  const iconColor = accent.accentText;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={making ? () => {} : onClose} statusBarTranslucent>
      <View style={st.backdrop}>
        <View style={st.top}>
          <Text style={st.title}>{inVideo ? 'فيديو الآية' : title}</Text>
          <IconButton onPress={making ? undefined : onClose} label="إغلاق">
            <X size={icon.size.md} color={colors.text} strokeWidth={icon.stroke} />
          </IconButton>
        </View>

        {/* direction:'ltr' + explicit offsets: under forced RTL `left` and a "top left" origin flip sides */}
        <View style={{ width: w * scale, height: h * scale, borderRadius: 18, overflow: 'hidden', direction: 'ltr' }}>
          {/* full-size card, scaled for preview; captureRef draws the card itself at full size */}
          <View style={{ width: w, height: h, position: 'absolute', top: 0, left: 0, transform: [{ translateX: -(w - w * scale) / 2 }, { translateY: -(h - h * scale) / 2 }, { scale }] }}>
            <View ref={ref} collapsable={false} style={{ width: w, height: h }}>
              {inVideo ? (
                <VideoCard
                  mode={cardMode}
                  background={VIDEO_BACKGROUNDS[bgIndex]}
                  clipUri={clipReady ? clip.uri : null}
                  surahName={video.surahName}
                  reciterName={ayahVideo.reciterName}
                  words={words}
                  fontU={fontU}
                  page={pageProp}
                  onWordsLaid={setBoxes}
                />
              ) : children}
            </View>
          </View>
          {/* outside the captured view: covers the parts being captured and shows the progress */}
          {making ? (
            <View style={[StyleSheet.absoluteFill, st.working]}>
              <ActivityIndicator color={accent.accentText} />
              <Text style={st.workingText}>{progressLabel}</Text>
              <ProgressBar progress={progressValue} height={4} style={st.workingBar} />
              <Text style={st.workingSub}>بصوت {ayahVideo.reciterName}</Text>
            </View>
          ) : null}
        </View>

        {inVideo ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={st.toolbar} contentContainerStyle={st.thumbs} pointerEvents={busy ? 'none' : 'auto'}>
            {VIDEO_BACKGROUNDS.map((b, i) => (
              <TouchableOpacity key={b.id} onPress={() => setBgIndex(i)} activeOpacity={0.85} accessibilityRole="button" accessibilityState={{ selected: i === bgIndex }}>
                <Image source={b.thumb} style={[st.thumb, i === bgIndex && { borderColor: accent.accent }]} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : toolbar ? <View style={st.toolbar}>{toolbar}</View> : null}

        {inVideo ? (
          <View style={st.actions}>
            <PillButton label="رجوع" variant="ghost" icon={<ChevronRight size={icon.size.sm} color={iconColor} strokeWidth={icon.stroke} />} disabled={!!busy} onPress={() => setMode('image')} />
            <PillButton label="حفظ" variant="ghost" icon={<Download size={icon.size.sm} color={iconColor} strokeWidth={icon.stroke} />} loading={busy === 'video-save'} disabled={!!busy || !boxes || !clipReady} onPress={() => onVideo('save')} />
            <PillButton label="شارك" icon={<Share2 size={icon.size.sm} color={accent.onAccent} strokeWidth={icon.stroke} />} loading={busy === 'video' || !boxes || (!clipReady && !clip.failed)} disabled={!!busy || !boxes || !clipReady} onPress={() => onVideo('share')} />
          </View>
        ) : video ? (
          <View style={st.actions}>
            <PillButton label="حفظ" variant="ghost" icon={<Download size={icon.size.sm} color={iconColor} strokeWidth={icon.stroke} />} loading={busy === 'save'} disabled={!!busy} onPress={onSave} />
            <PillButton label="صورة" variant="ghost" icon={<ImageIcon size={icon.size.sm} color={iconColor} strokeWidth={icon.stroke} />} loading={busy === 'share'} disabled={!!busy} onPress={onShare} />
            <PillButton label="فيديو" icon={<Film size={icon.size.sm} color={accent.onAccent} strokeWidth={icon.stroke} />} disabled={!!busy} onPress={() => setMode('video')} />
          </View>
        ) : (
          <View style={st.actions}>
            <PillButton label="حفظ في المعرض" variant="ghost" icon={<Download size={icon.size.sm} color={iconColor} strokeWidth={icon.stroke} />} loading={busy === 'save'} disabled={!!busy} onPress={onSave} />
            <PillButton label="مشاركة" icon={<Share2 size={icon.size.sm} color={accent.onAccent} strokeWidth={icon.stroke} />} loading={busy === 'share'} disabled={!!busy} onPress={onShare} />
          </View>
        )}
        <Text style={[st.hint, tooLong && { color: accent.accentText }]}>
          {tooLong
            ? `الفيديو ${clock(ayahVideo.durationMs!)} دقيقة، أطول من حالة واتساب (٩٠ ثانية): واتساب هيطلب منك تقصّه`
            : inVideo
              ? clip.failed ? 'تعذّر تحميل الخلفية، اتأكد من النت أو اختار واحدة تانية'
              : !clipReady ? `بيحمّل الخلفية ${toAr(Math.round(clip.progress * 100))}٪ (مرة واحدة بس)`
              : 'اختار الخلفية، وهتتحرك في الفيديو مع التلاوة'
              : 'اختر واتساب ثم «حالتي» لنشرها كحالة'}
        </Text>
      </View>
    </Modal>
  );
};

const st = themed(() => ({
  backdrop: { flex: 1, backgroundColor: colors.glassOpaque, alignItems: 'center', justifyContent: 'center', paddingHorizontal: space[5] },
  top: { position: 'absolute', top: space[10], left: space[5], right: space[5], flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { ...type.h2, color: colors.text },
  toolbar: { alignSelf: 'stretch', marginTop: space[4], flexGrow: 0 },
  thumbs: { paddingHorizontal: space[1] },
  thumb: { width: 44, height: 78, borderRadius: radius.field, borderWidth: 2, borderColor: 'transparent', marginHorizontal: space[1] },
  actions: { flexDirection: 'row', gap: space[3], marginTop: space[4] },
  hint: { ...type.caption, color: colors.textMuted, marginTop: space[3], textAlign: 'center' },
  working: { backgroundColor: colors.glassOpaque, alignItems: 'center', justifyContent: 'center', padding: space[4], gap: space[2] },
  workingText: { ...type.label, color: colors.text, textAlign: 'center' },
  workingBar: { alignSelf: 'stretch' },
  workingSub: { ...type.caption, color: colors.textMuted, textAlign: 'center' },
}));
