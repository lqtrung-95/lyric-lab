import { foldVietnamese } from "./fold-vietnamese";

/** Nghĩa tiếng Việt đã duyệt (từ → nghĩa), kèm bản đã gập dấu để tìm không phân biệt dấu. */
export interface GlossIndex {
  glosses: ReadonlyMap<string, string>;
  folded: ReadonlyMap<string, string[]>;
}

/** Nghĩa mỗi từ ngăn bằng dấu phẩy ("nói, kể"): tách thành các ý đã gập dấu để khớp trọn ý được xếp trước khớp một phần. */
export function buildGlossIndex(entries: Record<string, string>): GlossIndex {
  const glosses = new Map(Object.entries(entries));
  const folded = new Map<string, string[]>();
  for (const [term, gloss] of glosses) folded.set(term, foldVietnamese(gloss).split(/[,;]/).map((s) => s.trim()).filter(Boolean));
  return { glosses, folded };
}

export interface GlossHit { term: string; /** 3 = khớp trọn một ý, 2 = khớp theo từ, 1 = chứa chuỗi. */ strength: 1 | 2 | 3 }

/** Từ có nghĩa tiếng Việt khớp truy vấn (đã gập dấu): khớp trọn một ý trước, rồi khớp theo từ, cuối cùng chứa chuỗi. */
export function searchGlosses(index: GlossIndex, q: string, limit: number): GlossHit[] {
  if (q.length < 2) return [];
  const word = new RegExp(`(^| )${q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}( |$)`);
  const scored: GlossHit[] = [];
  for (const [term, parts] of index.folded) {
    let s = 0;
    for (const p of parts) s = Math.max(s, p === q ? 3 : word.test(p) ? 2 : p.includes(q) ? 1 : 0);
    if (s) scored.push({ term, strength: s as GlossHit["strength"] });
  }
  return scored.sort((a, b) => b.strength - a.strength || a.term.length - b.term.length).slice(0, limit);
}
