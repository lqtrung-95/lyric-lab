// Cầu nối bài hát → cảnh Khám phá: tìm cảnh có nhiều từ trùng với từ trong bài vừa xem/nghe, để mời người học vào cảnh học tiếp (và ngược lại với chiều
// cảnh → bài hát đã có ở "câu thật"). Chỉ so khớp đúng chữ Hán (giản thể) với từ của cảnh; không dùng AI.

import type { SceneObjectDef } from "./explore-types";
import { isDiscovered, progressKey, type ExploreProgress } from "./explore-progress";

export interface SceneForMatch { id: string; title: string; objects: readonly Pick<SceneObjectDef, "id" | "term">[] }

export interface SongSceneMatch {
  sceneId: string;
  title: string;
  /** Từ của cảnh có trong bài. */
  terms: string[];
  /** Trong số đó, từ bạn chưa học ở cảnh. */
  unlearned: string[];
}

/** Số từ trùng tối thiểu để mời vào một cảnh (một từ trùng đơn lẻ, thường là từ quá phổ biến, chỉ là nhiễu). */
export const MIN_SHARED_TERMS = 2;
export const MAX_SUGGESTIONS = 3;

/** Mọi từ chữ Hán của bài: mục học đã chọn và từ trong lời (loại trùng). */
export function songTermSet(items: readonly { term: string }[], lines: readonly { tokens: readonly { text: string }[] }[]): Set<string> {
  const out = new Set<string>();
  for (const i of items) out.add(i.term);
  for (const l of lines) for (const t of l.tokens) if (/\p{Script=Han}/u.test(t.text)) out.add(t.text);
  return out;
}

/** Cảnh hợp với bài, nhiều từ chưa học nhất lên trước (rồi nhiều từ trùng nhất). Tối đa `MAX_SUGGESTIONS`. */
export function scenesForSong(songTerms: ReadonlySet<string>, scenes: readonly SceneForMatch[], progress: ExploreProgress, min = MIN_SHARED_TERMS): SongSceneMatch[] {
  const out: SongSceneMatch[] = [];
  for (const s of scenes) {
    const shared = s.objects.filter((o) => songTerms.has(o.term));
    if (shared.length < min) continue;
    out.push({
      sceneId: s.id, title: s.title, terms: shared.map((o) => o.term),
      unlearned: shared.filter((o) => !isDiscovered(progress, progressKey(s.id, o.id))).map((o) => o.term),
    });
  }
  return out.sort((a, b) => b.unlearned.length - a.unlearned.length || b.terms.length - a.terms.length || a.sceneId.localeCompare(b.sceneId)).slice(0, MAX_SUGGESTIONS);
}
