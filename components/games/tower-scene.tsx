import { PetBurstFx } from "@/components/pet/pet-burst-fx";
import { PetSprite } from "@/components/pet/pet-sprite";
import type { PetBurst } from "@/lib/pet/pet-burst";
import type { PetMood, PetSpecies } from "@/lib/pet/pet-logic";
import { BOOM_SECONDS, LANES, SHOT_SECONDS, frontMonster, type Monster, type TowerState } from "@/lib/games/tower-engine";
import { PARTICLES } from "./blaster-backdrop";

const SKIN = ["👻", "👹", "🐛", "🦖", "🐙"];
/** Quái đi từ 4% đến 80% bề ngang; pet đứng ở 90%. */
const PET_X = 90;
const mapX = (x: number): number => 4 + Math.min(1, x) * 76;
const laneY = (lane: number): number => ((lane + 0.5) / LANES) * 100;
const SCENE_BG = "linear-gradient(to right, #86c87c, #9bd48a 70%, #b9a27c 78%, #d9c79e)";

function MonsterView({ m, front, index }: { m: Monster; front: boolean; index: number }) {
  return (
    <div className="absolute z-[6] -translate-x-1/2 -translate-y-1/2 text-center" style={{ left: `${mapX(m.x)}%`, top: `${laneY(m.lane)}%` }}>
      <div className={m.rush ? "tw-rush" : "bz-sway"} style={{ animationDelay: `${-(index % 5) * 0.2}s` }}>
        <span aria-hidden="true" className={`block text-4xl leading-none drop-shadow-[0_2px_2px_rgba(0,0,0,.35)] ${m.rush ? "grayscale-0 saturate-200" : ""}`}>{SKIN[m.skin % SKIN.length]}</span>
        <span lang="zh-Hans" className={`mt-0.5 block whitespace-nowrap rounded-lg border-2 px-1.5 font-serif text-lg font-bold leading-tight ${m.rush ? "border-red-500 bg-red-100 text-red-800" : front ? "border-amber-500 bg-amber-100 text-slate-900 shadow-[0_0_12px_rgba(245,158,11,.9)]" : "border-slate-500/50 bg-white/85 text-slate-900"}`}>{m.word.han}</span>
      </div>
    </div>
  );
}

/**
 * Sân Pet thủ thành: ba làn quái đi từ trái sang phải về phía nhà, pet đứng trên bệ đá ở bên phải và bắn hạt sáng vào con quái được chọn.
 * Quái đầu hàng có viền vàng (đó là con đang hỏi), quái chọn sai thì đỏ và lao vào nhà. Chỉ hiển thị, mọi thông tin quan trọng cũng có chữ ở nơi khác.
 */
export function TowerScene({ s, species, stage, mood, accessories, burst }: { s: TowerState; species: PetSpecies; stage: 1 | 2 | 3; mood: PetMood; accessories: readonly string[]; burst: PetBurst | null }) {
  const front = frontMonster(s);
  return (
    <>
      <div aria-hidden="true" className="absolute inset-0" style={{ backgroundImage: SCENE_BG }} />
      {Array.from({ length: LANES }, (_, lane) => <div key={lane} aria-hidden="true" className="absolute inset-x-0 h-[26%] -translate-y-1/2 bg-[#c8b07a]/45" style={{ top: `${laneY(lane)}%` }} />)}
      <div aria-hidden="true" className="absolute inset-y-0 right-0 w-[19%] border-l-4 border-[#8a7347] bg-[#c9b98f]" />
      {s.shots.map((h) => {
        const t = Math.min(1, h.age / SHOT_SECONDS);
        return <span key={h.id} aria-hidden="true" className="absolute z-[8] size-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-white to-amber-400 shadow-[0_0_14px_#fbbf24]" style={{ left: `${PET_X + (mapX(h.x) - PET_X) * t}%`, top: `${50 + (laneY(h.lane) - 50) * t}%` }} />;
      })}
      {s.monsters.map((m, i) => <MonsterView key={m.id} m={m} front={front?.id === m.id} index={i} />)}
      {s.booms.map((b) => (
        <div key={b.id} aria-hidden="true" className="pointer-events-none absolute z-[9]" style={{ left: `${b.good ? mapX(b.x) : 84}%`, top: `${laneY(b.lane)}%`, opacity: Math.min(1, (BOOM_SECONDS - b.age) * 3) }}>
          <span className={`bz-ring absolute left-0 top-0 size-16 rounded-full border-4 ${b.good ? "border-amber-400" : "border-red-500"}`} />
          {PARTICLES.map((p, i) => <span key={i} className="bz-particle absolute size-2 rounded-full" style={{ background: b.good ? p.color : "#ef4444", ["--dx" as string]: `${p.dx}px`, ["--dy" as string]: `${p.dy}px` }} />)}
          {b.points > 0 && <span className="bz-float absolute left-0 top-0 whitespace-nowrap text-xl font-extrabold text-amber-100 [text-shadow:0_2px_0_#7c4a03]">+{b.points}</span>}
        </div>
      ))}
      <div className="absolute z-10 -translate-x-1/2 -translate-y-1/2 text-center" style={{ left: `${PET_X}%`, top: "50%" }}>
        <span aria-hidden="true" className="block text-2xl leading-none">🏠</span>
        <span className="relative -mt-1 block">
          <PetSprite species={species} stage={stage} mood={mood} accessories={accessories} bare className="size-20 sm:size-24" />
          <PetBurstFx burst={burst} species={species} silent />
        </span>
      </div>
      {s.shake > 0 && <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-20 bg-red-600" style={{ opacity: s.shake * 0.45 }} />}
      {s.waveBanner > 0 && <p key={s.wave} className="bz-banner pointer-events-none absolute left-1/2 top-1/2 z-20 whitespace-nowrap text-4xl font-black text-white [text-shadow:0_3px_0_#166534]">ĐỢT {s.wave}!</p>}
    </>
  );
}
