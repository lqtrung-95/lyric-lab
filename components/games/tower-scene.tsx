import { PetBurstFx } from "@/components/pet/pet-burst-fx";
import { PetSprite } from "@/components/pet/pet-sprite";
import type { PetBurst } from "@/lib/pet/pet-burst";
import type { PetMood, PetSpecies } from "@/lib/pet/pet-logic";
import { BOOM_SECONDS, LANES, SHOT_SECONDS, frontMonster, type Monster, type TowerState } from "@/lib/games/tower-engine";
import { PARTICLES } from "./blaster-backdrop";

const SKIN = ["👻", "👹", "🐛", "🦖", "🐙"];
/** Quái đi từ 4% đến 78% bề ngang; pet đứng ở 90%. */
const PET_X = 90;
const mapX = (x: number): number => 4 + Math.min(1, x) * 74;
const laneY = (lane: number): number => ((lane + 0.5) / LANES) * 100;
const GRASS = "radial-gradient(40% 30% at 20% 15%, rgba(255,255,255,.18), transparent), radial-gradient(35% 30% at 60% 90%, rgba(255,255,255,.14), transparent), linear-gradient(to bottom, #7fc46f, #9bd68a)";
const DIRT_CENTER = "repeating-linear-gradient(to right, rgba(255,255,255,.4) 0 16px, transparent 16px 34px)";
const WALL = "repeating-linear-gradient(to bottom, #8d7a56 0 14px, #a8946b 14px 22px)";
/** Hoa, nấm, bụi cỏ rải ở khoảng trống giữa các làn (cố định để không nhảy giữa các lần vẽ). */
const DECOR: [string, number, number, number][] = [
  ["🌼", 8, 33, 1], ["🌿", 22, 35, 1.2], ["🍄", 37, 32, 1], ["🌸", 52, 36, 1], ["🌿", 66, 33, 1.2], ["🌼", 76, 35, 1],
  ["🌷", 12, 67, 1], ["🍄", 27, 65, 1], ["🌿", 42, 68, 1.2], ["🌼", 58, 66, 1], ["🌸", 70, 68, 1], ["🌿", 5, 66, 1.2],
  ["🌳", 15, 3, 1.8], ["🌳", 48, 2, 1.6], ["🌳", 74, 3, 1.8], ["🌲", 30, 97, 1.8], ["🌳", 62, 98, 1.7], ["🌲", 8, 97, 1.6],
];

function MonsterView({ m, front, index }: { m: Monster; front: boolean; index: number }) {
  return (
    <div className="absolute z-[6] -translate-x-1/2 -translate-y-1/2 text-center" style={{ left: `${mapX(m.x)}%`, top: `${laneY(m.lane)}%` }}>
      {front && !m.rush && <span aria-hidden="true" className="bz-sway block text-xl leading-none text-amber-500 drop-shadow">▼</span>}
      <div className={m.rush ? "tw-rush" : "bz-sway"} style={{ animationDelay: `${-(index % 5) * 0.2}s` }}>
        <span aria-hidden="true" className={`block text-5xl leading-none drop-shadow-[0_3px_2px_rgba(0,0,0,.35)] sm:text-6xl ${m.rush ? "saturate-200" : ""}`}>{SKIN[m.skin % SKIN.length]}</span>
      </div>
      <span aria-hidden="true" className="mx-auto -mt-1 block h-2 w-10 rounded-full bg-black/25 blur-[2px]" />
      <span lang="zh-Hans" className={`mt-1 block whitespace-nowrap rounded-xl border-2 px-2 font-serif text-xl font-bold leading-snug sm:text-2xl ${m.rush ? "border-red-500 bg-red-100 text-red-800" : front ? "border-amber-500 bg-amber-100 text-slate-900 shadow-[0_0_16px_rgba(245,158,11,.95)]" : "border-slate-500/40 bg-white/90 text-slate-900"}`}>{m.word.han}</span>
    </div>
  );
}

/**
 * Sân Pet thủ thành: cỏ có hoa lá, ba làn đường đất quái đi từ trái sang phải về cổng thành, pet đứng trên bệ đá ở sân nhà bên phải và bắn hạt sáng vào con quái được chọn.
 * Quái đầu hàng có viền vàng và mũi tên (đó là con đang hỏi), quái chọn sai thì đỏ và lao vào nhà; khi quái đầu hàng gần nhà thì viền sân ửng đỏ. Chỉ hiển thị, mọi thông tin quan trọng cũng có chữ ở nơi khác.
 */
