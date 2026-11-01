import type { UnitProgress } from "./course-types";
import type { QuizKind } from "./build-unit-quiz";

export type LevelId = 1 | 2 | 3 | 4 | 5;

export interface UnitLevel {
  id: LevelId;
  name: string;
  blurb: string;
  /** Các kiểu câu hỏi (xoay vòng). Cấp nói (4) dùng các kiểu nói riêng, xem `lib/courses/speaking-quiz.ts`. */
  kinds: QuizKind[];
  length: number;
  /** Phần trăm tối thiểu để qua cấp. */
  pass: number;
  /** Cấp nói: cho phép bỏ qua từng câu, và phải nói ít nhất `minAttempts` câu mới tính. */
  speaking?: boolean;
  minAttempts?: number;
}

/**
 * Năm cấp của mỗi chặng học. Cấp 1 là bài kiểm tra hiện có (nhận ra từ). Các cấp sau đổi KIỂU bài (nhớ lại, trong câu, nói, huyền thoại) nên học lại chặng không phải làm đúng bài cũ.
 * Mở khóa: 2 sau 1; 3 và 4 sau 2; 5 sau 3 (cấp nói không chặn cấp huyền thoại, vì không phải ai cũng bật được micro).
 */
export const UNIT_LEVELS: UnitLevel[] = [
  { id: 1, name: "Làm quen", blurb: "Nhận ra từ: chọn nghĩa, ghép cặp, nghe chọn chữ", kinds: ["meaning", "match", "listen", "tf", "order", "term", "type", "match", "listen", "order"], length: 15, pass: 70 },
  { id: 2, name: "Nhớ lại", blurb: "Tự nhớ: nghe gõ pinyin, chọn pinyin, điền chỗ trống", kinds: ["type", "cloze", "pinyin", "term", "type", "cloze", "order", "pinyin"], length: 12, pass: 70 },
  { id: 3, name: "Trong câu", blurb: "Dùng trong câu thật: xếp câu, điền chỗ trống, nghe", kinds: ["order", "cloze", "listen", "order", "tf", "cloze"], length: 12, pass: 70 },
  { id: 4, name: "Nói", blurb: "Đọc to, nhìn nghĩa nói từ, nhại câu thật (bỏ qua được)", kinds: ["meaning"], length: 5, pass: 60, speaking: true, minAttempts: 2 },
  { id: 5, name: "Huyền thoại", blurb: "Bộ câu khó nhất, cần từ 85%", kinds: ["type", "cloze", "order", "pinyin", "match", "type", "cloze", "order", "tf"], length: 15, pass: 85 },
];

export const levelById = (id: number): UnitLevel | undefined => UNIT_LEVELS.find((l) => l.id === id);
export const isLevelId = (n: number): n is LevelId => n >= 1 && n <= 5 && Number.isInteger(n);

/** Cấp phải qua trước để mở cấp này. */
const REQUIRES: Record<LevelId, LevelId | null> = { 1: null, 2: 1, 3: 2, 4: 2, 5: 3 };

/** Điểm cao nhất của từng cấp đã làm. Cấp 1 lấy từ điểm chặng khi đã hoàn thành (dữ liệu cũ không có chi tiết cấp); các cấp khác lưu ở `stepState.levels`. */
export function levelScores(p: UnitProgress | undefined): Partial<Record<LevelId, number>> {
  const out: Partial<Record<LevelId, number>> = {};
  if (p?.status === "completed") out[1] = p.bestScore;
  const raw = p?.stepState?.levels;
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
      const id = Number(k);
      if (isLevelId(id) && id !== 1 && typeof v === "number" && Number.isFinite(v)) out[id] = Math.max(0, Math.min(100, Math.round(v)));
    }
  }
  return out;
}

/** Các cấp đã qua (điểm đạt ngưỡng của cấp đó). */
export function passedLevels(p: UnitProgress | undefined): LevelId[] {
  const s = levelScores(p);
  return UNIT_LEVELS.filter((l) => (s[l.id] ?? -1) >= l.pass || (l.id === 1 && p?.status === "completed")).map((l) => l.id);
}

export const isLevelUnlocked = (id: LevelId, passed: readonly LevelId[]): boolean => REQUIRES[id] === null || passed.includes(REQUIRES[id]!);

/** Số sao (số cấp đã qua, 0–5). Chặng đủ 5 sao là "huyền thoại" (vàng). */
export const starsOf = (p: UnitProgress | undefined): number => passedLevels(p).length;

/** `stepState` mới sau khi làm xong một cấp (giữ điểm cao nhất, giữ các trường khác). Cấp 1 không lưu ở đây. */
export function withLevelScore(stepState: Record<string, unknown> | undefined, id: LevelId, percent: number): Record<string, unknown> {
  const base = stepState ?? {};
  const prev = base.levels && typeof base.levels === "object" && !Array.isArray(base.levels) ? (base.levels as Record<string, unknown>) : {};
  const old = typeof prev[String(id)] === "number" ? (prev[String(id)] as number) : 0;
  return { ...base, levels: { ...prev, [String(id)]: Math.max(old, Math.round(percent)) } };
}
