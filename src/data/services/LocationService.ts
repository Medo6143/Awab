import * as Location from 'expo-location';
import { Coordinates } from '../../domain/entities/types';

export class LocationService {
  static async requestPermissions(): Promise<boolean> {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === 'granted';
  }

  static async getCurrentLocation(): Promise<{ coords: Coordinates; countryCode: string | null } | null> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) return null;

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      // Try to determine country for prayer method calculation
      let countryCode: string | null = null;
      try {
        const address = await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
        if (address && address.length > 0) {
          countryCode = address[0].isoCountryCode;
        }
      } catch (e) {
        console.warn('LocationService: Failed to reverse geocode:', e);
      }

      return {
        coords: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        },
        countryCode: countryCode,
      };
    } catch (error) {
      console.error('Error fetching location:', error);
      return null;
    }
  }

  static calculateQiblaDirection(lat: number, lon: number): number {
    const kaabaLat = 21.4225;
    const kaabaLon = 39.8262;

    const φ1 = (lat * Math.PI) / 180;
    const φ2 = (kaabaLat * Math.PI) / 180;
    const Δλ = ((kaabaLon - lon) * Math.PI) / 180;

    const y = Math.sin(Δλ) * Math.cos(φ2);
    const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
    let qibla = (Math.atan2(y, x) * 180) / Math.PI;
    
    return (qibla + 360) % 360;
  }
}
