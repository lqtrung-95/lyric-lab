import "server-only";
import { tokenizeLyricLines } from "@/lib/analysis/tokenize-lyric-lines";
import { ALL_DIALOGUES } from "@/lib/dialogues/dialogue-catalog";
import { annotatePinyin } from "@/lib/explore/story/annotate-lines";
import { normalizeLyricLines } from "@/lib/lyrics/normalize-lyric-lines";
import { buildTrial, pickRounds, type Trial } from "./truth-or-lie";
import { isEligible, isSingleClause, shuffleDifferent, toTiles, type OrderItem } from "./word-order";

export interface TruthSet { trials: Trial[]; pinyin: Record<string, string> }

/** Một bộ "Hai thật một giả" ngẫu nhiên (đã xáo trộn ở server nên server và client thấy cùng thứ tự) kèm pinyin lấy từ từ điển. */
export async function loadTruthSet(count = 8): Promise<TruthSet> {
  const trials = pickRounds(count).map((r) => buildTrial(r));
  return { trials, pinyin: await annotatePinyin(trials.flatMap((t) => t.options.map((o) => o.zh))) };
}

/** Một bộ câu để xếp, lấy ngẫu nhiên từ các hội thoại (câu 3 đến 8 từ, mỗi câu một lần), tách từ bằng jieba, kèm pinyin. */
export async function loadWordOrderSet(count = 10): Promise<OrderItem[]> {
  const all = ALL_DIALOGUES.flatMap((d) => d.lines).filter((l) => isSingleClause(l.zh));
  const pool = [...all].sort(() => Math.random() - 0.5);
  const lines = tokenizeLyricLines(normalizeLyricLines(pool.slice(0, count * 4).map((l, i) => ({ text: l.zh, start: i, end: i + 1 }))));
  const byZh = new Map(pool.map((l) => [l.zh, l.vi]));
  const items: OrderItem[] = [];
  const seen = new Set<string>();
  for (const line of lines) {
    const tokens = toTiles(line.tokens);
    if (!isEligible(tokens) || seen.has(line.text) || !byZh.has(line.text)) continue;
    seen.add(line.text);
    items.push({ zh: line.text, vi: byZh.get(line.text)!, tokens, tiles: shuffleDifferent(tokens) });
    if (items.length === count) break;
  }
  const pinyin = await annotatePinyin(items.map((i) => i.zh));
  return items.map((i) => ({ ...i, pinyin: pinyin[i.zh] }));
}
