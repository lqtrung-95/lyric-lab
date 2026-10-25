// Tiến độ khám phá lưu trong trình duyệt (bản thử chưa ghi vào tài khoản): từ nào đã chạm học, đã đúng/sai bao nhiêu lần, lần cuối gặp lúc nào.
// Từ lâu không gặp thì "mờ" trên cảnh để gợi người học quay lại ôn (lặp lại ngắt quãng đơn giản).

import { LEGACY_SCENE_IDS } from "@/lib/routes/legacy-redirects";

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

/** Khóa tiến độ của một vật: theo cảnh để hai cảnh có vật trùng id không dẫm lên nhau. */
export const progressKey = (sceneId: string, objectId: string): string => `${sceneId}:${objectId}`;
/** Cảnh đầu tiên: tiến độ lưu trước khi có khóa theo cảnh (chỉ là id vật, không có dấu `:`) thuộc cảnh này. */
export const LEGACY_SCENE_ID = "room";
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

/** Xóa tiến độ của riêng một cảnh ("Học lại từ đầu" ở cảnh đó), giữ nguyên các cảnh khác. */
export const clearScene = (p: ExploreProgress, sceneId: string): ExploreProgress => ({
  terms: Object.fromEntries(Object.entries(p.terms).filter(([k]) => !k.startsWith(`${sceneId}:`))),
});

export const isDiscovered = (p: ExploreProgress, id: string): boolean => id in p.terms;
export const isFaded = (p: ExploreProgress, id: string, now: number): boolean => {
  const t = p.terms[id];
  return !!t && now - t.lastSeenAt > FADE_AFTER_MS;
};

/** Khóa cũ → khóa hiện tại: id vật trần thuộc cảnh đầu tiên; id cảnh tiếng Việt cũ (`phong:bed`) đổi sang id tiếng Anh (`room:bed`). */
function migrateKey(k: string): string {
  const i = k.indexOf(":");
  if (i < 0) return progressKey(LEGACY_SCENE_ID, k);
  const scene = k.slice(0, i);
  return `${LEGACY_SCENE_IDS[scene] ?? scene}${k.slice(i)}`;
}

/** Chuẩn hóa dữ liệu lấy từ bất kỳ đâu (localStorage, tài khoản); hỏng thì bắt đầu mới. */
export function parseProgress(data: unknown): ExploreProgress {
  const raw = (data as { terms?: unknown } | null)?.terms;
  if (!raw || typeof raw !== "object") return emptyProgress();
  const terms: Record<string, TermProgress> = {};
  for (const [k, v] of Object.entries(raw as Record<string, Partial<TermProgress>>)) {
    if (!v || typeof v !== "object") continue;
    // Dữ liệu cũ khóa theo id vật trần: chuyển sang khóa theo cảnh (cảnh đầu tiên).
    terms[migrateKey(k)] = { discoveredAt: Number(v.discoveredAt) || 0, lastSeenAt: Number(v.lastSeenAt) || 0, correct: Number(v.correct) || 0, wrong: Number(v.wrong) || 0 };
  }
  return { terms };
}

/** Đọc từ localStorage; dữ liệu hỏng hoặc không đọc được thì bắt đầu mới. */
export function loadProgress(storage: Pick<Storage, "getItem"> | null): ExploreProgress {
  try {
    const raw = storage?.getItem(STORAGE_KEY);
    return raw ? parseProgress(JSON.parse(raw)) : emptyProgress();
  } catch {
    return emptyProgress();
  }
}

export function saveProgress(storage: Pick<Storage, "setItem"> | null, p: ExploreProgress): void {
  try { storage?.setItem(STORAGE_KEY, JSON.stringify(p)); } catch { /* đầy hoặc bị chặn: chỉ mất khi đóng tab */ }
}
