import type { StoryDef } from "./story-types";

export type Verdict =
  | { type: "solved" }
  | { type: "wrong_suspect"; suspectId: string }
  | { type: "weak_evidence"; matched: number; needed: number };

/**
 * Chấm lời buộc tội: đúng thủ phạm và chọn đủ số manh mối then chốt thì phá án xong. Đúng thủ phạm mà bằng chứng yếu thì báo thiếu bao nhiêu (không lộ manh mối nào đúng);
 * sai thủ phạm thì báo sai.
 */
export function judge(story: Pick<StoryDef, "solution">, suspectId: string, clueIds: readonly string[]): Verdict {
  const { solution } = story;
  if (suspectId !== solution.suspectId) return { type: "wrong_suspect", suspectId };
  const matched = new Set(clueIds.filter((c) => solution.keyClues.includes(c))).size;
  return matched >= solution.needed ? { type: "solved" } : { type: "weak_evidence", matched, needed: solution.needed };
}

/** Đủ điều kiện để buộc tội: đã nghe lời khai của mọi nghi phạm. */
export const readyToAccuse = (suspects: readonly { metFlag: string }[], flags: readonly string[]): boolean => suspects.every((s) => flags.includes(s.metFlag));
