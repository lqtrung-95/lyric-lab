/** Một từ người dùng nhập: chữ Hán và (tùy chọn) nghĩa tiếng Việt họ tự ghi. */
export interface VocabEntry { zh: string; meaning: string | null }
/** Từ đã có pinyin và âm Hán Việt (lấy từ từ điển, xem API `han-to-pinyin`). */
export interface VocabItem extends VocabEntry { pinyin: string; sinoViet: string | null }

/** Số từ tối đa mỗi tờ: vừa khổ A4 với các phần bài tập. */
export const MAX_WORDS = 20;

const LINE = /^\s*(\p{Script=Han}[\p{Script=Han}·]*)\s*(?:[,，;；:：\t-]\s*|\s+)?(.*?)\s*$/u;

/**
 * Đọc danh sách từ: mỗi dòng một từ chữ Hán, có thể kèm nghĩa sau dấu phẩy, hai chấm, gạch ngang, tab hoặc khoảng trắng ("你好, xin chào" hay "你好 xin chào").
 * Bỏ dòng không bắt đầu bằng chữ Hán, bỏ từ trùng, giữ tối đa `MAX_WORDS` từ.
 */
export function parseWordList(text: string): VocabEntry[] {
  const seen = new Set<string>();
  const out: VocabEntry[] = [];
  for (const raw of text.split(/\r?\n/)) {
    const m = raw.match(LINE);
    if (!m || seen.has(m[1])) continue;
    seen.add(m[1]);
    out.push({ zh: m[1], meaning: m[2] ? m[2] : null });
    if (out.length === MAX_WORDS) break;
  }
  return out;
}

/** Chữ cái đánh dấu cột phải của bài nối (A, B, C…). */
export const letterOf = (i: number): string => String.fromCharCode(65 + i);

export interface MatchExercise {
  /** Cột phải đã xáo trộn. */
  right: string[];
  /** Đáp án: chữ cái của cột phải ứng với từng dòng bên trái. */
  answers: string[];
}

/** Bài nối: cột trái giữ thứ tự, cột phải xáo trộn (khác thứ tự gốc khi có từ 2 dòng trở lên), kèm đáp án theo chữ cái. */
export function buildMatch(rights: readonly string[], rng: () => number = Math.random): MatchExercise {
  const order = rights.map((_, i) => i);
  const shuffle = () => {
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
  };
  if (order.length >= 2) {
    for (let attempt = 0; attempt < 12; attempt++) { shuffle(); if (order.some((o, i) => o !== i)) break; }
    if (order.every((o, i) => o === i)) order.push(order.shift()!); // vẫn trùng gốc: xoay vòng
  }
  const answers = rights.map((_, i) => letterOf(order.indexOf(i)));
  return { right: order.map((i) => rights[i]), answers };
}

/** Phần nào của tờ bài tập được chọn. */
export interface SheetOptions { matchPinyin: boolean; matchMeaning: boolean; writePinyin: boolean; writeHan: boolean; answerKey: boolean }
export const DEFAULT_OPTIONS: SheetOptions = { matchPinyin: true, matchMeaning: true, writePinyin: true, writeHan: true, answerKey: true };

/** Mọi từ đều có nghĩa người dùng ghi thì mới làm được bài nối chữ với nghĩa. */
export const canMatchMeaning = (items: readonly VocabItem[]): boolean => items.length > 1 && items.every((i) => i.meaning);

/** Gợi ý hiện ở bài viết chữ Hán: nghĩa người dùng ghi, không có thì âm Hán Việt. */
export const hanHint = (item: VocabItem): string => item.meaning ?? item.sinoViet ?? "";
