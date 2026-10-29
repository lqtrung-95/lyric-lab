"use client";

import type { Dispatch, SetStateAction } from "react";
import { Button3d } from "@/components/ui/button-3d";
import { PET_NAME_MAX, PET_SPECIES_LABELS, cleanPetName, type Pet, type PetSpecies } from "@/lib/pet/pet-logic";
import { SpeciesPicker } from "./pet-species-picker";

/** Đổi tên hoặc đổi sang loài khác. Bản nháp do thẻ pet giữ để hình và tên trên thẻ đổi theo ngay (xem trước). Tiến độ lớn (XP lúc nhận nuôi, ngày nhận nuôi) được giữ nguyên, chỉ đổi hình và tên. */
export function PetEdit({ pet, draft, onDraft, onSave, onClose }: { pet: Pet; draft: { species: PetSpecies; name: string }; onDraft: Dispatch<SetStateAction<{ species: PetSpecies; name: string } | null>>; onSave: (next: Pet) => void; onClose: () => void }) {
  const { species, name } = draft;
  const clean = cleanPetName(name);
  const changed = clean !== null && (clean !== pet.name || species !== pet.species);
  return (
    <form
      aria-label="Đổi tên hoặc đổi bạn nhỏ"
      className="basis-full rounded-2xl bg-surface-container-low p-space-sm"
      onSubmit={(e) => { e.preventDefault(); if (clean && changed) onSave({ ...pet, species, name: clean }); }}
    >
      <p className="text-label-md font-bold">Đổi tên hoặc đổi bạn nhỏ. Tiến độ lớn của bạn vẫn được giữ nguyên.</p>
      <SpeciesPicker value={species} onChange={(s) => onDraft((d) => d && { ...d, species: s })} />
      <div className="mt-space-sm flex flex-wrap items-center gap-2">
        <label className="sr-only" htmlFor="pet-rename">Tên bạn nhỏ</label>
        <input id="pet-rename" value={name} onChange={(e) => onDraft((d) => d && { ...d, name: e.target.value })} maxLength={PET_NAME_MAX * 2} autoComplete="off" placeholder={`Tên ${PET_SPECIES_LABELS[species].toLowerCase()}`} className="min-h-11 min-w-[12rem] flex-1 rounded-xl border-2 border-ink bg-surface-container-lowest px-3 text-body-md" />
        <Button3d type="submit" variant="bright" disabled={!changed}>Lưu</Button3d>
        <button type="button" onClick={onClose} className="cursor-pointer min-h-11 rounded-full px-4 text-label-md font-bold underline">Hủy</button>
      </div>
    </form>
  );
}
