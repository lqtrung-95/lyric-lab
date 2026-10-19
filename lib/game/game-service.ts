import "server-only";
import { MAX_FREEZES } from "@/lib/streak/streak-freeze";
import { computeGame, type GameComputation } from "./build-game-summary";
import { buildBadgeCatalog, type BadgeCatalogItem } from "./evaluate-badges";
import { insertQuestClaim, loadGameData, saveBadges, saveFrozenDays } from "./game-repo";
import type { GameSummary } from "./game-types";

/** Tính trạng thái game và "chốt" phần phải lưu (huy hiệu mới, ngày đóng băng). Hai việc ghi đều idempotent; lỗi ghi không làm hỏng kết quả đọc. */
async function settle(userId: string, now: Date): Promise<GameComputation> {
  const data = await loadGameData(userId);
  const game = computeGame({ userId, now, ...data });
  // Cả hai thuộc cùng migration với bảng nhận thưởng: thiếu bảng thì cũng chưa có lượt đóng băng nào để dùng, nên bỏ qua kết quả ghi là an toàn.
  await Promise.all([saveBadges(userId, game.freshBadges, now), saveFrozenDays(userId, game.newFrozenDays)]);
  return game;
}

export async function getGameSummary(userId: string, now = new Date()): Promise<GameSummary> {
  return (await settle(userId, now)).summary;
}

export async function getBadgeCatalog(userId: string, now = new Date()): Promise<BadgeCatalogItem[]> {
  const game = await settle(userId, now);
  return buildBadgeCatalog(game.facts, game.summary.badges.earned);
}

export type ClaimResult =
  | { ok: true; claimed: boolean; summary: GameSummary }
  | { ok: false; error: "quest_not_found" | "not_complete" | "unavailable" };

/**
 * Nhận thưởng một nhiệm vụ. Chỉ nhận được nhiệm vụ hiện tại của chính người dùng và đã đủ tiến độ (tính lại ở server).
 * Idempotent: khóa chính (user, nhiệm vụ) chặn nhận hai lần kể cả khi hai yêu cầu đến cùng lúc. Đóng băng chỉ được cấp khi đang giữ dưới trần.
 */
export async function claimQuest(userId: string, questId: string, now = new Date()): Promise<ClaimResult> {
  const game = await settle(userId, now);
  const quest = game.summary.quests.find((q) => q.id === questId);
  if (!quest) return { ok: false, error: "quest_not_found" };
  if (quest.claimed) return { ok: true, claimed: false, summary: game.summary };
  if (!quest.claimable) return { ok: false, error: "not_complete" };
  const outcome = await insertQuestClaim(userId, { questId, kind: quest.kind, rewardXp: quest.rewardXp, freezeGranted: quest.rewardFreeze && game.freezesHeld < MAX_FREEZES });
  if (outcome === "error") return { ok: false, error: "unavailable" };
  return { ok: true, claimed: outcome === "claimed", summary: (await settle(userId, now)).summary };
}
