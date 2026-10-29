"use client";

import { useEffect, useMemo, useState } from "react";
import { useExploreProgress } from "@/components/explore/use-explore-progress";
import { Button3d } from "@/components/ui/button-3d";
import { WEEKLY_EVENT, WEEKLY_KEY } from "@/lib/pet/weekly-store";
import { canClaim, claimWeek, emptyWeekly, mondayOf, parseWeekly, weeklyRows } from "@/lib/pet/weekly-goals";
import { sfx } from "@/lib/games/arcade-sfx";
import { completedJourneys } from "@/lib/explore/journeys";
import { HOME_ITEMS, HOME_SLOTS, itemProgress, itemUnlocked, newlyUnlocked, parseHomeState, resolvePlacement, emptyHomeState, type HomeSlotId, type HomeStats } from "@/lib/pet/pet-home";
import type { PetBurstKind } from "@/lib/pet/pet-burst";
import type { Pet, PetMood, PetStage } from "@/lib/pet/pet-logic";
import { HomeItemArt } from "./pet-home-art";
import { PetSprite } from "./pet-sprite";
import { useNow } from "./use-now";
import { useLocalJson } from "./use-local-json-store";

const KEY = "lyric-lab-pet-home";
const EVENT = "lyric-lab-pet-home-change";

/** Khung của từng chỗ trong phòng (viewBox 400×260): x, y, cạnh của ô vuông 64×64 đã co lại. */
const BOX: Record<HomeSlotId, { x: number; y: number; s: number }> = {
  wallL: { x: 34, y: 24, s: 92 }, wallR: { x: 274, y: 24, s: 92 },
  floorL: { x: 30, y: 150, s: 96 }, floorR: { x: 274, y: 150, s: 96 },
  shelfL: { x: 152, y: 44, s: 46 }, shelfR: { x: 204, y: 44, s: 46 },
};

/** Số liệu Khám phá (cảnh đã ghé, dấu Thổ địa, hành trình xong) để mở khóa đồ. Nạp danh sách cảnh khi cần để trang chủ không phải tải sẵn. */
function useExploreStats(): { ready: boolean; visited: number; goldStamps: number; journeys: number } {
  const { progress, ready, now } = useExploreProgress();
  const [stamps, setStamps] = useState<{ visited: number; gold: number } | null>(null);
  useEffect(() => {
    if (!ready) return;
    let live = true;
    void Promise.all([import("@/components/explore/passport-view")]).then(([{ computeStamps }]) => {
      if (!live) return;
      const st = Object.values(computeStamps(progress, now || Date.now()));
      setStamps({ visited: st.filter((x) => x.tier >= 1).length, gold: st.filter((x) => x.tier === 3).length });
    });
    return () => { live = false; };
  }, [ready, progress, now]);
  return { ready: ready && stamps !== null, visited: stamps?.visited ?? 0, goldStamps: stamps?.gold ?? 0, journeys: completedJourneys(progress) };
}

