// Lịch sử tra gần đây: lưu cục bộ (localStorage), mới nhất đứng đầu, không trùng, tối đa MAX mục.
export const SEARCH_HISTORY_KEY = "songhanzi.tra-tu.history";
const MAX = 12;

export function parseHistory(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const data: unknown = JSON.parse(raw);
    return Array.isArray(data) ? data.filter((x): x is string => typeof x === "string" && x.length > 0 && x.length <= 40).slice(0, MAX) : [];
  } catch { return []; }
}

export function pushHistory(history: string[], term: string): string[] {
  const t = term.trim();
  if (!t) return history;
  return [t, ...history.filter((h) => h !== t)].slice(0, MAX);
}

export function readHistory(): string[] {
  try { return parseHistory(localStorage.getItem(SEARCH_HISTORY_KEY)); } catch { return []; }
}

export function saveHistory(history: string[]): void {
  try { localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(history)); } catch { /* chế độ riêng tư: bỏ qua */ }
}
