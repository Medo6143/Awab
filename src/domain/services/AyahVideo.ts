import type { AyahKey } from './Audio';

/** Why a video could not be made: no recitation download, no encoder on this phone, or the encoder failed. */
export type AyahVideoFailure = 'network' | 'unsupported' | 'encode';

export class AyahVideoError extends Error {
  constructor(readonly reason: AyahVideoFailure, message?: string) {
    super(message ?? reason);
    this.name = 'AyahVideoError';
  }
}

export type AyahVideoProgress = {
  /** 'audio' while the recitation downloads, 'encode' while the MP4 is built. */
  stage: 'audio' | 'encode';
  /** 0..1 within the stage. */
  fraction: number;
  /** Length of the video, known once the recitation is decoded. */
  durationMs?: number;
};

/** A box on the 1080×1920 video frame, in pixels from its top-left corner. */
export type FrameBox = { x: number; y: number; w: number; h: number };

/** One word of the ayah text, where it sits on its page image and when it is said. */
export type VideoWord = FrameBox & {
  /** Index into `ayahs`: the word appears during that ayah's recitation. */
  ayah: number;
  /** Its share of the ayah's recitation time (letters, without diacritics); 0 = with the previous word. */
  weight: number;
};

/** One screen of text: an image of its words (transparent elsewhere) and where each word is on it. */
export type VideoPage = { uri: string; words: VideoWord[] };

export type AyahVideoInput = {
  /** The nature clip played (looped) behind everything: a local MP4 file URI. */
  videoUri: string;
  /** 1080×1920 PNG file URIs on transparent: `shade` darkens the clip so the text reads; `overlay` (logo, surah, reciter) stays put. */
  shadeUri: string;
  overlayUri: string;
  /** The ayah text in pages; each word fades in as it is recited, and a page replaces the one before. */
  pages: VideoPage[];
  ayahs: AyahKey[];
  /** RECITER_MAP id; unknown ids fall back to the default reciter. */
  reciterId: string;
};

/**
 * Builds an ayah video on the phone: a nature clip playing behind the ayah, with the reciter's
 * recitation; a long ayah's text turns its pages as it is recited. Rejects with an AyahVideoError.
 */
export interface AyahVideoMaker {
  make(input: AyahVideoInput, onProgress?: (p: AyahVideoProgress) => void): Promise<{ uri: string; durationMs: number }>;
  /** Deletes a video made by `make`, once the share sheet is done with it. */
  release(uri: string): Promise<void>;
}
