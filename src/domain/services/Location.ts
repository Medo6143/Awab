import { Coordinates } from '../entities/types';

/** One compass reading: degrees clockwise from north, and the sensor's accuracy (1 low … 3 high, 0 unknown). */
export type HeadingReading = { degrees: number; accuracy: number };

/** Where the phone is and which way it faces. */
export interface LocationProvider {
  requestPermission(): Promise<boolean>;
  /** The current position and its country (for the prayer method), or null without permission or a fix. */
  currentPosition(): Promise<{ coords: Coordinates; countryCode: string | null } | null>;
  /** Calls `onReading` on every compass change until the returned handle is removed. */
  watchHeading(onReading: (r: HeadingReading) => void): Promise<{ remove(): void }>;
}
