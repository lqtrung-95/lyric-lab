import type { SceneObjectDef } from "./explore-types";

/** Ba kiểu nhiệm vụ: nghe giọng đọc rồi chạm vật; đọc nghĩa tiếng Việt rồi chạm vật; nhìn chữ Hán rồi chạm vật. */
export type QuestKind = "listen" | "meaning" | "hanzi";
export interface QuestRound {
  kind: QuestKind;
  targetId: string;
}

export const ROUNDS_PER_RUN = 8;
const KINDS: QuestKind[] = ["listen", "meaning", "hanzi"];

function shuffle<T>(items: T[], rng: () => number): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Dựng một lượt nhiệm vụ từ các vật đã khám phá. Vật hay sai và vật "mờ" (lâu không gặp) được xếp lên trước (ưu tiên ôn), còn lại xáo ngẫu nhiên;
 * mỗi từ ra một kiểu khác nhau luân phiên để vừa nhận ra tai, nghĩa, mặt chữ. Ít hơn 3 vật thì chưa đủ để chơi (trả mảng rỗng).
 */
export function buildQuestRounds(objects: SceneObjectDef[], priority: Set<string>, rng: () => number = Math.random, rounds = ROUNDS_PER_RUN): QuestRound[] {
  if (objects.length < 3) return [];
  const first = shuffle(objects.filter((o) => priority.has(o.id)), rng);
  const rest = shuffle(objects.filter((o) => !priority.has(o.id)), rng);
  const picked = [...first, ...rest].slice(0, Math.min(rounds, objects.length));
  const offset = Math.floor(rng() * KINDS.length);
  return picked.map((o, i) => ({ kind: KINDS[(i + offset) % KINDS.length], targetId: o.id }));
}

/** Số lần sai tối đa trước khi cảnh chỉ đáp án và sang câu sau. */
export const MAX_WRONG_PER_ROUND = 2;
