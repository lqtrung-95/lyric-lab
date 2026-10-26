"use client";

import { useEffect, useRef } from "react";

const COLORS = ["#f6c453", "#e0533d", "#51a0db", "#7fc468", "#f2a0a0", "#ffffff", "#e67e22"];
const DURATION_MS = 4800;
const GRAVITY = 0.045;

interface Spark { x: number; y: number; vx: number; vy: number; life: number; color: string }
interface Rocket { x: number; y: number; vy: number; targetY: number; color: string }

/** Một quả pháo nổ thành vòng tia sáng tại (x, y). */
function explode(x: number, y: number, color: string, sparks: Spark[]) {
  const n = 46;
  for (let i = 0; i < n; i++) {
    const a = (Math.PI * 2 * i) / n + Math.random() * 0.2;
    const speed = 1.6 + Math.random() * 2.6;
    sparks.push({ x, y, vx: Math.cos(a) * speed, vy: Math.sin(a) * speed, life: 1, color: i % 5 === 0 ? "#ffffff" : color });
  }
}

/**
 * Pháo hoa ăn mừng khi phá án xong: vài quả pháo bay lên rồi nổ trên toàn màn hình, tự tắt sau vài giây.
 * Trang trí thuần túy nên không nhận chuột/phím và ẩn với người đã chọn giảm chuyển động.
 */
export function FireworksBurst({ onDone }: { onDone: () => void }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      onDone();
      return;
    }
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);

    const sparks: Spark[] = [];
    const rockets: Rocket[] = [];
    const start = performance.now();
    let lastLaunch = 0;
    let frame = 0;

    const tick = (now: number) => {
      const t = now - start;
      if (t < DURATION_MS - 1400 && t - lastLaunch > 380) {
        lastLaunch = t;
        const x = w * (0.15 + Math.random() * 0.7);
        rockets.push({ x, y: h, vy: -(7 + Math.random() * 3), targetY: h * (0.15 + Math.random() * 0.35), color: COLORS[Math.floor(Math.random() * COLORS.length)] });
      }
      ctx.clearRect(0, 0, w, h);
      for (let i = rockets.length - 1; i >= 0; i--) {
        const r = rockets[i];
        r.y += r.vy;
        r.vy *= 0.985;
        ctx.fillStyle = r.color;
        ctx.fillRect(r.x - 1.5, r.y, 3, 10);
        if (r.y <= r.targetY || r.vy > -1.2) { explode(r.x, r.y, r.color, sparks); rockets.splice(i, 1); }
      }
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.x += s.vx;
        s.y += s.vy;
        s.vx *= 0.985;
        s.vy = s.vy * 0.985 + GRAVITY;
        s.life -= 0.012;
        if (s.life <= 0) { sparks.splice(i, 1); continue; }
        ctx.globalAlpha = s.life;
        ctx.fillStyle = s.color;
        ctx.beginPath();
        ctx.arc(s.x, s.y, 2.4 * s.life + 0.6, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      if (t < DURATION_MS || sparks.length > 0) frame = requestAnimationFrame(tick);
      else onDone();
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [onDone]);

  return <canvas ref={ref} aria-hidden="true" className="pointer-events-none fixed inset-0 z-50 h-full w-full" />;
}
