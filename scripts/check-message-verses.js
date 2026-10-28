#!/usr/bin/env node
// Checks every extra verse of "رسائل من القرآن" exists and holds its key words (plain mushaf text).
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const plain = JSON.parse(/QURAN_PLAIN_TEXT = (".*?");/s.exec(fs.readFileSync(path.join(root, 'src/data/quran/quranPlainText.ts'), 'utf8'))[1]);
const ayah = new Map(plain.split('\n').map((l) => { const [s, a, , t] = l.split('|'); return [`${s}:${a}`, t]; }));
const norm = (t) => t.replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, '').replace(/[أإآٱ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه').replace(/\s+/g, ' ');
const src = fs.readFileSync(path.join(root, 'src/domain/entities/quranMessageVerses.ts'), 'utf8');
let bad = 0, n = 0;
for (const m of src.matchAll(/v\((\d+), (\d+), '([^']+)'(?:, (\d+))?\)/g)) {
  const [, s, from, key, to = from] = m;
  n++;
  let text = '';
  for (let a = +from; a <= +to; a++) {
    const t = ayah.get(`${s}:${a}`);
    if (!t) { console.log(`MISSING ${s}:${a}`); bad++; }
    text += ' ' + (t || '');
  }
  if (!norm(text).includes(norm(key))) { console.log(`KEY NOT FOUND ${s}:${from}-${to} «${key}»\n  ${text.trim().slice(0, 160)}`); bad++; }
}
console.log(`${n} verses checked, ${bad} problems`);
process.exit(bad ? 1 : 0);
