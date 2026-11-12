import { Coordinates } from '../entities/types';

/**
 * Google Maps searching for «مسجد» around `at`. Without a position, Google Maps searches
 * around wherever the phone is, with its own location permission.
 *
 * Mosques are not listed in the app: no open dataset covers Egyptian villages (OSM, Overture
 * and Foursquare had none within 5 km of Abu Ghalib, Giza), and Google Maps has them (#22).
 */
export const mosqueSearchUrl = (at?: Coordinates | null) => {
  const q = encodeURIComponent('مسجد');
  return at
    ? `https://www.google.com/maps/search/${q}/@${at.latitude.toFixed(5)},${at.longitude.toFixed(5)},15z`
    : `https://www.google.com/maps/search/?api=1&query=${q}`;
};
