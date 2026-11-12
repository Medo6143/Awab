/**
 * What voice tasmee needs from the phone. The pieces are separate on purpose: the setup sheet
 * only checks and downloads the model, the tasmee screen listens, asks for the mic and plays
 * a corrected word.
 */

/** The offline speech model, downloaded once (it is not in the APK). */
export interface SpeechModel {
  /** Download size, in MB, to tell the user before they start. */
  readonly sizeMb: number;
  isReady(): Promise<boolean>;
  /** `onProgress` gets 0..1; resolves when the model can be used, rejects on failure. */
  download(onProgress: (fraction: number) => void): Promise<void>;
}

export interface Microphone {
  /** Whether it is already allowed (no dialog). */
  has(): Promise<boolean>;
  /** Asks the user; resolves true when allowed. */
  request(): Promise<boolean>;
}

/** One listening session on the microphone, recognising what the reciter says. */
export interface RecitationSession {
  /** Audio heard since start(), in seconds: the clock the caller polls. */
  readonly seconds: number;
  /** Quiet audio at the end of what was heard, in ms. */
  readonly quiet: number;
  /** How long the last recognition took (for tuning). */
  readonly timing: { melMs: number; runMs: number };
  start(): Promise<void>;
  pause(): Promise<void>;
  /** Forgets what was heard so far (the reciter moved to another place). */
  reset(): void;
  /** The words heard since the last call. */
  transcribe(): Promise<string[]>;
  close(): Promise<void>;
}

export interface RecitationRecognizer {
  /** Loads the model and opens the microphone stream. */
  open(): Promise<RecitationSession>;
}

/** A single word of the Quran recited on its own, to tell the reciter the right word. */
export interface WordAudio {
  /** Loads the word ahead of time, so `play` starts at once. */
  prefetch(surah: number, ayah: number, position: number): void;
  /** Plays it; resolves when it has played or failed, so the caller carries on either way. */
  play(surah: number, ayah: number, position: number): Promise<void>;
}
