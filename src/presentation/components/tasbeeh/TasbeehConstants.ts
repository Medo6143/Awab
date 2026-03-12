export const DEFAULT_TARGETS = [33, 99, 100, 1000];
export const DEFAULT_DHIKR = [
  "سبحان الله",
  "الحمد لله",
  "لا إله إلا الله",
  "الله أكبر",
  "أستغفر الله",
  "لا حول ولا قوة إلا بالله",
  "اللهم صل وسلم على نبينا محمد"
];

export const toAr = (n: number) => n.toString().replace(/[0-9]/g, d => '٠١٢٣٤٥٦٧٨٩'[+d]);
