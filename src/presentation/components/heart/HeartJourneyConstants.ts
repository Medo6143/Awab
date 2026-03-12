import { Dimensions } from 'react-native';

export const { width, height } = Dimensions.get('window');

export const JUZ_SURAH_RANGES = [
  [1, 2], [2, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8], [8, 9], [9, 10],
  [11, 12], [12, 14], [14, 16], [16, 18], [18, 20], [20, 22], [22, 25], [25, 27], [27, 29], [29, 32],
  [33, 36], [36, 39], [39, 43], [43, 47], [47, 51], [51, 57], [58, 66], [67, 77], [78, 114]
];

export const HEART_ANATOMY_BODY = "M12 28 C6 24, 2 18, 2 12 C2 7, 6 4, 12 8 C18 4, 22 7, 22 12 C22 18, 18 24, 12 28 Z";

export const toAr = (n: number) => n.toString().replace(/[0-9]/g, d => '٠١٢٣٤٥٦٧٨٩'[+d]);
