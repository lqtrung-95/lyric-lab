import type { PetMood, PetSpecies, PetStage } from "@/lib/pet/pet-logic";

/** Loài đã có hình. Các loài khác (mèo, cún, cú) chờ duyệt hình rồng và gấu trúc rồi mới vẽ. */
export const PET_SPECIES_READY: readonly PetSpecies[] = ["dragon", "panda"];

/**
 * Hoạt ảnh của linh vật (CSS thuần). Nằm trong `prefers-reduced-motion: no-preference`: người chọn giảm chuyển động thấy hình tĩnh.
 * Vui: nảy lên; đói: lắc nhẹ, chớp mắt; ngủ: phập phồng thở, chữ z bay lên. Đuôi rồng vẫy, cành tre đung đưa.
 */
const PET_CSS = `
@media (prefers-reduced-motion: no-preference) {
  @keyframes pet-hop { 0%,100% { transform: translateY(0) scale(1,1) } 45% { transform: translateY(-7px) scale(.97,1.04) } 60% { transform: translateY(0) scale(1.04,.96) } }
  @keyframes pet-wiggle { 0%,100% { transform: rotate(0) } 25% { transform: rotate(-3deg) } 75% { transform: rotate(3deg) } }
  @keyframes pet-breathe { 0%,100% { transform: scale(1,1) } 50% { transform: scale(1.03,.97) } }
  @keyframes pet-blink { 0%,90%,100% { transform: scaleY(1) } 95% { transform: scaleY(.1) } }
  @keyframes pet-zzz { 0% { opacity: 0; transform: translate(0,5px) } 30% { opacity: 1 } 100% { opacity: 0; transform: translate(4px,-14px) } }
  @keyframes pet-tail { from { transform: rotate(-7deg) } to { transform: rotate(9deg) } }
  @keyframes pet-sway { from { transform: rotate(-3deg) } to { transform: rotate(3deg) } }
  .pet-body { transform-box: fill-box; transform-origin: 50% 100% }
  .pet-body-happy { animation: pet-hop 1.1s ease-in-out infinite }
  .pet-body-hungry { animation: pet-wiggle 1.6s ease-in-out infinite }
  .pet-body-sleepy { animation: pet-breathe 3.6s ease-in-out infinite }
  .pet-eye { transform-box: fill-box; transform-origin: center; animation: pet-blink 4.2s ease-in-out infinite }
  .pet-z { animation: pet-zzz 2.8s ease-out infinite }
  .pet-z2 { animation-delay: 1.2s }
  .pet-tail { transform-box: fill-box; transform-origin: 0% 30%; animation: pet-tail 1.3s ease-in-out infinite alternate }
  .pet-bamboo { transform-box: fill-box; transform-origin: 50% 100%; animation: pet-sway 2.6s ease-in-out infinite alternate }
}`;

const INK = "#3b2416";
const BODY = "#6bbf6f";
const BODY_DARK = "#4a9a50";
const BELLY = "#f6e7ae";
const HORN = "#f5c518";
const CHEEK = "#f59a8a";

/** Mắt và miệng theo tâm trạng: vui = mắt cong + miệng cười, đói = mắt tròn + miệng há, ngủ = mắt nhắm + chữ z. */
function Face({ mood, y }: { mood: PetMood; y: number }) {
  const eye = { stroke: INK, strokeWidth: 3, strokeLinecap: "round" as const, fill: "none" };
  return (
    <g>
      {mood === "happy" && <><path d={`M42 ${y}q6 -8 12 0`} {...eye} /><path d={`M66 ${y}q6 -8 12 0`} {...eye} /><path d={`M52 ${y + 12}q8 8 16 0`} {...eye} /></>}
      {mood === "hungry" && <><circle className="pet-eye" cx="48" cy={y} r="4.5" fill={INK} /><circle className="pet-eye" cx="72" cy={y} r="4.5" fill={INK} /><ellipse cx="60" cy={y + 14} rx="5" ry="6" fill={INK} /></>}
      {mood === "sleepy" && <><path d={`M42 ${y}q6 6 12 0`} {...eye} /><path d={`M66 ${y}q6 6 12 0`} {...eye} /><path d={`M56 ${y + 13}h8`} {...eye} /><text className="pet-z" x="88" y={y - 10} fontSize="14" fontWeight="800" fill={INK}>z</text><text className="pet-z pet-z2" x="96" y={y - 22} fontSize="10" fontWeight="800" fill={INK}>z</text></>}
      <ellipse cx="38" cy={y + 9} rx="5" ry="3.5" fill={CHEEK} opacity="0.8" />
      <ellipse cx="82" cy={y + 9} rx="5" ry="3.5" fill={CHEEK} opacity="0.8" />
    </g>
  );
}

