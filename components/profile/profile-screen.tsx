"use client";

import { Icon } from "@/components/ui/icon";
import { ProgressBar } from "@/components/ui/progress-bar";
import { useGameSummary } from "@/components/layout/use-game-summary";
import { BadgeGrid } from "./badge-grid";
import { useBadgeCatalog } from "./use-badge-catalog";

function Stat({ icon, value, label }: { icon: "local_fire_department" | "emoji_events" | "star"; value: string | number; label: string }) {
  return (
    <div className="card-ink flex items-center gap-3 p-3">
      <span aria-hidden="true" className="flex size-11 items-center justify-center rounded-xl border-2 border-ink bg-primary-container text-on-primary-container"><Icon name={icon} size={24} filled /></span>
      <p><span className="block text-headline-md font-black leading-none">{value}</span><span className="text-label-md text-on-surface-variant">{label}</span></p>
    </div>
  );
}

/** Hồ sơ: cấp, XP, chuỗi ngày và bộ sưu tập huy hiệu, toàn bộ lấy từ API game thật. Thiếu dữ liệu thì báo rõ, không hiện số giả. */
export function ProfileScreen() {
  const game = useGameSummary();
  const badges = useBadgeCatalog();
  if (game === undefined || badges === undefined) return <p role="status" className="py-space-lg text-body-md text-on-surface-variant">Đang tải hồ sơ…</p>;
  if (!game) return <p role="alert" className="py-space-lg text-body-md text-on-surface-variant">Chưa tải được hồ sơ. Kiểm tra kết nối rồi tải lại trang nhé.</p>;

  const { level, xp, streak } = game;
  const unlocked = badges?.filter((b) => b.unlocked).length ?? 0;
  return (
    <div className="mx-auto max-w-4xl space-y-space-md">
      <header className="card-ink bg-primary-container p-space-md text-on-primary-container">
        <p className="text-label-md font-bold">Cấp {level.n}</p>
        <h1 className="text-headline-lg-mobile md:text-headline-lg">{level.name}</h1>
        <div className="mt-space-sm">
          <ProgressBar value={level.maxed ? level.nextXp : level.progressXp} max={level.nextXp || 1} label="Tiến độ lên cấp" />
          <p className="mt-1 text-label-md font-bold">{level.maxed ? "Bạn đã đạt cấp cao nhất" : `${level.progressXp}/${level.nextXp} XP để lên cấp ${level.n + 1}`}</p>
        </div>
      </header>
      <div className="grid gap-space-sm sm:grid-cols-3">
        <Stat icon="star" value={xp.total} label="Tổng XP" />
        <Stat icon="local_fire_department" value={streak.current} label={`ngày liên tiếp (dài nhất ${streak.longest})`} />
        <Stat icon="emoji_events" value={badges ? `${unlocked}/${badges.length}` : "—"} label="huy hiệu đã mở" />
      </div>
      {badges ? <BadgeGrid badges={badges} /> : <p role="status" className="text-body-md text-on-surface-variant">Chưa tải được danh sách huy hiệu.</p>}
    </div>
  );
}
