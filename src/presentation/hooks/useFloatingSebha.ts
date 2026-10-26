import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, AppState, Platform } from 'react-native';
import { useDispatch, useSelector, useStore } from 'react-redux';
import { RootState } from '../store';
import { incrementCount, resetCount, setFloatingActive } from '../store/slices/tasbeehSlice';
import { logDhikr } from '../store/slices/statsSlice';
import { useDependencies } from '../providers/DependencyProvider';
import { FloatingSebhaConfig, reconcileCount } from '../../domain/services/FloatingSebha';
import { NotificationService } from '../../data/services/NotificationService';

const DEFAULT_LABEL = 'سبحان الله';
type TasbeehState = RootState['tasbeeh'];

export const toSebhaConfig = (t: TasbeehState): FloatingSebhaConfig => ({
  scale: typeof t.floatingScale === 'number' ? t.floatingScale : 1,
  accentColor: t.floatingBubbleColor || '#B8860B',
  showBorder: !!t.floatingShowBorder,
  showReset: !!t.floatingShowReset,
  reminderInterval: t.floatingReminderInterval || 10,
});

/** Pull the overlay's saved count into the store (or push the store's count to it). */
const useCountSync = () => {
  const { floatingSebha } = useDependencies();
  const dispatch = useDispatch();
  const store = useStore<RootState>();
  /**
   * allowReset: a saved 0 may mean the overlay was reset while the app was not listening.
   * When stopping, resets already arrived as live events, so a 0 then is not trusted.
   */
  return useCallback(async ({ allowReset = true }: { allowReset?: boolean } = {}) => {
    const { count, selectedDhikr } = store.getState().tasbeeh;
    const r = reconcileCount(await floatingSebha.getSavedCount(), count);
    if (r.kind === 'add') {
      dispatch(incrementCount(r.amount));
      dispatch(logDhikr({ name: selectedDhikr || DEFAULT_LABEL, count: r.amount }));
    } else if (r.kind === 'reset' && allowReset) {
      dispatch(resetCount());
    } else if (r.kind === 'push') {
      floatingSebha.setCount(count);
    }
  }, [floatingSebha, dispatch, store]);
};

/**
 * Keeps the overlay and the store in step for the whole app session: restores the
 * overlay on launch and on return from background, mirrors count/label/config, and
 * turns overlay events into store actions. Rendered once at the app root.
 */
