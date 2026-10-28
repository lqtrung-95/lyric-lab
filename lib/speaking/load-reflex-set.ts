import "server-only";
import { ALL_DIALOGUES } from "@/lib/dialogues/dialogue-catalog";
import { loadDialogueSummaries } from "@/lib/dialogues/load-dialogues";
import { annotatePinyin } from "@/lib/explore/story/annotate-lines";
import { pickReflexItems, type ReflexItem } from "./reflex-questions";

export const REFLEX_MAX_LEVEL = 4;
export const REFLEX_ROUNDS = 10;

export interface ReflexSet { items: ReflexItem[]; pinyin: Record<string, string> }

/** Một bộ câu Hỏi nhanh – Đáp nhanh: ngẫu nhiên mỗi lần tải, chỉ hội thoại từ HSK 4 trở xuống, kèm pinyin lấy từ từ điển. */
export async function loadReflexSet(count = REFLEX_ROUNDS): Promise<ReflexSet> {
  const levels = new Map((await loadDialogueSummaries()).map((s) => [s.id, s.level] as const));
  const items = pickReflexItems(ALL_DIALOGUES, levels, count, REFLEX_MAX_LEVEL);
  return { items, pinyin: await annotatePinyin(items.flatMap((i) => [i.q, i.a])) };
}
