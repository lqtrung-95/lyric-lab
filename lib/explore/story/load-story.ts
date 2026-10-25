import "server-only";
import { TtlCache } from "@/lib/courses/ttl-cache";
import { annotatePinyin } from "./annotate-lines";
import { CASES } from "./cases";
import type { StoryDef, StorySceneDef } from "./story-types";

/** Dữ liệu cốt truyện gửi cho trang của một cảnh: lời thoại của cảnh, toàn bộ manh mối/mục tiêu/nghi phạm (sổ vụ án dùng ở mọi cảnh) và pinyin của các câu. */
export interface StoryPayload {
  story: Omit<StoryDef, "scenes">;
  scene: StorySceneDef;
  /** Câu tiếng Trung → pinyin (từ từ điển). */
  pinyin: Record<string, string>;
}

const cache = new TtlCache<StoryPayload | null>(10 * 60_000, 50);

/** Chuỗi tiếng Trung cần pinyin: lời thoại và lựa chọn của cảnh, mọi manh mối (sổ vụ án). */
export function chineseTexts(story: StoryDef, scene: StorySceneDef): string[] {
  const dialogue = Object.values(scene.dialogues).flatMap((n) => [n.zh, ...(n.choices ?? []).map((c) => c.zh)]);
  return [...dialogue, ...story.clues.map((c) => c.zh)].filter(Boolean);
}

/** Cốt truyện của một cảnh trong một vụ án; null nếu vụ án hoặc cảnh đó không có trong cốt truyện. Nội dung tĩnh nên nhớ 10 phút. */
export async function loadStoryPayload(storyId: string, sceneId: string): Promise<StoryPayload | null> {
  const key = `${storyId}/${sceneId}`;
  const hit = cache.get(key);
  if (hit !== undefined) return hit;
  const def = CASES[storyId];
  const scene = def?.scenes[sceneId];
  if (!def || !scene) { cache.set(key, null); return null; }
  const { scenes: _scenes, ...story } = def;
  void _scenes;
  const payload: StoryPayload = { story, scene, pinyin: await annotatePinyin(chineseTexts(def, scene)) };
  cache.set(key, payload);
  return payload;
}
