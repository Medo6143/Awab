// Average glyph advance as a share of the font size. Measured on the device: a 554-char
// ayah at 18.9px wrapped to 5 lines of ~354px (≈0.17em); 0.19 keeps a safety margin.
const AMIRI_ADVANCE = 0.19;
const TAJAWAL_ADVANCE = 0.5;

const linesFor = (chars: number, fontSize: number, width: number, advance: number) =>
  Math.max(1, Math.ceil((chars * advance * fontSize) / width));

/**
 * Picks the ayah font size (and whether the tafsir excerpt fits) from the space the
 * middle of the card actually has, so even al-Baqarah 282 stays inside the card.
 */
export const layoutAyahCard = (ayahLen: number, excerptLen: number, w: number, h: number, maxU = 8.4) => {
  const u = w / 100;
  const textW = w - 14 * u;                                // card padding 7u per side
  const middleH = h - 14 * u - 11 * u - 4.5 * u - 6 * u;   // padding, brand, footer, breathing room
  const surahH = 4.2 * u * 1.4 + 4 * u;
  const exSize = 3.6 * u;
  const tafsirH = excerptLen
    ? 6 * u + 8.8 * u + 3.2 * u * 1.4 + 1.6 * u
      + linesFor(excerptLen, exSize, textW - 8.8 * u, TAJAWAL_ADVANCE) * exSize * 1.75
    : 0;
  const ayahH = (f: number) => linesFor(ayahLen + 4, f, textW, AMIRI_ADVANCE) * f * 1.9;

  for (const withTafsir of excerptLen ? [true, false] : [false]) {
    const room = middleH - surahH - (withTafsir ? tafsirH : 0);
    for (let f = maxU; f >= 3; f -= 0.2) {
      if (ayahH(f * u) <= room) return { ayahSize: f * u, showTafsir: withTafsir, exSize };
    }
  }
  return { ayahSize: 3 * u, showTafsir: false, exSize }; // never reached for real ayahs
};
