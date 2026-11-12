import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import { useDependencies } from '../providers/DependencyProvider';
import { findNextPrayer } from '../../domain/entities/prayer';
import { prayerArName, widgetDateLine } from '../../domain/services/prayerDay';
import { toAr } from '../../shared/utils/format';

/**
 * Keeps the home-screen widget on the next prayer: when today's times change, and each minute
 * in case the next prayer has. Mounted once, at the app root.
 */
export const usePrayerWidgetSync = () => {
  const { prayerWidget } = useDependencies();
  const day = useSelector((s: RootState) => s.prayer.cachedData);
  const shown = useRef<string | null>(null);

  useEffect(() => {
    if (!day) return;
    shown.current = null; // new times: push them even if the next prayer is the same
    const push = () => {
      const next = findNextPrayer(day.timings, new Date());
      if (!next || shown.current === next.name) return;
      shown.current = next.name;
      prayerWidget.update({
        prayerName: prayerArName(next.name),
        prayerTime: next.time,
        targetTimeMillis: Date.now() + next.remaining * 60 * 1000, // remaining is in minutes
        // today's times let the widget move to the next prayer and draw its sky on its own
        timings: JSON.stringify(day.timings ?? {}),
        dateLine: widgetDateLine(new Date(), day.date?.hijri, toAr),
      });
    };
    push();
    const id = setInterval(push, 60000);
    return () => clearInterval(id);
  }, [day, prayerWidget]);
};
