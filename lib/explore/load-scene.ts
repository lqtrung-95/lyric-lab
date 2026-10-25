import "server-only";
import { loadTermSentences } from "@/lib/courses/load-term-sentences";
import { lookupTermEntry } from "@/lib/lookup/server-lookup";
import type { SceneDetail, SceneWord } from "./explore-types";

const EXAMPLES_PER_WORD = 2;
import { SCENES } from "./scenes/room-scene";

/** Đọc cảnh và bổ sung pinyin, Hán Việt, cấp HSK từ từ điển cho từng vật (không viết tay các trường này). Null nếu không có cảnh. */
export async function loadScene(id: string): Promise<SceneDetail | null> {
  const def = SCENES[id];
  if (!def) return null;
  const terms = def.objects.map((o) => o.term);
  const [entries, examples] = await Promise.all([
    Promise.all(terms.map((t) => lookupTermEntry(t).catch(() => null))),
    loadTermSentences(terms, EXAMPLES_PER_WORD).catch(() => ({})),
  ]);
  return {
    ...def,
    objects: def.objects.map((o, i) => ({ ...o, pinyin: entries[i]?.pinyin ?? "", sinoViet: entries[i]?.sinoViet ?? null, hskLevel: entries[i]?.hskLevel ?? null, examples: (examples as Record<string, SceneWord["examples"]>)[o.term] ?? [] })),
  };
}
