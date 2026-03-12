import React from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { CheckCircle2, Circle, XCircle, Star, Activity, Heart, Share2, X } from 'lucide-react-native';
import { THEME } from '../../../shared/theme/constants';
import { IbadaTask } from '../../store/slices/ibadaSlice';

interface DailyReportModalProps {
  visible: boolean;
  onClose: () => void;
  tasks: IbadaTask[];
  stats: {
    dhikrCount: number;
    dhikrDetails?: Record<string, number>;
    quranPages: number;
  };
  accentColor: string;
  periodType?: 'day' | 'month' | 'year';
  periodName?: string;
}

const { width, height } = Dimensions.get('window');

export const DailyReportModal: React.FC<DailyReportModalProps> = ({ 
  visible, onClose, tasks, stats, accentColor, periodType = 'day', periodName
}) => {
  const completedCount = tasks.filter(t => t.isCompleted).length;
  const totalCount = tasks.length;
  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const getSpiritualFeedback = () => {
    if (periodType === 'day') {
      if (percentage === 100) return { title: 'مقام الإحسان', msg: 'هنيئاً لك! لقد أتممت يومك في طاعة الله على أكمل وجه. نسأل الله القبول والثبات.', color: '#fbbf24' };
      if (percentage >= 80) return { title: 'درجة المتقين', msg: 'ما شاء الله! يوم مليء بالخير والبركة، استمر في هذا المسير المبارك.', color: '#10b981' };
      if (percentage >= 50) return { title: 'سبّاق بالخيرات', msg: 'اجتهدت فأصبت خيراً كثيراً، والفرصة أمامك غداً لتكون أفضل.', color: '#3b82f6' };
      return { title: 'بداية الرحلة', msg: 'اجعل من هذا التقرير دافعاً لتقرب أكثر من الله. كل خطوة صغيرة هي بداية عظيمة.', color: '#94a3b8' };
    } else if (periodType === 'month') {
      if (percentage >= 80) return { title: 'حصاد الشهر المبارك', msg: 'ثباتك في الطاعة طوال الشهر دليل على صدق العزيمة. بارك الله في عملك.', color: '#fbbf24' };
      return { title: 'محطة مراجعة للذات', msg: 'شهر مضى، والخير باقٍ في قلبك. لنجعل الشهر القادم أكثر إشراقاً بالطاعات.', color: '#3b82f6' };
    } else {
      return { title: 'مسيرة العام الإيمانية', msg: 'عام من الطاعة والتقرب إلى الله. جعل الله عامك القادم أفضل وأقرب إليه.', color: '#fbbf24' };
    }
  };

  const feedback = getSpiritualFeedback();
  const titleMap = { day: 'تقرير اليوم الإيماني', month: 'حصاد الشهر الإيماني', year: 'مسيرة العام الإيمانية' };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={s.overlay}>
        <BlurView intensity={20} style={StyleSheet.absoluteFill} />
        <LinearGradient 
          colors={['#1a120b', '#0c0805']} 
          style={s.modalContainer}
        >
          {/* Header */}
          <View style={s.header}>
            <View>
              <Text style={s.headerTitle}>{titleMap[periodType]}</Text>
              <Text style={s.headerDate}>{periodName || new Date().toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long' })}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={s.closeBtn}>
              <X color="#94a3b8" size={24} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scrollContent}>
            
            {/* Score Section */}
            <View style={s.scoreBox}>
              <View style={[s.scoreCircle, { borderColor: accentColor }]}>
                <Text style={[s.scoreNum, { color: accentColor }]}>{percentage}%</Text>
                <Text style={s.scoreLabel}>القلب</Text>
              </View>
              <View style={s.scoreTextBody}>
                <Text style={[s.feedbackTitle, { color: feedback.color }]}>{feedback.title}</Text>
                <Text style={s.feedbackMsg}>{feedback.msg}</Text>
              </View>
            </View>

            {/* Quick Stats Grid */}
            <View style={s.miniGrid}>
              <View style={s.miniCard}>
                <Activity color="#fbbf24" size={20} />
                <Text style={s.miniVal}>{stats.dhikrCount.toLocaleString('ar-EG')}</Text>
                <Text style={s.miniLabel}>تسبيحة</Text>
              </View>
              <View style={s.miniCard}>
                <Star color="#8b5cf6" size={20} />
                <Text style={s.miniVal}>{stats.quranPages.toLocaleString('ar-EG')}</Text>
                <Text style={s.miniLabel}>صفحات قرآن</Text>
              </View>
            </View>

            {/* Dhikr Breakdown Section */}
            {stats.dhikrDetails && Object.keys(stats.dhikrDetails).length > 0 && (
              <>
                <Text style={s.sectionTitle}>تفاصيل الأذكار والأوراد</Text>
                <View style={s.dhikrBreakdown}>
                  {Object.entries(stats.dhikrDetails).map(([name, count]) => (
                    <View key={name} style={s.dhikrItem}>
                      <Text style={s.dhikrName}>{name}</Text>
                      <View style={[s.dhikrCountBadge, { backgroundColor: accentColor + '20' }]}>
                         <Text style={[s.dhikrCount, { color: accentColor }]}>{count.toLocaleString('ar-EG')}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </>
            )}

            {/* Detailed Checklist - Only for Day view */}
            {periodType === 'day' && (
              <>
                <Text style={s.sectionTitle}>تفاصيل الطاعات والمهام</Text>
                <View style={s.taskContainer}>
                  {tasks.map((task) => (
                    <View key={task.id} style={s.taskItem}>
                      <View style={s.taskInfo}>
                        <Text style={[s.taskName, task.isCompleted && { color: '#fff' }]}>{task.name}</Text>
                        <Text style={s.taskCat}>{task.category === 'obligatory' ? 'فريضة' : 'سنة/نافلة'}</Text>
                      </View>
                      {task.isCompleted ? (
                        <CheckCircle2 color="#10b981" size={22} fill="#10b98120" />
                      ) : (
                        <XCircle color="#ef4444" size={22} />
                      )}
                    </View>
                  ))}
                </View>
              </>
            )}

            <View style={{ height: 20 }} />
          </ScrollView>

          {/* Footer Action */}
          <View style={s.footer}>
            <TouchableOpacity style={[s.primaryBtn, { backgroundColor: accentColor }]}>
              <Share2 color="#000" size={20} />
              <Text style={s.primaryBtnText}>مشاركة الأثر الطيب</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    </Modal>
  );
};

const s = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContainer: { 
    height: height * 0.85, 
    borderTopLeftRadius: 32, 
    borderTopRightRadius: 32, 
    padding: 24,
    borderWidth: 1,
    borderColor: '#ffffff10'
  },
  header: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  headerTitle: { fontFamily: 'Tajawal_700Bold', fontSize: 22, color: '#fff' },
  headerDate: { fontFamily: 'Tajawal_400Regular', fontSize: 14, color: '#94a3b8', textAlign: 'right' },
  closeBtn: { padding: 8, backgroundColor: '#ffffff05', borderRadius: 12 },
  scrollContent: { paddingBottom: 40 },
  scoreBox: { 
    flexDirection: 'row-reverse', 
    alignItems: 'center', 
    backgroundColor: '#ffffff05', 
    padding: 20, 
    borderRadius: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ffffff10'
  },
  scoreCircle: { 
    width: 80, 
    height: 80, 
    borderRadius: 40, 
    borderWidth: 4, 
    alignItems: 'center', 
    justifyContent: 'center',
    marginLeft: 16
  },
  scoreNum: { fontFamily: 'Tajawal_700Bold', fontSize: 20 },
  scoreLabel: { fontFamily: 'Tajawal_400Regular', fontSize: 10, color: '#94a3b8' },
  scoreTextBody: { flex: 1 },
  feedbackTitle: { fontFamily: 'Tajawal_700Bold', fontSize: 18, marginBottom: 4, textAlign: 'right' },
  feedbackMsg: { fontFamily: 'Tajawal_400Regular', fontSize: 14, color: '#94a3b8', lineHeight: 20, textAlign: 'right' },
  miniGrid: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  miniCard: { 
    flex: 1, 
    backgroundColor: '#ffffff05', 
    padding: 16, 
    borderRadius: 20, 
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ffffff08'
  },
  miniVal: { fontFamily: 'Tajawal_700Bold', fontSize: 18, color: '#fff', marginVertical: 4 },
  miniLabel: { fontFamily: 'Tajawal_400Regular', fontSize: 12, color: '#94a3b8' },
  sectionTitle: { fontFamily: 'Tajawal_700Bold', fontSize: 18, color: '#fff', marginBottom: 16, textAlign: 'right' },
  taskContainer: { backgroundColor: '#ffffff03', borderRadius: 24, padding: 12, borderWidth: 1, borderColor: '#ffffff05' },
  taskItem: { 
    flexDirection: 'row-reverse', 
    alignItems: 'center', 
    paddingVertical: 12, 
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ffffff05'
  },
  taskInfo: { flex: 1, alignItems: 'flex-end', marginLeft: 12 },
  taskName: { fontFamily: 'Tajawal_700Bold', fontSize: 16, color: '#64748b' },
  taskCat: { fontFamily: 'Tajawal_400Regular', fontSize: 12, color: '#475569' },
  footer: { paddingTop: 16, borderTopWidth: 1, borderTopColor: '#ffffff10' },
  primaryBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    height: 56, 
    borderRadius: 16, 
    gap: 12 
  },
  primaryBtnText: { fontFamily: 'Tajawal_700Bold', fontSize: 16, color: '#000' },
  dhikrBreakdown: { gap: 10, marginBottom: 24 },
  dhikrItem: { 
    flexDirection: 'row-reverse', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    backgroundColor: '#ffffff05', 
    padding: 14, 
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ffffff08'
  },
  dhikrName: { fontFamily: 'Tajawal_700Bold', fontSize: 16, color: '#fff' },
  dhikrCountBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 10 },
  dhikrCount: { fontFamily: 'Tajawal_700Bold', fontSize: 16 }
});
