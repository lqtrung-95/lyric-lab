import "server-only";
import { lookupTermEntry } from "@/lib/lookup/server-lookup";
import type { SceneDetail } from "./explore-types";
import { SCENES } from "./scenes/room-scene";

/** Đọc cảnh và bổ sung pinyin, Hán Việt, cấp HSK từ từ điển cho từng vật (không viết tay các trường này). Null nếu không có cảnh. */
export async function loadScene(id: string): Promise<SceneDetail | null> {
  const def = SCENES[id];
  if (!def) return null;
  const entries = await Promise.all(def.objects.map((o) => lookupTermEntry(o.term).catch(() => null)));
  return {
    ...def,
    objects: def.objects.map((o, i) => ({ ...o, pinyin: entries[i]?.pinyin ?? "", sinoViet: entries[i]?.sinoViet ?? null, hskLevel: entries[i]?.hskLevel ?? null })),
  };
}
