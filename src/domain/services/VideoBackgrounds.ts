/**
 * The nature clips behind the ayah video. They are too big to ship in the app, so each one is
 * downloaded the first time it is picked, and kept.
 */
export interface VideoBackgrounds {
  /** The clip's file on the phone, or null when it has not been downloaded yet. */
  localUri(id: string): Promise<string | null>;
  /** Downloads the clip (`onProgress` gets 0..1) and resolves with its file; rejects on failure. */
  download(id: string, onProgress?: (fraction: number) => void): Promise<string>;
}
