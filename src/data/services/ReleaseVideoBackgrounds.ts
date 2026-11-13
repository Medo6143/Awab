import * as FileSystem from 'expo-file-system/legacy';
import { VideoBackgrounds } from '../../domain/services/VideoBackgrounds';

/** The clips are assets of a GitHub release of the app's repo (720×1280 H.264, from Pexels). */
const RELEASE = 'https://github.com/Medo6143/Awab/releases/download/video-backgrounds-v1';
const DIR = `${FileSystem.documentDirectory}video-backgrounds/`;

const fileOf = (id: string) => `${DIR}${id}.mp4`;

/** VideoBackgrounds from the release, kept in the app's documents once downloaded. */
export class ReleaseVideoBackgrounds implements VideoBackgrounds {
  private inFlight = new Map<string, Promise<string>>();

  async localUri(id: string) {
    try {
      const info = await FileSystem.getInfoAsync(fileOf(id));
      return info.exists && (info.size ?? 0) > 100_000 ? fileOf(id) : null;
    } catch {
      return null;
    }
  }

  download(id: string, onProgress?: (fraction: number) => void) {
    // picking the same clip twice while it downloads shares the one download
    const running = this.inFlight.get(id);
    if (running) return running;
    const job = (async () => {
      const done = await this.localUri(id);
      if (done) return done;
      await FileSystem.makeDirectoryAsync(DIR, { intermediates: true }).catch(() => undefined);
      const tmp = `${fileOf(id)}.part`;
      const task = FileSystem.createDownloadResumable(`${RELEASE}/${id}.mp4`, tmp, {}, ({ totalBytesWritten, totalBytesExpectedToWrite }) => {
        if (totalBytesExpectedToWrite > 0) onProgress?.(totalBytesWritten / totalBytesExpectedToWrite);
      });
      const res = await task.downloadAsync();
      if (!res || res.status !== 200) {
        await FileSystem.deleteAsync(tmp, { idempotent: true }).catch(() => undefined);
        throw new Error(`download failed (${res?.status ?? 'no response'})`);
      }
      await FileSystem.moveAsync({ from: tmp, to: fileOf(id) });
      return fileOf(id);
    })().finally(() => this.inFlight.delete(id));
    this.inFlight.set(id, job);
    return job;
  }
}
