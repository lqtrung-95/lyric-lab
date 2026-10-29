import { PARTICLES, ShipSprite, StarBackdrop } from "./blaster-backdrop";
import { BOOM_SECONDS, ENEMY_H, SHIP_Y, type Enemy, type PowerKind, type SquadronState } from "@/lib/games/squadron-types";

const BODY = ["#ef4444", "#a855f7", "#f59e0b"];
export const POWER_ICON: Record<PowerKind, { icon: string; label: string }> = { spread: { icon: "⚡", label: "Đạn ba" }, shield: { icon: "🛡️", label: "Khiên" }, slow: { icon: "⏳", label: "Làm chậm" } };

/** Máy bay địch quay đầu xuống, mang chữ Hán ở bụng; trùm to hơn, viền sáng và có thanh máu. */
function EnemyPlane({ e, reveal }: { e: Enemy; reveal: boolean }) {
  const color = e.boss ? "#7f1d1d" : BODY[e.id % BODY.length];
  return (
    <div className="absolute z-[6] -translate-x-1/2" style={{ left: `${e.x * 100}%`, top: `${e.y * 100}%`, width: e.boss ? "25%" : "17%", height: `${ENEMY_H * 100}%` }}>
      <div className={`${e.flash > 0 ? "brightness-200" : ""} ${reveal && e.correct ? "rounded-2xl ring-4 ring-green-400 ring-offset-2 ring-offset-transparent shadow-[0_0_24px_6px_rgba(74,222,128,.8)]" : ""}`}>
        <svg viewBox="0 0 60 40" className={`w-full ${e.boss ? "drop-shadow-[0_0_10px_rgba(248,113,113,.9)]" : "drop-shadow-[0_0_5px_rgba(0,0,0,.6)]"}`}>
          <path d="M2 4 L22 14 L24 4 L30 0 L36 4 L38 14 L58 4 L56 12 L38 24 L36 34 L30 40 L24 34 L22 24 L4 12Z" fill={color} stroke="#fff" strokeOpacity=".55" strokeWidth="1.2" />
          <path d="M30 6 L33 26 L30 34 L27 26Z" fill="#000" fillOpacity=".25" />
          <circle cx="30" cy="22" r="3.2" fill="#fde68a" />
        </svg>
        <p lang="zh-Hans" className={`-mt-1 rounded-lg border border-white/30 bg-slate-900/85 text-center font-bold leading-tight text-white ${e.boss ? "text-2xl" : "text-xl"}`}>{e.word.han}</p>
        {e.maxHp > 1 && <div aria-hidden="true" className="mt-0.5 h-1.5 overflow-hidden rounded-full bg-black/60"><div className="h-full bg-red-400 transition-[width]" style={{ width: `${(e.hp / e.maxHp) * 100}%` }} /></div>}
      </div>
    </div>
  );
}

/** Sân Phi đội: nền sao trôi, máy bay địch, đạn có vệt sáng, vật phẩm rơi, vụ nổ có hạt (đỏ khi bắn nhầm), tàu có lửa đẩy và khiên, máy bay đáp án đúng viền xanh sáng khi vừa bắn nhầm, rung màn hình khi mất mạng, biểu ngữ lên cấp. Chỉ hiển thị. */
export function SquadronScene({ s }: { s: SquadronState }) {
  return (
    <>
      <StarBackdrop />
      {s.slow > 0 && <div aria-hidden="true" className="absolute inset-0 bg-sky-400/10" />}
      {s.bullets.map((b) => <span key={b.id} aria-hidden="true" className="absolute z-[5] h-5 w-1 -translate-x-1/2 rounded-full bg-gradient-to-t from-cyan-300 to-white shadow-[0_0_8px_#22d3ee]" style={{ left: `${b.x * 100}%`, top: `${b.y * 100}%` }} />)}
      {s.enemies.map((e) => <EnemyPlane key={e.id} e={e} reveal={s.revealLeft > 0} />)}
      {s.pickups.map((p) => <span key={p.id} aria-hidden="true" className="bz-sway absolute z-[6] flex size-9 -translate-x-1/2 items-center justify-center rounded-full border-2 border-amber-300 bg-slate-900/80 text-lg shadow-[0_0_14px_rgba(251,191,36,.8)]" style={{ left: `${p.x * 100}%`, top: `${p.y * 100}%` }}>{POWER_ICON[p.kind].icon}</span>)}
      {s.booms.map((b) => (
        <div key={b.id} aria-hidden="true" className="pointer-events-none absolute z-[7]" style={{ left: `${b.x * 100}%`, top: `${(b.y + ENEMY_H / 2) * 100}%`, opacity: Math.min(1, (BOOM_SECONDS - b.age) * 3) }}>
          <span className={`bz-ring absolute left-0 top-0 size-20 rounded-full border-4 ${b.good ? "border-amber-300" : "border-red-500"}`} />
          {PARTICLES.map((p, i) => <span key={i} className="bz-particle absolute size-2 rounded-full" style={{ background: b.good ? p.color : "#ef4444", ["--dx" as string]: `${p.dx}px`, ["--dy" as string]: `${p.dy}px` }} />)}
          {b.points !== 0 && <span className={`bz-float absolute left-0 top-0 whitespace-nowrap text-xl font-extrabold [text-shadow:0_2px_0_#000] ${b.points > 0 ? "text-amber-300" : "text-red-400"}`}>{b.points > 0 ? "+" : ""}{b.points}</span>}
        </div>
      ))}
      <div className="absolute z-10 -translate-x-1/2" style={{ left: `${s.shipX * 100}%`, top: `${(SHIP_Y - 0.05) * 100}%` }}><ShipSprite shield={s.shield} /></div>
      {s.shake > 0 && <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-20 bg-red-600" style={{ opacity: s.shake * 0.5 }} />}
      {s.levelUp > 0 && <p key={s.level} className="bz-banner pointer-events-none absolute left-1/2 top-1/2 z-20 whitespace-nowrap text-4xl font-black text-amber-300 [text-shadow:0_3px_0_#000]">CẤP {s.level}!</p>}
    </>
  );
}