/** Rồng con ba giai đoạn: con non (tròn, sừng nhỏ) → thiếu niên (cánh nhỏ, đuôi) → trưởng thành (cánh lớn, sừng dài, lửa). */
function Dragon({ stage, mood }: { stage: PetStage; mood: PetMood }) {
  const s = { stroke: INK, strokeWidth: 3, strokeLinejoin: "round" as const };
  const hornLen = stage === 1 ? 10 : stage === 2 ? 16 : 22;
  const headY = stage === 1 ? 64 : 52;
  return (
    <g>
      {stage >= 2 && <path d={`M26 78q-24 ${stage === 3 ? -34 : -18} -4 ${stage === 3 ? -34 : -22}q2 20 14 30z M94 78q24 ${stage === 3 ? -34 : -18} 4 ${stage === 3 ? -34 : -22}q-2 20 -14 30z`} fill={BODY_DARK} {...s} />}
      {stage >= 2 && <path className="pet-tail" d="M86 100q26 4 26 -16q-8 8 -22 2z" fill={BODY} {...s} />}
      <ellipse cx="60" cy={stage === 1 ? 82 : 86} rx={stage === 1 ? 30 : 28} ry={stage === 1 ? 28 : 26} fill={BODY} {...s} />
      <ellipse cx="60" cy={stage === 1 ? 90 : 94} rx="16" ry={stage === 1 ? 17 : 15} fill={BELLY} stroke={INK} strokeWidth="2" />
      <ellipse cx="60" cy={headY} rx="32" ry="28" fill={BODY} {...s} />
      <path d={`M38 ${headY - 22}l-6 -${hornLen}l16 ${hornLen - 6}z M82 ${headY - 22}l6 -${hornLen}l-16 ${hornLen - 6}z`} fill={HORN} {...s} />
      {stage >= 2 && <path d={`M60 ${headY - 28}l-5 -8l5 3l5 -3z`} fill={HORN} {...s} />}
      <Face mood={mood} y={headY - 2} />
      {stage === 3 && mood !== "sleepy" && <path d="M76 66q12 -4 14 6q-8 -2 -14 -6z" fill="#ff8a3d" stroke={INK} strokeWidth="2" strokeLinejoin="round" />}
      <path d="M36 108h14m20 0h14" stroke={INK} strokeWidth="5" strokeLinecap="round" />
    </g>
  );
}


const WHITE = "#fbfaf5";
const BLACK = "#2a2420";
const BAMBOO = "#7bc96f";

