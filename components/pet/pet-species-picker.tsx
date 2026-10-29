"use client";

import { PET_SPECIES_LABELS, type PetSpecies } from "@/lib/pet/pet-logic";
import { sfx } from "@/lib/games/arcade-sfx";
import { PET_SPECIES_READY } from "./pet-sprite";

/** Chọn loài: nhóm nút radio, mỗi lần chọn pet kêu thử một tiếng. Dùng ở màn nhận nuôi và màn đổi bạn nhỏ. */
export function SpeciesPicker({ value, onChange }: { value: PetSpecies; onChange: (s: PetSpecies) => void }) {
  if (PET_SPECIES_READY.length < 2) return null;
  return (
    <div role="radiogroup" aria-label="Chọn loài" className="mt-2 flex flex-wrap gap-2">
      {PET_SPECIES_READY.map((s) => (
        <button key={s} type="button" role="radio" aria-checked={s === value} onClick={() => { onChange(s); sfx.petChirp(s); }} className={`min-h-11 rounded-full border-2 border-ink px-4 text-label-md font-bold ${s === value ? "bg-primary-container" : "bg-surface-container-low"}`}>{PET_SPECIES_LABELS[s]}</button>
      ))}
    </div>
  );
}
