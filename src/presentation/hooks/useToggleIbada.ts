import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import * as Haptics from 'expo-haptics';
import { toggleTask } from '../store/slices/ibadaSlice';
import { logPrayer } from '../store/slices/statsSlice';

/**
 * Check or uncheck a worship task, and record it in today's stats too, so the prayer
 * page, the ibada page and the stats all agree.
 */
export const useToggleIbada = () => {
  const dispatch = useDispatch();
  return useCallback((id: string, wasDone: boolean) => {
    Haptics.selectionAsync();
    dispatch(toggleTask(id));
    dispatch(logPrayer({ prayerId: id, isCompleted: !wasDone }));
  }, [dispatch]);
};
