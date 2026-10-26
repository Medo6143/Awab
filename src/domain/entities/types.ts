/** A dua as stored and shown: built-in ones and the user's own share this shape. */
export type Dua = {
  id: string;
  text: string;
  ref: string;
  category: string;
};

export type Coordinates = {
  latitude: number;
  longitude: number;
};

export type AudioState = {
  isPlaying: boolean;
  isBuffering: boolean;
  currentSurahId: number | null;
  currentPosition: number;
  duration: number;
  playMode?: 'surah' | 'ayah' | 'sequence';
};
