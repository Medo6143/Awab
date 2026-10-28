/**
 * Prayer-time calculation methods (AlAdhan method ids) and the official one per country, so
 * a user anywhere gets the timetable their local mosques follow. Unlisted countries use the
 * Muslim World League, the most widely used default.
 */
export const PRAYER_METHODS: { id: number; name: string }[] = [
  { id: 4, name: 'أم القرى (مكة)' },
  { id: 5, name: 'الهيئة المصرية العامة للمساحة' },
  { id: 3, name: 'رابطة العالم الإسلامي' },
  { id: 2, name: 'أمريكا الشمالية (ISNA)' },
  { id: 1, name: 'جامعة العلوم الإسلامية بكراتشي' },
  { id: 13, name: 'رئاسة الشؤون الدينية التركية (ديانت)' },
  { id: 16, name: 'دبي' },
  { id: 9, name: 'الكويت' },
  { id: 10, name: 'قطر' },
  { id: 8, name: 'منطقة الخليج' },
  { id: 23, name: 'الأردن' },
  { id: 21, name: 'المغرب' },
  { id: 19, name: 'الجزائر' },
  { id: 18, name: 'تونس' },
  { id: 7, name: 'طهران' },
  { id: 20, name: 'إندونيسيا (كمنج)' },
  { id: 17, name: 'ماليزيا (جاكيم)' },
  { id: 11, name: 'سنغافورة' },
  { id: 12, name: 'فرنسا (اتحاد المنظمات الإسلامية)' },
  { id: 14, name: 'روسيا' },
  { id: 22, name: 'البرتغال' },
];

const BY_COUNTRY: Record<string, number> = {
  SA: 4, YE: 4,
  EG: 5, SD: 5, LY: 5, SY: 5, LB: 5, PS: 5, IQ: 5,
  JO: 23,
  AE: 16, KW: 9, QA: 10, BH: 8, OM: 8,
  MA: 21, DZ: 19, TN: 18,
  TR: 13, AZ: 13,
  IR: 7,
  PK: 1, IN: 1, BD: 1, AF: 1,
  ID: 20, MY: 17, SG: 11, BN: 11,
  US: 2, CA: 2,
  FR: 12, RU: 14, PT: 22,
};

export const DEFAULT_METHOD = 3;

/** The official method for a country (ISO 3166 alpha-2), or the Muslim World League. */
export const methodForCountry = (countryCode: string | null | undefined) =>
  (countryCode && BY_COUNTRY[countryCode.toUpperCase()]) || DEFAULT_METHOD;

export const methodName = (id: number) => PRAYER_METHODS.find((m) => m.id === id)?.name ?? 'رابطة العالم الإسلامي';
