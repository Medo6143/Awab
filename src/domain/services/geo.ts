import { Coordinates } from '../entities/types';

const rad = (d: number) => (d * Math.PI) / 180;

/** Great-circle distance in metres. */
export const distanceMeters = (a: Coordinates, b: Coordinates) => {
  const dLat = rad(b.latitude - a.latitude), dLon = rad(b.longitude - a.longitude);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.latitude)) * Math.cos(rad(b.latitude)) * Math.sin(dLon / 2) ** 2;
  return 2 * 6371000 * Math.asin(Math.sqrt(h));
};

/** Compass bearing from `a` to `b`, 0–360 degrees clockwise from north. */
export const bearingDeg = (a: Coordinates, b: Coordinates) => {
  const φ1 = rad(a.latitude), φ2 = rad(b.latitude), Δλ = rad(b.longitude - a.longitude);
  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
};

/** Minutes on foot at an easy 80 m a minute. */
export const walkMinutes = (meters: number) => Math.max(1, Math.round(meters / 80));

const KAABA: Coordinates = { latitude: 21.4225, longitude: 39.8262 };

/** Direction of the Kaaba from `c`, 0–360 degrees clockwise from north. */
export const qiblaBearing = (c: Coordinates) => bearingDeg(c, KAABA);
