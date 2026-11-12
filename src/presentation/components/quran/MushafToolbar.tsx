import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Bookmark, BookOpen, Ellipsis, Home, Lightbulb, Mic, Minus, Pause, Play, Plus, Settings, Square, Target, X } from 'lucide-react-native';
import type { RootState } from '../../store';
import { dismissMushafHint, setMushafFontScale } from '../../store/slices/settingsSlice';
import { colors, icon, radius, space, themed, type } from '../../../shared/theme/tokens';
import { useAccent } from '../../../shared/theme/useAccent';
import { toAr } from '../../../shared/utils/format';
import { Sheet } from '../ui';
import { MUSHAF_FONT_SCALES, useMushafFontScale } from './mushafThemes';

/** One labelled button of the mushaf's top bar. */
const Tool = ({ label, onPress, children, a11y }: { label: string; onPress: () => void; children: React.ReactNode; a11y?: string }) => (
  <TouchableOpacity onPress={onPress} style={st.tool} accessibilityRole="button" accessibilityLabel={a11y ?? label} activeOpacity={0.8}>
    <View style={st.toolIcon}>{children}</View>
    <Text style={st.toolLabel} numberOfLines={1}>{label}</Text>
  </TouchableOpacity>
);

export type PlayState = 'idle' | 'loading' | 'playing-surah' | 'playing';

type ToolbarProps = {
  play: PlayState;
  hasSaved: boolean;
  onHome: () => void;
  onIndex: () => void;
  onPlay: () => void;
  onTasmee: () => void;
  onSaved: () => void;
  onMore: () => void;
};

/**
 * The mushaf's top bar: every action labelled, in reading order. Less used ones (text size,
 * khatmat, settings) are under «المزيد».
 */
export const MushafToolbar = ({ play, hasSaved, onHome, onIndex, onPlay, onTasmee, onSaved, onMore }: ToolbarProps) => {
  const accent = useAccent();
  const c = accent.accentText;
  const playLabel = play === 'idle' ? 'استمع' : play === 'loading' ? 'بيحمّل' : play === 'playing-surah' ? 'إيقاف مؤقت' : 'إيقاف';
  return (
    <View style={st.bar}>
      <Tool label="الرئيسية" onPress={onHome}><Home size={icon.size.md} color={c} strokeWidth={icon.stroke} /></Tool>
      <Tool label="الفهرس" onPress={onIndex} a11y="فهرس السور والأجزاء"><BookOpen size={icon.size.md} color={c} strokeWidth={icon.stroke} /></Tool>
      <Tool label={playLabel} onPress={onPlay} a11y={play === 'idle' ? 'استمع للصفحة' : 'إيقاف التلاوة'}>
        {play === 'loading' ? <ActivityIndicator size="small" color={c} />
          : play === 'playing' ? <Square size={icon.size.md - 2} color={c} fill={c} />
          : play === 'playing-surah' ? <Pause size={icon.size.md} color={c} fill={c} />
          : <Play size={icon.size.md} color={c} fill={c} />}
      </Tool>
      <Tool label="سمّع" onPress={onTasmee} a11y="تسميع الصفحة"><Mic size={icon.size.md} color={c} strokeWidth={icon.stroke} /></Tool>
      <Tool label="المحفوظات" onPress={onSaved}><Bookmark size={icon.size.md} color={c} strokeWidth={icon.stroke} fill={hasSaved ? c : 'none'} /></Tool>
      <Tool label="المزيد" onPress={onMore} a11y="المزيد: حجم الخط والختمات والإعدادات"><Ellipsis size={icon.size.md} color={c} strokeWidth={icon.stroke} /></Tool>
    </View>
  );
};

