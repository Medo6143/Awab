/** Letters only: diacritics, Quranic marks and tatweel removed, ٱ (alef wasla) read as ا. */
const skeleton = (word: string) =>
  word.replace(/[ؐ-ًؚ-ٰٟۖ-ۭـ]/g, '').replace(/ٱ/g, 'ا');

/**
 * Whether a word of the mushaf text is the name of Allah (الله, لله, بالله, والله, اللهم …)
 * or ٱلرَّحۡمَٰن, which in the Quran is only ever His name. Other names are left out on
 * purpose: «رب» can refer to a person (﴿ٱذۡكُرۡنِي عِندَ رَبِّكَ﴾).
 */
export const isDivineName = (word: string) => {
  const k = skeleton(word);
  // prefixes: و/ف, ب/ت/ل, the question hamza (ءآلله); «ضلله» and the like do not match
  return /^[وف]?[ءأآ]{0,2}[بتل]?ا?لله(م)?$/.test(k) || /^[وفب]?الرحمن$/.test(k);
};

/** The text cut into runs, keeping the spaces, each marked as the name of Allah or not. */
export const divineRuns = (text: string): { text: string; divine: boolean }[] => {
  const runs: { text: string; divine: boolean }[] = [];
  for (const part of text.split(/(\s+)/)) {
    if (!part) continue;
    const divine = !/^\s+$/.test(part) && isDivineName(part);
    const last = runs[runs.length - 1];
    if (last && last.divine === divine) last.text += part;
    else runs.push({ text: part, divine });
  }
  return runs;
};
