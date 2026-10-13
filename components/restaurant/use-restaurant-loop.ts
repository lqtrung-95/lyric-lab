"use client";

import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { clearTray, createGame, deliver, pickUp, tickGame, type Customer, type GameState } from "@/lib/games/restaurant-engine";
import { inRange, nearestTarget, stepByDirection, stepToward, targetPoint, type Target } from "@/lib/games/restaurant-world";

const KEY_DIRS: Record<string, [number, number]> = {
  w: [0, -1], arrowup: [0, -1], s: [0, 1], arrowdown: [0, 1], a: [-1, 0], arrowleft: [-1, 0], d: [1, 0], arrowright: [1, 0],
};

interface Goal { target: Target; picks: number }

function interact(g: GameState, target: Target, picks = 1) {
  if (target.kind === "station") {
    for (let i = 0; i < picks; i++) if (!pickUp(g, target.dishId)) break;
  } else if (target.kind === "table") {
    deliver(g, target.index);
  } else if (target.kind === "bin") {
    clearTray(g);
  }
}

/**
 * Vòng lặp của game Quán ăn: mỗi khung hình đi theo phím (WASD hoặc mũi tên) hoặc về đích người chơi vừa bấm, tới nơi thì tự lấy/đưa món; phím E làm việc đó với
 * mục gần nhất. Trạng thái nằm trong `ref` (sửa tại chỗ), chỉ vẽ lại giao diện mỗi khung hình. Bấm lại đúng ô món đang đi tới thì lấy thêm một phần.
 */
export function useRestaurantLoop(running: boolean, onArrive: (c: Customer) => void, onFinish: (g: GameState) => void) {
  // Hộp giữ ván chơi, tạo đúng một lần (useRef(createGame()) sẽ sinh cả ca mới ở mỗi khung hình rồi bỏ đi).
  const [game] = useState(() => ({ current: createGame() }));
  const goal = useRef<Goal | null>(null);
  const keys = useRef(new Set<string>());
  const [, repaint] = useReducer((n: number) => n + 1, 0);
  const arriveRef = useRef(onArrive);
  arriveRef.current = onArrive;
  const finishRef = useRef(onFinish);
  finishRef.current = onFinish;

  const reset = useCallback(() => { game.current = createGame(); goal.current = null; keys.current.clear(); repaint(); }, [game]);

  const command = useCallback((target: Target) => {
    const g = game.current;
    if (target.kind !== "floor" && inRange(g.player, target)) { interact(g, target); goal.current = null; repaint(); return; }
    const cur = goal.current;
    goal.current = cur && cur.target.kind === "station" && target.kind === "station" && cur.target.dishId === target.dishId ? { target, picks: cur.picks + 1 } : { target, picks: 1 };
  }, [game]);

  useEffect(() => {
    if (!running) return;
    const isTyping = (e: KeyboardEvent) => ["INPUT", "SELECT", "TEXTAREA"].includes((e.target as HTMLElement | null)?.tagName ?? "");
    const down = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (isTyping(e) || e.ctrlKey || e.metaKey || e.altKey) return;
      if (k in KEY_DIRS) { keys.current.add(k); goal.current = null; e.preventDefault(); }
      else if (k === "e") { const t = nearestTarget(game.current.player); if (t) { interact(game.current, t); repaint(); } e.preventDefault(); }
    };
    const pressed = keys.current;
    const up = (e: KeyboardEvent) => pressed.delete(e.key.toLowerCase());
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    let last = performance.now();
    let raf = requestAnimationFrame(function frame(now) {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const g = game.current;
      if (!g.finished) {
        let dx = 0, dy = 0;
        for (const k of keys.current) { dx += KEY_DIRS[k][0]; dy += KEY_DIRS[k][1]; }
        if (dx !== 0 || dy !== 0) g.player = stepByDirection(g.player, dx, dy, dt);
        else if (goal.current) {
          const { target, picks } = goal.current;
          g.player = stepToward(g.player, targetPoint(target), dt);
          if (inRange(g.player, target) && (target.kind !== "floor" || Math.hypot(g.player.x - target.x, g.player.y - target.y) < 0.5)) {
            if (target.kind !== "floor") interact(g, target, picks);
            goal.current = null;
          }
        }
        for (const c of tickGame(g, dt)) arriveRef.current(c);
        if (g.finished) finishRef.current(g);
      }
      repaint();
      raf = requestAnimationFrame(frame);
    });
    return () => { cancelAnimationFrame(raf); window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); pressed.clear(); };
  }, [running, game]);

  return { game: game.current, command, reset };
}
