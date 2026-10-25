import { applyEffects, holds, recordCheck } from "./story-state";
import type { DialogueChoice, DialogueEntry, DialogueNode, StoryProgress } from "./story-types";

/** Điểm vào hội thoại của một NPC: mục đầu tiên có điều kiện đúng; không có thì null (NPC chưa có gì để nói). */
export function pickEntry(entries: readonly DialogueEntry[] | undefined, flags: readonly string[]): string | null {
  return entries?.find((e) => holds(e.when, flags))?.node ?? null;
}

/** Các lựa chọn đang hiện (theo điều kiện cờ). */
export function visibleChoices(node: DialogueNode, flags: readonly string[]): DialogueChoice[] {
  return (node.choices ?? []).filter((c) => holds(c.when, flags));
}

/** Câu thoại hiện ra: áp hiệu ứng của chính câu đó (đặt cờ, thêm manh mối). */
export const enterNode = (p: StoryProgress, node: DialogueNode): StoryProgress => applyEffects(p, node.effects);

export interface StepResult {
  progress: StoryProgress;
  /** Câu kế tiếp; null = hết hội thoại. */
  next: string | null;
}

/**
 * Đi tiếp từ một câu thoại. Câu có lựa chọn: `choiceIndex` là chỉ số trong danh sách ĐANG HIỆN; áp hiệu ứng của lựa chọn và (nếu là câu kiểm tra hiểu)
 * ghi đúng/sai. Câu không có lựa chọn: sang `next`. Chỉ số sai thì không đi đâu (giữ nguyên câu).
 */
export function step(node: DialogueNode, p: StoryProgress, choiceIndex: number | null): StepResult & { moved: boolean } {
  const choices = visibleChoices(node, p.flags);
  if (choices.length === 0) return { progress: p, next: node.next ?? null, moved: true };
  const c = choiceIndex === null ? undefined : choices[choiceIndex];
  if (!c) return { progress: p, next: node.id, moved: false };
  let progress = applyEffects(p, c.effects);
  if (c.check) progress = recordCheck(progress, c.check === "right");
  return { progress, next: c.next, moved: true };
}
