import * as Location from 'expo-location';
import { Coordinates } from '../../domain/entities/types';
import { HeadingReading, LocationProvider } from '../../domain/services/Location';

/** LocationProvider on top of expo-location. */
export class ExpoLocationProvider implements LocationProvider {
  async requestPermission(): Promise<boolean> {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === 'granted';
  }

  async currentPosition(): Promise<{ coords: Coordinates; countryCode: string | null } | null> {
    try {
      if (!(await this.requestPermission())) return null;

      let location: Location.LocationObject | null = null;
      try {
        location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      } catch (e) {
        // Network provider unavailable (indoors, airplane mode, emulators): fall back to
        // the last known fix, then to a GPS-only request, instead of giving up.
        console.warn('LocationService: current position failed, trying fallbacks:', e instanceof Error ? e.message : e);
        location = await Location.getLastKnownPositionAsync({ maxAge: 24 * 60 * 60 * 1000 });
        if (!location) {
          location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest });
        }
      }
      if (!location) return null;

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
        coords: { latitude: location.coords.latitude, longitude: location.coords.longitude },
        countryCode,
      };
    } catch (error) {
      console.error('Error fetching location:', error);
      return null;
    }
  }

  watchHeading(onReading: (r: HeadingReading) => void): Promise<{ remove(): void }> {
    return Location.watchHeadingAsync((data) =>
      // trueHeading is -1 until the phone knows where it is; magnetic north is close enough until then
      onReading({ degrees: data.trueHeading === -1 ? data.magHeading : data.trueHeading, accuracy: data.accuracy }),
    );
  }
}
