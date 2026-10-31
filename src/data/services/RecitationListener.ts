import { PermissionsAndroid, Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import AudioRecord from '@fugood/react-native-audio-pcm-stream';
import { CtcEngine, CtcTiming } from './ctcEngine';

/**
 * The offline speech model for voice tasmee: a FastConformer CTC model trained on the Quran
 * (see ctcEngine). It is not in the APK: the user downloads it once from the app's site,
 * the first time they choose «بصوتي».
 */
export const MODEL_URL = 'https://owwab.vercel.app/models/quran-ctc-int8.onnx';
export const MODEL_MB = 157;

const MODEL_FILE = `${FileSystem.documentDirectory}asr/quran-ctc-int8.onnx`;
// TEMPORARY, until the model is on the site: a copy pushed over USB (adb can write the app's
// external files dir) stands in for the download
const DEV_MODEL = 'file:///storage/emulated/0/Android/data/com.mohamewael66sorganization.owwab/files/asr/quran-ctc-int8.onnx';

const SAMPLE_RATE = 16000;

const exists = async (uri: string, minBytes = 1_000_000) => {
  try { const i = await FileSystem.getInfoAsync(uri); return i.exists && (i.size ?? 0) >= minBytes; } catch { return false; }
};

/** The model on this phone, or null. */
export const modelPath = async (): Promise<string | null> => {
  if (await exists(MODEL_FILE)) return MODEL_FILE;
  if (Platform.OS === 'android' && await exists(DEV_MODEL)) return DEV_MODEL;
  return null;
};

/** Downloads the model; `onProgress` gets 0..1. Resolves when it is ready to use. */
export const downloadModel = async (onProgress: (p: number) => void): Promise<void> => {
  const tmp = `${MODEL_FILE}.part`;
  await FileSystem.makeDirectoryAsync(`${FileSystem.documentDirectory}asr`, { intermediates: true });
  const task = FileSystem.createDownloadResumable(MODEL_URL, tmp, {}, ({ totalBytesWritten, totalBytesExpectedToWrite }) => {
    if (totalBytesExpectedToWrite > 0) onProgress(totalBytesWritten / totalBytesExpectedToWrite);
  });
  const res = await task.downloadAsync();
  if (!res || res.status !== 200) {
    await FileSystem.deleteAsync(tmp, { idempotent: true });
    throw new Error(`download failed (${res?.status ?? 'no response'})`);
  }
  await FileSystem.moveAsync({ from: tmp, to: MODEL_FILE });
};

export const requestMic = async (): Promise<boolean> => {
  if (Platform.OS !== 'android') return true;
  const r = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO);
  return r === PermissionsAndroid.RESULTS.GRANTED;
};

const decode = (b64: string): Uint8Array => {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
};

/**
 * Each listen covers the last this many seconds, so it takes the same time however long the
 * recitation. Three seconds holds the last few words; a longer window gave the CTC model
 * more chances to mishear a word said right.
 */
const WINDOW_SECONDS = 3;

/** RMS of 16-bit little-endian PCM. */
const rms = (b: Uint8Array) => {
  const v = new DataView(b.buffer, b.byteOffset, b.byteLength);
  let sum = 0;
  const n = Math.floor(b.byteLength / 2);
  for (let k = 0; k < n; k++) { const x = v.getInt16(k * 2, true); sum += x * x; }
  return n ? Math.sqrt(sum / n) : 0;
};

/**
 * One loaded model listening to the reciter continuously. It keeps the last few seconds of
 * audio; transcribe() reads them while recording goes on, so the caller can follow along.
 */
export class RecitationListener {
  private ctc: CtcEngine | null = null;
  /** How long the last listen took, for the diagnostics line under the button. */
  readonly timing: CtcTiming = { melMs: 0, runMs: 0 };
  private chunks: Uint8Array[] = [];
  /** Per chunk: ms louder than the room (someone speaking), else 0. */
  private voiced: number[] = [];
  private bytes = 0;
  /** Audio heard since start(), in seconds: the clock the caller polls. */
  private total = 0;
  private recording = false;
  /** Quiet audio at the end of the buffer, in ms, and the quietest level heard (the room). */
  private quietMs = 0;
  private floor = Infinity;

  static async open(): Promise<RecitationListener> {
    const path = await modelPath();
    if (!path) throw new Error('model missing');
    const l = new RecitationListener();
    l.ctc = await CtcEngine.open(path);
    AudioRecord.on('data', (b64: string) => l.onChunk(decode(b64)));
    return l;
  }

  private onChunk(c: Uint8Array) {
    if (!this.recording) return;
    const level = rms(c);
    this.floor = Math.min(this.floor * 1.002 + 1, Math.max(level, 50)); // drifts up slowly so a loud start does not stick
    const ms = (c.length / 2 / SAMPLE_RATE) * 1000;
    const quiet = level < Math.max(this.floor * 2.5, 400);
    this.quietMs = quiet ? this.quietMs + ms : 0;
    this.chunks.push(c);
    this.voiced.push(quiet ? 0 : ms);
    this.bytes += c.length;
    this.total += ms / 1000;
    const keep = WINDOW_SECONDS * SAMPLE_RATE * 2;
    while (this.chunks.length > 1 && this.bytes - this.chunks[0].length >= keep) {
      this.bytes -= this.chunks.shift()!.length;
      this.voiced.shift();
    }
  }

  /** Seconds heard since start(); the window holds the last few of them. */
  get seconds() { return this.total; }
  /** How long the reciter has been quiet, in ms. */
  get quiet() { return this.quietMs; }

  /** The mic module releases its recorder on stop, so every start creates a new one. */
  async start() {
    this.reset();
    await AudioRecord.init({ sampleRate: SAMPLE_RATE, channels: 1, bitsPerSample: 16, audioSource: 6, wavFile: '', bufferSize: 4096 });
    this.recording = true;
    AudioRecord.start();
  }

  async pause() {
    if (!this.recording) return;
    this.recording = false;
    await AudioRecord.stop();
    await new Promise((r) => setTimeout(r, 250)); // the recording thread lets go of the mic
  }

  /** Drops the audio so far. */
  reset() {
    this.chunks = [];
    this.voiced = [];
    this.bytes = 0;
    this.total = 0;
    this.quietMs = 0;
  }

  private pcm(): Uint8Array {
    const out = new Uint8Array(this.bytes);
    let at = 0;
    for (const c of this.chunks) { if (at + c.length > out.length) break; out.set(c, at); at += c.length; }
    return out;
  }

  /** The words said in the last few seconds (none when nobody spoke in them). */
  async transcribe(): Promise<string[]> {
    const seconds = this.bytes / 2 / SAMPLE_RATE;
    // on silence the model makes letters up, so it only listens once someone spoke
    const voicedMs = this.voiced.reduce((a, b) => a + b, 0);
    if (!this.ctc || seconds < 0.6 || voicedMs < 250) return [];
    const raw = this.pcm();
    const text = await this.ctc.transcribe(new Int16Array(raw.buffer, raw.byteOffset, raw.byteLength >> 1), this.timing);
    return text.split(/\s+/).filter(Boolean);
  }

  async close() {
    await this.pause().catch(() => undefined);
    await this.ctc?.close();
    this.ctc = null;
  }
}