export const useFloatingSebhaSync = () => {
  const { floatingSebha } = useDependencies();
  const dispatch = useDispatch();
  const store = useStore<RootState>();
  const syncCount = useCountSync();
  const t = useSelector((s: RootState) => s.tasbeeh);
  const [ready, setReady] = useState(false);
  const lastReminder = useRef<string | null>(null);
  const available = floatingSebha.isAvailable;

  // restore on launch
  useEffect(() => {
    (async () => {
      if (!t.isFloatingActive || !available) return;
      if (!(await floatingSebha.hasPermission())) { dispatch(setFloatingActive(false)); return; }
      await NotificationService.requestPermissions();
      await floatingSebha.initialize();
      if (!(await floatingSebha.isVisible())) {
        floatingSebha.configure(toSebhaConfig(store.getState().tasbeeh));
        await floatingSebha.show().catch(() => {});
      }
      await syncCount();
    })().finally(() => setReady(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // restore after the system killed it while the app was in the background
  useEffect(() => {
    const sub = AppState.addEventListener('change', async (next) => {
      if (next !== 'active' || !ready || !available || !store.getState().tasbeeh.isFloatingActive) return;
      if (!(await floatingSebha.isVisible())) await floatingSebha.show().catch(() => {});
      syncCount();
    });
    return () => sub.remove();
  }, [ready, available, floatingSebha, store, syncCount]);

  // mirror config (only while active: configuring starts the foreground service)
  useEffect(() => {
    if (available && t.isFloatingActive) floatingSebha.configure(toSebhaConfig(t));
  }, [available, t.isFloatingActive, t.floatingScale, t.floatingBubbleColor, t.floatingShowBorder, t.floatingShowReset, t.floatingReminderInterval, floatingSebha]);

  useEffect(() => {
    if (ready && available && t.isFloatingActive) floatingSebha.setCount(t.count);
  }, [ready, available, t.isFloatingActive, t.count, floatingSebha]);

  useEffect(() => {
    if (!available || !t.isFloatingActive) return;
    const label = t.selectedDhikr || DEFAULT_LABEL;
    floatingSebha.setLabel(label);
    if (lastReminder.current !== label) {
      floatingSebha.showReminder(label);
      lastReminder.current = label;
    }
  }, [available, t.isFloatingActive, t.selectedDhikr, floatingSebha]);

  // overlay events
  useEffect(() => {
    if (!available) return;
    const offs = [
      floatingSebha.onPress(() => {
        dispatch(incrementCount(1));
        dispatch(logDhikr({ name: store.getState().tasbeeh.selectedDhikr || DEFAULT_LABEL, count: 1 }));
      }),
      floatingSebha.onReset(() => dispatch(resetCount())),
      // stopped from the overlay: keep what was counted before marking it inactive
      floatingSebha.onRemove(async () => {
        await syncCount({ allowReset: false });
        dispatch(setFloatingActive(false));
      }),
    ];
    return () => offs.forEach((off) => off());
  }, [available, floatingSebha, dispatch, store, syncCount]);
};

/** Waits until the user comes back from a system settings page (or 30 s pass). */
const waitForReturn = () => new Promise<void>((resolve) => {
  const sub = AppState.addEventListener('change', (s) => {
    if (s === 'active') { sub.remove(); setTimeout(resolve, 500); }
  });
  setTimeout(() => { sub.remove(); resolve(); }, 30000);
});

/** State and the on/off action behind the settings toggle. */
export const useFloatingSebhaToggle = () => {
  const { floatingSebha } = useDependencies();
  const dispatch = useDispatch();
  const store = useStore<RootState>();
  const syncCount = useCountSync();
  const isActive = useSelector((s: RootState) => s.tasbeeh.isFloatingActive);
  const [isPermitted, setIsPermitted] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  useEffect(() => {
    if (!floatingSebha.isAvailable) return;
    floatingSebha.hasPermission().then((ok) => {
      setIsPermitted(ok);
      if (ok) floatingSebha.initialize();
    });
  }, [floatingSebha]);

  const ensurePermission = async () => {
    if (await floatingSebha.hasPermission()) return true;
    await floatingSebha.requestPermission();
    await waitForReturn();
    const ok = await floatingSebha.hasPermission();
    setIsPermitted(ok);
    return ok;
  };

  const enable = async () => {
    await floatingSebha.initialize();
    floatingSebha.configure(toSebhaConfig(store.getState().tasbeeh));
    await floatingSebha.show();
    floatingSebha.setCount(store.getState().tasbeeh.count);
    dispatch(setFloatingActive(true));
    // confirm it really appeared; otherwise show what is missing
    setTimeout(async () => {
      const d = await floatingSebha.diagnostics();
      if (d && !d.bubbleViewExists) {
        Alert.alert('تشخيص المسبحة',
          `الخدمة: ${d.serviceRunning ? '✅' : '❌'}\n` +
          `صلاحية العرض: ${d.overlayPermission ? '✅' : '❌'}\n` +
          `الفقاعة: ${d.bubbleViewExists ? '✅' : '❌'}\n` +
          `الحدث: ${d.lastEvent || 'N/A'}\n` +
          `الخطأ: ${d.lastError || 'None'}\n\n` +
          'تأكد من:\n1. صلاحية العرض فوق التطبيقات\n2. إيقاف توفير البطارية\n3. السماح بالنوافذ المنبثقة');
      } else {
        Alert.alert('تم التفعيل', 'المسبحة العائمة تعمل الآن.');
      }
    }, 1500);
  };

  const disable = async () => {
    await syncCount({ allowReset: false }); // keep what the overlay counted before it goes away
    await floatingSebha.hide();
    dispatch(setFloatingActive(false));
  };

  const toggle = async () => {
    if (isToggling) return;
    if (!floatingSebha.isAvailable) {
      Alert.alert('خطأ', 'الموديول الأصلي للمسبحة العائمة غير متاح. تأكد من تثبيت التطبيق بالكامل.');
      return;
    }
    setIsToggling(true);
    try {
      if (!(await ensurePermission())) {
        Alert.alert('صلاحية مطلوبة', 'يجب تفعيل "السماح بالعرض فوق التطبيقات الأخرى" من الإعدادات.');
        return;
      }
      if (Platform.OS === 'android' && Number(Platform.Version) >= 33 && !(await NotificationService.requestPermissions())) {
        Alert.alert('تنبيه الإشعارات', 'يُفضل تفعيل الإشعارات لضمان استقرار المسبحة العائمة في الخلفية.');
      }
      if (isActive) await disable();
      else {
        try {
          await enable();
        } catch (e: any) {
          Alert.alert('خطأ في التفعيل', 'فشل إظهار المسبحة العائمة: ' + (e?.message || String(e)) + '\n\nتأكد من:\n1. تفعيل "العرض فوق التطبيقات"\n2. عدم تفعيل توفير البطارية للتطبيق');
        }
      }
    } catch (e: any) {
      Alert.alert('خطأ', 'حدث خطأ: ' + (e?.message || String(e)));
    } finally {
      setIsToggling(false);
    }
  };

  return { isActive, isPermitted, isToggling, toggle };
};
