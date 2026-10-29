"use client";

import { useRef, useState } from "react";
import { RoleplaySummaryModal } from "@/components/speaking/roleplay-summary-modal";
import { Button3d } from "@/components/ui/button-3d";
import { sfx } from "@/lib/games/arcade-sfx";
import { PET_SPECIES_LABELS, type Pet, type PetStage } from "@/lib/pet/pet-logic";
import type { PetBurst } from "@/lib/pet/pet-burst";
import { buildVisitUrl } from "@/lib/pet/pet-visit";
import { chipRows, confetti, shareChips, shareFileName, sparkles, type ShareStats } from "@/lib/pet/pet-share";
import { PetBurstFx } from "./pet-burst-fx";
import { renderShareImage } from "./pet-share-image";
import { PetSprite, TINT } from "./pet-sprite";
import { SHARE_CSS } from "./pet-share-css";

const STAGE_NAMES = ["con non", "thiếu niên", "trưởng thành"];
const SPARKLES = sparkles(14);
const CONFETTI = confetti(26);

/**
 * Hộp thoại "Khoe bạn nhỏ": thẻ hologram nghiêng theo con trỏ, viền cầu vồng quay, tia nắng, lấp lánh, confetti rơi lúc mở và tiếng chúc mừng.
 * Có thể lưu thành ảnh PNG hoặc chia sẻ (nếu trình duyệt hỗ trợ). Hiệu ứng chỉ chạy khi không bật giảm chuyển động; mọi số liệu đều có chữ.
 */
