import { Microphone, RecitationRecognizer, SpeechModel, WordAudio } from '../../domain/services/Tasmee';
import { MODEL_MB, RecitationListener, downloadModel, hasMic, modelPath, requestMic } from './RecitationListener';
import { playWord, prefetchWord } from './wordAudio';

/** The CTC model file in the app's documents (see RecitationListener). */
export class OnnxSpeechModel implements SpeechModel {
  readonly sizeMb = MODEL_MB;
  async isReady() { return (await modelPath()) != null; }
  download(onProgress: (fraction: number) => void) { return downloadModel(onProgress); }
}

/** The RECORD_AUDIO permission (always allowed off Android). */
export class AndroidMicrophone implements Microphone {
  has() { return hasMic(); }
  request() { return requestMic(); }
}

/** RecitationListener: the PCM mic stream into the on-device CTC model. */
export class CtcRecitationRecognizer implements RecitationRecognizer {
  open() { return RecitationListener.open(); }
}

/** quran.com's word-by-word recordings. */
export class QuranCdnWordAudio implements WordAudio {
  prefetch(surah: number, ayah: number, position: number) { prefetchWord(surah, ayah, position); }
  play(surah: number, ayah: number, position: number) { return playWord(surah, ayah, position); }
}
