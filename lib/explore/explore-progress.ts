// Tiến độ khám phá lưu trong trình duyệt (bản thử chưa ghi vào tài khoản): từ nào đã chạm học, đã đúng/sai bao nhiêu lần, lần cuối gặp lúc nào.
// Từ lâu không gặp thì "mờ" trên cảnh để gợi người học quay lại ôn (lặp lại ngắt quãng đơn giản).

export interface TermProgress {
  discoveredAt: number;
  lastSeenAt: number;
  correct: number;
  wrong: number;
}
export interface ExploreProgress {
  terms: Record<string, TermProgress>;
}

export const STORAGE_KEY = "songhanzi-explore-v1";
/** Quá thời gian này không gặp lại thì vật bị "mờ" và cần ôn. */
export const FADE_AFTER_MS = 24 * 60 * 60 * 1000;

export const emptyProgress = (): ExploreProgress => ({ terms: {} });

export function markDiscovered(p: ExploreProgress, id: string, now: number): ExploreProgress {
  const cur = p.terms[id];
  return { terms: { ...p.terms, [id]: cur ? { ...cur, lastSeenAt: now } : { discoveredAt: now, lastSeenAt: now, correct: 0, wrong: 0 } } };
}

/** Ghi một lần trả lời nhiệm vụ. Trả lời đúng làm vật "sáng" lại (cập nhật lần cuối gặp). */
export function recordAnswer(p: ExploreProgress, id: string, ok: boolean, now: number): ExploreProgress {
  const base = p.terms[id] ?? { discoveredAt: now, lastSeenAt: now, correct: 0, wrong: 0 };
  return { terms: { ...p.terms, [id]: { ...base, lastSeenAt: ok ? now : base.lastSeenAt, correct: base.correct + (ok ? 1 : 0), wrong: base.wrong + (ok ? 0 : 1) } } };
}

export const isDiscovered = (p: ExploreProgress, id: string): boolean => id in p.terms;
export const isFaded = (p: ExploreProgress, id: string, now: number): boolean => {
  const t = p.terms[id];
  return !!t && now - t.lastSeenAt > FADE_AFTER_MS;
};

/** Đọc từ localStorage; dữ liệu hỏng hoặc không đọc được thì bắt đầu mới. */
export function loadProgress(storage: Pick<Storage, "getItem"> | null): ExploreProgress {
  try {
    const raw = storage?.getItem(STORAGE_KEY);
    if (!raw) return emptyProgress();
    const data = JSON.parse(raw) as ExploreProgress;
    return data && typeof data.terms === "object" && data.terms ? { terms: data.terms } : emptyProgress();
  } catch {
    return emptyProgress();
  }
}

export function saveProgress(storage: Pick<Storage, "setItem"> | null, p: ExploreProgress): void {
  try { storage?.setItem(STORAGE_KEY, JSON.stringify(p)); } catch { /* đầy hoặc bị chặn: chỉ mất khi đóng tab */ }
}
