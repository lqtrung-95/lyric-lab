"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { SHIFT_SIZE, type Customer, type GameState } from "@/lib/games/restaurant-engine";
import { playChinese } from "@/lib/speech/play-chinese";
import { RestaurantScene } from "./restaurant-scene";
import { RestaurantTickets } from "./restaurant-tickets";
import { useBestScore } from "./use-best-score";
import { useRestaurantLoop } from "./use-restaurant-loop";

const btn = "inline-flex min-h-11 items-center justify-center rounded-full bg-primary px-6 text-label-md font-semibold text-on-primary hover:bg-primary-container";

/**
 * Trò chơi "Quán ăn": đi trong quán, lấy món ở quầy phía trên theo order của khách rồi mang tới đúng bàn. Order chỉ có tiếng Trung (đọc to khi khách tới), nghĩa
 * tiếng Việt hiện sau khi phục vụ đúng. Điều khiển bằng WASD/mũi tên + E, hoặc bấm vào món/bàn/sàn để tự đi tới (điện thoại). Chỉ luyện thêm, không đổi lịch ôn.
 */
export function RestaurantGame() {
  const [phase, setPhase] = useState<"intro" | "playing" | "result">("intro");
  const [autoPlay, setAutoPlay] = useState(true);
  const [listenOnly, setListenOnly] = useState(false);
  const { best, submit } = useBestScore();
  const autoPlayRef = useRef(autoPlay);
  useEffect(() => { autoPlayRef.current = autoPlay; }, [autoPlay]);
  const onArrive = useCallback((c: Customer) => { if (autoPlayRef.current) void playChinese(c.order.zh).catch(() => undefined); }, []);
  const onFinish = useCallback((g: GameState) => { submit(g.coins); setPhase("result"); }, [submit]);
  const { game, command, reset } = useRestaurantLoop(phase === "playing", onArrive, onFinish);

  const start = () => { reset(); setPhase("playing"); };

  if (phase === "intro") {
    return (
      <div className="rounded-3xl bg-surface-container-low p-space-lg text-center">
        <p aria-hidden className="text-6xl">🥟🍜🥛</p>
        <h2 className="mt-3 font-serif text-headline-md">Quán ăn sáng Bắc Kinh</h2>
        <p className="mx-auto mt-2 max-w-md text-body-md text-on-surface-variant">Khách gọi món bằng tiếng Trung, ví dụ <span lang="zh" className="font-serif">两个包子</span>. Nghe order, đi tới quầy lấy đúng món và số lượng, rồi mang ra đúng bàn. Mỗi ca có {SHIFT_SIZE} khách; khách chờ lâu sẽ bỏ đi.</p>
        <p className="mx-auto mt-2 max-w-md text-label-md text-on-surface-variant"><kbd className="rounded bg-surface-container-high px-1.5">W A S D</kbd> hoặc mũi tên để đi, <kbd className="rounded bg-surface-container-high px-1.5">E</kbd> để lấy/đưa món. Trên điện thoại: bấm vào món hoặc bàn, nhân vật tự đi tới.</p>
        {best !== null && <p className="mt-2 text-label-md text-primary">Kỷ lục: ¥{best}</p>}
        <button type="button" onClick={start} className={`${btn} mt-space-md`}>Mở cửa quán</button>
      </div>
    );
  }
  if (phase === "result") {
    return (
      <div className="rounded-3xl bg-surface-container-low p-space-lg text-center" role="status">
        <p aria-hidden className="text-5xl">{game.served >= 6 ? "🏆" : game.served >= 4 ? "😋" : "🙂"}</p>
        <h2 className="mt-2 font-serif text-headline-md">Hết ca! Bạn kiếm được ¥{game.coins}</h2>
        <p className="mt-1 text-body-md text-on-surface-variant">Phục vụ {game.served}/{SHIFT_SIZE} khách{game.left > 0 ? `, ${game.left} khách bỏ đi.` : "."}</p>
        {best !== null && <p className="mt-1 text-label-md text-primary">{game.coins >= best ? "Kỷ lục mới!" : `Kỷ lục: ¥${best}`}</p>}
        <button type="button" onClick={start} className={`${btn} mt-space-md`}>Chơi ca mới</button>
      </div>
    );
  }
  const msg = game.message;
  return (
    <div className="space-y-space-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="flex gap-2 text-label-md font-semibold">
          <span className="rounded-full bg-secondary-container px-4 py-2 text-on-secondary-container">¥ {game.coins}</span>
          <span className="rounded-full bg-surface-container-high px-4 py-2 text-on-surface">Khách {game.served + game.left}/{SHIFT_SIZE}</span>
        </p>
        <div className="flex flex-wrap gap-x-4 text-label-md text-on-surface">
          <label className="flex min-h-11 items-center gap-2"><input type="checkbox" className="h-5 w-5 accent-[var(--color-primary)]" checked={autoPlay} onChange={(e) => setAutoPlay(e.target.checked)} />Tự đọc</label>
          <label className="flex min-h-11 items-center gap-2"><input type="checkbox" className="h-5 w-5 accent-[var(--color-primary)]" checked={listenOnly} onChange={(e) => setListenOnly(e.target.checked)} />Chỉ nghe (ẩn chữ)</label>
        </div>
      </div>
      <RestaurantTickets customers={game.customers} listenOnly={listenOnly} />
      <RestaurantScene game={game} onTarget={command} />
      <div aria-live="polite" className="min-h-12 text-body-md">
        <p data-testid="tray" className="text-label-md text-on-surface-variant">Khay: {game.carried.length === 0 ? "trống" : `${game.carried.length}/6 phần`}</p>
        {msg && <p key={msg.id} className={msg.kind === "ok" ? "font-semibold text-primary" : msg.kind === "warn" ? "font-semibold text-error" : "text-on-surface-variant"}>{msg.text}</p>}
      </div>
    </div>
  );
}
