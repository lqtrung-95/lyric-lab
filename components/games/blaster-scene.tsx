import { BLAST_SECONDS, SHOT_SECONDS, type BlasterState } from "@/lib/games/blaster-engine";

const TILE = (size: number, dots: [number, number, number][]): React.CSSProperties => ({
  backgroundImage: dots.map(([x, y, r]) => `radial-gradient(${r}px ${r}px at ${x}px ${y}px, #fff, transparent)`).join(","),
  backgroundSize: `${size}px ${size}px`, ["--tile" as string]: `${size}px`,
});
const NEBULA = "radial-gradient(60% 50% at 15% 20%, rgba(124,58,237,.28), transparent), radial-gradient(55% 45% at 85% 70%, rgba(14,165,233,.22), transparent), linear-gradient(to bottom, #040816, #0a1d4a)";
const PARTICLES = Array.from({ length: 12 }, (_, i) => { const a = (i / 12) * Math.PI * 2, r = 38 + (i % 3) * 16; return { dx: Math.cos(a) * r, dy: Math.sin(a) * r, color: ["#fbbf24", "#fb923c", "#fff", "#f87171"][i % 4] }; });

function Ship({ x }: { x: number }) {
  return (
    <div aria-hidden="true" className="absolute bottom-2 z-10 flex -translate-x-1/2 flex-col items-center transition-[left] duration-150" style={{ left: `${x * 100}%` }}>
      <svg viewBox="0 0 48 60" className="h-14 w-11 drop-shadow-[0_0_8px_rgba(34,211,238,.55)]">
        <path d="M14 34 L2 50 L2 56 L17 48Z M34 34 L46 50 L46 56 L31 48Z" fill="#3b82f6" />
        <path d="M24 2 C30 13 34 27 34 42 L24 50 L14 42 C14 27 18 13 24 2Z" fill="#eaf2ff" stroke="#9db8e6" strokeWidth="1.2" />
        <circle cx="24" cy="23" r="5" fill="#22d3ee" stroke="#0e7490" />
      </svg>
      <span className="bz-flame -mt-1 h-4 w-3 rounded-b-full bg-gradient-to-b from-amber-300 via-orange-500 to-transparent" />
    </div>
  );
}

/** Cảnh Bắn chữ: nền sao trôi ba lớp, từ rơi (đỏ lên khi gần đáy), tia laser, vụ nổ có hạt, số điểm bay lên, tàu có lửa đẩy, rung và nháy đỏ khi mất mạng, biểu ngữ lên cấp. Chỉ hiển thị, không giữ trạng thái. */
export function BlasterScene({ s, showPinyin }: { s: BlasterState; showPinyin: boolean }) {
  const locked = s.targets.find((t) => t.id === s.lockedId);
  const lastShot = s.shots[s.shots.length - 1];
  const shipX = lastShot?.x ?? locked?.x ?? 0.5;
  const danger = s.targets.some((t) => t.y > 0.7);
  return (
    <>
      <div aria-hidden="true" className="absolute inset-0" style={{ backgroundImage: NEBULA }} />
      <div aria-hidden="true" className="bz-drift bz-twinkle absolute inset-0 opacity-80" style={{ ...TILE(180, [[20, 30, 1], [90, 90, 1.2], [150, 20, 1]]), ["--dur" as string]: "14s" }} />
      <div aria-hidden="true" className="bz-drift absolute inset-0 opacity-60" style={{ ...TILE(260, [[40, 60, 1.4], [200, 140, 1], [120, 230, 1.6]]), ["--dur" as string]: "26s" }} />
      <div aria-hidden="true" className="bz-drift absolute inset-0 opacity-40" style={{ ...TILE(340, [[70, 40, 1], [250, 180, 1.3], [160, 300, 1]]), ["--dur" as string]: "44s" }} />
      <svg aria-hidden="true" className="pointer-events-none absolute inset-0 z-[5] size-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        {s.shots.map((h) => <line key={h.id} x1={shipX * 100} y1={92} x2={h.x * 100} y2={h.y * 100 + 6} stroke="#67e8f9" strokeWidth={3} strokeLinecap="round" vectorEffect="non-scaling-stroke" opacity={1 - h.age / SHOT_SECONDS} style={{ filter: "drop-shadow(0 0 4px #22d3ee)" }} />)}
      </svg>
      {s.targets.map((t) => {
        const on = t.id === s.lockedId, hot = t.y > 0.7;
        return (
          <div key={t.id} className="absolute z-[6] -translate-x-1/2" style={{ left: `${t.x * 100}%`, top: `${t.y * 100}%` }}>
            <div className="bz-pop">
              <div className="bz-sway text-white" style={{ animationDelay: `${-(t.id % 7) * 0.3}s` }}>
                <div className={`rounded-2xl border px-3 py-2 backdrop-blur-sm ${hot ? "bz-danger border-red-400 bg-red-950/80" : on ? "border-cyan-300 bg-slate-900/90 shadow-[0_0_24px_rgba(34,211,238,.6)]" : "border-white/25 bg-slate-900/80"}`}>
                  <div className="flex items-baseline gap-2">
                    <span lang="zh-Hans" className="text-2xl font-bold leading-none">{t.word.han}</span>
                    {t.word.meaning && <span className="max-w-32 truncate rounded-md bg-blue-900/80 px-1.5 text-xs text-blue-200">({t.word.meaning})</span>}
                  </div>
                  <div className="mt-1 flex gap-0.5 font-mono text-sm leading-none" aria-hidden="true">
                    {[...t.letters].map((ch, i) => <span key={i} className={on && i < s.typed.length ? "text-cyan-300" : showPinyin ? "text-white/70" : "text-white/30"}>{(on && i < s.typed.length) || showPinyin ? ch : "_"}</span>)}
                  </div>
                  {showPinyin && <p className="mt-0.5 text-[11px] text-white/50">{t.word.pinyin}</p>}
                </div>
              </div>
            </div>
          </div>
        );
      })}
      {s.blasts.map((b) => (
        <div key={b.id} aria-hidden="true" className="pointer-events-none absolute z-[7]" style={{ left: `${b.x * 100}%`, top: `calc(${b.y * 100}% + 28px)`, opacity: Math.min(1, (BLAST_SECONDS - b.age) * 3) }}>
          <span className="bz-ring absolute left-0 top-0 size-16 rounded-full border-4 border-amber-300" />
          {PARTICLES.map((p, i) => <span key={i} className="bz-particle absolute size-2 rounded-full" style={{ background: p.color, ["--dx" as string]: `${p.dx}px`, ["--dy" as string]: `${p.dy}px` }} />)}
          <span className="bz-float absolute left-0 top-0 whitespace-nowrap text-xl font-extrabold text-amber-300 [text-shadow:0_2px_0_#000]">+{b.points}</span>
        </div>
      ))}
      <Ship x={shipX} />
      <div aria-hidden="true" className={`absolute inset-x-0 bottom-0 h-4 bg-gradient-to-t ${danger ? "from-red-500/90" : "from-red-700/60"} to-transparent`} />
      {s.shake > 0 && <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-20 bg-red-600" style={{ opacity: s.shake * 0.5 }} />}
      {s.levelUp > 0 && <p key={s.level} className="bz-banner pointer-events-none absolute left-1/2 top-1/2 z-20 whitespace-nowrap text-4xl font-black text-amber-300 [text-shadow:0_3px_0_#000]">CẤP {s.level}!</p>}
    </>
  );
}
