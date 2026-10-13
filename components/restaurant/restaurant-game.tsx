"use client";

import { useEffect, useMemo, useState } from "react";
import { dishById, type DishId } from "@/lib/games/restaurant-menu";
import { buildShift, CUSTOMERS_PER_SHIFT, isTrayCorrect } from "@/lib/games/restaurant-order";
import { playChinese } from "@/lib/speech/play-chinese";
import { RestaurantCustomer } from "./restaurant-customer";
import { MAX_PER_DISH, RestaurantMenu, trayLabel, type Tray } from "./restaurant-menu";

const BEST_KEY = "songhanzi-restaurant-best";
const COINS = [10, 5, 0] as const; // đúng lần 1, đúng lần 2, phải xem đáp án

function readBest(): number | null {
  try {
    const v = Number(localStorage.getItem(BEST_KEY));
    return Number.isFinite(v) && v > 0 ? v : null;
  } catch {
    return null;
  }
}

type Phase = "intro" | "playing" | "result";
type Feedback = null | { kind: "ok" | "retry" | "reveal"; coins: number };

/**
 * Trò chơi "Quán ăn": khách gọi món bằng tiếng Trung (nghe hoặc đọc), người chơi bấm đúng món và số lượng lên khay rồi phục vụ.
 * 7 khách mỗi ca, được sai một lần (nhận ít xu hơn); sai lần hai thì hiện đáp án. Chỉ là luyện thêm, không đổi lịch ôn.
 */
