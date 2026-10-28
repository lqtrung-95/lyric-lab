"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { useDueCount } from "@/components/review/use-due-count";
import { useStreak } from "@/components/streak/use-streak";
import { useGameSummary } from "./use-game-summary";

const CHIP = "inline-flex h-9 items-center gap-1.5 rounded-full border-2 border-outline-variant bg-surface-container-lowest px-3 text-label-md font-bold text-on-surface";

/**
 * Các chỉ số nhỏ ở thanh trên (HUD): chuỗi ngày, số thẻ cần ôn, cấp độ. Chỉ hiện khi có dữ liệu thật (chuỗi 0 và 0 thẻ thì ẩn, cấp chỉ hiện khi API game hóa trả về),
 * không dựng số giả. Mỗi chip có nhãn chữ cho trình đọc màn hình.
 */
export function HudChips() {
  const streak = useStreak();
  const due = useDueCount();
  const game = useGameSummary();
  const days = streak?.current ?? 0;
  return (
    <div className="flex items-center gap-1.5" data-testid="hud-chips">
      {days > 0 && (
        <span className={CHIP} title="Chuỗi ngày học">
          <Icon name="local_fire_department" size={18} filled className="text-primary" />
          {days}<span className="sr-only"> ngày liên tiếp</span>
        </span>
      )}
      {!!due && (
        <Link href="/review/cards" className={CHIP} title="Thẻ cần ôn hôm nay">
          <Icon name="style" size={18} className="text-primary" />
          {due}<span className="sr-only"> thẻ cần ôn</span>
        </Link>
      )}
      {game && (
        <Link href="/profile" className={`${CHIP} max-sm:hidden`} title={`Cấp ${game.level.n}: ${game.level.name}. Xem hồ sơ và huy hiệu`}>
          <Icon name="star" size={18} filled className="text-primary" />
          Lv {game.level.n}
        </Link>
      )}
    </div>
  );
}