/** "Nhà" của pet: căn phòng nhỏ có 6 chỗ đặt đồ. Đồ mở khóa nhờ việc bạn đã làm (xem `lib/pet/pet-home.ts`), chỉ để ngắm; chỉ lưu cách sắp xếp trên thiết bị này. */
export function PetHome({ pet, stage, mood, accessories, base, onFx, onClose }: { pet: Pet; stage: PetStage; mood: PetMood; accessories: string[]; base: Pick<HomeStats, "streakLongest" | "level" | "daysTogether"> & { /** Số ngày đã học trong tuần này (từ chuỗi ngày). */ daysStudied: number }; onFx: (kind: PetBurstKind) => void; onClose: () => void }) {
  const ex = useExploreStats();
  const [state, write] = useLocalJson(KEY, EVENT, parseHomeState, emptyHomeState);
  const [weekly, writeWeekly] = useLocalJson(WEEKLY_KEY, WEEKLY_EVENT, parseWeekly, emptyWeekly);
  const now = useNow();
  const week = mondayOf(now);
  const { streakLongest, level, daysTogether, daysStudied } = base;
  const stats: HomeStats = useMemo(() => ({ streakLongest, level, daysTogether, stage, visited: ex.visited, goldStamps: ex.goldStamps, journeys: ex.journeys, weeksDone: weekly.claimed.length }), [streakLongest, level, daysTogether, stage, ex.visited, ex.goldStamps, ex.journeys, weekly.claimed.length]);
  const rows = weeklyRows(weekly, week, daysStudied);
  const claimable = canClaim(weekly, week, daysStudied);
  const placed = useMemo(() => resolvePlacement(state.placed, stats), [state.placed, stats]);
  const fresh = ex.ready ? newlyUnlocked(state.seen, stats) : [];
  const freshKey = fresh.map((i) => i.id).join(",");
  const [announced, setAnnounced] = useState("");
  if (freshKey !== announced) { setAnnounced(freshKey); if (freshKey) onFx("cheer"); }
  const unlockedCount = HOME_ITEMS.filter((i) => itemUnlocked(i, stats)).length;

  const choose = (slot: HomeSlotId, value: string) => {
    sfx.petBlip();
    write({ ...state, placed: { ...state.placed, [slot]: value === "" ? null : value === "~auto" ? undefined : value } });
  };
  const acknowledge = () => { sfx.petCheer(); write({ ...state, seen: [...new Set([...state.seen, ...fresh.map((i) => i.id)])] }); };

  return (
    <section aria-label={`Nhà của ${pet.name}`} className="basis-full rounded-2xl bg-surface-container-low p-space-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-headline-md">Nhà của {pet.name}</h3>
        <p className="text-label-md font-bold text-on-surface-variant">Đã mở {unlockedCount}/{HOME_ITEMS.length} món</p>
      </div>
      {fresh.length > 0 && (
        <div role="status" className="mt-space-sm flex flex-wrap items-center gap-2 rounded-2xl bg-secondary-container p-space-sm text-on-secondary-container">
          <p className="text-label-md font-bold">Mở khóa đồ mới: {fresh.map((i) => i.label).join(", ")}!</p>
          <button type="button" onClick={acknowledge} className="min-h-11 rounded-full border-2 border-ink bg-surface-container-lowest px-4 text-label-md font-bold">Tuyệt!</button>
        </div>
      )}
      <div className="relative mt-space-sm overflow-hidden rounded-2xl">
      <section aria-label="Mục tiêu tuần" className="mt-space-sm rounded-2xl border-2 border-ink bg-surface-container-lowest p-space-sm">
        <h4 className="text-label-lg font-extrabold">Mục tiêu tuần này · huy hiệu đã nhận: {weekly.claimed.length}</h4>
        <ul className="mt-1 flex flex-col gap-1">
          {rows.map((r) => (
            <li key={r.id} className="flex items-center justify-between gap-2 text-body-md">
              <span>{r.done ? "✓ " : "○ "}{r.label}</span>
              <span className="text-label-md font-bold">{r.have}/{r.target}</span>
            </li>
          ))}
        </ul>
        {claimable
          ? <button type="button" onClick={() => { sfx.petCheer(); onFx("evolve"); writeWeekly(claimWeek(weekly, week)); }} className="mt-2 min-h-11 rounded-full border-2 border-ink bg-primary-container px-4 text-label-md font-extrabold">Nhận huy hiệu tuần</button>
          : weekly.claimed.includes(week) && <p role="status" className="mt-1 text-label-md font-bold text-secondary">Đã nhận huy hiệu tuần này. Hẹn bạn tuần sau!</p>}
      </section>
      <svg viewBox="0 0 400 260" role="img" aria-label={`Căn phòng của ${pet.name}: ${HOME_SLOTS.map((s) => `${s.label} ${HOME_ITEMS.find((i) => i.id === placed[s.id])?.label ?? "trống"}`).join(", ")}`} className="block w-full">
        <rect width="400" height="260" fill="#ffe9c9" />
        <rect y="170" width="400" height="90" fill="#d9a066" />
        <path d="M0 170H400" stroke="#b9772f" strokeWidth="6" />
        {[0, 1, 2, 3, 4, 5, 6].map((i) => <path key={i} d={`M${i * 62} 176V260`} stroke="#c58f55" strokeWidth="2" opacity="0.5" />)}
        <rect x="140" y="92" width="120" height="8" rx="3" fill="#8f5a22" />
        <rect x="150" y="100" width="6" height="12" fill="#8f5a22" /><rect x="244" y="100" width="6" height="12" fill="#8f5a22" />
        {HOME_SLOTS.map((s) => {
          const id = placed[s.id];
          const b = BOX[s.id];
          return id ? <HomeItemArt key={s.id} id={id} box={b} /> : null;
        })}
      </svg>
        <div className="absolute left-[35%] top-[50%] w-[30%]"><PetSprite species={pet.species} stage={stage} mood={mood} accessories={accessories} bare className="block w-full" /></div>
      </div>
      <ul className="mt-space-sm grid gap-2 sm:grid-cols-2">
        {HOME_SLOTS.map((s) => {
          const options = HOME_ITEMS.filter((i) => i.kind === s.kind && itemUnlocked(i, stats));
          const cur = state.placed[s.id];
          const value = cur === null ? "" : typeof cur === "string" && options.some((o) => o.id === cur) ? cur : "~auto";
          return (
            <li key={s.id}>
              <label className="flex min-h-11 items-center justify-between gap-2 text-label-md font-bold">
                {s.label}
                <select value={value} onChange={(e) => choose(s.id, e.target.value)} className="min-h-11 rounded-xl border-2 border-ink bg-surface-container-lowest px-2 font-medium">
                  <option value="~auto">Tự chọn món mới nhất</option>
                  <option value="">Để trống</option>
                  {options.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
                </select>
              </label>
            </li>
          );
        })}
      </ul>
      <h4 className="mt-space-md text-label-lg font-extrabold">Bộ sưu tập</h4>
      <ul className="mt-space-sm grid grid-cols-2 gap-2 sm:grid-cols-3">
        {HOME_ITEMS.map((it) => {
          const open = itemUnlocked(it, stats);
          const pr = itemProgress(it, stats);
          return (
            <li key={it.id} className="flex items-center gap-2 rounded-xl border-2 border-ink bg-surface-container-lowest p-2">
              <HomeItemArt id={it.id} className={`size-12 shrink-0 ${open ? "" : "opacity-30 grayscale"}`} />
              <div className="min-w-0">
                <p className="text-label-md font-bold">{open ? it.label : "🔒 " + it.label}</p>
                {!open && <p className="text-label-sm text-on-surface-variant">{it.how}{pr ? ` (${pr.have}/${pr.need})` : ""}</p>}
              </div>
            </li>
          );
        })}
      </ul>
      <div className="mt-space-sm"><Button3d type="button" onClick={onClose}>Đóng</Button3d></div>
    </section>
  );
}
