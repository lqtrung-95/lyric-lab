/**
 * Ghép bộ thủ (kiểu Little Alchemy): bắt đầu với vài bộ cơ bản, ghép hai mảnh thành chữ mới (日 + 月 = 明), chữ mới lại ghép tiếp.
 * Công thức lấy từ cấu tạo chữ thật (IDS của Make Me a Hanzi trong `dict_hanzi_info`): chỉ các chữ có đúng hai thành phần (trái-phải hoặc trên-dưới).
 * Thứ tự hai mảnh không quan trọng; một cặp có thể ra nhiều chữ (木 + 口 = 杏 và 呆).
 */
export interface Recipe { a: string; b: string; out: string }

const IDS_PAIR = /^[⿰⿱]([^⿰-⿿\s？?])([^⿰-⿿\s？?])$/u;

/** Đọc cấu tạo IDS thành hai thành phần; null nếu không phải cấu tạo hai mảnh trái-phải/trên-dưới của hai ký tự đơn. */
export function parsePair(decomposition: string | null | undefined): [string, string] | null {
  const m = decomposition ? IDS_PAIR.exec(decomposition.trim()) : null;
  return m ? [m[1], m[2]] : null;
}

export const pairKey = (a: string, b: string): string => (a <= b ? `${a}${b}` : `${b}${a}`);

/** Các chữ có thể ghép tới được từ bộ ban đầu `start`, lặp tới khi hết chữ mới. */
export function reachable(recipes: readonly Recipe[], start: readonly string[]): Set<string> {
  const have = new Set(start);
  for (let grew = true; grew;) {
    grew = false;
    for (const r of recipes) if (have.has(r.a) && have.has(r.b) && !have.has(r.out)) { have.add(r.out); grew = true; }
  }
  return have;
}

/**
 * Chọn bộ ban đầu theo kiểu tham lam: các mảnh "nguyên tử" (không tự ghép được từ mảnh khác); mỗi lượt thêm mảnh làm mở được NHIỀU chữ nhất
 * (hòa thì mảnh dùng nhiều công thức hơn), tới khi đủ `size` hoặc không còn mảnh nào mở thêm chữ. Giữ lại các công thức ghép tới được từ bộ đó.
 */
export function pickStart(recipes: readonly Recipe[], size = 24): { start: string[]; recipes: Recipe[] } {
  const made = new Set(recipes.map((r) => r.out));
  const uses = new Map<string, number>();
  for (const r of recipes) for (const p of new Set([r.a, r.b])) if (!made.has(p)) uses.set(p, (uses.get(p) ?? 0) + 1);
  const atoms = [...uses.keys()].sort((x, y) => (uses.get(y) ?? 0) - (uses.get(x) ?? 0) || x.localeCompare(y));
  const start: string[] = [];
  while (start.length < size) {
    let best: { atom: string; gain: number } | null = null;
    for (const atom of atoms) {
      if (start.includes(atom)) continue;
      const gain = reachable(recipes, [...start, atom]).size - start.length - 1;
      if (!best || gain > best.gain) best = { atom, gain };
    }
    if (!best) break;
    start.push(best.atom);
  }
  const ok = reachable(recipes, start);
  return { start, recipes: recipes.filter((r) => ok.has(r.a) && ok.has(r.b) && ok.has(r.out)) };
}

/** Kết quả ghép hai mảnh: danh sách chữ (rỗng nếu không ghép được). */
export function combine(recipes: readonly Recipe[], a: string, b: string): string[] {
  const key = pairKey(a, b);
  return [...new Set(recipes.filter((r) => pairKey(r.a, r.b) === key).map((r) => r.out))];
}

/** Gợi ý: một công thức mà cả hai mảnh đã có nhưng chữ ra chưa tìm thấy (null nếu hết). `pick` chọn chỉ số trong danh sách ứng viên. */
export function hint(recipes: readonly Recipe[], found: ReadonlySet<string>, pick: (n: number) => number = () => 0): Recipe | null {
  const open = recipes.filter((r) => found.has(r.a) && found.has(r.b) && !found.has(r.out));
  return open.length === 0 ? null : open[Math.min(open.length - 1, Math.max(0, pick(open.length)))];
}

/** Số chữ ghép được trong tổng số (không tính bộ ban đầu). */
export function forgeProgress(recipes: readonly Recipe[], found: ReadonlySet<string>): { done: number; total: number } {
  const outs = new Set(recipes.map((r) => r.out));
  return { done: [...outs].filter((c) => found.has(c)).length, total: outs.size };
}

export function parseFound(raw: unknown): string[] {
  return Array.isArray(raw) ? [...new Set(raw.filter((x): x is string => typeof x === "string" && [...x].length === 1))] : [];
}
