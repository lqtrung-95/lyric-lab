const KEY = "lyric-lab-weak-terms";
const MAX_TRACKED = 120;
export const MAX_WEAK_SENT = 20;

/**
 * Các từ người học hay làm sai trong bài kiểm tra chặng (lưu cục bộ trong trình duyệt, không cần tài khoản): từ sai được ghi nhận, từ trả lời đúng ở lần sau thì bỏ ra.
 * Chặng ôn tổng hợp dùng danh sách này để ưu tiên đưa đúng các từ đó vào đề.
 */
export function readWeakTerms(): string[] {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(v) ? v.filter((t): t is string => typeof t === "string") : [];
  } catch {
    return [];
  }
}

/** Cập nhật danh sách: thêm các từ vừa sai (lên đầu), bỏ các từ vừa đúng; giữ tối đa `MAX_TRACKED` từ gần nhất. Hàm thuần để test. */
export function updateWeakTerms(current: string[], wrong: string[], right: string[]): string[] {
  const fixed = new Set(right);
  const kept = current.filter((t) => !fixed.has(t) && !wrong.includes(t));
  return [...wrong, ...kept].slice(0, MAX_TRACKED);
}

export function recordQuizOutcome(wrong: string[], right: string[]): void {
  try { localStorage.setItem(KEY, JSON.stringify(updateWeakTerms(readWeakTerms(), wrong, right))); } catch { /* không lưu được: bỏ qua */ }
}
