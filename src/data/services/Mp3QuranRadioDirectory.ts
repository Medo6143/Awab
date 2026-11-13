import AsyncStorage from '@react-native-async-storage/async-storage';
import { RadioStation, tidyStations } from '../../domain/entities/radio';
import { RadioDirectory } from '../../domain/services/Radio';

const API = 'https://www.mp3quran.net/api/v3/radios?language=ar';
const CACHE_KEY = 'radios:v1';
const FRESH_MS = 7 * 24 * 60 * 60 * 1000;

type Saved = { t: number; list: RadioStation[] };
type ApiRadio = { id: number; name: string; url: string };

/**
 * RadioDirectory on mp3quran.net's radio list (about 170 live stations: reciters around the
 * clock, tafsir, ruqyah). The list rarely changes, so it is kept for a week and served from
 * the saved copy when the network fails.
 */
export class Mp3QuranRadioDirectory implements RadioDirectory {
  async stations(): Promise<RadioStation[]> {
    const saved = await this.read();
    if (saved && Date.now() - saved.t < FRESH_MS) return saved.list;
    try {
      const res = await fetch(API);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as { radios?: ApiRadio[] };
      const list = tidyStations((data.radios ?? []).map((r) => ({ id: String(r.id), name: r.name, url: r.url })));
      if (list.length) AsyncStorage.setItem(CACHE_KEY, JSON.stringify({ t: Date.now(), list } as Saved)).catch(() => {});
      return list;
    } catch (e) {
      if (saved) return saved.list;
      throw e;
    }
  }

  private async read(): Promise<Saved | null> {
    try {
      const raw = await AsyncStorage.getItem(CACHE_KEY);
      return raw ? (JSON.parse(raw) as Saved) : null;
    } catch {
      return null;
    }
  }
}
