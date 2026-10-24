import React from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, StyleSheet, Dimensions, Share } from 'react-native';
import { CheckCircle2, XCircle, Share2, X, BookOpen, Sparkles } from 'lucide-react-native';
import { IbadaTask } from '../../store/slices/ibadaSlice';
import { colors, icon, radius, space, type } from '../../../shared/theme/tokens';
import { toAr } from '../../../shared/utils/format';
import { PillButton, ProgressRing, StatNumber } from '../ui';

interface DailyReportModalProps {
  visible: boolean;
  onClose: () => void;
  tasks: IbadaTask[];
  stats: { dhikrCount: number; dhikrDetails?: Record<string, number>; quranPages: number };
  accentColor: string;
  periodType?: 'day' | 'month' | 'year';
  periodName?: string;
}

const { height } = Dimensions.get('window');
const TITLES = { day: 'تقرير اليوم', month: 'حصاد الشهر', year: 'مسيرة العام' };

export const DailyReportModal: React.FC<DailyReportModalProps> = ({ visible, onClose, tasks, stats, accentColor, periodType = 'day', periodName }) => {
  const completedCount = tasks.filter((t) => t.isCompleted).length;
  const totalCount = tasks.length;
  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const feedback = (() => {
    if (periodType === 'day') {
      if (percentage === 100) return { title: 'مقام الإحسان', msg: 'أتممت يومك في طاعة الله على أكمل وجه. نسأل الله القبول والثبات.' };
      if (percentage >= 80) return { title: 'درجة المتقين', msg: 'يوم مليء بالخير والبركة، استمر في هذا المسير المبارك.' };
      if (percentage >= 50) return { title: 'سبّاق بالخيرات', msg: 'اجتهدت فأصبت خيراً كثيراً، والفرصة أمامك غداً لتكون أفضل.' };
      return { title: 'بداية الرحلة', msg: 'اجعل من هذا التقرير دافعاً للتقرب أكثر من الله. كل خطوة صغيرة بداية عظيمة.' };
    }
    if (periodType === 'month') {
      return percentage >= 80
        ? { title: 'حصاد الشهر المبارك', msg: 'ثباتك في الطاعة طوال الشهر دليل على صدق العزيمة.' }
        : { title: 'محطة مراجعة للذات', msg: 'شهر مضى والخير باقٍ في قلبك. لنجعل القادم أكثر إشراقاً.' };
    }
    return { title: 'مسيرة العام الإيمانية', msg: 'عام من الطاعة والتقرب إلى الله. جعل الله عامك القادم أفضل.' };
  })();

  const dateLabel = periodName || new Date().toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long' });

  const share = async () => {
    const lines = [
      `${TITLES[periodType]} · ${dateLabel}`,
      `التسبيح: ${toAr(stats.dhikrCount)}`,
      `صفحات القرآن: ${toAr(stats.quranPages)}`,
      totalCount ? `المهام: ${toAr(completedCount)} من ${toAr(totalCount)} (${toAr(percentage)}٪)` : '',
      '— من تطبيق أوّاب',
    ].filter(Boolean);
    try { await Share.share({ message: lines.join('\n') }); } catch {}
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={st.overlay}>
        <View style={st.sheet}>
          <View style={st.header}>
            <TouchableOpacity onPress={onClose} style={st.closeBtn} accessibilityLabel="إغلاق">
              <X color={colors.textMuted} size={icon.size.lg} strokeWidth={icon.stroke} />
            </TouchableOpacity>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={st.title}>{TITLES[periodType]}</Text>
              <Text style={st.date}>{dateLabel}</Text>
            </View>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={st.scroll}>
            <View style={st.scoreBox}>
              <View style={st.scoreText}>
                <Text style={[st.feedbackTitle, { color: accentColor }]}>{feedback.title}</Text>
                <Text style={st.feedbackMsg}>{feedback.msg}</Text>
              </View>
              {totalCount > 0 ? <ProgressRing progress={percentage / 100} size={84} stroke={8} color={accentColor} /> : null}
            </View>

            <View style={st.miniGrid}>
              <View style={st.miniCard}>
                <Sparkles color={accentColor} size={icon.size.md} strokeWidth={icon.stroke} />
                <StatNumber value={stats.dhikrCount} caption="تسبيحة" size="h2" />
              </View>
              <View style={st.miniCard}>
                <BookOpen color={accentColor} size={icon.size.md} strokeWidth={icon.stroke} />
                <StatNumber value={stats.quranPages} caption="صفحات قرآن" size="h2" />
              </View>
            </View>

            {stats.dhikrDetails && Object.keys(stats.dhikrDetails).length > 0 && (
              <>
                <Text style={st.sectionTitle}>تفاصيل الأذكار والأوراد</Text>
                <View style={st.list}>
                  {Object.entries(stats.dhikrDetails).sort((a, b) => b[1] - a[1]).map(([name, count]) => (
                    <View key={name} style={st.row}>
                      <Text style={[st.rowValue, { color: accentColor }]}>{toAr(count)}</Text>
                      <Text style={st.rowName} numberOfLines={1}>{name}</Text>
                    </View>
                  ))}
                </View>
              </>
            )}

            {periodType === 'day' && tasks.length > 0 && (
              <>
                <Text style={st.sectionTitle}>الطاعات والمهام</Text>
                <View style={st.list}>
                  {tasks.map((task) => (
                    <View key={task.id} style={st.row}>
                      {task.isCompleted
                        ? <CheckCircle2 color={colors.success} size={icon.size.md} strokeWidth={icon.stroke} />
                        : <XCircle color={colors.textFaint} size={icon.size.md} strokeWidth={icon.stroke} />}
                      <Text style={[st.rowName, !task.isCompleted && { color: colors.textMuted }]}>{task.name}</Text>
                    </View>
                  ))}
                </View>
              </>
            )}
          </ScrollView>

          <View style={st.footer}>
            <PillButton label="مشاركة الأثر الطيب" onPress={share} icon={<Share2 color={colors.onGold} size={icon.size.md} strokeWidth={icon.stroke} />} />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const st = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: colors.overlay },
  sheet: { height: height * 0.85, backgroundColor: colors.surface, borderTopLeftRadius: radius.sheet, borderTopRightRadius: radius.sheet, padding: space[6] },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: space[5] },
  title: { ...type.h2, color: colors.text },
  date: { ...type.caption, color: colors.textMuted, marginTop: 2 },
  closeBtn: { width: 40, height: 40, borderRadius: radius.tile, backgroundColor: colors.surfaceRaised, alignItems: 'center', justifyContent: 'center' },
  scroll: { paddingBottom: space[6] },
  scoreBox: { flexDirection: 'row-reverse', alignItems: 'center', gap: space[4], backgroundColor: colors.surfaceRaised, padding: space[5], borderRadius: radius.card, marginBottom: space[4] },
  scoreText: { flex: 1 },
  feedbackTitle: { ...type.h2, textAlign: 'right' },
  feedbackMsg: { ...type.body, color: colors.textMuted, textAlign: 'right', marginTop: 4 },
  miniGrid: { flexDirection: 'row', gap: space[3], marginBottom: space[5] },
  miniCard: { flex: 1, backgroundColor: colors.surfaceRaised, padding: space[4], borderRadius: radius.card, alignItems: 'center', gap: space[2] },
  sectionTitle: { ...type.h2, color: colors.text, marginBottom: space[3], textAlign: 'right' },
  list: { gap: space[2], marginBottom: space[5] },
  row: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', gap: space[3], backgroundColor: colors.surfaceRaised, padding: space[4], borderRadius: radius.field },
  rowName: { ...type.bodyMedium, color: colors.text, flex: 1, textAlign: 'right' },
  rowValue: { ...type.label, fontSize: 15 },
  footer: { paddingTop: space[3] },
});
