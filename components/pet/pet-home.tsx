"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useExploreProgress } from "@/components/explore/use-explore-progress";
import { Icon } from "@/components/ui/icon";
import { WEEKLY_EVENT, WEEKLY_KEY } from "@/lib/pet/weekly-store";
import { canClaim, claimWeek, emptyWeekly, mondayOf, parseWeekly, weeklyRows } from "@/lib/pet/weekly-goals";
import { sfx } from "@/lib/games/arcade-sfx";
import { completedJourneys } from "@/lib/explore/journeys";
import { HOME_ITEMS, HOME_SLOTS, itemProgress, itemUnlocked, newlyUnlocked, parseHomeState, placeItem, resolvePlacement, emptyHomeState, type HomeSlotId, type HomeStats } from "@/lib/pet/pet-home";
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

const AUTO = "~auto";

/**
 * "Nhà" của pet trong một hộp thoại lớn (không chiếm chỗ ở trang chủ): căn phòng có 6 chỗ đặt đồ, chạm thẳng vào chỗ trong phòng để đổi đồ.
 * Đồ mở khóa nhờ việc bạn đã làm (xem `lib/pet/pet-home.ts`), chỉ để ngắm; chỉ lưu cách sắp xếp trên thiết bị này.
 */
export function PetHome({ pet, stage, mood, accessories, base, onFx, onClose }: { pet: Pet; stage: PetStage; mood: PetMood; accessories: string[]; base: Pick<HomeStats, "streakLongest" | "level" | "daysTogether"> & { /** Số ngày đã học trong tuần này (từ chuỗi ngày). */ daysStudied: number }; onFx: (kind: PetBurstKind) => void; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const ex = useExploreStats();
  const [state, write] = useLocalJson(KEY, EVENT, parseHomeState, emptyHomeState);
  const [weekly, writeWeekly] = useLocalJson(WEEKLY_KEY, WEEKLY_EVENT, parseWeekly, emptyWeekly);
  const [editing, setEditing] = useState<HomeSlotId | null>(null);
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
  const labelOf = (id: string | null) => HOME_ITEMS.find((i) => i.id === id)?.label ?? "trống";

  useEffect(() => {
    const dialog = ref.current;
    if (dialog && !dialog.open) { dialog.showModal(); dialog.focus({ preventScroll: true }); }
  }, []);

  const choose = (slot: HomeSlotId, value: string) => {
    sfx.petBlip();
    if (value === AUTO) write({ ...state, placed: { ...state.placed, [slot]: undefined } });
    else if (value === "") write({ ...state, placed: { ...state.placed, [slot]: null } });
    else write({ ...state, placed: placeItem(state.placed, placed, slot, value) });
  };
  const acknowledge = () => { sfx.petCheer(); write({ ...state, seen: [...new Set([...state.seen, ...fresh.map((i) => i.id)])] }); };

  const slot = editing ? HOME_SLOTS.find((s) => s.id === editing)! : null;
  const options = slot ? HOME_ITEMS.filter((i) => i.kind === slot.kind && itemUnlocked(i, stats)) : [];
  const cur = editing ? state.placed[editing] : undefined;
  const curValue = cur === null ? "" : typeof cur === "string" && options.some((o) => o.id === cur) ? cur : AUTO;
  const chip = (on: boolean) => `flex min-h-11 items-center gap-2 rounded-xl border-2 px-3 py-1 text-left text-label-md font-bold ${on ? "border-ink bg-primary-container" : "border-outline-variant bg-surface-container-lowest hover:bg-surface-container-high"}`;

  return (
    <dialog
      ref={ref} aria-labelledby="pet-home-title" tabIndex={-1} onClose={onClose} onClick={(e) => { if (e.target === ref.current) onClose(); }}
      className="m-auto w-[min(96vw,46rem)] max-h-[94dvh] overflow-y-auto rounded-3xl bg-surface-container-lowest p-0 text-on-surface shadow-[0_24px_60px_-20px_rgba(20,10,5,0.5)] outline-none backdrop:bg-black/50 backdrop:backdrop-blur-[2px]"
    >
      <div className="flex flex-col gap-space-md p-space-md sm:p-space-lg">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h2 id="pet-home-title" className="font-serif text-headline-md">Nhà của {pet.name}</h2>
            <p className="text-label-md font-bold text-on-surface-variant">Đã mở {unlockedCount}/{HOME_ITEMS.length} món</p>
          </div>
          <button type="button" aria-label="Đóng" onClick={onClose} className="-mr-2 flex size-11 shrink-0 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-high"><Icon name="close" size={22} /></button>
        </div>

        {fresh.length > 0 && (
          <div role="status" className="flex flex-wrap items-center gap-2 rounded-2xl bg-secondary-container p-space-sm text-on-secondary-container">
            <p className="text-label-md font-bold">Mở khóa đồ mới: {fresh.map((i) => i.label).join(", ")}!</p>
            <button type="button" onClick={acknowledge} className="min-h-11 rounded-full border-2 border-ink bg-surface-container-lowest px-4 text-label-md font-bold">Tuyệt!</button>
          </div>
        )}

        <div className="relative overflow-hidden rounded-2xl">
          <svg viewBox="0 0 400 260" role="img" aria-label={`Căn phòng của ${pet.name}: ${HOME_SLOTS.map((s) => `${s.label} ${labelOf(placed[s.id])}`).join(", ")}`} className="block w-full">
            <rect width="400" height="260" fill="#ffe9c9" />
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13].map((i) => <rect key={i} x={i * 30} width="15" height="170" fill="#ffdfb8" opacity="0.55" />)}
            <rect y="160" width="400" height="12" fill="#f3c98f" />
            <rect y="170" width="400" height="90" fill="#d9a066" />
            <path d="M0 170H400" stroke="#b9772f" strokeWidth="6" />
            {[0, 1, 2, 3, 4, 5, 6].map((i) => <path key={i} d={`M${i * 62} 176V260`} stroke="#c58f55" strokeWidth="2" opacity="0.5" />)}
            <rect x="140" y="92" width="120" height="8" rx="3" fill="#8f5a22" />
            <rect x="150" y="100" width="6" height="12" fill="#8f5a22" /><rect x="244" y="100" width="6" height="12" fill="#8f5a22" />
            {HOME_SLOTS.map((s) => (placed[s.id] ? <HomeItemArt key={s.id} id={placed[s.id]!} box={BOX[s.id]} /> : null))}
          </svg>
          <div className="pointer-events-none absolute left-[35%] top-[50%] w-[30%]"><PetSprite species={pet.species} stage={stage} mood={mood} accessories={accessories} bare className="block w-full" /></div>
          {HOME_SLOTS.map((s) => {
            const b = BOX[s.id];
            const on = editing === s.id;
            return (
              <button
                key={s.id} type="button" aria-pressed={on} aria-label={`${s.label}: ${labelOf(placed[s.id])}. Chạm để đổi đồ`}
                onClick={() => { sfx.petBlip(); setEditing(on ? null : s.id); }}
                style={{ left: `${(b.x / 400) * 100}%`, top: `${(b.y / 260) * 100}%`, width: `${(b.s / 400) * 100}%`, height: `${(b.s / 260) * 100}%` }}
                className={`absolute flex min-h-11 min-w-11 items-center justify-center rounded-xl border-2 border-dashed transition-colors ${on ? "border-ink bg-white/40" : placed[s.id] ? "border-transparent hover:border-ink/50 hover:bg-white/25" : "border-ink/35 bg-white/20 hover:bg-white/40"}`}
              >
                {!placed[s.id] && <span aria-hidden="true" className="text-2xl font-bold text-ink/60">+</span>}
              </button>
            );
          })}
        </div>
        <p className="-mt-space-sm text-center text-label-md text-on-surface-variant">Chạm vào đồ hoặc dấu + trong phòng để đổi.</p>

        {slot && (
          <section aria-label={`Chọn đồ cho ${slot.label}`} className="rounded-2xl bg-surface-container-low p-space-sm">
            <h3 className="text-label-lg font-extrabold">{slot.label}</h3>
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
              <button type="button" aria-pressed={curValue === AUTO} onClick={() => choose(slot.id, AUTO)} className={chip(curValue === AUTO)}>✨ Tự chọn món mới nhất</button>
              <button type="button" aria-pressed={curValue === ""} onClick={() => choose(slot.id, "")} className={chip(curValue === "")}>⬜ Để trống</button>
              {options.map((o) => {
                const elsewhere = HOME_SLOTS.find((x) => x.id !== slot.id && placed[x.id] === o.id);
                return (
                  <button key={o.id} type="button" aria-pressed={curValue === o.id} onClick={() => choose(slot.id, o.id)} className={chip(curValue === o.id)}>
                    <HomeItemArt id={o.id} className="size-9 shrink-0" />
                    <span className="min-w-0"><span className="block">{o.label}</span>{elsewhere && <span className="block text-label-sm font-medium text-on-surface-variant">đang ở {elsewhere.label.toLowerCase()}</span>}</span>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        <section aria-label="Mục tiêu tuần" className="rounded-2xl border-2 border-ink bg-surface-container-lowest p-space-sm">
          <h3 className="text-label-lg font-extrabold">Mục tiêu tuần này · huy hiệu đã nhận: {weekly.claimed.length}</h3>
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

        <section aria-label="Bộ sưu tập">
          <h3 className="text-label-lg font-extrabold">Bộ sưu tập</h3>
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
        </section>
      </div>
    </dialog>
  );
}
