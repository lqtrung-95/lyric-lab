// Tiến độ luyện phát âm lưu ngay trên thiết bị (localStorage): không cần tài khoản, mất khi xóa dữ liệu trình duyệt.
import { computeStreak, dayKey, type StreakSummary } from "@/lib/streak/streak-logic";

export interface PronunciationProgress {
  /** Các ngày (YYYY-MM-DD) đã hoàn thành bài tập hằng ngày. */
  days: string[];
  /** Id các bước lộ trình đã đánh dấu xong. */
  lessons: string[];
  /** Điểm cao nhất từng câu 绕口令 (theo id). */
  twisters: Record<string, number>;
}

const KEY = "songhanzi:pronunciation-progress";
export const emptyProgress = (): PronunciationProgress => ({ days: [], lessons: [], twisters: {} });

const uniq = (items: string[]) => [...new Set(items)];

export const markDay = (p: PronunciationProgress, day: string): PronunciationProgress => ({ ...p, days: uniq([...p.days, day]).sort().slice(-400) });
export const toggleLesson = (p: PronunciationProgress, id: string): PronunciationProgress => ({ ...p, lessons: p.lessons.includes(id) ? p.lessons.filter((l) => l !== id) : [...p.lessons, id] });
export const recordTwister = (p: PronunciationProgress, id: string, score: number): PronunciationProgress => ({ ...p, twisters: { ...p.twisters, [id]: Math.max(p.twisters[id] ?? 0, Math.round(score)) } });
export const streakOf = (p: PronunciationProgress, today: string): StreakSummary => computeStreak(p.days, today);
export const todayKey = (now = new Date()) => dayKey(now, Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Ho_Chi_Minh");

/** Đọc từ localStorage; dữ liệu hỏng hoặc không truy cập được thì trả bản rỗng. */
export function loadProgress(): PronunciationProgress {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? "null") as Partial<PronunciationProgress> | null;
    if (!raw || typeof raw !== "object") return emptyProgress();
    return {
      days: Array.isArray(raw.days) ? raw.days.filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d)) : [],
      lessons: Array.isArray(raw.lessons) ? raw.lessons.filter((l) => typeof l === "string") : [],
      twisters: raw.twisters && typeof raw.twisters === "object" ? Object.fromEntries(Object.entries(raw.twisters).filter(([, v]) => typeof v === "number")) : {},
    };
  } catch {
    return emptyProgress();
  }
}

export function saveProgress(p: PronunciationProgress): void {
  try { localStorage.setItem(KEY, JSON.stringify(p)); } catch { /* chế độ riêng tư: bỏ qua, tiến độ chỉ sống trong phiên */ }
}
