import type { SceneWord } from "@/lib/explore/explore-types";

/**
 * Pet đi phiêu lưu: học xong mục tiêu ngày thì cho pet đi chơi ở một cảnh Khám phá, khoảng một giờ sau pet về mang quà là vài từ của cảnh đó.
 * Mỗi ngày một chuyến. Không phạt (không đi cũng không mất gì), từ chỉ vào bộ ôn khi người dùng chủ động bấm thêm.
 */
export const ADVENTURE_MS = 60 * 60_000;
export const ADVENTURE_WORDS = 3;
export const PET_ADVENTURE_KEY = "lyric-lab-pet-adventure";
export const PET_ADVENTURE_EVENT = "lyric-lab-pet-adventure";

export interface Adventure {
  sceneId: string;
  title: string;
  /** Ngày bắt đầu (YYYY-MM-DD theo múi giờ người dùng): mỗi ngày chỉ một chuyến. */
  day: string;
  startedAt: number;
  returnAt: number;
  words: SceneWord[];
  /** Đã nhận quà chưa. */
  taken: boolean;
}

export type AdventurePhase = "away" | "back" | "done";

/** Đang đi (chưa tới giờ về), đã về mang quà chờ nhận, hay đã nhận xong. */
export function adventurePhase(a: Adventure, now: number): AdventurePhase {
  if (a.taken) return "done";
  return now >= a.returnAt ? "back" : "away";
}

/** Được cho đi chưa: đã đạt mục tiêu ngày và hôm nay chưa có chuyến nào. */
export const canStartAdventure = (goalDone: boolean, current: Adventure | null, today: string): boolean => goalDone && (current === null || current.day !== today);

/** Số phút còn lại tới lúc pet về (làm tròn lên, tối đa bằng cả chuyến). */
export const minutesLeft = (a: Adventure, now: number): number => Math.min(ADVENTURE_MS / 60_000, Math.max(0, Math.ceil((a.returnAt - now) / 60_000)));

export function startAdventure(scene: { sceneId: string; title: string; words: SceneWord[] }, today: string, now: number): Adventure {
  return { ...scene, day: today, startedAt: now, returnAt: now + ADVENTURE_MS, taken: false };
}

export function parseAdventure(raw: unknown): Adventure | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : null);
  const startedAt = num(r.startedAt), returnAt = num(r.returnAt);
  if (typeof r.sceneId !== "string" || !r.sceneId || typeof r.title !== "string" || typeof r.day !== "string" || !r.day || startedAt === null || returnAt === null || !Array.isArray(r.words)) return null;
  const words = r.words.filter((w): w is SceneWord => !!w && typeof w === "object" && typeof (w as SceneWord).term === "string" && typeof (w as SceneWord).gloss === "string");
  return { sceneId: r.sceneId, title: r.title, day: r.day, startedAt, returnAt, words, taken: r.taken === true };
}

/** Băm chuỗi thành số không âm, ổn định (để chọn cảnh và từ theo ngày mà không ngẫu nhiên). */
export function hashSeed(seed: string): number {
  let h = 2166136261;
  for (const ch of seed) h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0;
  return h;
}

/** Cảnh của chuyến đi theo hạt giống (ngày + tên pet): cùng hạt giống thì cùng cảnh. */
export const pickAdventureScene = (sceneIds: readonly string[], seed: string): string | null => (sceneIds.length === 0 ? null : sceneIds[hashSeed(seed) % sceneIds.length]);

/** Chọn tối đa `n` từ làm quà: chỉ lấy từ đã có pinyin từ từ điển, xoay vòng theo hạt giống. */
export function pickSouvenirWords(words: readonly SceneWord[], seed: string, n = ADVENTURE_WORDS): SceneWord[] {
  const ok = words.filter((w) => w.pinyin && w.term && w.gloss);
  if (ok.length === 0) return [];
  const start = hashSeed(`${seed}:words`) % ok.length;
  return Array.from({ length: Math.min(n, ok.length) }, (_, i) => ok[(start + i) % ok.length]);
}
