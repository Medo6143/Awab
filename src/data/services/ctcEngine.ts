import { InferenceSession, Tensor } from 'onnxruntime-react-native';
import { CTC_VOCAB } from './ctcModelData';

/**
 * The recitation model for voice tasmee: a FastConformer CTC model trained on the Quran
 * (mrmuminov/quran-fastconformer-ctc-ar, CC-BY-4.0, built on NVIDIA's Arabic FastConformer).
 * One pass over the audio gives the whole text, so a listen costs the same however many
 * words were said, unlike Whisper which wrote them token by token.
 *
 * The file is the published model with NeMo's log-mel front-end fused in front of it
 * (owwab-voice-spike/ctc/fuse_mel.py), so it takes raw 16 kHz audio: the front-end in
 * TypeScript took a second per listen on the phone, in ONNX it takes milliseconds.
 */

const BLANK = CTC_VOCAB.length;

/** Greedy CTC: the best character per frame, repeats collapsed, blanks dropped. */
export const greedyDecode = (logProbs: Float32Array, frames: number, vocabSize: number): string => {
  let out = '';
  let prev = -1;
  for (let t = 0; t < frames; t++) {
    const base = t * vocabSize;
    let best = 0, bestV = logProbs[base];
    for (let v = 1; v < vocabSize; v++) if (logProbs[base + v] > bestV) { bestV = logProbs[base + v]; best = v; }
    if (best !== prev && best !== BLANK) out += CTC_VOCAB[best];
    prev = best;
  }
  return out;
};

export type CtcTiming = { melMs: number; runMs: number };

const FEED = 'fe_audio';

export class CtcEngine {
  private constructor(private session: InferenceSession) {}

  /** `provider`: 'xnnpack' is the fast CPU path on Android; 'nnapi' tries the phone's accelerator. */
  static async open(modelPath: string, provider: 'xnnpack' | 'nnapi' | 'cpu' = 'xnnpack'): Promise<CtcEngine> {
    const session = await InferenceSession.create(modelPath.replace('file://', ''), {
      executionProviders: provider === 'cpu' ? ['cpu'] : [provider, 'cpu'],
      graphOptimizationLevel: 'all',
      intraOpNumThreads: 4,
    });
    return new CtcEngine(session);
  }

  /** The text heard in `pcm` (16 kHz mono), Uthmani with its marks; `timing` is filled when given. */
  async transcribe(pcm: Int16Array, timing?: CtcTiming): Promise<string> {
    const t0 = Date.now();
    const audio = new Float32Array(pcm.length);
    for (let i = 0; i < pcm.length; i++) audio[i] = pcm[i] / 32768;
    const t1 = Date.now();
    const out = await this.session.run({ [FEED]: new Tensor('float32', audio, [1, audio.length]) });
    const t2 = Date.now();
    if (timing) { timing.melMs = t1 - t0; timing.runMs = t2 - t1; }
    const lp = out.log_probs;
    const outFrames = Number((out.out_lengths.data as BigInt64Array)[0]);
    return greedyDecode(lp.data as Float32Array, Math.min(outFrames, lp.dims[1]), lp.dims[2]);
  }

  async close() {
    await this.session.release();
  }
}
