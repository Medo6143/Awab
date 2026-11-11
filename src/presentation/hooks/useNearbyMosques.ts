import { useCallback, useEffect, useRef, useState } from 'react';
import { Coordinates } from '../../domain/entities/types';
import { Mosque } from '../../domain/services/Mosques';
import { useDependencies } from '../providers/DependencyProvider';

/** Mosques around `coords`, nearest first; waits for a position, and can be retried. */
export const useNearbyMosques = (coords: Coordinates | null) => {
  const [mosques, setMosques] = useState<Mosque[] | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tick, setTick] = useState(0);
  // only the fetch a retry starts skips the saved answer; a later move uses the cache again
  const fresh = useRef(false);
  const { mosques: finder } = useDependencies();

  useEffect(() => {
    if (!coords) return;
    let alive = true;
    const skipCache = fresh.current;
    fresh.current = false;
    setLoading(true);
    setError(false);
    finder.findNearby(coords, skipCache)
      .then((list) => { if (alive) setMosques(list); })
      .catch(() => { if (alive) setError(true); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
    // a few metres of GPS drift should not query again: key on the rounded position
  }, [coords && Math.round(coords.latitude * 1000), coords && Math.round(coords.longitude * 1000), tick, finder]);

  const retry = useCallback(() => { fresh.current = true; setTick((t) => t + 1); }, []);
  return { mosques, error, loading, retry };
};
