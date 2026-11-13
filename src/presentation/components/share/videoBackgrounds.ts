import type { ImageSourcePropType } from 'react-native';

/**
 * Nature clips behind the ayah video. The clip itself is downloaded when picked (see
 * VideoBackgrounds); only a small still of each ships with the app, for the picker. All from
 * Pexels (pexels.com/license: free to use, no credit needed); `pexels` is the video id,
 * pexels.com/video/<id>.
 */
export type VideoBackground = { id: string; thumb: ImageSourcePropType; pexels: number };

export const VIDEO_BACKGROUNDS: VideoBackground[] = [
  { id: 'sky-clouds', pexels: 5693822, thumb: require('../../../../assets/video-backgrounds/sky-clouds.jpg') },
  { id: 'clouds-timelapse', pexels: 11678587, thumb: require('../../../../assets/video-backgrounds/clouds-timelapse.jpg') },
  { id: 'ocean-wave', pexels: 9620654, thumb: require('../../../../assets/video-backgrounds/ocean-wave.jpg') },
  { id: 'sea-sunset', pexels: 36906465, thumb: require('../../../../assets/video-backgrounds/sea-sunset.jpg') },
  { id: 'red-sunset', pexels: 15519539, thumb: require('../../../../assets/video-backgrounds/red-sunset.jpg') },
  { id: 'mountain-waterfall', pexels: 31002853, thumb: require('../../../../assets/video-backgrounds/mountain-waterfall.jpg') },
  { id: 'forest-waterfall', pexels: 40011100, thumb: require('../../../../assets/video-backgrounds/forest-waterfall.jpg') },
  { id: 'pine-forest', pexels: 32848154, thumb: require('../../../../assets/video-backgrounds/pine-forest.jpg') },
  { id: 'forest-stream', pexels: 33536363, thumb: require('../../../../assets/video-backgrounds/forest-stream.jpg') },
  { id: 'sand-dunes', pexels: 19797595, thumb: require('../../../../assets/video-backgrounds/sand-dunes.jpg') },
  { id: 'desert-sunset', pexels: 39145684, thumb: require('../../../../assets/video-backgrounds/desert-sunset.jpg') },
  { id: 'snow-mountains', pexels: 37591340, thumb: require('../../../../assets/video-backgrounds/snow-mountains.jpg') },
];