export function TowerScene({ s, species, stage, mood, accessories, burst }: { s: TowerState; species: PetSpecies; stage: 1 | 2 | 3; mood: PetMood; accessories: readonly string[]; burst: PetBurst | null }) {
  const front = frontMonster(s);
  const danger = !!front && front.x > 0.7;
  return (
    <>
      <div aria-hidden="true" className="absolute inset-0" style={{ backgroundImage: GRASS }} />
      {DECOR.map(([e, x, y, k], i) => <span key={i} aria-hidden="true" className="absolute -translate-x-1/2 -translate-y-1/2 leading-none opacity-90" style={{ left: `${x}%`, top: `${y}%`, fontSize: `${k * 1.15}rem` }}>{e}</span>)}
      {Array.from({ length: LANES }, (_, lane) => (
        <div key={lane} aria-hidden="true" className="absolute inset-x-0 h-[23%] -translate-y-1/2 border-y-4 border-[#b39562]/70 bg-gradient-to-b from-[#e3cc99] to-[#d4b87d]" style={{ top: `${laneY(lane)}%` }}>
          <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 opacity-80" style={{ backgroundImage: DIRT_CENTER }} />
        </div>
      ))}
      {danger && <div aria-hidden="true" className="absolute inset-y-0 right-[19%] z-[4] w-1/3 bg-gradient-to-l from-red-500/35 to-transparent" />}
      <div aria-hidden="true" className="absolute inset-y-0 right-0 z-[3] w-[19%] bg-gradient-to-r from-[#cdbd96] to-[#bba983]" />
      <div aria-hidden="true" className="absolute inset-y-0 right-[19%] z-[4] w-3 border-x-2 border-[#6f5d3c]" style={{ backgroundImage: WALL }} />
      {Array.from({ length: LANES }, (_, lane) => <div key={lane} aria-hidden="true" className="absolute right-[18.2%] z-[5] h-[17%] w-5 -translate-y-1/2 rounded-l-full border-2 border-[#4a3b22] bg-[#3b2f1c]" style={{ top: `${laneY(lane)}%` }} />)}
      {s.shots.map((h) => {
        const t = Math.min(1, h.age / SHOT_SECONDS);
        return <span key={h.id} aria-hidden="true" className="absolute z-[8] size-5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-white via-amber-200 to-amber-500 shadow-[0_0_18px_6px_rgba(251,191,36,.7)]" style={{ left: `${PET_X + (mapX(h.x) - PET_X) * t}%`, top: `${50 + (laneY(h.lane) - 50) * t}%` }} />;
      })}
      {s.monsters.map((m, i) => <MonsterView key={m.id} m={m} front={front?.id === m.id} index={i} />)}
      {s.booms.map((b) => (
        <div key={b.id} aria-hidden="true" className="pointer-events-none absolute z-[9]" style={{ left: `${b.good ? mapX(b.x) : 80}%`, top: `${laneY(b.lane)}%`, opacity: Math.min(1, (BOOM_SECONDS - b.age) * 3) }}>
          <span className={`bz-ring absolute left-0 top-0 size-20 rounded-full border-4 ${b.good ? "border-amber-400" : "border-red-500"}`} />
          {PARTICLES.map((p, i) => <span key={i} className="bz-particle absolute size-2.5 rounded-full" style={{ background: b.good ? p.color : "#ef4444", ["--dx" as string]: `${p.dx}px`, ["--dy" as string]: `${p.dy}px` }} />)}
          {b.points > 0 && <span className="bz-float absolute left-0 top-0 whitespace-nowrap text-2xl font-extrabold text-white [text-shadow:0_2px_0_#b45309,0_0_8px_#f59e0b]">+{b.points}</span>}
        </div>
      ))}
      <div className="absolute z-10 -translate-x-1/2 -translate-y-1/2 text-center" style={{ left: `${PET_X}%`, top: "50%" }}>
        <span aria-hidden="true" className="block text-3xl leading-none">🚩</span>
        <span className="relative mt-1 block">
          <span aria-hidden="true" className={`absolute inset-x-1 -bottom-1 h-5 rounded-full border-4 border-[#7d7260] bg-[#a8a090] ${front ? "shadow-[0_0_18px_4px_rgba(251,191,36,.55)]" : ""}`} />
          <PetSprite species={species} stage={stage} mood={mood} accessories={accessories} bare className="relative size-24 sm:size-32" />
          <PetBurstFx burst={burst} species={species} silent />
        </span>
      </div>
      {s.reveal && <p aria-hidden="true" className={`bz-pop absolute left-1/2 top-3 z-20 max-w-[90%] -translate-x-1/2 rounded-full border-2 px-4 py-1 text-center text-base font-extrabold shadow-lg sm:text-lg ${s.reveal.ok ? "border-green-700 bg-green-100 text-green-900" : "border-red-700 bg-red-100 text-red-900"}`}>{s.reveal.ok ? "✓" : "✗"} {s.reveal.han} · {s.reveal.pinyin}</p>}
      {s.shake > 0 && <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-20 bg-red-600" style={{ opacity: s.shake * 0.45 }} />}
      {s.waveBanner > 0 && <p key={s.wave} className="bz-banner pointer-events-none absolute left-1/2 top-1/2 z-20 whitespace-nowrap text-5xl font-black text-white [text-shadow:0_4px_0_#166534,0_0_16px_#16a34a]">ĐỢT {s.wave}!</p>}
    </>
  );
}
