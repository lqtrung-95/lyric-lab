import type { HskTheme } from "./hsk1-themes";

export interface HskWord { simplified: string; frequency: number }
export interface GeneratedUnit { title: string; topic: string; terms: string[]; summary: string }

export const MAX_TERMS_PER_UNIT = 18;
const MIN_LAST_CHUNK = 6;
const PREVIEW_WORDS = 4;

/** Chia `items` thành các đoạn ≤ `max` phần tử, đều nhau: tránh đoạn cuối chỉ còn 1-2 từ (chia 20 từ thành 10+10 chứ không phải 18+2). */
export function splitEvenly<T>(items: T[], max: number): T[][] {
  if (items.length <= max) return [items];
  const parts = Math.ceil(items.length / max);
  const size = Math.ceil(items.length / parts);
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

const summaryOf = (terms: string[]) => `${terms.length} từ: ${terms.slice(0, PREVIEW_WORDS).join(" · ")}…`;

/**
 * Sinh các chặng cho một cấp HSK: từng chủ đề (theo thứ tự `themes`) rồi các từ còn lại theo tần suất. Mỗi từ xuất hiện đúng một lần;
 * từ trong chủ đề mà không thuộc danh sách cấp này bị bỏ qua; chủ đề lớn chia đều thành "(1)", "(2)"... Kết quả xác định (cùng đầu vào cho cùng đầu ra).
 */
export function generateHskUnits(words: HskWord[], themes: HskTheme[], levelLabel: string, max = MAX_TERMS_PER_UNIT): GeneratedUnit[] {
  const available = new Set(words.map((w) => w.simplified));
  const used = new Set<string>();
  const units: GeneratedUnit[] = [];

  const push = (title: string, topic: string, terms: string[]) => {
    const parts = splitEvenly(terms, max);
    parts.forEach((part, i) => units.push({ title: parts.length > 1 ? `${title} (${i + 1})` : title, topic, terms: part, summary: summaryOf(part) }));
  };

  for (const theme of themes) {
    const terms = theme.words.filter((t) => available.has(t) && !used.has(t));
    for (const t of terms) used.add(t);
    if (terms.length) push(theme.title, theme.title, [...new Set(terms)]);
  }

  const rest = words.filter((w) => !used.has(w.simplified)).sort((a, b) => b.frequency - a.frequency || a.simplified.localeCompare(b.simplified)).map((w) => w.simplified);
  if (rest.length === 0) return units;
  const chunks = splitEvenly(rest, max);
  // Phần dư quá ít thì dồn vào chặng liền trước thay vì làm một chặng lẻ.
  if (chunks.length > 1 && chunks[chunks.length - 1].length < MIN_LAST_CHUNK) {
    const last = chunks.pop()!;
    chunks[chunks.length - 1].push(...last);
  }
  chunks.forEach((c, i) => units.push({ title: `Từ thông dụng khác ${chunks.length > 1 ? i + 1 : ""}`.trim(), topic: `${levelLabel}: từ khác`, terms: c, summary: summaryOf(c) }));
  return units;
}

export type PlannedUnit =
  | ({ kind: "hsk" } & GeneratedUnit)
  | { kind: "review"; variant: "checkpoint" | "final"; title: string; topic: string; summary: string; from?: number; to?: number };

/**
 * Chèn chặng ôn tổng hợp vào dãy chặng học: sau mỗi `every` chặng học (0 = không chèn) có một "Ôn tập chặng a–b", cuối dãy có "Kiểm tra cuối cấp".
 * `from`/`to` là số thứ tự (trong cả khóa, đã tính chặng ôn đã chèn) của chặng học đầu và cuối trong nhóm. Chặng học cuối còn lẻ dưới nửa nhóm
 * thì gộp vào lượt ôn cuối thay vì có một lượt ôn riêng cho 1–2 chặng.
 */
export function withReviewUnits(units: GeneratedUnit[], levelLabel: string, every: number, final = true): PlannedUnit[] {
  const out: PlannedUnit[] = [];
  let groupStart = 1; // số thứ tự (trong khóa) của chặng học đầu nhóm hiện tại
  let inGroup = 0;
  const flush = () => {
    const to = out.length;
    out.push({ kind: "review", variant: "checkpoint", title: `Ôn tập chặng ${groupStart}–${to}`, topic: "Ôn tập", summary: `Ôn lại các từ của ${inGroup} chặng vừa học`, from: groupStart, to });
    groupStart = out.length + 1;
    inGroup = 0;
  };
  units.forEach((u, i) => {
    out.push({ kind: "hsk", ...u });
    inGroup++;
    const remaining = units.length - 1 - i;
    if (every > 0 && inGroup >= every && remaining >= Math.ceil(every / 2)) flush();
  });
  if (every > 0 && inGroup > 0) flush();
  if (final) out.push({ kind: "review", variant: "final", title: `Kiểm tra cuối cấp ${levelLabel}`, topic: "Kiểm tra", summary: `Bài kiểm tra tổng hợp toàn bộ từ ${levelLabel}` });
  return out;
}
