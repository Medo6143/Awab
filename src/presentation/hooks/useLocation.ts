import { useEffect, useState, useRef } from 'react';
import * as Location from 'expo-location';
import { LocationService } from '../../data/services/LocationService';
import { Coordinates } from '../../domain/entities/types';

export type AccuracyLevel = 'low' | 'medium' | 'high' | 'unknown';

export const useLocation = () => {
  const [coords, setCoords] = useState<Coordinates | null>(null);
  const [heading, setHeading] = useState(0);
  const [qiblaDir, setQiblaDir] = useState(0);
  const [accuracy, setAccuracy] = useState<AccuracyLevel>('unknown');
  const [error, setError] = useState<string | null>(null);
  
  const lastHeading = useRef(0);

  // 1. Initial Location Setup
  useEffect(() => {
    let isMounted = true;
    const fetchLocation = async () => {
      try {
        const location = await LocationService.getCurrentLocation();
        if (isMounted && location) {
          setCoords(location);
          const qibla = LocationService.calculateQiblaDirection(location.latitude, location.longitude);
          setQiblaDir(qibla);
        } else if (isMounted) {
          setError('Location permission denied or unavailable');
        }
      } catch (e) {
        if (isMounted) setError('Error fetching location');
      }
    };
    
    fetchLocation();
    return () => { isMounted = false; };
  }, []);

  // 2. Heading Subscription with Accuracy level maping
  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null;

    const startWatching = async () => {
      const hasPermission = await LocationService.requestPermissions();
      if (hasPermission) {
        subscription = await Location.watchHeadingAsync((data) => {
          const trueHeading = data.trueHeading === -1 ? data.magHeading : data.trueHeading;
          
          // Map accuracy: 3 = High, 2 = Medium, 1 = Low
          let acc: AccuracyLevel = 'unknown';
          if (data.accuracy >= 3) acc = 'high';
          else if (data.accuracy === 2) acc = 'medium';
          else if (data.accuracy === 1) acc = 'low';
          
          setAccuracy(acc);

          // Smoother transition logic
          const smoothed = lastHeading.current * 0.6 + trueHeading * 0.4;
          lastHeading.current = smoothed;
          
          setHeading(smoothed);
        });
      }
    };

    startWatching();

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, []);

  return { coords, heading, qiblaDir, accuracy, error };
};
