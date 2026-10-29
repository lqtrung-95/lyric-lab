"use client";

import { useState } from "react";
import { Button3d } from "@/components/ui/button-3d";
import { PET_NAME_MAX, PET_SPECIES_LABELS, cleanPetName, type PetSpecies } from "@/lib/pet/pet-logic";
import { PET_SPECIES_READY, PetSprite } from "./pet-sprite";
import { SpeciesPicker } from "./pet-species-picker";

/** Màn nhận nuôi: chọn loài, đặt tên, lưu một lần. `ready` = đã biết tổng XP hiện tại (cần để tính XP lúc nhận nuôi), nên nút chờ tới lúc đó. */
export function AdoptPet({ onAdopt, ready }: { onAdopt: (species: PetSpecies, name: string) => void; ready: boolean }) {
  const [species, setSpecies] = useState<PetSpecies>(PET_SPECIES_READY[0]);
  const [name, setName] = useState("");
  const clean = cleanPetName(name);
  return (
    <section aria-labelledby="adopt-heading" className="pet-ui card-ink flex flex-wrap items-center gap-x-space-md gap-y-space-sm p-space-md">
      <PetSprite species={species} stage={1} mood="happy" className="size-28 shrink-0" />
      <form className="min-w-[14rem] flex-1" onSubmit={(e) => { e.preventDefault(); if (clean && ready) onAdopt(species, clean); }}>
        <h2 id="adopt-heading" className="text-headline-md">Nhận nuôi một người bạn học</h2>
        <p className="mt-1 text-body-md text-on-surface-variant">Bạn học càng đều, bạn nhỏ càng lớn nhanh. {PET_SPECIES_LABELS[species]} sẽ lớn thêm sau mỗi buổi học.</p>
        <SpeciesPicker value={species} onChange={setSpecies} />
        <div className="mt-space-sm flex flex-wrap items-center gap-2">
          <label className="sr-only" htmlFor="pet-name">Tên bạn nhỏ</label>
          <input id="pet-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={PET_NAME_MAX * 2} placeholder="Đặt tên, ví dụ Tiểu Long" autoComplete="off" className="min-h-11 min-w-[12rem] flex-1 rounded-xl border-2 border-ink bg-surface-container-lowest px-3 text-body-md" />
          <Button3d type="submit" variant="bright" disabled={!clean || !ready}>Nhận nuôi</Button3d>
        </div>
      </form>
    </section>
  );
}
