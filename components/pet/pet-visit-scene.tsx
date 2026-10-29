"use client";

import Link from "next/link";
import { useState } from "react";
import { sfx } from "@/lib/games/arcade-sfx";
import type { PetBurst, PetBurstKind } from "@/lib/pet/pet-burst";
import { PET_SPECIES_LABELS } from "@/lib/pet/pet-logic";
import { VISIT_GIFTS, VISIT_GREETINGS, type PetVisit } from "@/lib/pet/pet-visit";
import { PetBurstFx } from "./pet-burst-fx";
import { PetSprite } from "./pet-sprite";
import { usePetView } from "./use-pet-view";

/**
 * "Nhà" của pet bạn bè khi mở link mời: chạm vào pet để nghe lời chào, tặng quà nhỏ, và pet của chính bạn (nếu có) đến chơi cùng.
 * Chỉ xem và chơi, không đổi gì của chủ pet. Chưa có pet thì mời nhận nuôi.
 */
export function PetVisitScene({ visit }: { visit: PetVisit }) {
  const mine = usePetView();
  const [tapKey, setTapKey] = useState(0);
  const [line, setLine] = useState(VISIT_GREETINGS(visit.name)[0]);
  const [burst, setBurst] = useState<PetBurst | null>(null);
  const fx = (kind: PetBurstKind) => setBurst((b) => ({ key: (b?.key ?? 0) + 1, kind }));
  const greet = () => { const all = VISIT_GREETINGS(visit.name); setTapKey((k) => k + 1); setLine(all[(tapKey + 1) % all.length]); fx("tap"); };
  const gift = (g: string) => {
    const from = mine ? mine.pet.name : "Bạn";
    setLine(`${from} tặng ${visit.name} ${g}! ${visit.name} cảm ơn nhiều lắm!`);
    setTapKey((k) => k + 1); fx("gift"); sfx.petGift();
  };
  const chips = [{ l: "Cấp", v: String(visit.level) }, ...(visit.streak > 0 ? [{ l: "Chuỗi ngày", v: String(visit.streak) }] : []), { l: "Giai đoạn", v: `${visit.stage}/3` }];
  return (
    <section aria-labelledby="visit-title" className="mx-auto max-w-xl rounded-3xl border-4 border-ink bg-surface-container-lowest p-space-md text-center">
      <h1 id="visit-title" className="font-serif text-headline-md">Bạn đang ghé nhà {visit.name}</h1>
      <p className="text-label-md text-on-surface-variant">{PET_SPECIES_LABELS[visit.species]} đang học tiếng Trung trên SongHanzi</p>
      <div className="relative mx-auto mt-space-sm flex items-end justify-center gap-4">
        <div className="relative">
          <p role="status" aria-live="polite" className="mx-auto mb-2 max-w-[16rem] rounded-2xl border-2 border-ink bg-surface-container-low px-3 py-1 text-label-md font-bold">{line}</p>
          <button type="button" onClick={greet} aria-label={`Chạm vào ${visit.name}`} className="cursor-pointer block rounded-full">
            <PetSprite species={visit.species} stage={visit.stage} mood="happy" accessories={visit.accessories} tapKey={tapKey} className="size-44" />
          </button>
          <PetBurstFx burst={burst} species={visit.species} />
        </div>
        {mine && (
          <div className="shrink-0 text-center">
            <PetSprite species={mine.pet.species} stage={mine.view.growth.stage} mood="happy" accessories={mine.view.accessories} className="size-24" />
            <p className="text-label-md font-bold">{mine.pet.name} đến chơi</p>
          </div>
        )}
      </div>
      <ul className="mt-space-sm flex flex-wrap justify-center gap-2">{chips.map((c) => <li key={c.l} className="rounded-xl border-2 border-ink px-3 py-1"><span className="block text-base font-extrabold">{c.v}</span><span className="text-label-md text-on-surface-variant">{c.l}</span></li>)}</ul>
      <div className="mt-space-sm" role="group" aria-label={`Tặng quà cho ${visit.name}`}>
        <p className="text-label-md font-bold">Tặng quà cho {visit.name}:</p>
        <div className="mt-1 flex justify-center gap-2">{VISIT_GIFTS.map((g) => <button key={g} type="button" onClick={() => gift(g)} aria-label={`Tặng ${g}`} className="min-h-12 min-w-12 rounded-full border-2 border-ink bg-surface-container-low text-2xl">{g}</button>)}</div>
      </div>
      <div className="mt-space-md">
        {mine === null && <p className="mb-2 text-body-md">Bạn cũng muốn có một bạn nhỏ như {visit.name}? Học càng đều, bạn nhỏ càng lớn.</p>}
        <Link href="/app" className="inline-flex min-h-12 items-center rounded-full bg-primary px-6 text-label-lg font-extrabold text-on-primary hover:brightness-110">{mine === null ? "Nhận nuôi bạn nhỏ của bạn" : "Về trang học của mình"}</Link>
      </div>
    </section>
  );
}
