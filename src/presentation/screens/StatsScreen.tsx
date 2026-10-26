import type { IbadaTask as ReportTask } from '../store/slices/ibadaSlice';

type ReportData = {
  type: 'day' | 'month' | 'year';
  name: string;
  tasks: ReportTask[];
  stats: { dhikrCount: number; dhikrDetails?: Record<string, number>; quranPages: number };
};
import { ScreenProps } from '../navigation/types';
import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useSelector } from 'react-redux';
import { Calendar, BookOpen, ChevronDown, ChevronUp, Star, Moon, Sun, Flame, BarChart3 } from 'lucide-react-native';
import { RootState } from '../store';
import { IbadaTask } from '../store/slices/ibadaSlice';
import { useAccent } from '../../shared/theme/useAccent';
import { colors, icon } from '../../shared/theme/tokens';
import { toAr } from '../../shared/utils/format';

import { Screen, ScreenHeader, Chip, Card, SectionTitle, StatNumber, IconTile, EmptyState } from '../components/ui';
import { StatCard, WeeklyActivityChart, DhikrBreakdownChart, StatusRow } from '../components/stats/StatsComponents';
import { DailyReportModal } from '../components/home/DailyReportModal';
import { s } from '../components/stats/StatsStyles';

const MONTHS = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
const WEEKDAYS = ['أحد', 'اثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'];
const QIYAM_IDS = ['qiyam_al_layl', 'qiyan_al_layl'];
const localKey = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const StatsScreen = ({ navigation }: Pick<ScreenProps, 'navigation'>) => {
  const accent = useAccent();
  const [activeTab, setActiveTab] = useState<'day' | 'month'>('day');
  const [expandedMonths, setExpandedMonths] = useState<Record<string, boolean>>({});
  const [reportVisible, setReportVisible] = useState(false);
  const [reportData, setReportData] = useState<ReportData | null>(null);

  const { dailyRecords } = useSelector((state: RootState) => state.stats);
  const { tasks } = useSelector((state: RootState) => state.ibada);
  const records = dailyRecords || {};
  const todayKey = localKey();
  const todayStats = records[todayKey] || { prayers: [], dhikrCount: 0, quranPages: [], dhikrDetails: {} };

  const getRangeStats = (days: number) => {
    const dates = Object.keys(records).sort((a, b) => new Date(b).getTime() - new Date(a).getTime()).slice(0, days);
    let prayers = 0, dhikr = 0, pages = 0, nightPrayerCount = 0;
    const allDhikrDetails: Record<string, number> = {};
    dates.forEach((d) => {
      const r = records[d] || { prayers: [], dhikrCount: 0, quranPages: [], dhikrDetails: {} };
      prayers += (r.prayers || []).length;
      dhikr += r.dhikrCount || 0;
      pages += (r.quranPages || []).length;
      if ((r.prayers || []).some((p: string) => QIYAM_IDS.includes(p))) nightPrayerCount++;
      Object.entries(r.dhikrDetails || {}).forEach(([n, c]) => { allDhikrDetails[n] = (allDhikrDetails[n] || 0) + (c as number); });
    });
    return { prayers, dhikr, pages, nightPrayerCount, allDhikrDetails };
  };

  const streak = useMemo(() => {
    let n = 0;
    const check = new Date();
    if (!records[todayKey]) check.setDate(check.getDate() - 1);
    for (let i = 0; i < 400; i++) {
      if (records[localKey(check)]) { n++; check.setDate(check.getDate() - 1); } else break;
    }
    return n;
  }, [records, todayKey]);

  const monthStats = getRangeStats(30);
  const todayQiyam = (todayStats.prayers || []).some((p: string) => QIYAM_IDS.includes(p));
  const todayFasting = (todayStats.prayers || []).includes('fasting');

  const display = activeTab === 'day'
    ? { prayers: (todayStats.prayers || []).length, dhikr: todayStats.dhikrCount || 0, pages: (todayStats.quranPages || []).length, label: 'تسبيحة اليوم', details: todayStats.dhikrDetails || {} }
    : { prayers: monthStats.prayers, dhikr: monthStats.dhikr, pages: monthStats.pages, label: 'تسبيحة في ٣٠ يوماً', details: monthStats.allDhikrDetails };

  const groupedHistory = useMemo(() => Object.keys(records)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
    .reduce((acc, dateStr) => {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return acc;
      const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      (acc[k] = acc[k] || []).push(dateStr);
      return acc;
    }, {} as Record<string, string[]>), [records]);

  useEffect(() => {
    const d = new Date();
    setExpandedMonths({ [`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`]: true });
  }, []);

  const chartData = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    return records[localKey(d)]?.dhikrCount || records[d.toDateString()]?.dhikrCount || 0;
  });
  const maxDhikr = Math.max(...chartData, 100);

  const showReport = (type: 'day' | 'month', dateKey?: string) => {
    if (type === 'day') {
      const target = dateKey || todayKey;
      const r = records[target] || { prayers: [], dhikrCount: 0, quranPages: [], dhikrDetails: {} };
      let name = target;
      try { name = new Date(target).toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long' }); } catch {}
      setReportData({ type, stats: { dhikrCount: r.dhikrCount, dhikrDetails: r.dhikrDetails, quranPages: (r.quranPages || []).length }, name, tasks: tasks.map((t: IbadaTask) => ({ ...t, isCompleted: (r.prayers || []).includes(t.id) })) });
    } else {
      setReportData({ type, stats: { dhikrCount: monthStats.dhikr, dhikrDetails: monthStats.allDhikrDetails, quranPages: monthStats.pages }, name: `آخر ٣٠ يوم (${MONTHS[new Date().getMonth()]})`, tasks: [] });
    }
    setReportVisible(true);
  };

  const hasAnyData = Object.keys(records).length > 0;

  return (
    <Screen scroll header={<ScreenHeader title="الإحصائيات" subtitle="تتبّع رحلتك الروحانية" onBack={() => navigation.goBack()} />}>
      {!hasAnyData ? (
        <EmptyState icon={BarChart3} title="لا توجد إحصائيات بعد" message="ابدأ بالتسبيح أو قراءة صفحة من المصحف أو إتمام مهمة، وستظهر رحلتك هنا." />
      ) : (
        <>
          <View style={s.tabContainer}>
            <Chip label="اليوم" selected={activeTab === 'day'} onPress={() => setActiveTab('day')} />
            <Chip label="آخر ٣٠ يوم" selected={activeTab === 'month'} onPress={() => setActiveTab('month')} />
          </View>

          <Card padding={5} onPress={() => showReport(activeTab)} accessibilityLabel="عرض التقرير">
            <StatNumber value={display.dhikr} caption={display.label} size="display" />
            {streak > 0 ? (
              <View style={s.streakPill}>
                <Flame size={icon.size.sm} color={colors.goldText} strokeWidth={icon.stroke} />
                <Text style={s.streakText}>{streak > 1 ? `مستمر منذ ${toAr(streak)} أيام` : 'بداية مباركة اليوم'}</Text>
              </View>
            ) : null}
            <Text style={s.heroCaption}>اضغط لعرض التقرير التفصيلي</Text>
          </Card>

          <View style={s.statsRow}>
            <StatCard value={display.prayers} label="الصلوات والمهام" />
            <StatCard value={display.pages} label="صفحات القرآن" />
            <StatCard value={streak} label="أيام متتالية" />
          </View>

          <SectionTitle title="قيام وصيام" />
          <Card padding={4}>
            <StatusRow
              icon={<IconTile icon={Moon} tone={todayQiyam ? 'accent' : 'muted'} />}
              title="قيام الليل"
              sub={activeTab === 'day' ? (todayQiyam ? 'نور في سجل اليوم' : 'فرصة للقيام الليلة') : `تمت المحافظة ${toAr(monthStats.nightPrayerCount)} ليلة`}
            />
            <StatusRow
              icon={<IconTile icon={Sun} tone={todayFasting ? 'success' : 'muted'} />}
              title="صيام اليوم"
              sub={todayFasting ? 'هنيئاً لك صيام اليوم، تقبّل الله' : 'لم يُسجَّل صيام لليوم'}
              last
            />
          </Card>

          <DhikrBreakdownChart details={display.details} />
          <WeeklyActivityChart chartData={chartData} maxDhikr={maxDhikr} />

          <SectionTitle title="دفتر العبادات" />
          {Object.entries(groupedHistory).map(([mKey, days]) => {
            const [year, m] = mKey.split('-');
            const isExpanded = !!expandedMonths[mKey];
            return (
              <View key={mKey}>
                <TouchableOpacity style={s.monthRow} onPress={() => setExpandedMonths((p) => ({ ...p, [mKey]: !p[mKey] }))} activeOpacity={0.8} accessibilityRole="button">
                  <View style={s.monthDisplay}>
                    <Calendar size={icon.size.md} color={accent.accent} strokeWidth={icon.stroke} />
                    <Text style={s.monthLabel}>{MONTHS[parseInt(m, 10) - 1] || mKey} {toAr(year)}</Text>
                    <Text style={s.monthCount}>· {toAr(days.length)} يوم</Text>
                  </View>
                  {isExpanded ? <ChevronUp color={colors.textMuted} size={icon.size.md} /> : <ChevronDown color={colors.textMuted} size={icon.size.md} />}
                </TouchableOpacity>

                {isExpanded && days.map((date) => {
                  const dObj = new Date(date);
                  const rec = records[date];
                  const qiyam = (rec.prayers || []).some((p: string) => QIYAM_IDS.includes(p));
                  return (
                    <TouchableOpacity key={date} style={s.historyCard} onPress={() => showReport('day', date)} activeOpacity={0.8} accessibilityRole="button">
                      <View style={s.historyDatePart}>
                        <Text style={s.historyDayNum}>{isNaN(dObj.getDate()) ? '-' : toAr(dObj.getDate())}</Text>
                        <Text style={s.historyDayShort}>{WEEKDAYS[dObj.getDay()] || ''}</Text>
                      </View>
                      <View style={s.historyContentPart}>
                        <View style={s.historyBadgeRow}>
                          <View style={s.hBadge}><Text style={s.hBadgeText}>{toAr((rec.prayers || []).length)} مهام</Text></View>
                          <View style={s.hBadge}><BookOpen size={11} color={colors.textMuted} /><Text style={s.hBadgeText}>{toAr((rec.quranPages || []).length)} صفحات</Text></View>
                          {qiyam ? <View style={[s.hBadge, { backgroundColor: colors.goldSoft }]}><Star size={11} color={colors.goldText} /><Text style={[s.hBadgeText, { color: colors.goldText }]}>قيام</Text></View> : null}
                        </View>
                        <Text style={s.historySummaryText}>{toAr(rec.dhikrCount || 0)} تسبيحة</Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            );
          })}
        </>
      )}

      {reportData && (
        <DailyReportModal
          visible={reportVisible}
          onClose={() => setReportVisible(false)}
          tasks={reportData.tasks}
          stats={reportData.stats}
          accentColor={accent.accent}
          periodType={reportData.type}
          periodName={reportData.name}
        />
      )}
    </Screen>
  );
};

export default StatsScreen;
