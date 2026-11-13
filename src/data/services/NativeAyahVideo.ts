import { DeviceEventEmitter } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import { AyahVideoError, AyahVideoInput, AyahVideoMaker, AyahVideoProgress } from '../../domain/services/AyahVideo';
import { DEFAULT_RECITER_ID, RECITER_MAP, ayahAudioUrl } from '../../domain/entities/reciters';
import { ayahVideoNative } from './nativeModules';

const DIR = `${FileSystem.cacheDirectory}ayah-video/`;

/** The native side wants plain paths; view-shot and expo-file-system hand out file:// URIs. */
const toPath = (uri: string) => decodeURI(uri.replace(/^file:\/\//, ''));

type NativeProgress = { fraction?: number; durationMs?: number };

/**
 * Downloads the ayahs' recitation from everyayah.com into the cache, then hands the frame
 * images, the word boxes and the MP3s to the native encoder (AyahVideoModule), which writes
 * the MP4.
 */
export class NativeAyahVideo implements AyahVideoMaker {
  async make({ videoUri, shadeUri, overlayUri, pages, ayahs, reciterId }: AyahVideoInput, onProgress?: (p: AyahVideoProgress) => void) {
    const native = ayahVideoNative();
    if (!native?.encode) throw new AyahVideoError('unsupported', 'AyahVideo native module missing');
    if (ayahs.length === 0 || pages.length === 0) throw new AyahVideoError('encode', 'nothing to show');

    const folder = (RECITER_MAP[reciterId] ?? RECITER_MAP[DEFAULT_RECITER_ID]).folder;
    const id = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
    await FileSystem.makeDirectoryAsync(DIR, { intermediates: true }).catch(() => undefined);

    const mp3s: string[] = [];
    try {
      onProgress?.({ stage: 'audio', fraction: 0 });
      for (let i = 0; i < ayahs.length; i++) {
        const { surahId, ayahNumber } = ayahs[i];
        const file = `${DIR}${id}-${i}.mp3`;
        mp3s.push(file);
        let status = 0;
        try {
          status = (await FileSystem.downloadAsync(ayahAudioUrl(folder, surahId, ayahNumber), file)).status;
        } catch (e) {
          throw new AyahVideoError('network', String(e));
        }
        if (status !== 200) throw new AyahVideoError('network', `HTTP ${status} for ${surahId}:${ayahNumber}`);
        onProgress?.({ stage: 'audio', fraction: (i + 1) / ayahs.length });
      }

      const out = `${DIR}${id}.mp4`;
      const spec = JSON.stringify({
        video: toPath(videoUri),
        shade: toPath(shadeUri),
        overlay: toPath(overlayUri),
        pages: pages.map((p) => ({ image: toPath(p.uri), words: p.words })),
        audios: mp3s.map(toPath),
        out: toPath(out),
      });

      let durationMs: number | undefined;
      const sub = DeviceEventEmitter.addListener('ayahVideoProgress', (e: NativeProgress) => {
        if (typeof e?.durationMs === 'number') durationMs = e.durationMs;
        onProgress?.({ stage: 'encode', fraction: e?.fraction ?? 0, durationMs });
      });
      try {
        onProgress?.({ stage: 'encode', fraction: 0 });
        const res = await native.encode(spec);
        return { uri: out, durationMs: res?.durationMs ?? durationMs ?? 0 };
      } catch (e) {
        const code = (e as { code?: string } | null)?.code;
        throw new AyahVideoError(code === 'ENCODER_UNAVAILABLE' ? 'unsupported' : 'encode', String(e));
      } finally {
        sub.remove();
      }
    } finally {
      // the MP3s are inside the MP4 now (or the attempt failed): drop them either way
      for (const f of mp3s) await FileSystem.deleteAsync(f, { idempotent: true }).catch(() => undefined);
    }
  }

  async release(uri: string) {
    await FileSystem.deleteAsync(uri, { idempotent: true }).catch(() => undefined);
  }
}