/** «المزيد»: the text size, and the way to khatmat and settings. */
export const MushafMoreSheet = ({ visible, onClose, onKhatmat, onSettings }: { visible: boolean; onClose: () => void; onKhatmat: () => void; onSettings: () => void }) => {
  const dispatch = useDispatch();
  const accent = useAccent();
  const scale = useMushafFontScale();
  const i = Math.max(0, MUSHAF_FONT_SCALES.findIndex((v) => Math.abs(v - scale) < 0.01));
  const step = (d: number) => dispatch(setMushafFontScale(MUSHAF_FONT_SCALES[Math.min(MUSHAF_FONT_SCALES.length - 1, Math.max(0, i + d))]));
  const atMin = i === 0;
  const atMax = i === MUSHAF_FONT_SCALES.length - 1;
  return (
    <Sheet visible={visible} title="المزيد" onClose={onClose}>
      <Text style={st.groupLabel}>حجم خط المصحف</Text>
      <View style={st.sizeRow}>
        <TouchableOpacity onPress={() => step(-1)} disabled={atMin} style={[st.sizeBtn, atMin && st.disabled]} accessibilityRole="button" accessibilityLabel="تصغير الخط">
          <Minus size={icon.size.md} color={accent.accentText} strokeWidth={icon.stroke} />
        </TouchableOpacity>
        <View style={st.sizeValue}>
          <Text style={[st.sample, { fontSize: 20 * scale, lineHeight: 36 * scale }]}>بِسۡمِ ٱللَّهِ</Text>
          <Text style={st.sizePct}>{toAr(Math.round(scale * 100))}٪</Text>
        </View>
        <TouchableOpacity onPress={() => step(1)} disabled={atMax} style={[st.sizeBtn, atMax && st.disabled]} accessibilityRole="button" accessibilityLabel="تكبير الخط">
          <Plus size={icon.size.md} color={accent.accentText} strokeWidth={icon.stroke} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={st.row} onPress={onKhatmat} accessibilityRole="button">
        <Target size={icon.size.md} color={accent.accentText} strokeWidth={icon.stroke} />
        <View style={{ flex: 1 }}>
          <Text style={st.rowTitle}>الختمات</Text>
          <Text style={st.rowSub}>ختماتك اللي خلّصتها، وابدأ ختمة جديدة</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity style={st.row} onPress={onSettings} accessibilityRole="button">
        <Settings size={icon.size.md} color={accent.accentText} strokeWidth={icon.stroke} />
        <View style={{ flex: 1 }}>
          <Text style={st.rowTitle}>إعدادات المصحف</Text>
          <Text style={st.rowSub}>شكل الصفحة، التفسير، القارئ</Text>
        </View>
      </TouchableOpacity>
    </Sheet>
  );
};

/** Shown above the page until dismissed: what tapping an ayah does. */
export const MushafHint = () => {
  const dispatch = useDispatch();
  const accent = useAccent();
  const seen = useSelector((s: RootState) => s.settings.mushafHintSeen);
  if (seen) return null;
  return (
    <View style={[st.hint, { backgroundColor: accent.accentSoft }]}>
      <Lightbulb size={icon.size.sm} color={accent.accentText} strokeWidth={icon.stroke} />
      <Text style={st.hintText}>دوس على أي آية للتفسير والاستماع والحفظ والمشاركة، وضغطة طويلة تشغّلها على طول</Text>
      <TouchableOpacity onPress={() => dispatch(dismissMushafHint())} hitSlop={10} accessibilityRole="button" accessibilityLabel="إخفاء">
        <X size={icon.size.sm} color={colors.textMuted} strokeWidth={icon.stroke} />
      </TouchableOpacity>
    </View>
  );
};

const st = themed(() => ({
  // a plain row runs right to left: children in reading order
  bar: { flexDirection: 'row', paddingHorizontal: space[2], paddingTop: space[2], paddingBottom: space[1], backgroundColor: colors.bg },
  tool: { flex: 1, alignItems: 'center', gap: 2 },
  toolIcon: { width: 40, height: 34, borderRadius: radius.tile, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  toolLabel: { ...type.caption, fontSize: 11, color: colors.textMuted },
  groupLabel: { ...type.label, color: colors.textMuted, marginBottom: space[2] },
  sizeRow: { flexDirection: 'row', alignItems: 'center', gap: space[3], marginBottom: space[5] },
  sizeBtn: { width: 44, height: 44, borderRadius: radius.pill, backgroundColor: colors.surfaceRaised, alignItems: 'center', justifyContent: 'center' },
  disabled: { opacity: 0.4 },
  sizeValue: { flex: 1, alignItems: 'center' },
  sample: { fontFamily: 'Amiri_700Bold', color: colors.text, textAlign: 'center' },
  sizePct: { ...type.caption, color: colors.textMuted },
  row: { flexDirection: 'row', alignItems: 'center', gap: space[3], paddingVertical: space[3], borderTopWidth: 1, borderTopColor: colors.hairline },
  rowTitle: { ...type.bodyMedium, color: colors.text },
  rowSub: { ...type.caption, color: colors.textMuted },
  hint: { flexDirection: 'row', alignItems: 'center', gap: space[2], marginHorizontal: space[3], marginTop: space[1], paddingHorizontal: space[3], paddingVertical: space[2], borderRadius: radius.field },
  hintText: { ...type.caption, color: colors.text, flex: 1 },
}));
