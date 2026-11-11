import { useCallback, useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { useDependencies } from '../providers/DependencyProvider';

/**
 * Whether the adhan may ring at the exact minute (Android 14+ asks the user once), checked on
 * mount and again whenever the app comes back to the foreground, e.g. from the settings page.
 * `granted` is null until the first check answers.
 */
export const useExactAlarmAccess = () => {
  const { azanAlarms } = useDependencies();
  const [granted, setGranted] = useState<boolean | null>(null);

  const check = useCallback(() => {
    azanAlarms.canScheduleExact().then(setGranted);
  }, [azanAlarms]);

  useEffect(() => {
    check();
    const sub = AppState.addEventListener('change', (s) => { if (s === 'active') check(); });
    return () => sub.remove();
  }, [check]);

  const request = useCallback(() => azanAlarms.openExactAlarmSettings(), [azanAlarms]);
  return { granted, request };
};
