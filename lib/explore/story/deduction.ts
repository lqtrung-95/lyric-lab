import { applyEffects } from "./story-state";
import type { ClueDef, StoryDef, StoryProgress, Suspect } from "./story-types";

export type Verdict =
  | { type: "solved" }
  | { type: "wrong_suspect"; suspectId: string }
  | { type: "weak_evidence"; matched: number; needed: number };

/**
 * Chấm lời buộc tội: đúng thủ phạm (và đồng phạm nếu có) và chọn đủ số manh mối then chốt thì phá án xong. Đúng thủ phạm mà bằng chứng yếu thì báo thiếu bao nhiêu (không lộ manh mối nào đúng);
 * sai người thì báo sai. `suspectIds` là một id hoặc nhiều id (vụ có đồng phạm: phải chọn đúng cả hai, không thừa không thiếu).
 */
export function judge(story: Pick<StoryDef, "solution">, suspectIds: string | readonly string[], clueIds: readonly string[]): Verdict {
  const { solution } = story;
  const chosen = new Set(typeof suspectIds === "string" ? [suspectIds] : suspectIds);
  const want = new Set([solution.suspectId, ...(solution.partnerId ? [solution.partnerId] : [])]);
  const same = chosen.size === want.size && [...want].every((id) => chosen.has(id));
  if (!same) return { type: "wrong_suspect", suspectId: [...chosen][0] ?? "" };
  const matched = new Set(clueIds.filter((c) => solution.keyClues.includes(c))).size;
  return matched >= solution.needed ? { type: "solved" } : { type: "weak_evidence", matched, needed: solution.needed };
}

/** Đủ điều kiện để buộc tội: đã nghe lời khai của mọi nghi phạm thật (lựa chọn ảo như "Không ai cả" không cần gặp). */
export const readyToAccuse = (suspects: readonly Pick<Suspect, "metFlag" | "virtual">[], flags: readonly string[]): boolean => suspects.every((s) => s.virtual || flags.includes(s.metFlag));

export type LinkResult =
  | { status: "linked"; clue: ClueDef; progress: StoryProgress }
  | { status: "known"; clue: ClueDef }
  | { status: "none" };

/**
 * Nối hai manh mối đã tìm: nếu cặp đó dẫn tới một suy luận của vụ án thì suy luận được thêm vào sổ (như một manh mối mới), cặp sai thì không có gì.
 * Thứ tự hai manh mối không quan trọng.
 */
export function linkClues(story: Pick<StoryDef, "clues">, progress: StoryProgress, a: string, b: string): LinkResult {
  if (a === b || !progress.clues.includes(a) || !progress.clues.includes(b)) return { status: "none" };
  const found = story.clues.find((c) => c.kind === "deduction" && c.link && c.link.includes(a) && c.link.includes(b));
  if (!found) return { status: "none" };
  if (progress.clues.includes(found.id)) return { status: "known", clue: found };
  return { status: "linked", clue: found, progress: applyEffects(progress, [{ clue: found.id }]) };
}
