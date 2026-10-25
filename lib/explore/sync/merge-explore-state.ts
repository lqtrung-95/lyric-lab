import type { ExploreProgress, TermProgress } from "../explore-progress";
import type { StoryProgress } from "../story/story-types";

const union = (a: readonly string[], b: readonly string[]): string[] => [...new Set([...a, ...b])];

function mergeTerm(a: TermProgress, b: TermProgress): TermProgress {
  return {
    discoveredAt: Math.min(a.discoveredAt || b.discoveredAt, b.discoveredAt || a.discoveredAt),
    lastSeenAt: Math.max(a.lastSeenAt, b.lastSeenAt),
    correct: Math.max(a.correct, b.correct),
    wrong: Math.max(a.wrong, b.wrong),
  };
}

/** Gộp tiến độ từ vựng của hai nguồn (máy này và tài khoản): hợp các từ; từ có ở cả hai thì lấy mốc học sớm nhất, lần gặp muộn nhất, số đúng/sai lớn nhất. */
export function mergeProgress(a: ExploreProgress, b: ExploreProgress): ExploreProgress {
  const terms: Record<string, TermProgress> = { ...a.terms };
  for (const [k, v] of Object.entries(b.terms)) terms[k] = terms[k] ? mergeTerm(terms[k], v) : v;
  return { terms };
}

/** Gộp tiến độ cốt truyện: hợp cờ và manh mối (chỉ tiến lên, không mất), giữ bộ đếm câu kiểm tra của nguồn đã chơi nhiều hơn, đã nhận XP ở nguồn nào thì coi là đã nhận. */
export function mergeStory(a: StoryProgress, b: StoryProgress): StoryProgress {
  return { flags: union(a.flags, b.flags), clues: union(a.clues, b.clues), checks: b.checks.total > a.checks.total ? b.checks : a.checks, scored: a.scored || b.scored };
}

export const isProgressEmpty = (p: ExploreProgress): boolean => Object.keys(p.terms).length === 0;
export const isStoryEmpty = (p: StoryProgress): boolean => p.flags.length === 0 && p.clues.length === 0 && p.checks.total === 0 && !p.scored;
