/**
 * Turns the quran.com tafsir HTML into structured blocks instead of one flattened string.
 *
 * The API marks up its text with:
 *   <p>                      paragraphs (Ibn Kathir, Tabari, Qurtubi)
 *   <span class="arabic">    a quoted Quran phrase being explained
 *   <span class="blue">      a lead-in such as "عن ابن عباس:" or "وقوله:"
 *   <span class="reference"> a cross-reference like "[ الحديد : 16 ]"
 * Sources without <p> (Saadi, Muyassar) are split into one block per quoted phrase,
 * so each phrase sits with its own explanation.
 */
export type TafsirRun = { kind: 'text' | 'quran' | 'lead' | 'ref'; text: string };
export type TafsirBlock = { runs: TafsirRun[] };

const ENTITIES: Record<string, string> = { '&nbsp;': ' ', '&amp;': '&', '&quot;': '"', '&#39;': "'", '&lt;': '<', '&gt;': '>' };
const decode = (s: string) => s.replace(/&(nbsp|amp|quot|#39|lt|gt);/g, (m) => ENTITIES[m] ?? m);
const clean = (s: string) => decode(s.replace(/<[^>]+>/g, '')).replace(/\\/g, '').replace(/\s+/g, ' ');

const kindOf = (cls: string): TafsirRun['kind'] => {
  if (/\breference\b/.test(cls)) return 'ref';
  if (/\barabic\b/.test(cls)) return 'quran';
  if (/\bblue\b/.test(cls)) return 'lead';
  return 'text';
};

/** Flat run list for one chunk of HTML (no nesting beyond one span level in this API). */
const toRuns = (html: string): TafsirRun[] => {
  const runs: TafsirRun[] = [];
  const re = /<span[^>]*class=["']([^"']*)["'][^>]*>([\s\S]*?)<\/span>/g;
  let last = 0;
  let m: RegExpExecArray | null;
  const push = (kind: TafsirRun['kind'], raw: string) => {
    const text = clean(raw);
    if (!text.trim()) { if (text && runs.length) runs[runs.length - 1].text += ' '; return; }
    const prev = runs[runs.length - 1];
    if (prev && prev.kind === kind && kind === 'text') prev.text += text;
    else runs.push({ kind, text });
  };
  while ((m = re.exec(html))) {
    push('text', html.slice(last, m.index));
    push(kindOf(m[1]), m[2]);
    last = re.lastIndex;
  }
  push('text', html.slice(last));
  // tidy edges
  if (runs.length) {
    runs[0].text = runs[0].text.replace(/^\s+/, '');
    runs[runs.length - 1].text = runs[runs.length - 1].text.replace(/\s+$/, '');
  }
  return runs.filter((r) => r.text.length > 0);
};

/** Split a long run list so each quoted phrase opens its own block. */
const splitAtQuotes = (runs: TafsirRun[]): TafsirBlock[] => {
  const blocks: TafsirBlock[] = [];
  let cur: TafsirRun[] = [];
  const textLen = (rs: TafsirRun[]) => rs.reduce((n, r) => n + r.text.length, 0);
  runs.forEach((r, i) => {
    // a lead-in directly before a quote ("وقوله:") travels with that quote
    const startsPoint = r.kind === 'quran' || (r.kind === 'lead' && runs[i + 1]?.kind === 'quran');
    const continuesLead = r.kind === 'quran' && runs[i - 1]?.kind === 'lead';
    if (startsPoint && !continuesLead && textLen(cur) > 40) {
      blocks.push({ runs: cur });
      cur = [];
    }
    cur.push(r);
  });
  if (cur.length) blocks.push({ runs: cur });
  return blocks;
};

/** Plain prose with no markup at all: break it into paragraphs of a few sentences. */
const splitSentences = (text: string): TafsirBlock[] => {
  const sentences = text.split(/(?<=[.؟!])\s+/);
  const blocks: TafsirBlock[] = [];
  let buf = '';
  for (const s of sentences) {
    buf = buf ? `${buf} ${s}` : s;
    if (buf.length > 280) { blocks.push({ runs: [{ kind: 'text', text: buf }] }); buf = ''; }
  }
  if (buf) blocks.push({ runs: [{ kind: 'text', text: buf }] });
  return blocks;
};

export const parseTafsir = (html: string): TafsirBlock[] => {
  if (!html) return [];
  const paragraphs = html.match(/<p[^>]*>[\s\S]*?<\/p>/g);
  const chunks = paragraphs && paragraphs.length ? paragraphs.map((p) => p.replace(/^<p[^>]*>|<\/p>$/g, '')) : [html];
  const blocks: TafsirBlock[] = [];
  for (const chunk of chunks) {
    const runs = toRuns(chunk);
    if (!runs.length) continue;
    if (!runs.some((r) => r.kind !== 'text')) blocks.push(...splitSentences(runs[0].text));
    else if (chunks.length === 1 || runs.reduce((n, r) => n + r.text.length, 0) > 500) blocks.push(...splitAtQuotes(runs));
    else blocks.push({ runs });
  }
  return blocks;
};

/** First block's plain text, trimmed to a sentence boundary — used on the share card. */
export const tafsirExcerpt = (blocks: TafsirBlock[], max = 320): string => {
  const plain = blocks.map((b) => b.runs.map((r) => r.text).join('')).join(' ').replace(/\s+/g, ' ').trim();
  if (plain.length <= max) return plain;
  const cut = plain.slice(0, max);
  const end = Math.max(cut.lastIndexOf('.'), cut.lastIndexOf('،'), cut.lastIndexOf('؛'));
  return (end > max * 0.5 ? cut.slice(0, end + 1) : cut.replace(/\s+\S*$/, '')) + ' …';
};