/** Gấu trúc ba giai đoạn: con non (tròn xoe) → thiếu niên (tay chân đen rõ, nhai nhánh tre) → trưởng thành (ôm cây tre cao có lá). */
function Panda({ stage, mood }: { stage: PetStage; mood: PetMood }) {
  const s = { stroke: INK, strokeWidth: 3, strokeLinejoin: "round" as const };
  const headY = stage === 1 ? 62 : 52;
  const eye = { stroke: WHITE, strokeWidth: 2.6, strokeLinecap: "round" as const, fill: "none" };
  const line = { stroke: INK, strokeWidth: 3, strokeLinecap: "round" as const, fill: "none" };
  return (
    <g>
      {stage >= 2 && (
        <g className="pet-bamboo">
          <rect x="95" y={stage === 3 ? 30 : 66} width="6" height={stage === 3 ? 76 : 40} rx="2" fill={BAMBOO} {...s} strokeWidth="2.5" />
          <path d={`M95 ${stage === 3 ? 56 : 80}h6 M95 ${stage === 3 ? 82 : 96}h6`} stroke={INK} strokeWidth="2" />
          {stage === 3 && <path d="M101 40q18 -4 20 -16q-14 2 -20 16z M95 52q-16 -2 -20 -14q14 0 20 14z" fill={BAMBOO} stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />}
        </g>
      )}
      <ellipse cx="60" cy={stage === 1 ? 86 : 88} rx={stage === 1 ? 27 : 29} ry={stage === 1 ? 25 : 24} fill={WHITE} {...s} />
      {stage >= 2 && <path d="M32 74q-12 16 4 30q10 -6 8 -26z M88 74q12 16 -4 30q-10 -6 -8 -26z" fill={BLACK} {...s} />}
      <ellipse cx="42" cy="107" rx="11" ry="7" fill={BLACK} {...s} />
      <ellipse cx="78" cy="107" rx="11" ry="7" fill={BLACK} {...s} />
      {stage === 1 && <path d="M36 80q-8 12 2 20 M84 80q8 12 -2 20" stroke={BLACK} strokeWidth="9" strokeLinecap="round" fill="none" />}
      <circle cx="35" cy={headY - 22} r={stage === 1 ? 10 : 11} fill={BLACK} {...s} />
      <circle cx="85" cy={headY - 22} r={stage === 1 ? 10 : 11} fill={BLACK} {...s} />
      <ellipse cx="60" cy={headY} rx="33" ry="28" fill={WHITE} {...s} />
      <ellipse cx="45" cy={headY + 1} rx="9" ry="11.5" transform={`rotate(20 45 ${headY + 1})`} fill={BLACK} />
      <ellipse cx="75" cy={headY + 1} rx="9" ry="11.5" transform={`rotate(-20 75 ${headY + 1})`} fill={BLACK} />
      {mood === "happy" && <><path d={`M40 ${headY + 1}q5 -7 10 0`} {...eye} /><path d={`M70 ${headY + 1}q5 -7 10 0`} {...eye} /></>}
      {mood === "hungry" && <><circle className="pet-eye" cx="46" cy={headY + 1} r="3.4" fill={WHITE} /><circle className="pet-eye" cx="74" cy={headY + 1} r="3.4" fill={WHITE} /></>}
      {mood === "sleepy" && <><path d={`M40 ${headY + 2}q5 5 10 0`} {...eye} /><path d={`M70 ${headY + 2}q5 5 10 0`} {...eye} /><text className="pet-z" x="90" y={headY - 12} fontSize="14" fontWeight="800" fill={INK}>z</text><text className="pet-z pet-z2" x="98" y={headY - 24} fontSize="10" fontWeight="800" fill={INK}>z</text></>}
      <ellipse cx="60" cy={headY + 11} rx="4.5" ry="3.2" fill={BLACK} />
      {mood === "happy" && <path d={`M53 ${headY + 17}q7 7 14 0`} {...line} />}
      {mood === "hungry" && <ellipse cx="60" cy={headY + 20} rx="4" ry="5" fill={INK} />}
      {mood === "sleepy" && <path d={`M56 ${headY + 18}h8`} {...line} />}
      <ellipse cx="34" cy={headY + 12} rx="5" ry="3.4" fill={CHEEK} opacity="0.75" />
      <ellipse cx="86" cy={headY + 12} rx="5" ry="3.4" fill={CHEEK} opacity="0.75" />
    </g>
  );
}

/** Hình linh vật. Chỉ trang trí (aria-hidden): thông tin tên, giai đoạn, tâm trạng luôn có chữ bên cạnh. */
export function PetSprite({ species, stage, mood, className = "size-28" }: { species: PetSpecies; stage: PetStage; mood: PetMood; className?: string }) {
  return (
    <>
      <style>{PET_CSS}</style>
      <svg viewBox="0 0 120 120" aria-hidden="true" className={`${className} overflow-visible`}>
        {/* Nền kem mờ để phần lông đen của gấu trúc không chìm vào giao diện tối. */}
        <circle cx="60" cy="64" r="56" fill="#f6ecd5" opacity="0.92" />
        <ellipse cx="60" cy="112" rx="34" ry="5" fill={INK} opacity="0.18" />
        <g className={`pet-body pet-body-${mood}`}>
          {species === "dragon" && <Dragon stage={stage} mood={mood} />}
          {species === "panda" && <Panda stage={stage} mood={mood} />}
        </g>
      </svg>
    </>
  );
}
