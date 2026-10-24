import { Dimensions } from 'react-native';

export const { width, height } = Dimensions.get('window');

// Surah range touched by each of the 30 ajza' (index 0 = juz 1). Surah 2 spans
// juz 1-3, so ranges overlap on purpose; a juz counts as complete when every surah
// it touches is marked complete.
export const JUZ_SURAH_RANGES: [number, number][] = [
  [1, 2],   [2, 2],   [2, 3],   [3, 4],   [4, 4],   [4, 5],   [5, 6],   [6, 7],   [7, 8],   [8, 9],
  [9, 11],  [11, 12], [12, 14], [15, 16], [17, 18], [18, 20], [21, 22], [23, 25], [25, 27], [27, 29],
  [29, 33], [33, 36], [36, 39], [39, 41], [41, 45], [46, 51], [51, 57], [58, 66], [67, 77], [78, 114],
];

export const HEART_ANATOMY_BODY = "M12 28 C6 24, 2 18, 2 12 C2 7, 6 4, 12 8 C18 4, 22 7, 22 12 C22 18, 18 24, 12 28 Z";

export { toAr } from '../../../shared/utils/format';

// NOTE: the heart map itself (114 organic regions) now lives in ./heartMap.ts,
// generated as a Voronoi tessellation. HEART_ANATOMY_BODY above is kept for any
// legacy references but is no longer used by HeartVisualizer.
