// Tùy chọn gợi ý chung của các game giải trí: hiện pinyin và/hoặc nghĩa để dễ nhớ (mặc định bật cả hai, lưu trên thiết bị).
export interface ArcadeHints { pinyin: boolean; meaning: boolean }

const KEY = "songhanzi-arcade-hints";
const EVENT = "songhanzi:arcade-hints";
const DEFAULT: ArcadeHints = { pinyin: true, meaning: true };

/** Chuỗi thô để so sánh theo giá trị (useSyncExternalStore); server trả rỗng. */
export const readHintsRaw = (): string => { try { return localStorage.getItem(KEY) ?? ""; } catch { return ""; } };

export function parseHints(raw: string): ArcadeHints {
  try {
    const d = JSON.parse(raw) as Partial<ArcadeHints>;
    return { pinyin: typeof d.pinyin === "boolean" ? d.pinyin : DEFAULT.pinyin, meaning: typeof d.meaning === "boolean" ? d.meaning : DEFAULT.meaning };
  } catch { return DEFAULT; }
}

export function writeHints(next: ArcadeHints): void {
  try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* chỉ đổi trong phiên này */ }
  window.dispatchEvent(new Event(EVENT));
}

export function subscribeHints(onChange: () => void): () => void {
  window.addEventListener(EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => { window.removeEventListener(EVENT, onChange); window.removeEventListener("storage", onChange); };
}
