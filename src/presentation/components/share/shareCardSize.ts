import { PixelRatio } from 'react-native';

/** Story format (9:16), the size Instagram/WhatsApp stories use. */
export const SHARE_PX_W = 1080;
export const SHARE_PX_H = 1920;

/** Cards lay themselves out in dp at exactly this many pixels, so the capture is 1080×1920. */
export const useShareCardSize = () => {
  const r = PixelRatio.get();
  return { w: SHARE_PX_W / r, h: SHARE_PX_H / r };
};
