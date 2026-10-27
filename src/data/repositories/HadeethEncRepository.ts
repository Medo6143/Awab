import { AxiosInstance } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { HadithDetail, HadithRepository } from '../../domain/entities/hadith';

type Raw = {
  id: string; hadeeth?: string; hadeeth_intro?: string; attribution?: string; grade?: string;
  explanation?: string; hints?: string[]; words_meanings?: { word: string; meaning: string }[]; reference?: string;
};

const KEY = (id: number) => `hadith:v1:${id}`;

/**
 * موسوعة الأحاديث النبوية (hadeethenc.com) in Arabic. A hadith opened once is kept on the
 * device (AsyncStorage), so it reads offline afterwards.
 */
export class HadeethEncRepository implements HadithRepository {
  private memory = new Map<number, HadithDetail>();

  constructor(private readonly api: AxiosInstance) {}

  async getHadith(id: number): Promise<HadithDetail> {
    const hit = this.memory.get(id);
    if (hit) return hit;
    try {
      const saved = await AsyncStorage.getItem(KEY(id));
      if (saved) {
        const d = JSON.parse(saved) as HadithDetail;
        this.memory.set(id, d);
        return d;
      }
    } catch {}

    const res = await this.api.get('/hadeeths/one/', { params: { language: 'ar', id } });
    const r: Raw = res.data;
    if (!r?.hadeeth) throw new Error(`hadith ${id} not found`);
    const intro = (r.hadeeth_intro ?? '').trim();
    const d: HadithDetail = {
      id,
      intro,
      // the text repeats the intro at its start; keep just the hadith
      text: (intro && r.hadeeth.startsWith(intro) ? r.hadeeth.slice(intro.length) : r.hadeeth).trim(),
      grade: r.grade ?? '',
      attribution: r.attribution ?? '',
      explanation: (r.explanation ?? '').trim(),
      benefits: (r.hints ?? []).map((h) => h.trim()).filter(Boolean),
      words: (r.words_meanings ?? []).filter((w) => w.word && w.meaning),
      reference: (r.reference ?? '').trim(),
    };
    this.memory.set(id, d);
    AsyncStorage.setItem(KEY(id), JSON.stringify(d)).catch(() => {});
    return d;
  }
}
