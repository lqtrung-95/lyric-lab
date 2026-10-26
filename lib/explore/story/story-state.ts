import type { Condition, Effect, StoryProgress } from "./story-types";

export const STORY_KEY = "songhanzi-story-v1";

export const emptyStory = (): StoryProgress => ({ flags: [], clues: [], checks: { right: 0, total: 0 }, scored: false });

/** Điều kiện theo cờ: đủ mọi cờ trong `all`, không có cờ nào trong `none`. */
export function holds(cond: Condition | undefined, flags: readonly string[]): boolean {
  if (!cond) return true;
  const set = new Set(flags);
  return (cond.all ?? []).every((f) => set.has(f)) && !(cond.none ?? []).some((f) => set.has(f));
}

/** Áp các hiệu ứng (đặt cờ, thêm manh mối, kèm cờ `clue:<id>`); trùng thì bỏ qua. Trả bản mới, không sửa bản cũ. */
export function applyEffects(p: StoryProgress, effects: readonly Effect[] | undefined): StoryProgress {
  if (!effects?.length) return p;
  const flags = new Set(p.flags);
  const clues = new Set(p.clues);
  for (const e of effects) {
    if ("flag" in e) flags.add(e.flag);
    else { clues.add(e.clue); flags.add(`clue:${e.clue}`); } // manh mối cũng đặt cờ để mục tiêu/hội thoại dùng làm điều kiện
  }
  return { ...p, flags: [...flags], clues: [...clues] };
}

export const addFlag = (p: StoryProgress, flag: string): StoryProgress => applyEffects(p, [{ flag }]);

/** Ghi một lần trả lời câu kiểm tra hiểu: chỉ lần đầu đúng của câu đó mới tính "đúng"; sai tính một lần cho mỗi câu. */
export function recordCheck(p: StoryProgress, right: boolean): StoryProgress {
  return { ...p, checks: { right: p.checks.right + (right ? 1 : 0), total: p.checks.total + 1 } };
}

/** Chuẩn hóa dữ liệu lấy từ bất kỳ đâu (localStorage, tài khoản); hỏng thì bắt đầu mới. */
export function parseStory(data: unknown): StoryProgress {
  const d = data as Partial<StoryProgress> | null;
  if (!d || !Array.isArray(d.flags) || !Array.isArray(d.clues)) return emptyStory();
  return { flags: d.flags.filter((x) => typeof x === "string"), clues: d.clues.filter((x) => typeof x === "string"), checks: { right: Number(d.checks?.right) || 0, total: Number(d.checks?.total) || 0 }, scored: d.scored === true };
}

/** Vụ án đầu tiên lưu tiến độ trước khi có khóa theo vụ án: dữ liệu ở khóa trần thuộc vụ này. */
export const LEGACY_CASE_ID = "wooden-box";
export const storyKey = (caseId: string): string => `${STORY_KEY}:${caseId}`;

/** Đọc tiến độ của một vụ án (mỗi vụ một khóa); dữ liệu hỏng hoặc không đọc được thì bắt đầu mới. */
export function loadStory(storage: Pick<Storage, "getItem"> | null, caseId: string = LEGACY_CASE_ID): StoryProgress {
  try {
    const raw = storage?.getItem(storyKey(caseId)) ?? (caseId === LEGACY_CASE_ID ? storage?.getItem(STORY_KEY) : null);
    return raw ? parseStory(JSON.parse(raw)) : emptyStory();
  } catch {
    return emptyStory();
  }
}

export function saveStory(storage: Pick<Storage, "setItem"> | null, p: StoryProgress, caseId: string = LEGACY_CASE_ID): void {
  try { storage?.setItem(storyKey(caseId), JSON.stringify(p)); } catch { /* đầy hoặc bị chặn: chỉ mất khi đóng tab */ }
}
