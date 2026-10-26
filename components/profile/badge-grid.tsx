import { Icon } from "@/components/ui/icon";
import { ProgressBar } from "@/components/ui/progress-bar";
import { BADGE_GROUP_LABELS, type BadgeGroup } from "@/lib/game/badge-catalog";
import type { BadgeCatalogItem } from "@/lib/game/evaluate-badges";
import type { BadgeTier } from "@/lib/game/game-types";

const TIER_LABEL: Record<BadgeTier, string> = { bronze: "Đồng", silver: "Bạc", gold: "Vàng", diamond: "Kim cương" };
// Màu chỉ để trang trí; bậc luôn có chữ đi kèm nên không phụ thuộc màu.
const TIER_STYLE: Record<BadgeTier, string> = {
  bronze: "bg-[#e6b98f] text-[#3b2410]",
  silver: "bg-[#d9dde3] text-[#252b33]",
  gold: "bg-primary-container text-on-primary-container",
  diamond: "bg-[#a8dcf5] text-[#0b3248]",
};
const GROUP_ORDER: BadgeGroup[] = ["learn", "streak", "listen", "speak", "battle", "explore"];

function BadgeCard({ badge }: { badge: BadgeCatalogItem }) {
  const next = badge.nextTarget;
  return (
    <li className={`card-ink flex gap-3 p-3 ${badge.unlocked ? "" : "opacity-90"}`}>
      <span aria-hidden="true" className={`flex size-14 shrink-0 items-center justify-center rounded-2xl border-2 border-ink ${badge.tier ? TIER_STYLE[badge.tier] : "bg-surface-container-high text-on-surface-variant"}`}>
        <Icon name={badge.unlocked ? "emoji_events" : badge.hidden ? "visibility_off" : "star_border"} size={28} filled={badge.unlocked} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-body-lg font-extrabold">{badge.title}</h3>
          <span className="shrink-0 rounded-full border-2 border-ink/30 bg-surface-container-high px-2 py-0.5 text-label-sm font-bold text-on-surface-variant">
            {badge.tier ? `Bậc ${TIER_LABEL[badge.tier]}` : "Chưa mở"}
          </span>
        </div>
        <p className="text-label-md text-on-surface-variant">{badge.hint}</p>
        {next !== null && !badge.hidden && (
          <div className="mt-2">
            <ProgressBar value={Math.min(badge.progress, next)} max={next} label={`Tiến độ huy hiệu ${badge.title}`} />
            <p className="mt-1 text-label-sm text-on-surface-variant">{Math.min(badge.progress, next)}/{next}{badge.nextTier ? ` để lên bậc ${TIER_LABEL[badge.nextTier]}` : ""}</p>
          </div>
        )}
      </div>
    </li>
  );
}

/** Bộ sưu tập huy hiệu, gom theo nhóm. */
export function BadgeGrid({ badges }: { badges: BadgeCatalogItem[] }) {
  return (
    <div className="space-y-space-md">
      {GROUP_ORDER.map((group) => {
        const items = badges.filter((b) => b.group === group);
        if (!items.length) return null;
        return (
          <section key={group} aria-label={`Huy hiệu nhóm ${BADGE_GROUP_LABELS[group]}`}>
            <h2 className="mb-space-sm text-headline-md font-extrabold">{BADGE_GROUP_LABELS[group]}</h2>
            <ul className="grid gap-space-sm md:grid-cols-2">{items.map((b) => <BadgeCard key={b.id} badge={b} />)}</ul>
          </section>
        );
      })}
    </div>
  );
}
