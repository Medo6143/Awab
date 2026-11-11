import type { FrameBox } from './AyahVideo';

/** A word of an ayah video's text, before it is laid out. */
export type LayoutWord = { text: string; ayah: number; weight: number };

const MARKS = /[ؐ-ًؚ-ٰٟۖ-ۭـ]/g;

/** How long a word takes to recite, relative to the others: its letters, without diacritics. */
export const wordWeight = (word: string) => word.replace(MARKS, '').replace(/[^\p{L}]/gu, '').length;

/**
 * The words of the ayahs in reading order, each followed by its ayah-end sign «﴿n﴾»
 * (weight 0: it appears with the ayah's last word).
 */
export const ayahWords = (ayahs: { text: string; number: number }[], toDigits: (n: number) => string): LayoutWord[] =>
  ayahs.flatMap((a, i) => [
    ...a.text.trim().split(/\s+/).filter(Boolean).map((text) => ({ text, ayah: i, weight: Math.max(1, wordWeight(text)) })),
    { text: `﴿${toDigits(a.number)}﴾`, ayah: i, weight: 0 },
  ]);

/** Rough font size (as % of the frame width) for this many words: big for a short ayah. */
export const videoFontU = (wordCount: number) => (wordCount <= 10 ? 7.6 : wordCount <= 22 ? 6.6 : wordCount <= 40 ? 5.8 : 5.2);

/**
 * Splits laid-out words into pages that fit `pageHeight`. Words are grouped into lines by
 * their top; a page is a run of whole lines. Returns, for each page, the word indices and how
 * far its first line must move up (`shift`) so the page is vertically centred in the box.
 */
export const paginate = (boxes: FrameBox[], pageHeight: number) => {
  const lines: { top: number; bottom: number; words: number[] }[] = [];
  boxes.forEach((b, i) => {
    const line = lines.find((l) => Math.abs(l.top - b.y) < b.h / 2);
    if (line) {
      line.words.push(i);
      line.bottom = Math.max(line.bottom, b.y + b.h);
    } else {
      lines.push({ top: b.y, bottom: b.y + b.h, words: [i] });
    }
  });
  lines.sort((a, b) => a.top - b.top);

  const pages: { words: number[]; top: number; bottom: number }[] = [];
  for (const l of lines) {
    const page = pages[pages.length - 1];
    if (page && l.bottom - page.top <= pageHeight) {
      page.words.push(...l.words);
      page.bottom = l.bottom;
    } else {
      pages.push({ words: [...l.words], top: l.top, bottom: l.bottom });
    }
  }
  return pages.map((p) => ({
    words: p.words.sort((a, b) => a - b),
    /** Subtract from a word's y (measured in the tall layout) to place it on this page. */
    shift: p.top - Math.max(0, (pageHeight - (p.bottom - p.top)) / 2),
  }));
};
