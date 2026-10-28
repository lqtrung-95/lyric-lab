"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { HintToggles } from "@/components/games/hint-toggles";
import { SoundToggle } from "@/components/games/sound-toggle";
import { useArcadeHints } from "@/components/games/use-arcade-hints";
import { PronounceButton } from "@/components/ui/pronounce-button";
import { sfx } from "@/lib/games/arcade-sfx";
import { ORDERS, STATIONS, nextOrder, serve, type Order, type StationId } from "@/lib/kitchen/spike-orders";
import { playChinese } from "@/lib/speech/play-chinese";
import { KitchenWorld, type NearId } from "./kitchen-world";

const COOK_MS = 1500;
const FEEDBACK_MS = 1800;

/**
 * Bản thử (spike) quán ăn 3D: khách gọi bằng tiếng Trung, đi tới đúng bếp, bấm E (hoặc nút) để nấu, mang tới bàn rồi bấm E để phục vụ.
 * Mục đích: kiểm tra 3D chạy mượt (hiện FPS) trước khi làm đầy đủ. Luật nằm ở `lib/kitchen/spike-orders`; ở đây chỉ nối trạng thái với cảnh.
 */
export function KitchenGame() {
  const hints = useArcadeHints();
  const [started, setStarted] = useState(false);
  const [near, setNear] = useState<NearId | null>(null);
  const [busy, setBusy] = useState<StationId | null>(null);
  const [carrying, setCarrying] = useState<StationId | null>(null);
  const [order, setOrder] = useState<Order>(ORDERS[0]);
  const [customer, setCustomer] = useState(true);
  const [money, setMoney] = useState(0);
  const [served, setServed] = useState(0);
  const [msg, setMsg] = useState<string | null>(null);
  const [goal, setGoal] = useState<NearId | null>(null);
  const [cheer, setCheer] = useState(false);
  const [fps, setFps] = useState(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => { const t = timers.current; return () => t.forEach(clearTimeout); }, []);
  const later = (fn: () => void, ms: number) => { timers.current.push(setTimeout(fn, ms)); };

  const act = useCallback((target: NearId | null = near) => {
    if (!started || busy || !target) return;
    if (target === "table") {
      if (!customer) return;
      if (!carrying) { setMsg("Bạn chưa cầm món nào. Ra bếp nấu trước nhé."); return; }
      const r = serve(order, carrying);
      setCarrying(null);
      sfx[r.correct ? "pop" : "buzz"]();
      if (r.correct) { setCheer(true); later(() => setCheer(false), 1400); }
      setMsg(r.correct ? `谢谢！+¥${r.coins}` : "Sai món rồi! Nghe lại câu gọi món nhé.");
      if (r.correct) { setMoney((m) => m + r.coins); setServed((n) => n + 1); }
      setCustomer(false);
      later(() => { const o = nextOrder(order, Math.random); setOrder(o); setCustomer(true); setMsg(null); void playChinese(o.zh); }, FEEDBACK_MS);
      return;
    }
    if (carrying) { setMsg("Tay đang cầm món rồi, mang ra bàn trước."); return; }
    setBusy(target); setMsg(null); sfx.laser(2);
    later(() => { setBusy(null); setCarrying(target); sfx.pop(); }, COOK_MS);
  }, [started, busy, near, customer, carrying, order]);
  const onArrive = useCallback((id: NearId) => { setGoal(null); act(id); }, [act]);
  const onCancel = useCallback(() => setGoal(null), []);
  // Gợi ý: bếp cần dùng cho đơn hiện tại; khi đã cầm đúng món thì gợi ý bàn khách.
  const hint: NearId | null = !started || busy ? null : carrying ? (customer ? "table" : null) : customer ? order.stationId : null;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key.toLowerCase() === "e" && !(e.target instanceof HTMLInputElement)) act(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [act]);

  const prompt = !near ? "Đi tới bếp hoặc bàn khách" : near === "table" ? (carrying ? "Bấm E: phục vụ khách" : "Bàn khách") : carrying ? "Đang cầm món" : `Bấm E: nấu ở ${STATIONS.find((s) => s.id === near)?.han}`;
  return (
    <div className="relative h-[min(78vh,640px)] min-h-[420px] w-full overflow-hidden rounded-3xl border-2 border-ink bg-[#e8d9a8]">
      <KitchenWorld near={near} busy={busy} carrying={carrying} customerHere={customer} guestIndex={served} hint={hint} goal={goal} cheer={cheer} onNear={setNear} onFps={setFps} onTap={(id) => { if (started) setGoal(id); }} onArrive={onArrive} onCancel={onCancel} />
      <div className="pointer-events-none absolute inset-x-3 top-3 flex flex-wrap items-center justify-between gap-2 text-label-lg font-extrabold">
        <span className="rounded-full bg-white/90 px-3 py-1 text-slate-900">¥ {money} · {served} khách</span>
        <span className="pointer-events-auto flex items-center gap-1.5"><SoundToggle className="min-h-11 min-w-11 rounded-full bg-white/90 text-xl" /><HintToggles /></span>
        <span className="rounded-full bg-white/90 px-3 py-1 text-slate-900 text-xs font-bold">{fps} FPS</span>
      </div>
      {customer && started && (
        <div role="status" aria-live="polite" className="absolute inset-x-3 bottom-24 mx-auto flex max-w-md items-center gap-3 rounded-2xl bg-white/95 p-3 text-slate-900 shadow-lg">
          <div className="min-w-0 flex-1">
            <p lang="zh-Hans" className="text-xl font-bold">{order.zh}</p>
            {hints.pinyin && <p className="text-body-sm text-orange-800">{order.pinyin}</p>}
            {hints.meaning && <p className="text-body-sm text-slate-600">{order.vi}</p>}
          </div>
          <PronounceButton text={order.zh} />
        </div>
      )}
      <div className="absolute inset-x-3 bottom-3 flex items-center gap-2">
        <p className="min-w-0 flex-1 truncate rounded-2xl bg-white/90 px-3 py-3 text-body-md font-bold text-slate-900" role="status">{msg ?? prompt}</p>
        <button type="button" onClick={() => act()} disabled={!near || !!busy} className="min-h-14 min-w-14 rounded-full border-2 border-ink bg-primary text-xl font-extrabold text-on-primary disabled:opacity-40" aria-label="Hành động (phím E)">E</button>
      </div>
      {!started && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-black/55 px-6 text-center text-white">
          <p className="text-xl font-bold">Quán ăn 3D (bản thử)</p>
          <p className="max-w-sm text-sm text-white/85">Nghe khách gọi món bằng tiếng Trung, ra bếp nấu đúng món rồi mang tới bàn. Chạm vào bếp hoặc bàn là đầu bếp tự đi tới và làm. Cũng có thể đi bằng WASD/mũi tên rồi bấm E. Mũi tên vàng chỉ chỗ cần tới.</p>
          <button type="button" onClick={() => { setStarted(true); void playChinese(order.zh); }} className="min-h-12 rounded-full bg-amber-300 px-8 text-base font-extrabold text-slate-900 hover:brightness-110">Bắt đầu</button>
        </div>
      )}
    </div>
  );
}
