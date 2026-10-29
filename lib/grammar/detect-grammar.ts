import { GRAMMAR_PATTERNS } from "./grammar-patterns";
import type { GrammarPattern } from "./grammar-types";

let table: { p: GrammarPattern; re: RegExp }[] | null = null;
const build = () => (table ??= GRAMMAR_PATTERNS.flatMap((p) => (p.detect ? [{ p, re: new RegExp(p.detect, "u") }] : [])));

/** Nhận ra các mẫu ngữ pháp có trong một dòng lời (tối đa `limit`, mẫu cấp cao ưu tiên vì ít trùng hơn). Không dùng để ghi dữ liệu, chỉ gợi ý học. */
export function detectGrammar(text: string, limit = 2): GrammarPattern[] {
  if (!/\p{Script=Han}/u.test(text)) return [];
  return build().filter(({ re }) => re.test(text)).map(({ p }) => p).sort((a, b) => b.level - a.level).slice(0, limit);
}
