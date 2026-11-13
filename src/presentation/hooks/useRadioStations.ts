import { useCallback, useEffect, useState } from 'react';
import { RadioStation } from '../../domain/entities/radio';
import { useDependencies } from '../providers/DependencyProvider';

/** The live radio list: loads once, with an error state and a retry. */
export const useRadioStations = () => {
  const { radios } = useDependencies();
  const [stations, setStations] = useState<RadioStation[] | null>(null);
  const [error, setError] = useState(false);

  const load = useCallback(() => {
    setError(false);
    radios.stations().then(setStations).catch(() => setError(true));
  }, [radios]);

  useEffect(() => { load(); }, [load]);

  return { stations, loading: !stations && !error, error, retry: load };
};
