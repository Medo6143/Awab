import type { ImageSourcePropType } from 'react-native';

/**
 * Nature pictures behind the ayah video, 1080×1920 (assets/video-backgrounds), with a small
 * thumbnail each for the picker. All from Pexels (pexels.com/license: free to use, no credit
 * needed); `pexels` is the photo id, pexels.com/photo/<id>.
 */
export type VideoBackground = { id: string; image: ImageSourcePropType; thumb: ImageSourcePropType; pexels: number };

export const VIDEO_BACKGROUNDS: VideoBackground[] = [
  { id: 'golden-clouds', pexels: 32050400, image: require('../../../../assets/video-backgrounds/golden-clouds.jpg'), thumb: require('../../../../assets/video-backgrounds/thumbs/golden-clouds.jpg') },
  { id: 'sun-rays', pexels: 12578398, image: require('../../../../assets/video-backgrounds/sun-rays.jpg'), thumb: require('../../../../assets/video-backgrounds/thumbs/sun-rays.jpg') },
  { id: 'calm-sea', pexels: 15053172, image: require('../../../../assets/video-backgrounds/calm-sea.jpg'), thumb: require('../../../../assets/video-backgrounds/thumbs/calm-sea.jpg') },
  { id: 'milky-way', pexels: 27977090, image: require('../../../../assets/video-backgrounds/milky-way.jpg'), thumb: require('../../../../assets/video-backgrounds/thumbs/milky-way.jpg') },
  { id: 'misty-hills', pexels: 11294493, image: require('../../../../assets/video-backgrounds/misty-hills.jpg'), thumb: require('../../../../assets/video-backgrounds/thumbs/misty-hills.jpg') },
  { id: 'desert-dunes', pexels: 28911994, image: require('../../../../assets/video-backgrounds/desert-dunes.jpg'), thumb: require('../../../../assets/video-backgrounds/thumbs/desert-dunes.jpg') },
  { id: 'waterfall', pexels: 8257830, image: require('../../../../assets/video-backgrounds/waterfall.jpg'), thumb: require('../../../../assets/video-backgrounds/thumbs/waterfall.jpg') },
  { id: 'sunset-clouds', pexels: 13922023, image: require('../../../../assets/video-backgrounds/sunset-clouds.jpg'), thumb: require('../../../../assets/video-backgrounds/thumbs/sunset-clouds.jpg') },
  { id: 'snow-peaks', pexels: 16573043, image: require('../../../../assets/video-backgrounds/snow-peaks.jpg'), thumb: require('../../../../assets/video-backgrounds/thumbs/snow-peaks.jpg') },
  { id: 'white-cloud', pexels: 5432833, image: require('../../../../assets/video-backgrounds/white-cloud.jpg'), thumb: require('../../../../assets/video-backgrounds/thumbs/white-cloud.jpg') },
  { id: 'lake-light', pexels: 25858862, image: require('../../../../assets/video-backgrounds/lake-light.jpg'), thumb: require('../../../../assets/video-backgrounds/thumbs/lake-light.jpg') },
  { id: 'forest-falls', pexels: 1878304, image: require('../../../../assets/video-backgrounds/forest-falls.jpg'), thumb: require('../../../../assets/video-backgrounds/thumbs/forest-falls.jpg') },
  { id: 'green-terraces', pexels: 32050675, image: require('../../../../assets/video-backgrounds/green-terraces.jpg'), thumb: require('../../../../assets/video-backgrounds/thumbs/green-terraces.jpg') },
  { id: 'sand-ripples', pexels: 8869381, image: require('../../../../assets/video-backgrounds/sand-ripples.jpg'), thumb: require('../../../../assets/video-backgrounds/thumbs/sand-ripples.jpg') },
];
