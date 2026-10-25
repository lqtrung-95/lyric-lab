"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { clampToFloor, heldDirection, moveBy, nearestInteractable, START, stepToward, WALK_SPEED, type Dir, type Interactable, type Vec } from "@/lib/explore/player-movement";

interface Target { at: Vec; then?: () => void }

const LATCH_MS = 130;

/**
 * Điều khiển nhân vật: giữ phím (mũi tên/WASD) để đi, hoặc `walkTo` để tự đi tới một điểm rồi gọi `then`.
 * Vị trí cập nhật thẳng vào phần tử DOM mỗi khung hình (không render lại React 60 lần/giây); React chỉ nhận thay đổi hiếm:
 * đang đi hay đứng, quay mặt trái/phải, vật nào đang ở gần. Vòng lặp chỉ chạy khi nhân vật đang di chuyển.
 */
export function usePlayerMovement(interactables: readonly Interactable[], start: Vec = START) {
  const el = useRef<HTMLDivElement | null>(null);
  const pos = useRef<Vec>(start);
  const target = useRef<Target | null>(null);
  const held = useRef(new Set<Dir>());
  // Mỗi lần nhấn giữ hướng đi thêm ít nhất LATCH_MS: gõ phím rất nhanh (nhấn rồi nhả trong chưa đầy một khung hình) vẫn đi một đoạn thấy được.
  const latched = useRef(new Map<Dir, number>());
  const items = useRef(interactables);
  const kick = useRef<() => void>(() => undefined);
  const refreshNear = useRef<() => void>(() => undefined);
  const [walking, setWalking] = useState(false);
  const [facing, setFacing] = useState<1 | -1>(1);
  const [nearId, setNearId] = useState<string | null>(null);

  useEffect(() => {
    items.current = interactables;
    refreshNear.current();
  }, [interactables]);

  useEffect(() => {
    let raf: number | null = null;
    let prev = 0;
    let wasWalking = false;
    let face: 1 | -1 = 1;
    let near: string | null = null;

    const paint = () => {
      const node = el.current;
      if (!node) return;
      node.style.left = `${pos.current.x}%`;
      node.style.top = `${pos.current.y}%`;
      node.style.zIndex = String(10 + Math.round(pos.current.y * 10));
    };
    const updateNear = () => {
      const id = nearestInteractable(pos.current, items.current);
      if (id !== near) { near = id; setNearId(id); }
    };
    const tick = (t: number) => {
      const dt = Math.min(0.05, (t - prev) / 1000);
      prev = t;
      const active = new Set<Dir>(held.current);
      for (const [d, until] of latched.current) { if (until > t) active.add(d); else latched.current.delete(d); }
      const dir = heldDirection(active);
      let moving = false;
      let dx = 0;
      if (dir) {
        target.current = null;
        const next = moveBy(pos.current, dir, WALK_SPEED, dt);
        dx = next.x - pos.current.x;
        pos.current = next;
        moving = true;
      } else if (target.current) {
        const goal = target.current;
        const r = stepToward(pos.current, goal.at, WALK_SPEED, dt);
        dx = r.pos.x - pos.current.x;
        pos.current = r.pos;
        if (r.arrived) { target.current = null; goal.then?.(); } else moving = true;
      }
      if (Math.abs(dx) > 0.001 && (dx > 0 ? 1 : -1) !== face) { face = dx > 0 ? 1 : -1; setFacing(face); }
      if (moving !== wasWalking) { wasWalking = moving; setWalking(moving); }
      paint();
      updateNear();
      raf = moving ? requestAnimationFrame(tick) : null;
    };

    kick.current = () => {
      if (raf !== null) return;
      prev = performance.now();
      raf = requestAnimationFrame(tick);
    };
    refreshNear.current = updateNear;
    paint();
    updateNear();
    return () => { if (raf !== null) cancelAnimationFrame(raf); };
  }, []);

  const press = useCallback((d: Dir) => { held.current.add(d); latched.current.set(d, performance.now() + LATCH_MS); kick.current(); }, []);
  const release = useCallback((d: Dir) => { held.current.delete(d); }, []);
  const releaseAll = useCallback(() => { held.current.clear(); }, []);
  /** Tự đi tới điểm `at` (đã giới hạn trong sàn) rồi gọi `then`; đi tới nơi khác thì lần gọi trước bị huỷ. */
  const walkTo = useCallback((at: Vec, then?: () => void) => {
    target.current = { at: clampToFloor(at), then };
    kick.current();
  }, []);

  return { elRef: el, walking, facing, nearId, press, release, releaseAll, walkTo };
}
