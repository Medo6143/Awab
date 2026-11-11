import { useEffect, useState, useRef } from 'react';
import { Coordinates } from '../../domain/entities/types';
import { qiblaBearing } from '../../domain/services/geo';
import { useDependencies } from '../providers/DependencyProvider';

export type AccuracyLevel = 'low' | 'medium' | 'high' | 'unknown';

/**
 * Compass heading, 0–360 clockwise from north, smoothed. `hasHeading` stays false until the
 * first reading, and forever on a phone without a compass, so callers can avoid pointing an
 * arrow as if the phone faced north.
 */
export const useHeading = (enabled = true) => {
  const [heading, setHeading] = useState(0);
  const [hasHeading, setHasHeading] = useState(false);
  const [accuracy, setAccuracy] = useState<AccuracyLevel>('unknown');
  const lastHeading = useRef<number | null>(null);
  const { location } = useDependencies();

  useEffect(() => {
    if (!enabled) return;
    let subscription: { remove(): void } | null = null;
    let alive = true;

    const startWatching = async () => {
      const hasPermission = await location.requestPermission();
      if (!hasPermission || !alive) return;
      const sub = await location.watchHeading((data) => {
        const trueHeading = data.degrees;

        // Map accuracy: 3 = High, 2 = Medium, 1 = Low
        let acc: AccuracyLevel = 'unknown';
        if (data.accuracy >= 3) acc = 'high';
        else if (data.accuracy === 2) acc = 'medium';
        else if (data.accuracy === 1) acc = 'low';
        setAccuracy(acc);

        // smooth along the shorter way round, so 359° → 1° moves 2°, not 358° back through south
        const last = lastHeading.current;
        const smoothed = last == null ? trueHeading : (last + (((trueHeading - last + 540) % 360) - 180) * 0.7 + 360) % 360;
        lastHeading.current = smoothed;
        setHeading(smoothed);
        setHasHeading(true);
      });
      if (alive) subscription = sub;
      else sub.remove();
    };

    startWatching();
    return () => {
      alive = false;
      subscription?.remove();
    };
  }, [enabled, location]);

  return { heading, hasHeading, accuracy };
};

/** Position (once) and, unless `watchHeading` is false, the compass. */
export const useLocation = ({ watchHeading = true }: { watchHeading?: boolean } = {}) => {
  const [coords, setCoords] = useState<Coordinates | null>(null);
  const [countryCode, setCountryCode] = useState<string | null>(null);
  const [qiblaDir, setQiblaDir] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const { heading, hasHeading, accuracy } = useHeading(watchHeading);
  const { location } = useDependencies();

  useEffect(() => {
    let isMounted = true;
    const fetchLocation = async () => {
      try {
        const result = await location.currentPosition();
        if (isMounted && result) {
          const { coords: fetchedCoords, countryCode: fetchedCountry } = result;
          setCoords(fetchedCoords);
          setCountryCode(fetchedCountry);
          setQiblaDir(qiblaBearing(fetchedCoords));
        } else if (isMounted) {
          setError('Location permission denied or unavailable');
        }
      } catch (e) {
        if (isMounted) setError('Error fetching location');
      }
    };

    fetchLocation();
    return () => { isMounted = false; };
  }, [location]);

  return { coords, countryCode, heading, hasHeading, qiblaDir, accuracy, error };
};
