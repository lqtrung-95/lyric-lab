// "Hộ chiếu" thị trấn Khám phá: mỗi cảnh có một dấu đóng theo mức học (đã ghé → thông thạo → thổ địa), cộng danh hiệu theo số cảnh đã ghé và gợi ý
// điểm đến kế tiếp. Chỉ ĐỌC tiến độ khám phá có sẵn (không lưu thêm gì, không cộng XP), nên đồng bộ tài khoản và "Học lại từ đầu" tự đúng.

import type { SceneObjectDef } from "./explore-types";
import { isFaded, progressKey, type ExploreProgress } from "./explore-progress";

/** 0 chưa ghé, 1 Đã ghé (học ≥ 1 từ), 2 Thông thạo (học đủ từ của cảnh), 3 Thổ địa (đủ từ, mọi từ từng trả lời đúng ở nhiệm vụ, không từ nào đang phai). */
export type StampTier = 0 | 1 | 2 | 3;
export const STAMP_LABELS: Record<StampTier, string> = { 0: "Chưa ghé", 1: "Đã ghé", 2: "Thông thạo", 3: "Thổ địa" };
export const STAMP_MEDALS: Record<StampTier, string> = { 0: "", 1: "🥉", 2: "🥈", 3: "🥇" };

export interface SceneLike { id: string; objects: readonly Pick<SceneObjectDef, "id">[]; exits?: readonly { to: string; locked?: boolean }[] }

export interface SceneStamp {
  tier: StampTier;
  learned: number;
  total: number;
  /** Lần đầu học một từ của cảnh (mốc "ghé"); null nếu chưa ghé. */
  firstAt: number | null;
  /** Từ đang phai (lâu chưa gặp). */
  faded: number;
  /** Từ chưa từng trả lời đúng ở nhiệm vụ. */
  notYetCorrect: number;
}

export function sceneStamp(scene: SceneLike, p: ExploreProgress, now: number): SceneStamp {
  const total = scene.objects.length;
  let learned = 0, faded = 0, notYetCorrect = 0;
  let firstAt: number | null = null;
  for (const o of scene.objects) {
    const key = progressKey(scene.id, o.id);
    const t = p.terms[key];
    if (!t) continue;
    learned++;
    if (t.discoveredAt > 0) firstAt = firstAt === null ? t.discoveredAt : Math.min(firstAt, t.discoveredAt);
    if (isFaded(p, key, now)) faded++;
    if (t.correct < 1) notYetCorrect++;
  }
  const tier: StampTier = learned === 0 ? 0 : learned < total ? 1 : faded === 0 && notYetCorrect === 0 ? 3 : 2;
  return { tier, learned, total, firstAt, faded, notYetCorrect };
}

/** Danh hiệu theo số cảnh ĐÃ GHÉ (cột mốc tuyệt đối để thêm cảnh mới không làm tụt danh hiệu); ghé hết mọi cảnh là "Trưởng thị trấn". */
export const PASSPORT_TITLES: readonly { at: number; name: string }[] = [
  { at: 0, name: "Khách vãng lai" }, { at: 3, name: "Du khách" }, { at: 10, name: "Người khám phá" }, { at: 20, name: "Dân thị trấn" }, { at: 35, name: "Người sành thị trấn" }, { at: 50, name: "Thổ địa" },
];
export const TOP_TITLE = "Trưởng thị trấn";

export interface PassportSummary {
  total: number;
  /** Số cảnh theo từng bậc dấu. */
  byTier: Record<StampTier, number>;
  /** Số cảnh đã ghé (bậc ≥ 1). */
  visited: number;
  title: string;
  /** Danh hiệu kế tiếp và số cảnh cần ghé để đạt; null khi đã ở danh hiệu cao nhất. */
  next: { name: string; at: number; remaining: number } | null;
}

export function passportSummary(scenes: readonly SceneLike[], stamps: Record<string, SceneStamp>): PassportSummary {
  const byTier: Record<StampTier, number> = { 0: 0, 1: 0, 2: 0, 3: 0 };
  for (const s of scenes) byTier[stamps[s.id]?.tier ?? 0]++;
  const total = scenes.length;
  const visited = total - byTier[0];
  if (total > 0 && visited === total) return { total, byTier, visited, title: TOP_TITLE, next: null };
  const reached = [...PASSPORT_TITLES].reverse().find((t) => visited >= t.at) ?? PASSPORT_TITLES[0];
  const upcoming = PASSPORT_TITLES.find((t) => t.at > visited && t.at <= total);
  const next = upcoming ? { name: upcoming.name, at: upcoming.at, remaining: upcoming.at - visited } : { name: TOP_TITLE, at: total, remaining: total - visited };
  return { total, byTier, visited, title: reached.name, next };
}

const dayKey = (t: number): string => new Date(t).toLocaleDateString("sv");

/** Số cảnh lần đầu ghé ĐÚNG HÔM NAY (theo giờ địa phương của `now`): nhiệm vụ nhỏ "ghé một cảnh mới mỗi ngày". */
export function newScenesToday(stamps: Record<string, SceneStamp>, now: number): number {
  const today = dayKey(now);
  return Object.values(stamps).filter((s) => s.firstAt !== null && dayKey(s.firstAt) === today).length;
}

export interface Destination { sceneId: string; reason: "neighbor" | "next" | "polish" }

/**
 * Gợi ý điểm đến kế tiếp: (1) cảnh CHƯA ghé nối liền với cảnh vừa ghé (đi tiếp một lối ra), (2) cảnh chưa ghé đầu tiên theo thứ tự thị trấn,
 * (3) khi đã ghé hết thì cảnh có bậc dấu thấp nhất để "đánh bóng" (thiếu từ, từ phai hoặc chưa trả lời đúng). null nếu không còn gì để gợi ý.
 */
export function nextDestination(scenes: readonly SceneLike[], stamps: Record<string, SceneStamp>, lastSceneId: string | null): Destination | null {
  const unvisited = scenes.filter((s) => (stamps[s.id]?.tier ?? 0) === 0);
  const last = lastSceneId ? scenes.find((s) => s.id === lastSceneId) : undefined;
  const neighbor = last?.exits?.map((e) => e.to).find((to) => unvisited.some((s) => s.id === to));
  if (neighbor) return { sceneId: neighbor, reason: "neighbor" };
  if (unvisited[0]) return { sceneId: unvisited[0].id, reason: "next" };
  const weakest = [...scenes].sort((a, b) => (stamps[a.id]?.tier ?? 0) - (stamps[b.id]?.tier ?? 0))[0];
  return weakest && (stamps[weakest.id]?.tier ?? 0) < 3 ? { sceneId: weakest.id, reason: "polish" } : null;
}
