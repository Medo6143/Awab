import type { VerseRef } from './guidance';

/**
 * «الابتلاءات»: why a person is tested, what the trial is for, and what to do in it. Verses are
 * references only (their text comes from the mushaf; scripts/check-message-verses.js checks
 * each holds its key word). Hadiths are ids in the bundled library of صحيح/حسن hadiths
 * (موسوعة الأحاديث النبوية), shown with their source and grade from there.
 */
const v = (surah: number, from: number, key: string, to?: number): VerseRef => ({ surah, from, to, key });

export interface TrialSection {
  id: string;
  title: string;
  /** A short explanation in plain Egyptian Arabic. */
  body: string;
  verses: VerseRef[];
  hadithIds: number[];
}

/** Why: the wisdom behind trials. */
export const TRIAL_WISDOM: TrialSection[] = [
  {
    id: 'test',
    title: 'الدنيا دار اختبار',
    body: 'ربنا خلق الحياة نفسها عشان يختبرنا: مين فينا يعمل أحسن. فالابتلاء مش معناه إن ربنا نسيك أو زعلان منك، ده جزء من رحلة كل إنسان، وبيبيّن الصادق في إيمانه.',
    verses: [v(67, 2, 'ليبلوكم'), v(29, 2, 'يفتنون', 3)],
    hadithIds: [],
  },
  {
    id: 'both',
    title: 'بالخير وبالشر',
    body: 'الابتلاء مش بالمصايب بس. الصحة والفلوس والنجاح اختبار شكر، والتعب والفقد اختبار صبر. والمؤمن كسبان في الحالتين.',
    verses: [v(21, 35, 'ونبلوكم')],
    hadithIds: [3298],
  },
  {
    id: 'sins',
    title: 'بتمحي الذنوب',
    body: 'كل وجع بيعدّي عليك، حتى الشوكة، ربنا بيمسح بيه من ذنوبك. فالتعب اللي انت فيه مش ضايع.',
    verses: [],
    hadithIds: [3701, 3159],
  },
  {
    id: 'love',
    title: 'علامة محبة',
    body: 'البلاء مش دليل إن ربنا مش راضي عنك؛ بالعكس، النبي ﷺ قال إن ربنا لما يحب قوم يبتليهم، وعلى قد البلاء بيكون الأجر.',
    verses: [],
    hadithIds: [3339, 4204],
  },
  {
    id: 'return',
    title: 'باب للرجوع',
    body: 'ساعات الشدة بتصحّينا وترجّعنا لربنا بعد ما بعدنا. وده معنى «أوّاب»: اللي كل ما يقع يرجع.',
    verses: [v(7, 168, 'يرجعون')],
    hadithIds: [],
  },
  {
    id: 'reward',
    title: 'جزاء الصابرين',
    body: 'ربنا وعد الصابرين بصلوات منه ورحمة وهداية، وفي الحديث القدسي: اللي ربنا ابتلاه في عينيه فصبر، عوّضه عنهم الجنة.',
    verses: [v(2, 155, 'ولنبلونكم', 157)],
    hadithIds: [66068],
  },
];

/** What to do when it comes. */
export const TRIAL_ACTIONS: TrialSection[] = [
  {
    id: 'first',
    title: 'اصبر من أول لحظة',
    body: 'الصبر الحقيقي في أول الصدمة. اللي جاي بعد كده أسهل.',
    verses: [],
    hadithIds: [3295],
  },
  {
    id: 'say',
    title: 'قول «إنا لله وإنا إليه راجعون»',
    body: 'وادعي بالدعاء ده: «اللهم أجرني في مصيبتي، وأخلف لي خيرًا منها».',
    verses: [],
    hadithIds: [65772],
  },
  {
    id: 'karb',
    title: 'دعاء الكرب',
    body: 'النبي ﷺ كان بيقوله وقت الضيق.',
    verses: [],
    hadithIds: [5141],
  },
  {
    id: 'ease',
    title: 'بعد العسر يسر',
    body: 'مفيش ضيق بيفضل على حاله. ربنا وعد إن مع العسر يسر، واتكررت مرتين.',
    verses: [v(94, 5, 'يسرا', 6)],
    hadithIds: [],
  },
];
