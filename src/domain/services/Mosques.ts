import { Coordinates } from '../entities/types';

export type Mosque = { id: string; name: string; coords: Coordinates; meters: number };

/** How far around the user mosques are looked for. */
export const MOSQUE_RADIUS_M = 3000;

/** Mosques around a point, and the map links to reach them. */
export interface MosqueFinder {
  /** Within MOSQUE_RADIUS_M, nearest first. `fresh` skips any saved answer. */
  findNearby(at: Coordinates, fresh?: boolean): Promise<Mosque[]>;
  /** A link that opens walking directions to `m`. */
  walkingDirectionsUrl(m: Mosque): string;
  /** A link that searches a full map for mosques around `at`, for ones this finder does not know. */
  mapSearchUrl(at: Coordinates): string;
}
