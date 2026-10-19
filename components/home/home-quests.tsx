"use client";

import { useState } from "react";
import { refreshGameSummary, useGameSummary } from "@/components/layout/use-game-summary";
import { Button3d } from "@/components/ui/button-3d";
import { Icon } from "@/components/ui/icon";
import { ProgressBar } from "@/components/ui/progress-bar";
import type { QuestView } from "@/lib/game/game-types";

function QuestRow({ quest, onClaim, busy }: { quest: QuestView; onClaim: (q: QuestView) => void; busy: boolean }) {
  const done = quest.progress >= quest.target;
  return (
    <li className="rounded-xl bg-surface-container-low p-space-sm">
      <div className="flex items-center gap-space-sm">
        <span aria-hidden="true" className={`flex size-10 shrink-0 items-center justify-center rounded-xl border-2 border-ink ${quest.claimed ? "bg-secondary text-on-secondary" : done ? "bg-primary-container text-on-primary-container" : "bg-surface-container-highest text-on-surface-variant"}`}>
          <Icon name={quest.claimed || done ? "check" : "flag"} size={22} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-body-md font-bold">{quest.title}</p>
          <p className="text-label-md text-on-surface-variant">{quest.kind === "weekly" ? "Tuần này" : "Hôm nay"} · {Math.min(quest.progress, quest.target)}/{quest.target}{quest.rewardFreeze ? " · +1 đóng băng chuỗi" : ""}</p>
        </div>
        {quest.claimed ? (
          <span className="text-label-md font-extrabold text-secondary">Đã nhận</span>
        ) : quest.claimable ? (
          <Button3d variant="secondary" disabled={busy} onClick={() => onClaim(quest)} className="min-h-10 px-3 text-label-md">Nhận +{quest.rewardXp} XP</Button3d>
        ) : (
          <span className="text-label-md font-bold text-on-surface-variant">+{quest.rewardXp} XP</span>
        )}
      </div>
      {!quest.claimed && <ProgressBar className="mt-2" value={quest.progress} max={quest.target} label={`Tiến độ: ${quest.title}`} tone={done ? "success" : "primary"} />}
    </li>
  );
}

/** Nhiệm vụ ngày và tuần từ API game hóa: chỉ hiện khi có dữ liệu thật (không có phiên, chưa chạy migration hoặc lỗi thì ẩn cả khối). Nhận thưởng gọi API rồi tải lại tóm tắt. */
export function HomeQuests() {
  const game = useGameSummary();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  if (!game || game.quests.length === 0) return null;

  async function claim(q: QuestView) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/game/quests/${encodeURIComponent(q.id)}/claim`, { method: "POST" });
      if (!res.ok) throw new Error(String(res.status));
      refreshGameSummary();
    } catch {
      setError("Chưa nhận được thưởng, thử lại sau nhé.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section aria-labelledby="quests-heading" className="card-ink p-space-md">
      <div className="flex items-center justify-between gap-2">
        <h2 id="quests-heading" className="text-headline-md">Nhiệm vụ</h2>
        <p className="text-label-md font-bold text-on-surface-variant">{game.xp.today} XP hôm nay</p>
      </div>
      <ul className="mt-space-sm space-y-2">{game.quests.map((q) => <QuestRow key={q.id} quest={q} onClaim={claim} busy={busy} />)}</ul>
      {error && <p role="alert" className="mt-2 text-label-md text-error">{error}</p>}
    </section>
  );
}
