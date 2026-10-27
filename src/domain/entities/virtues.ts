import type { Hadith, Supplication, VerseRef } from './guidance';
import { DUA, H } from './hadiths';

export type VirtueTopic = 'dua' | 'dhikr';

export interface VirtueSection {
  title: string;
  sub?: string;
  intro?: string;
  verses: VerseRef[];
  hadiths: Hadith[];
  duas?: Supplication[];
}

/** "لماذا ندعو؟" and "فضل الذكر": intros are ours; verses by reference; hadiths verified. */
export const VIRTUES: Record<VirtueTopic, { title: string; subtitle: string; sections: VirtueSection[] }> = {
  dua: {
    title: 'لماذا ندعو؟',
    subtitle: 'فضل الدعاء ودعاء المضطر',
    sections: [
      {
        title: 'الدعاء عبادة',
        intro: 'الدعاء عبادة في ذاته، وهو اعتراف بحاجتنا إلى الله وثقة بقربه منا. والله قريب يجيب، ولا يضيع دعاء مؤمن: فإما أن تُعجَّل له دعوته، أو تُدَّخر له في الآخرة، أو يُصرف عنه من السوء مثلها.',
        verses: [
          { surah: 2, from: 186, key: 'اجيب دعوة' },
          { surah: 40, from: 60, key: 'ادعوني' },
          { surah: 7, from: 55, key: 'ادعوا ربكم' },
        ],
        hadiths: [H.duaIsWorship, H.oneOfThree, H.noHaste, H.shyGenerous, H.lastThird],
      },
      {
        title: 'دعاء المضطر',
        sub: 'إذا ضاقت بك الأسباب',
        intro: 'المضطر من ضاقت به الأسباب ولم يبق له رجاء إلا في الله. وقد ذكر الله إجابته للمضطر دليلًا على أنه لا إله غيره ﴿أَإِلَٰهٌ مَّعَ اللَّهِ﴾، فإذا اشتد بك الأمر فالجأ إليه بصدق، وادعُ بما دعا به الأنبياء وعلّمه النبي ﷺ.',
        verses: [
          { surah: 27, from: 62, key: 'المضطر' },
          { surah: 21, from: 87, to: 88, key: 'الظالمين' },
        ],
        hadiths: [H.dhunNun],
        duas: [DUA.karb, DUA.makrub, DUA.yaHayy],
      },
    ],
  },
  dhikr: {
    title: 'فضل الذكر',
    subtitle: 'حياة القلب وطمأنينته',
    sections: [
      {
        title: 'لماذا نذكر الله؟',
        intro: 'ذكر الله حياة القلب وطمأنينته، وهو أيسر العبادات وأعظمها أجرًا، يرافقك في كل حال: قائمًا وقاعدًا وعلى جنبك، والله يذكر من ذكره.',
        verses: [
          { surah: 13, from: 28, key: 'تطمئن القلوب' },
          { surah: 2, from: 152, key: 'فاذكروني' },
          { surah: 33, from: 41, to: 42, key: 'ذكرا كثيرا' },
          { surah: 33, from: 35, key: 'الذاكرين' },
        ],
        hadiths: [H.aliveDead, H.withHimWhenRemembered, H.mufarridun, H.tongueMoist],
      },
      {
        title: 'كلمتان خفيفتان',
        sub: 'ذكر يسير وأجر عظيم',
        verses: [],
        hadiths: [H.twoWords],
      },
    ],
  },
};