export function PetShareCard({ pet, stage, accessories, stats, onClose }: { pet: Pet; stage: PetStage; accessories: string[]; stats: ShareStats; onClose: () => void }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [burst] = useState<PetBurst>({ key: 1, kind: "evolve" });
  const [note, setNote] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const chips = shareChips(stats);
  // Mỗi ô rộng bằng 6 chia số ô trong hàng của nó (6 cột): hàng 3 ô mỗi ô 2 cột, hàng 2 ô mỗi ô 3 cột, nên hàng ít ô vẫn đều và căn giữa.
  const chipSpan = chipRows(chips.length).flatMap((n) => Array<string>(n).fill(n === 3 ? "col-span-2" : n === 2 ? "col-span-3" : "col-span-6"));
  const subtitle = `${PET_SPECIES_LABELS[pet.species]} · ${STAGE_NAMES[stage - 1]}`;

  const tilt = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
    el.style.setProperty("--rx", `${((0.5 - py) * 14).toFixed(1)}deg`);
    el.style.setProperty("--ry", `${((px - 0.5) * 16).toFixed(1)}deg`);
    el.style.setProperty("--mx", `${(px * 100).toFixed(0)}%`);
    el.style.setProperty("--my", `${(py * 100).toFixed(0)}%`);
  };
  const untilt = () => { const el = cardRef.current; if (el) for (const v of ["--rx", "--ry"]) el.style.setProperty(v, "0deg"); };

  const makeImage = async (): Promise<File> => {
    const svg = cardRef.current?.querySelector("svg");
    if (!svg) throw new Error("no_svg");
    const blob = await renderShareImage({ svg: svg as SVGSVGElement, name: pet.name, subtitle, stars: stage, chips, tint: TINT[pet.species] });
    return new File([blob], shareFileName(pet.name), { type: "image/png" });
  };
  const invite = async () => {
    const url = buildVisitUrl(`${window.location.origin}/ghe-tham-pet`, { species: pet.species, name: pet.name, stage, accessories, level: stats.level, streak: stats.streak });
    const text = `Ghé nhà ${pet.name} chơi nè! ${pet.name} đang học tiếng Trung cùng mình trên SongHanzi.`;
    try {
      if (navigator.share) await navigator.share({ title: `Ghé thăm ${pet.name}`, text, url });
      else { await navigator.clipboard.writeText(`${text} ${url}`); setNote("Đã sao chép link mời bạn đến thăm."); }
    } catch (e) { if (!(e instanceof DOMException && e.name === "AbortError")) setNote("Chưa chia sẻ được. Thử lại nhé."); }
  };
  const run = async (share: boolean) => {
    setBusy(true); setNote(null); sfx.petBlip();
    try {
      const file = await makeImage();
      if (share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: `${pet.name} · SongHanzi`, text: `${pet.name} đang học tiếng Trung cùng mình trên SongHanzi!` });
      } else {
        const url = URL.createObjectURL(file);
        const a = Object.assign(document.createElement("a"), { href: url, download: file.name });
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        setNote("Đã lưu ảnh vào máy.");
      }
    } catch (e) {
      if (!(e instanceof DOMException && e.name === "AbortError")) setNote("Chưa tạo được ảnh. Thử lại nhé.");
    } finally { setBusy(false); }
  };

  return (
    <RoleplaySummaryModal label={`Khoe ${pet.name}`} onClose={onClose}>
      <style>{SHARE_CSS}</style>
      <div className="flex flex-col items-center gap-space-sm p-space-md">
        <div className="share-stage relative" onPointerMove={tilt} onPointerLeave={untilt}>
          <div ref={cardRef} className="share-card">
            <div className="share-spin" aria-hidden="true" />
            <div className="share-body" style={{ ["--tint" as string]: TINT[pet.species] }}>
              <div className="share-rays" aria-hidden="true" />
              <div className="share-halo" aria-hidden="true" />
              {SPARKLES.map((s, i) => <span key={i} aria-hidden="true" className="share-sparkle" style={{ left: `${s.x}%`, top: `${s.y}%`, ["--s" as string]: s.size, ["--d" as string]: `${s.delay}s` }} />)}
              {CONFETTI.map((c, i) => <span key={i} aria-hidden="true" className="share-confetti" style={{ left: `${c.x}%`, width: c.w, height: c.w * 1.8, background: `hsl(${c.hue} 90% 62%)`, ["--d" as string]: `${c.delay}s`, ["--t" as string]: `${c.duration}s`, ["--r" as string]: `${c.spin}deg` }} />)}
              <div className="relative z-10 flex flex-col items-center px-4 pt-6 text-[#3a2b2b]">
                <div className="share-pet relative">
                  <PetSprite species={pet.species} stage={stage} mood="happy" accessories={accessories} className="size-44" />
                  <PetBurstFx burst={burst} species={pet.species} />
                </div>
                <h2 className="share-foil mt-1 text-center text-4xl font-extrabold">{pet.name}</h2>
                <p className="text-label-md font-bold">{subtitle}</p>
                <p className="mt-1 text-2xl text-[#f59e0b]" aria-label={`Giai đoạn ${stage} trên 3`}>
                  {[1, 2, 3].map((n) => <span key={n} aria-hidden="true" className="share-star" style={{ ["--d" as string]: `${0.5 + n * 0.18}s` }}>{n <= stage ? "★" : "☆"}</span>)}
                </p>
                <ul className="mt-2 grid w-full grid-cols-6 gap-2 pb-5">
                  {chips.map((c, i) => (
                    <li key={c.label} className={`${chipSpan[i]} rounded-xl border-2 border-[#3a2b2b] bg-white/85 px-1 py-1.5 text-center`}>
                      <span className="block text-base font-extrabold">{c.value}</span>
                      <span className="block text-[0.7rem] font-semibold leading-tight text-[#6b5b4b]">{c.label}</span>
                    </li>
                  ))}
                </ul>
                <p className="pb-3 text-[0.7rem] font-bold text-[#6b5b4b]">SongHanzi · học tiếng Trung qua bài hát</p>
              </div>
              <div className="share-shine" aria-hidden="true" />
            </div>
          </div>
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          <Button3d type="button" variant="bright" disabled={busy} onClick={() => void run(false)}>Lưu ảnh</Button3d>
          <Button3d type="button" disabled={busy} onClick={() => void run(true)}>Chia sẻ ảnh</Button3d>
          <Button3d type="button" variant="tertiary" onClick={() => void invite()}>Mời bạn đến thăm</Button3d>
          <button type="button" onClick={() => { sfx.petBlip(); onClose(); }} className="min-h-11 rounded-full px-4 text-label-md font-bold text-on-surface-variant hover:bg-surface-container">Đóng</button>
        </div>
        {note && <p role="status" className="text-label-md font-bold">{note}</p>}
      </div>
    </RoleplaySummaryModal>
  );
}
