import type { SfxKind } from "@/lib/feedback/sfx-notes";
import type { GameSummary } from "./game-types";

/**
 * Chọn MỘT hiệu ứng thưởng khi tóm tắt game đổi từ `prev` sang `next` (ưu tiên cái "to" nhất để các thay đổi cùng lúc không phát chồng nhau):
 * lên cấp hoặc có huy hiệu mới > nhiệm vụ vừa đủ điều kiện nhận > tăng chuỗi ngày > nhận XP. Không đổi gì đáng thưởng (hoặc chưa có bản trước) thì null.
 */
export function rewardSoundFor(prev: GameSummary | null | undefined, next: GameSummary | null | undefined): SfxKind | null {
  if (!prev || !next) return null;
  if (next.level.n > prev.level.n || next.badges.earned.length > prev.badges.earned.length) return "levelup";
  const wasClaimable = new Set(prev.quests.filter((q) => q.claimable).map((q) => q.id));
  if (next.quests.some((q) => q.claimable && !wasClaimable.has(q.id) && !q.claimed)) return "quest";
  if (next.streak.current > prev.streak.current) return "streak";
  if (next.xp.total > prev.xp.total) return "xp";
  return null;
}