export function RestaurantGame() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [shiftNo, setShiftNo] = useState(0);
  const orders = useMemo(() => buildShift(), [shiftNo]); // eslint-disable-line react-hooks/exhaustive-deps
  const [idx, setIdx] = useState(0);
  const [tray, setTray] = useState<Tray>({});
  const [tries, setTries] = useState(0);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [coins, setCoins] = useState(0);
  const [perfect, setPerfect] = useState(0);
  const [listenOnly, setListenOnly] = useState(false);
  const [autoPlay, setAutoPlay] = useState(true);
  const [best, setBest] = useState<number | null>(readBest);
  const order = orders[idx];
  const settled = feedback?.kind === "ok" || feedback?.kind === "reveal";

  // Khách mới đến thì tự đọc lời gọi món (nếu bật). Chỉ chạy khi đang chơi nên luôn sau một thao tác bấm của người chơi.
  useEffect(() => {
    if (phase === "playing" && autoPlay) void playChinese(order.zh).catch(() => undefined);
  }, [phase, idx, shiftNo]); // eslint-disable-line react-hooks/exhaustive-deps

  const start = () => { setShiftNo((n) => n + 1); setIdx(0); setCoins(0); setPerfect(0); setTray({}); setTries(0); setFeedback(null); setPhase("playing"); };
  const add = (id: DishId) => setTray((t) => ({ ...t, [id]: Math.min(MAX_PER_DISH, (t[id] ?? 0) + 1) }));
  const remove = (id: DishId) => setTray((t) => ({ ...t, [id]: Math.max(0, (t[id] ?? 0) - 1) }));

  function serve() {
    if (isTrayCorrect(order, tray)) {
      const earned = COINS[Math.min(tries, 2)];
      setCoins((c) => c + earned);
      if (tries === 0) setPerfect((p) => p + 1);
      setFeedback({ kind: "ok", coins: earned });
    } else if (tries === 0) {
      setTries(1);
      setFeedback({ kind: "retry", coins: 0 });
    } else {
      setTries(2);
      setFeedback({ kind: "reveal", coins: 0 });
    }
  }

  function next() {
    if (idx + 1 < CUSTOMERS_PER_SHIFT) {
      setIdx(idx + 1); setTray({}); setTries(0); setFeedback(null);
      return;
    }
    if (best === null || coins > best) {
      setBest(coins);
      try { localStorage.setItem(BEST_KEY, String(coins)); } catch { /* không lưu được kỷ lục: không sao */ }
    }
    setPhase("result");
  }

  const btn = "inline-flex min-h-11 items-center justify-center rounded-full px-6 text-label-md font-semibold";
  if (phase === "intro") {
    return (
      <div className="rounded-3xl bg-surface-container-low p-space-lg text-center">
        <p aria-hidden className="text-6xl">🥟🍜🥛</p>
        <h2 className="mt-3 font-serif text-headline-md">Quán ăn sáng Bắc Kinh</h2>
        <p className="mx-auto mt-2 max-w-md text-body-md text-on-surface-variant">Khách gọi món bằng tiếng Trung, ví dụ <span lang="zh" className="font-serif">两个包子</span>. Nghe hoặc đọc, rồi bấm đúng món và số lượng lên khay. Mỗi ca có {CUSTOMERS_PER_SHIFT} khách; bạn được sai một lần.</p>
        {best !== null && <p className="mt-2 text-label-md text-primary">Kỷ lục: ¥{best}</p>}
        <button type="button" onClick={start} className={`${btn} mt-space-md bg-primary text-on-primary hover:bg-primary-container`}>Mở cửa quán</button>
      </div>
    );
  }
  if (phase === "result") {
    return (
      <div className="rounded-3xl bg-surface-container-low p-space-lg text-center" role="status">
        <p aria-hidden className="text-5xl">{perfect >= 6 ? "🏆" : perfect >= 4 ? "😋" : "🙂"}</p>
        <h2 className="mt-2 font-serif text-headline-md">Hết ca! Bạn kiếm được ¥{coins}</h2>
        <p className="mt-1 text-body-md text-on-surface-variant">{perfect}/{CUSTOMERS_PER_SHIFT} khách phục vụ đúng ngay lần đầu.</p>
        {best !== null && <p className="mt-1 text-label-md text-primary">{coins >= best ? "Kỷ lục mới!" : `Kỷ lục: ¥${best}`}</p>}
        <button type="button" onClick={start} className={`${btn} mt-space-md bg-primary text-on-primary hover:bg-primary-container`}>Chơi ca mới</button>
      </div>
    );
  }
  return (
    <div className="space-y-space-md">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="flex gap-2 text-label-md font-semibold">
          <span className="rounded-full bg-secondary-container px-4 py-2 text-on-secondary-container">¥ {coins}</span>
          <span className="rounded-full bg-surface-container-high px-4 py-2 text-on-surface">Khách {idx + 1}/{CUSTOMERS_PER_SHIFT}</span>
        </p>
        <div className="flex flex-wrap gap-x-4 text-label-md text-on-surface">
          <label className="flex min-h-11 items-center gap-2"><input type="checkbox" className="h-5 w-5 accent-[var(--color-primary)]" checked={autoPlay} onChange={(e) => setAutoPlay(e.target.checked)} />Tự đọc</label>
          <label className="flex min-h-11 items-center gap-2"><input type="checkbox" className="h-5 w-5 accent-[var(--color-primary)]" checked={listenOnly} onChange={(e) => setListenOnly(e.target.checked)} />Chỉ nghe (ẩn chữ)</label>
        </div>
      </div>
      <RestaurantCustomer order={order} index={idx} listenOnly={listenOnly} reveal={settled || feedback?.kind === "retry"} showMeaning={settled} />
      <RestaurantMenu tray={tray} disabled={settled} onAdd={add} onRemove={remove} onClear={() => setTray({})} />
      <div aria-live="polite" className="min-h-6 text-body-md">
        {feedback?.kind === "ok" && <p className="font-semibold text-primary">Đúng rồi! +¥{feedback.coins}</p>}
        {feedback?.kind === "retry" && <p className="font-semibold text-error">Chưa đúng, nghe lại và thử lần nữa nhé.</p>}
        {feedback?.kind === "reveal" && <p className="text-on-surface-variant"><span className="font-semibold text-error">Khách gọi: </span>{order.items.map((i) => `${i.qty} ${dishById(i.dishId).vi}`).join(", ")}. Bạn đã đưa: {trayLabel(tray) || "không có gì"}.</p>}
      </div>
      {settled ? (
        <button type="button" onClick={next} className={`${btn} bg-primary text-on-primary hover:bg-primary-container`}>{idx + 1 < CUSTOMERS_PER_SHIFT ? "Khách tiếp theo" : "Xem kết quả"}</button>
      ) : (
        <button type="button" onClick={serve} disabled={Object.values(tray).every((n) => !n)} className={`${btn} bg-primary text-on-primary hover:bg-primary-container disabled:opacity-50`}>Phục vụ</button>
      )}
    </div>
  );
}
