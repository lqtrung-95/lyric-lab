// Chỉ số lưu loát của người học, lưu cục bộ theo thiết bị (localStorage): thời gian phản xạ, lượng chữ đã nói, số từ đã dùng. Không gửi lên máy chủ.

export type FluencySource = "reflex" | "fiveword" | "roleplay";
export interface FluencyEntry {
  at: number;
  source: FluencySource;
  /** Số lượt đã nói. */
  turns: number;
  /** Từng lượt: từ lúc bắt đầu ghi tới lúc bắt đầu nói (ms). Chỉ ghi các lượt đo được. */
  reactionMs: number[];
  hanChars: number;
  /** Các từ đã dùng được trong lời nói (Dùng 5 từ). */
  words: string[];
}
export interface FluencySummary { sessions: number; turns: number; hanChars: number; distinctWords: number; avgReactionMs: number | null }

const KEY = "songhanzi-fluency-v1";
const MAX_ENTRIES = 200;
const DAY_MS = 86_400_000;

type StoreLike = Pick<Storage, "getItem" | "setItem">;
const browserStore = (): StoreLike | null => { try { return typeof localStorage === "undefined" ? null : localStorage; } catch { return null; } };

export function readEntries(store: StoreLike | null = browserStore()): FluencyEntry[] {
  try {
    const raw = JSON.parse(store?.getItem(KEY) ?? "[]");
    return Array.isArray(raw) ? raw.filter((e): e is FluencyEntry => typeof e?.at === "number" && Array.isArray(e?.reactionMs)) : [];
  } catch {
    return [];
  }
}

/** Ghi một lượt vào lúc hiện tại (`at` do hàm tự đặt). */
export function recordFluency(entry: Omit<FluencyEntry, "at">, store: StoreLike | null = browserStore()): void {
  if (!store || entry.turns <= 0) return;
  try {
    store.setItem(KEY, JSON.stringify([...readEntries(store), { ...entry, at: Date.now() }].slice(-MAX_ENTRIES)));
  } catch { /* hết chỗ hoặc bị chặn: bỏ qua, chỉ là số liệu phụ */ }
}

/** Tổng hợp các lượt trong `days` ngày gần nhất tính từ `now`. */
export function summarize(entries: readonly FluencyEntry[], now: number, days = 7): FluencySummary {
  const recent = entries.filter((e) => now - e.at <= days * DAY_MS);
  const reactions = recent.flatMap((e) => e.reactionMs);
  return {
    sessions: recent.length,
    turns: recent.reduce((s, e) => s + e.turns, 0),
    hanChars: recent.reduce((s, e) => s + e.hanChars, 0),
    distinctWords: new Set(recent.flatMap((e) => e.words)).size,
    avgReactionMs: reactions.length ? Math.round(reactions.reduce((s, x) => s + x, 0) / reactions.length) : null,
  };
}
