import { BADGES, BADGE_BY_ID, TIER_ORDER, type BadgeDef, type BadgeFacts } from "./badge-catalog";
import type { BadgeTier, EarnedBadge } from "./game-types";

/** Các bậc đã đạt của một huy hiệu (đạt bậc cao thì kéo theo các bậc thấp). */
export function reachedTiers(def: BadgeDef, facts: BadgeFacts): BadgeTier[] {
  const value = facts[def.metric];
  return TIER_ORDER.filter((_, i) => i < def.thresholds.length && value >= def.thresholds[i]);
}

/** Mọi (huy hiệu, bậc) đạt được theo số liệu hiện tại. Hàm thuần: cùng số liệu ra cùng kết quả (cấp huy hiệu idempotent). */
export function evaluateBadges(facts: BadgeFacts): { id: string; tier: BadgeTier }[] {
  return BADGES.flatMap((def) => reachedTiers(def, facts).map((tier) => ({ id: def.id, tier })));
}

const key = (b: { id: string; tier: BadgeTier }) => `${b.id}:${b.tier}`;

/** Hợp huy hiệu đã lưu (có ngày nhận) và huy hiệu vừa đạt; cái chưa lưu có `earnedAt` null. `fresh` = cần ghi mới. */
export function mergeBadges(stored: EarnedBadge[], facts: BadgeFacts): { earned: EarnedBadge[]; fresh: { id: string; tier: BadgeTier }[] } {
  const have = new Map(stored.filter((b) => BADGE_BY_ID.has(b.id)).map((b) => [key(b), b]));
  const fresh = evaluateBadges(facts).filter((b) => !have.has(key(b)));
  const earned = [...have.values(), ...fresh.map((b) => ({ ...b, earnedAt: null }))];
  return { earned, fresh };
}

/** Bậc cao nhất đã nhận của từng huy hiệu. */
export function highestTiers(earned: EarnedBadge[]): Map<string, BadgeTier> {
  const out = new Map<string, BadgeTier>();
  for (const b of earned) {
    const cur = out.get(b.id);
    if (!cur || TIER_ORDER.indexOf(b.tier) > TIER_ORDER.indexOf(cur)) out.set(b.id, b.tier);
  }
  return out;
}

export interface BadgeCatalogItem {
  id: string;
  group: BadgeDef["group"];
  title: string;
  hint: string;
  hidden: boolean;
  unlocked: boolean;
  tier: BadgeTier | null;
  nextTier: BadgeTier | null;
  progress: number;
  nextTarget: number | null;
  tiers: { tier: BadgeTier; threshold: number; earned: boolean }[];
}

/** Toàn danh mục kèm trạng thái mở/khóa và gợi ý. Huy hiệu ẩn chưa mở thì che tên và cách mở. */
export function buildBadgeCatalog(facts: BadgeFacts, earned: EarnedBadge[]): BadgeCatalogItem[] {
  const top = highestTiers(earned);
  return BADGES.map((def) => {
    const tier = top.get(def.id) ?? null;
    const idx = tier ? TIER_ORDER.indexOf(tier) : -1;
    const nextIdx = idx + 1 < def.thresholds.length ? idx + 1 : -1;
    const nextTarget = nextIdx >= 0 ? def.thresholds[nextIdx] : null;
    const concealed = def.hidden === true && !tier;
    return {
      id: def.id,
      group: def.group,
      title: concealed ? "???" : def.title,
      hint: concealed ? "Huy hiệu ẩn: cứ học rồi sẽ gặp" : def.hint.replace("{n}", String(nextTarget ?? def.thresholds[def.thresholds.length - 1])),
      hidden: def.hidden === true,
      unlocked: tier !== null,
      tier,
      nextTier: nextIdx >= 0 ? TIER_ORDER[nextIdx] : null,
      progress: facts[def.metric],
      nextTarget,
      tiers: def.thresholds.map((threshold, i) => ({ tier: TIER_ORDER[i], threshold, earned: i <= idx })),
    };
  });
}
