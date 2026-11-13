import type { IbadaTask as ReportTask } from '../store/slices/ibadaSlice';

type ReportData = {
  type: 'day' | 'month' | 'year';
  name: string;
  tasks: ReportTask[];
  stats: { dhikrCount: number; dhikrDetails?: Record<string, number>; quranPages: number };
};
import { ScreenProps } from '../navigation/types';
import React, { useState, useMemo } from 'react';
import { View } from 'react-native';
import { useSelector } from 'react-redux';
import { Moon, Sun, BarChart3 } from 'lucide-react-native';
import { RootState } from '../store';
import { IbadaTask } from '../store/slices/ibadaSlice';
import { useAccent } from '../../shared/theme/useAccent';
import { toAr } from '../../shared/utils/format';

import { Screen, ScreenHeader, Chip, Card, SectionTitle, IconTile, EmptyState } from '../components/ui';
import { StatCard, WeeklyActivityChart, DhikrBreakdownChart, StatusRow, StreakCard, Heatmap } from '../components/stats/StatsComponents';
import { DailyReportModal } from '../components/home/DailyReportModal';
import { IbadaCalendar, MONTHS, dayLevel } from '../components/stats/IbadaCalendar';
import { journeyOf } from '../../domain/services/returns';
import { s } from '../components/stats/StatsStyles';

const QIYAM_IDS = ['qiyam_al_layl', 'qiyan_al_layl'];
const FARD_IDS = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
const localKey = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const StatsScreen = ({ navigation }: Pick<ScreenProps, 'navigation'>) => {
  const accent = useAccent();
  const [activeTab, setActiveTab] = useState<'day' | 'month'>('day');
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

  // older versions saved days under Date.toDateString(); fold everything onto YYYY-MM-DD
  const byDay = useMemo(() => {
    const out: typeof records = {};
    Object.entries(records).forEach(([k, r]) => {
      const iso = /^\d{4}-\d{2}-\d{2}$/.test(k);
      const d = new Date(iso ? `${k}T12:00:00` : k);
      if (isNaN(d.getTime())) return;
      const key = localKey(d);
      if (iso || !out[key]) out[key] = r;
    });
    return out;
  }, [records]);

  const journey = useMemo(() => journeyOf(Object.keys(byDay), todayKey), [byDay, todayKey]);

  // obligatory prayers kept, as a share of the days counted (never more than since the first record)
  const fardOf = (k: string) => (byDay[k]?.prayers || []).filter((p: string) => FARD_IDS.includes(p)).length;
  const prayerShare = (days: number) => {
    const first = Object.keys(byDay).sort()[0];
    const since = first ? Math.floor((Date.now() - new Date(`${first}T00:00:00`).getTime()) / 86400000) + 1 : 1;
    const n = Math.max(1, Math.min(days, since));
    let kept = 0;
    for (let i = 0; i < n; i++) { const d = new Date(); d.setDate(d.getDate() - i); kept += fardOf(localKey(d)); }
    return Math.round((kept / (n * 5)) * 100);
  };

  // 12 weeks, oldest first, each a column Sunday..Saturday; -1 for days still to come
  const heat = useMemo(() => {
    const start = new Date(); start.setHours(12, 0, 0, 0);
    start.setDate(start.getDate() - start.getDay() - 7 * 11);
    return Array.from({ length: 12 }, (_, w) => Array.from({ length: 7 }, (__, d) => {
      const day = new Date(start); day.setDate(start.getDate() + w * 7 + d);
      if (day.getTime() > Date.now()) return -1;
      return dayLevel(byDay[localKey(day)]);
    }));
  }, [byDay]);

  const monthStats = getRangeStats(30);
  const todayQiyam = (todayStats.prayers || []).some((p: string) => QIYAM_IDS.includes(p));
  const todayFasting = (todayStats.prayers || []).includes('fasting');

  const display = activeTab === 'day'
    ? { prayers: (todayStats.prayers || []).length, dhikr: todayStats.dhikrCount || 0, pages: (todayStats.quranPages || []).length, label: 'تسبيحة اليوم', details: todayStats.dhikrDetails || {} }
    : { prayers: monthStats.prayers, dhikr: monthStats.dhikr, pages: monthStats.pages, label: 'تسبيحة في ٣٠ يوماً', details: monthStats.allDhikrDetails };

  const chartData = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    return records[localKey(d)]?.dhikrCount || records[d.toDateString()]?.dhikrCount || 0;
  });
  const maxDhikr = Math.max(...chartData, 100);

  /** Sums of the days whose key starts with `prefix` ("2026-11" for a month, "2026" for a year). */
  const sumOf = (prefix: string) => {
    let dhikr = 0, pages = 0;
    const details: Record<string, number> = {};
    Object.entries(byDay).forEach(([k, r]) => {
      if (!k.startsWith(prefix)) return;
      dhikr += r.dhikrCount || 0;
      pages += (r.quranPages || []).length;
      Object.entries(r.dhikrDetails || {}).forEach(([n, c]) => { details[n] = (details[n] || 0) + (c as number); });
    });
    return { dhikrCount: dhikr, dhikrDetails: details, quranPages: pages };
  };

  const showMonth = (year: number, month: number) => {
    setReportData({ type: 'month', stats: sumOf(`${year}-${String(month + 1).padStart(2, '0')}`), name: `${MONTHS[month]} ${toAr(year)}`, tasks: [] });
    setReportVisible(true);
  };

  const showYear = (year: number) => {
    setReportData({ type: 'year', stats: sumOf(String(year)), name: `سنة ${toAr(year)}`, tasks: [] });
    setReportVisible(true);
  };

  const showReport = (type: 'day' | 'month', dateKey?: string) => {
    if (type === 'day') {
      const target = dateKey || todayKey;
      const r = byDay[target] || { prayers: [], dhikrCount: 0, quranPages: [], dhikrDetails: {} };
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
    <Screen scroll header={<ScreenHeader title="رحلتك" subtitle="الإحصائيات وتتبّع الاستمرار" onBack={() => navigation.goBack()} />}>
      {!hasAnyData ? (
        <EmptyState icon={BarChart3} title="لا توجد إحصائيات بعد" message="ابدأ بالتسبيح أو قراءة صفحة من المصحف أو إتمام مهمة، وستظهر رحلتك هنا." />
      ) : (
        <>
          <View style={s.tabContainer}>
            <Chip label="اليوم" selected={activeTab === 'day'} onPress={() => setActiveTab('day')} />
            <Chip label="آخر ٣٠ يوم" selected={activeTab === 'month'} onPress={() => setActiveTab('month')} />
          </View>

          <StreakCard journey={journey} onPress={() => showReport(activeTab)} />

          <View style={s.statsRow}>
            <StatCard value={`${toAr(prayerShare(activeTab === 'day' ? 1 : 30))}٪`} label="الصلوات" />
            <StatCard value={display.pages} label="صفحات القرآن" />
            <StatCard value={display.dhikr} label={activeTab === 'day' ? 'تسبيحات اليوم' : 'تسبيحات'} />
          </View>

          <WeeklyActivityChart chartData={chartData} maxDhikr={maxDhikr} />
          <Heatmap levels={heat} />

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

          <SectionTitle title="دفتر العبادات" />
          <IbadaCalendar byDay={byDay} returnDays={journey.returnDays} onDayPress={(k) => showReport('day', k)} onMonthPress={showMonth} onYearPress={showYear} />
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
