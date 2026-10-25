import type { SceneObjectDef } from "./explore-types";

/**
 * Năm kiểu câu nhiệm vụ: nghe tên rồi đi tới vật (`listen`); đọc nghĩa Việt rồi đi tới (`meaning`); nhìn chữ Hán rồi đi tới (`hanzi`);
 * nghe LỆNH tiếng Trung của Cú Thầy không phụ đề rồi làm theo (`command`: vật mang được thì mang cho Cú, không thì đi tới);
 * đọc yêu cầu "mang cho Cú Thầy" rồi nhặt vật và mang tới (`bring`, chỉ với vật mang được).
 */
export type QuestKind = "listen" | "meaning" | "hanzi" | "command" | "bring";
export interface QuestRound {
  kind: QuestKind;
  targetId: string;
}

export const ROUNDS_PER_RUN = 8;
const KINDS: QuestKind[] = ["listen", "meaning", "hanzi", "command", "bring"];

/** Câu này phải nhặt vật rồi mang tới NPC: câu `bring`, hoặc lệnh `command` với vật mang được. */
export const roundNeedsDelivery = (kind: QuestKind, portable: boolean): boolean => portable && (kind === "bring" || kind === "command");

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
 * mỗi từ ra một kiểu khác nhau luân phiên (nhận ra tai, nghĩa, mặt chữ, nghe lệnh, mang đồ). Ít hơn 3 vật thì chưa đủ để chơi (trả mảng rỗng).
 */
export function buildQuestRounds(objects: SceneObjectDef[], priority: Set<string>, rng: () => number = Math.random, rounds = ROUNDS_PER_RUN): QuestRound[] {
  if (objects.length < 3) return [];
  const first = shuffle(objects.filter((o) => priority.has(o.id)), rng);
  const rest = shuffle(objects.filter((o) => !priority.has(o.id)), rng);
  const picked = [...first, ...rest].slice(0, Math.min(rounds, objects.length));
  const offset = Math.floor(rng() * KINDS.length);
  // Kiểu luân phiên để mỗi lượt có đủ loại; vật không mang được thì kiểu `bring` đổi thành `meaning`.
  return picked.map((o, i) => {
    const kind = KINDS[(i + offset) % KINDS.length];
    return { kind: kind === "bring" && !o.portable ? "meaning" : kind, targetId: o.id };
  });
}

/** Số lần sai tối đa trước khi cảnh chỉ đáp án và sang câu sau. */
export const MAX_WRONG_PER_ROUND = 2;
