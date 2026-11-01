"use client";

import { useState } from "react";
import { EmojiIcon } from "@/components/ui/emoji-icon";
import { Button3d } from "@/components/ui/button-3d";
import { sfx } from "@/lib/games/arcade-sfx";
import type { PetBurstKind } from "@/lib/pet/pet-burst";
import type { Pet, PetMood, PetStage } from "@/lib/pet/pet-logic";
import { SHOP_ITEMS, SHOP_SLOTS, buyItem, outfitIds, toggleEquip, xuBalance, type ShopSlot } from "@/lib/pet/pet-shop";
import { PetSprite } from "./pet-sprite";
import { usePetShop } from "./use-pet-shop";

/**
 * Cửa hàng của pet: tiêu xu (1 xu mỗi 10 XP đã kiếm, XP không bị trừ) mua phụ kiện, bấm món đã có để đeo hoặc cởi.
 * Bấm vào một món để xem thử trên pet trước khi mua.
 */
export function PetShop({ pet, stage, mood, totalXp, streakAccessories, onFx, onClose }: { pet: Pet; stage: PetStage; mood: PetMood; totalXp: number; streakAccessories: string[]; onFx: (k: PetBurstKind) => void; onClose: () => void }) {
  const [shop, setShop] = usePetShop();
  const [slot, setSlot] = useState<ShopSlot>("head");
  const [preview, setPreview] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const balance = xuBalance(totalXp, shop);
  const items = SHOP_ITEMS.filter((i) => i.slot === slot);
  const shown = preview && !shop.owned.includes(preview) ? outfitIds(streakAccessories, { ...shop, equipped: { ...shop.equipped, [SHOP_ITEMS.find((i) => i.id === preview)!.slot]: preview } }) : outfitIds(streakAccessories, shop);
  const selected = SHOP_ITEMS.find((i) => i.id === preview) ?? null;

  function buy(id: string) {
    const next = buyItem(shop, id, totalXp);
    if (!next) { setNote("Chưa đủ xu. Học thêm để kiếm xu nhé!"); sfx.petBlip(); return; }
    setShop(next); setPreview(null); setNote(`${pet.name} có ${SHOP_ITEMS.find((i) => i.id === id)!.label} rồi!`); sfx.petAdopt(); onFx("adopt");
  }
  function equip(id: string) { setShop(toggleEquip(shop, id)); sfx.petBlip(); onFx("tap"); setNote(""); }

  return (
    <section aria-label={`Cửa hàng của ${pet.name}`} className="basis-full rounded-2xl bg-surface-container-low p-space-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-label-lg font-extrabold">Cửa hàng của {pet.name}</h3>
        <p className="inline-flex items-center gap-1 rounded-full border-2 border-ink bg-primary-container px-3 py-0.5 text-label-md font-extrabold text-on-primary-container" aria-label={`Bạn có ${balance} xu`}><EmojiIcon e="🪙" size={20} /> {balance} xu</p>
      </div>
      <p className="mt-1 text-label-md text-on-surface-variant">Cứ 10 XP kiếm được là 1 xu. XP của bạn không bị trừ khi mua.</p>
      <div className="mt-space-sm flex flex-wrap items-center gap-space-md">
        <div className="mx-auto"><PetSprite species={pet.species} stage={stage} mood={mood} accessories={shown} className="size-36" /></div>
        <div className="min-w-[14rem] flex-1">
          <div role="tablist" aria-label="Chỗ đeo" className="flex flex-wrap gap-1.5">
            {SHOP_SLOTS.map((s) => <button key={s.id} type="button" role="tab" aria-selected={slot === s.id} onClick={() => { setSlot(s.id); setPreview(null); }} className={`min-h-11 rounded-full border-2 border-ink px-4 text-label-md font-extrabold ${slot === s.id ? "bg-primary text-on-primary" : "bg-surface-container-lowest"}`}>{s.label}</button>)}
          </div>
          <ul className="mt-space-sm grid grid-cols-2 gap-2 sm:grid-cols-3">
            {items.map((it) => {
              const owned = shop.owned.includes(it.id);
              const worn = shop.equipped[it.slot] === it.id;
              return (
                <li key={it.id}>
                  <button type="button" aria-pressed={preview === it.id || worn} onClick={() => { setPreview(it.id); if (owned) equip(it.id); }} className={`flex min-h-24 w-full flex-col items-center justify-center rounded-xl border-2 p-1.5 text-center ${worn ? "border-secondary bg-secondary-container" : preview === it.id ? "border-ink bg-primary-container" : "border-[var(--ink-soft)] bg-surface-container-lowest"}`}>
                    <PetSprite species={pet.species} stage={stage} mood="happy" accessories={[it.id]} bare className="size-14" />
                    <span className="text-label-sm font-extrabold leading-tight">{it.label}</span>
                    <span className="text-label-sm text-on-surface-variant">{worn ? "Đang đeo" : owned ? "Đã có · bấm để đeo" : <><EmojiIcon e="🪙" size={14} /> {it.price}</>}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
      <div className="mt-space-sm flex flex-wrap items-center gap-2">
        {selected && !shop.owned.includes(selected.id) && <Button3d type="button" variant="bright" onClick={() => buy(selected.id)} disabled={balance < selected.price}>Mua {selected.label} · {selected.price} xu</Button3d>}
        {selected && !shop.owned.includes(selected.id) && balance < selected.price && <span className="text-label-md text-on-surface-variant">Còn thiếu {selected.price - balance} xu</span>}
        <button type="button" onClick={onClose} className="cursor-pointer min-h-11 rounded-full px-4 text-label-md font-bold underline">Đóng</button>
      </div>
      <p role="status" className="mt-1 text-label-md font-bold text-secondary">{note}</p>
    </section>
  );
}
