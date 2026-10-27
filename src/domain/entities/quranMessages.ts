import { CloudFog, CloudRain, HeartCrack, Scale, Shield, Stethoscope, Undo2, UserRound, Wallet, Waves } from 'lucide-react-native';
import type { Hadith, Supplication, VerseRef } from './guidance';
import { DUA, H } from './hadiths';

type Icon = typeof CloudRain;

export interface QuranMessage {
  id: string;
  name: string;
  hint: string;
  icon: Icon;
  /** A gentle opening word (ours, not a quotation). */
  comfort: string;
  verses: VerseRef[];
  hadiths: Hadith[];
  duas: Supplication[];
  tips: string[];
  /** A caring note, e.g. that seeking professional help is part of taking the means. */
  care?: string;
}

/** "رسائل من القرآن": one entry per state a Muslim may be going through. */
export const QURAN_MESSAGES: QuranMessage[] = [
  {
    id: 'sadness',
    name: 'الحزن',
    hint: 'قلبك مثقل ولا تعرف لماذا',
    icon: CloudRain,
    comfort: 'حزنك ليس ضعفًا في إيمانك، فقد حزن الأنبياء قبلك. الله يعلم ما في قلبك، وما من حزن يصيب المؤمن إلا كان له به أجر. خذ نفسًا عميقًا واقرأ هذه الكلمات على مهل.',
    verses: [
      { surah: 9, from: 40, key: 'لا تحزن ان الله معنا' },
      { surah: 3, from: 139, key: 'ولا تحزنوا' },
      { surah: 12, from: 86, key: 'حزني الي الله' },
      { surah: 94, from: 5, to: 6, key: 'يسرا' },
      { surah: 93, from: 3, to: 5, key: 'ما ودعك' },
    ],
    hadiths: [H.expiation, H.believerAllGood],
    duas: [DUA.hamm],
    tips: [
      'لا تحمل حزنك وحدك: حدّث به من تثق به، أو اشكُه إلى الله في سجودك كما شكا يعقوب عليه السلام.',
      'حافظ على صلاتك في وقتها، فهي موعد ثابت تلتقي فيه بربك كل يوم.',
      'أعطِ جسدك حقه: نومًا كافيًا ومشيًا قليلًا في الهواء الطلق.',
      'اقرأ ولو صفحة من القرآن كل يوم، وتأمل معانيها بهدوء.',
    ],
  },
  {
    id: 'distress',
    name: 'الهم والكرب',
    hint: 'أمر يضيق به صدرك',
    icon: Waves,
    comfort: 'كل ضيق مهما اشتد له عند الله مخرج. لست وحدك في هذا؛ فالله أقرب إليك من همّك، وقد علّمنا النبي ﷺ كلمات نقولها عند الكرب.',
    verses: [
      { surah: 65, from: 3, key: 'فهو حسبه' },
      { surah: 27, from: 62, key: 'المضطر' },
      { surah: 21, from: 87, to: 88, key: 'الظالمين' },
      { surah: 13, from: 28, key: 'تطمئن القلوب' },
    ],
    hadiths: [H.dhunNun, H.guardAllah],
    duas: [DUA.karb, DUA.makrub],
    tips: [
      'قسّم المشكلة إلى خطوات صغيرة، وابدأ بأقربها إليك اليوم.',
      'أكثر من دعوة ذي النون، وقلها بقلب حاضر.',
      'اكتب ما يقلقك على ورقة، ثم اكتب بجانبه ما بيدك فعله وما ليس بيدك.',
    ],
  },
  {
    id: 'loss',
    name: 'فقد عزيز',
    hint: 'وفاة شخص تحبه',
    icon: HeartCrack,
    comfort: 'الفراق موجع، ودموعك رحمة لا تعارض الصبر؛ فقد دمعت عينا النبي ﷺ عند فقد ابنه. من رحل في رحمة الله، والصبر على فقده عند الله أجره عظيم.',
    verses: [
      { surah: 2, from: 155, to: 157, key: 'راجعون' },
      { surah: 3, from: 185, key: 'ذائقة الموت' },
      { surah: 39, from: 10, key: 'الصابرون' },
    ],
    hadiths: [H.eyeTears, H.mustarja],
    duas: [DUA.musiba],
    tips: [
      'لا بأس بالبكاء، فالحزن على الفقيد فطرة، والمطلوب ألا نقول إلا ما يرضي الله.',
      'ادعُ لمن فقدته، وتصدّق عنه، فبرّك به لا ينقطع بموته.',
      'لا تعتزل الناس طويلًا؛ وجود الأهل والأصحاب حولك عون على الصبر.',
    ],
  },
  {
    id: 'debt',
    name: 'الدَّين وضيق الرزق',
    hint: 'ديون أو ضائقة مالية',
    icon: Wallet,
    comfort: 'رزقك مكتوب لن يأخذه غيرك، والله الذي يرزق الطير يرزقك. خذ بالأسباب واطمئن، فبعد العسر يسر، وعد من الله لا يُخلف.',
    verses: [
      { surah: 65, from: 3, key: 'يرزقه' },
      { surah: 11, from: 6, key: 'رزقها' },
      { surah: 2, from: 280, key: 'ميسرة' },
      { surah: 94, from: 5, to: 6, key: 'يسرا' },
    ],
    hadiths: [H.birdsProvision],
    duas: [DUA.kifaya, DUA.hamm],
    tips: [
      'اكتب ديونك كلها ورتّبها، وضع خطة سداد ولو بمبالغ صغيرة.',
      'كن صادقًا مع من تدين له، واطلب منه المهلة إن احتجت.',
      'ابتعد عن الاقتراض بالربا مهما اشتدت الحاجة.',
      'أكثر من الاستغفار والدعاء مع السعي في طلب الرزق الحلال.',
    ],
  },
  {
    id: 'anxiety',
    name: 'القلق والخوف',
    hint: 'خوف من المستقبل أو من أمر قادم',
    icon: Shield,
    comfort: 'ما كتبه الله لك سيأتيك، وما لم يُكتب لن يصيبك. القلق يحمّلك هم الغد قبل أن يأتي، والله تكفّل بغدك كما تكفّل بيومك.',
    verses: [
      { surah: 9, from: 51, key: 'ما كتب الله لنا' },
      { surah: 3, from: 173, key: 'حسبنا الله' },
      { surah: 20, from: 46, key: 'لا تخافا' },
      { surah: 13, from: 28, key: 'تطمئن القلوب' },
    ],
    hadiths: [H.guardAllah, H.believerAllGood, H.hasbuna],
    duas: [DUA.makrub],
    tips: [
      'ركّز على ما بيدك اليوم، واترك ما ليس بيدك لله.',
      'حافظ على أذكار الصباح والمساء، فهي حصن يومي يطمئن به القلب.',
      'خفّف من متابعة الأخبار ووسائل التواصل إذا كانت تزيد قلقك.',
    ],
  },
  {
    id: 'depression',
    name: 'الضيق والاكتئاب',
    hint: 'فتور وضيق مستمر',
    icon: CloudFog,
    comfort: 'ما تشعر به حقيقي، ولست ضعيفًا ولا بعيدًا عن الله بسببه. رحمة الله أوسع من كل ضيق، وطلب العلاج من الأخذ بالأسباب الذي أمرنا به.',
    verses: [
      { surah: 39, from: 53, key: 'لا تقنطوا' },
      { surah: 12, from: 87, key: 'لا تياسوا' },
      { surah: 93, from: 3, to: 5, key: 'ما ودعك' },
      { surah: 15, from: 97, to: 98, key: 'يضيق صدرك' },
    ],
    hadiths: [H.cureExists, H.believerAllGood, H.lastThird],
    duas: [DUA.makrub, DUA.yaHayy],
    tips: [
      'حدّث شخصًا تثق به عمّا تمر به، ولا تنتظر حتى يشتد عليك.',
      'ابدأ بأشياء صغيرة: صلاة في وقتها، مشي قصير، وجبة منتظمة.',
      'اسجد وقل لله ما في قلبك بكلماتك أنت، فهو يسمعك.',
    ],
    care: 'إذا استمر الضيق أسابيع، أو أثّر على نومك وعملك، أو راودتك أفكار بإيذاء نفسك، فتواصل فورًا مع طبيب أو مختص نفسي. العلاج لا يتعارض مع الإيمان؛ «ما أنزل الله داء إلا أنزل له شفاء».',
  },
  {
    id: 'illness',
    name: 'المرض',
    hint: 'مرض أو ألم يتعبك',
    icon: Stethoscope,
    comfort: 'مرضك ليس عقوبة، بل قد يكون رفعة وتكفيرًا. وأجر ما كنت تعمله وأنت صحيح يُكتب لك وأنت مريض، فارفق بنفسك.',
    verses: [
      { surah: 26, from: 80, key: 'يشفين' },
      { surah: 21, from: 83, to: 84, key: 'الضر' },
      { surah: 17, from: 82, key: 'شفاء' },
    ],
    hadiths: [H.sickWritten, H.expiation, H.cureExists],
    duas: [DUA.pain],
    tips: [
      'التزم بعلاج طبيبك، فالتداوي من الأخذ بالأسباب.',
      'صلِّ على قدر استطاعتك: قائمًا، فإن لم تستطع فقاعدًا، فإن لم تستطع فعلى جنب.',
      'ضع يدك على موضع الألم وقل ما علّمه النبي ﷺ.',
    ],
  },
  {
    id: 'loneliness',
    name: 'الوحدة',
    hint: 'تشعر أنك وحيد',
    icon: UserRound,
    comfort: 'قد يبعد عنك الناس، لكن الله لا يبعد. هو أقرب إليك من حبل الوريد، يسمعك في كل وقت، ومعك إذا ذكرته.',
    verses: [
      { surah: 2, from: 186, key: 'فاني قريب' },
      { surah: 50, from: 16, key: 'الوريد' },
      { surah: 57, from: 4, key: 'وهو معكم' },
      { surah: 20, from: 46, key: 'انني معكما' },
    ],
    hadiths: [H.withHimWhenRemembered, H.shadeAlone],
    duas: [DUA.yaHayy],
    tips: [
      'اجعل لك وردًا ثابتًا من الذكر، فالله مع من ذكره.',
      'احرص على صلاة الجماعة في المسجد إن استطعت، ففيها أنس وصحبة.',
      'تواصل مع قريب أو صديق قديم برسالة قصيرة اليوم.',
    ],
  },
  {
    id: 'guilt',
    name: 'الذنب والندم',
    hint: 'تشعر بثقل ذنب',
    icon: Undo2,
    comfort: 'ندمك علامة حياة قلبك. باب التوبة مفتوح، والله يفرح بعودتك أكثر مما تتخيل، ويبدّل السيئات حسنات لمن تاب وعمل صالحًا.',
    verses: [
      { surah: 39, from: 53, key: 'لا تقنطوا' },
      { surah: 3, from: 135, key: 'فاستغفروا' },
      { surah: 25, from: 70, key: 'سيئاتهم حسنات' },
      { surah: 4, from: 110, key: 'يستغفر' },
    ],
    hadiths: [H.joyRepentance, H.handNight],
    duas: [DUA.sayyidIstighfar],
    tips: [
      'التوبة: أن تترك الذنب، وتندم عليه، وتعزم ألا تعود، وتردّ الحقوق لأصحابها إن كان فيه حق لأحد.',
      'أتبع السيئة الحسنة: صدقة، أو صلاة، أو عمل خير.',
      'إذا عدت إلى الذنب فعُد إلى التوبة، ولا تيأس.',
    ],
  },
  {
    id: 'injustice',
    name: 'الظلم',
    hint: 'وقع عليك ظلم',
    icon: Scale,
    comfort: 'الله لا يغفل عن ظلم وقع عليك، وحقك محفوظ عنده. اصبر واطلب حقك بالطريق المشروع، ودعوتك وأنت مظلوم ليس بينها وبين الله حجاب.',
    verses: [
      { surah: 14, from: 42, key: 'غافلا' },
      { surah: 42, from: 40, to: 43, key: 'عفا واصلح' },
      { surah: 26, from: 227, key: 'منقلب' },
    ],
    hadiths: [H.oppressedDua, H.respiteOppressor, H.hasbuna],
    duas: [DUA.hamm],
    tips: [
      'اطلب حقك بالطرق المشروعة، فهذا لا ينافي الصبر.',
      'لا تجعل الظلم يدفعك إلى ظلم غيرك.',
      'العفو عند القدرة خير لمن استطاعه، وأجره على الله.',
    ],
  },
];
