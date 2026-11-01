"use client";

import { useState } from "react";
import { EmojiIcon } from "@/components/ui/emoji-icon";
import { Button3d } from "@/components/ui/button-3d";
import { sfx } from "@/lib/games/arcade-sfx";
import { accessoryLine } from "@/lib/pet/pet-accessory-lines";
import type { PetBurstKind } from "@/lib/pet/pet-burst";
import type { Pet, PetMood, PetStage } from "@/lib/pet/pet-logic";
import { CHEST_MAX, CHEST_MIN, SEASON_LABELS, SHOP_ITEMS, SHOP_SLOTS, buyItem, openChest, openSeasons, outfitIds, seasonOpen, toggleEquip, xuBalance, type ShopItem, type ShopSlot } from "@/lib/pet/pet-shop";
import { PetSprite } from "./pet-sprite";
import { useNow } from "./use-now";
import { usePetShop } from "./use-pet-shop";

type Tab = ShopSlot | "event";

/** Số ngẫu nhiên [0,1) cho rương (tách ra ngoài thành phần để vẽ lại không đổi kết quả). */
const rollChest = (): number => Math.random();

/**
 * Cửa hàng của pet: tiêu xu (1 xu mỗi 10 XP kiếm được; XP không bị trừ) mua phụ kiện, bấm món đã có để đeo hoặc cởi. Bấm một món để xem thử trên pet trước khi mua.
 * Tab "Sự kiện": món giới hạn theo mùa lễ (Tết, Trung thu, Giáng sinh), chỉ mua được trong mùa. Rương may mắn: mỗi ngày chọn một trong ba rương để nhận xu.
 */
export function PetShop({ pet, stage, mood, totalXp, streakAccessories, onFx, onClose }: { pet: Pet; stage: PetStage; mood: PetMood; totalXp: number; streakAccessories: string[]; onFx: (k: PetBurstKind) => void; onClose: () => void }) {
  const [shop, setShop] = usePetShop();
  const [tab, setTab] = useState<Tab>("head");
  const [preview, setPreview] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [chest, setChest] = useState<{ picked: number; xu: number } | null>(null);
  const nowMs = useNow();
  const now = nowMs ? new Date(nowMs) : null;
  const today = now ? now.toLocaleDateString("sv") : "";
  const balance = xuBalance(totalXp, shop);
  const open = now ? openSeasons(now) : [];
  const items: ShopItem[] = tab === "event" ? SHOP_ITEMS.filter((i) => i.season) : SHOP_ITEMS.filter((i) => i.slot === tab && (!i.season || shop.owned.includes(i.id)));
  const previewItem = SHOP_ITEMS.find((i) => i.id === preview) ?? null;
  const shown = previewItem && !shop.owned.includes(previewItem.id) ? outfitIds(streakAccessories, { ...shop, equipped: { ...shop.equipped, [previewItem.slot]: previewItem.id } }) : outfitIds(streakAccessories, shop);
  const selected = previewItem;
  const chestOpened = today !== "" && shop.chestDay === today;
  const inSeason = (it: ShopItem) => !it.season || (now !== null && seasonOpen(it.season, now));
  const say = (id: string, seed: number) => { const l = accessoryLine([id], seed); return l ? `${pet.name}: “${l}”` : ""; };

  function buy(id: string) {
    const item = SHOP_ITEMS.find((i) => i.id === id)!;
    const next = now ? buyItem(shop, id, totalXp, now) : null;
    if (!next) { setNote(!inSeason(item) ? "Món này chỉ bán trong mùa lễ." : "Chưa đủ xu. Học thêm để kiếm xu nhé!"); sfx.petBlip(); return; }
    setShop(next); setPreview(null); setNote(`${pet.name} có ${item.label} rồi! ${say(id, 0)}`); sfx.petAdopt(); onFx("adopt");
  }
  function equip(id: string) {
    const was = shop.equipped[SHOP_ITEMS.find((i) => i.id === id)!.slot] === id;
    setShop(toggleEquip(shop, id)); sfx.petBlip(); onFx("tap"); setNote(was ? "" : say(id, shop.owned.length));
  }
  function pickChest(i: number) {
    if (chest || chestOpened || !today) return;
    const res = openChest(shop, today, rollChest());
    if (!res) return;
    setShop(res.state); setChest({ picked: i, xu: res.xu }); sfx.petGift(); onFx("gift");
  }

  return (
    <section aria-label={`Cửa hàng của ${pet.name}`} className="basis-full rounded-2xl bg-surface-container-low p-space-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-label-lg font-extrabold">Cửa hàng của {pet.name}</h3>
        <p className="inline-flex items-center gap-1 rounded-full border-2 border-ink bg-primary-container px-3 py-0.5 text-label-md font-extrabold text-on-primary-container" aria-label={`Bạn có ${balance} xu`}><EmojiIcon e="🪙" size={20} /> {balance} xu</p>
      </div>
      <p className="mt-1 text-label-md text-on-surface-variant">Cứ 10 XP kiếm được là 1 xu. XP của bạn không bị trừ khi mua.</p>
      {open.length > 0 && <p role="status" className="mt-1 inline-block rounded-full bg-secondary-container px-3 py-0.5 text-label-md font-extrabold text-on-secondary-container"><EmojiIcon e="🎉" /> Đang có sự kiện {open.map((s) => SEASON_LABELS[s]).join(", ")}: xem tab Sự kiện!</p>}

      <div className="mt-space-sm flex flex-wrap items-center gap-space-md">
        <div className="mx-auto"><PetSprite species={pet.species} stage={stage} mood={mood} accessories={shown} className="size-36" /></div>
        <div className="min-w-[14rem] flex-1">
          <div role="tablist" aria-label="Chỗ đeo" className="flex flex-wrap gap-1.5">
            {[...SHOP_SLOTS, { id: "event" as const, label: "Sự kiện" }].map((s) => <button key={s.id} type="button" role="tab" aria-selected={tab === s.id} onClick={() => { setTab(s.id); setPreview(null); }} className={`min-h-11 rounded-full border-2 border-ink px-4 text-label-md font-extrabold ${tab === s.id ? "bg-primary text-on-primary" : "bg-surface-container-lowest"}`}>{s.label}</button>)}
          </div>
          <ul className="mt-space-sm grid grid-cols-2 gap-2 sm:grid-cols-3">
            {items.length === 0 && <li className="col-span-full text-label-md text-on-surface-variant">Chưa có món nào ở đây.</li>}
            {items.map((it) => {
              const owned = shop.owned.includes(it.id);
              const worn = shop.equipped[it.slot] === it.id;
              const closed = !owned && !inSeason(it);
              return (
                <li key={it.id}>
                  <button type="button" aria-pressed={preview === it.id || worn} onClick={() => { setPreview(it.id); if (owned) equip(it.id); }} className={`flex min-h-24 w-full flex-col items-center justify-center rounded-xl border-2 p-1.5 text-center ${worn ? "border-secondary bg-secondary-container" : preview === it.id ? "border-ink bg-primary-container" : "border-[var(--ink-soft)] bg-surface-container-lowest"} ${closed ? "opacity-60" : ""}`}>
                    <PetSprite species={pet.species} stage={stage} mood="happy" accessories={[it.id]} bare className="size-14" />
                    <span className="text-label-sm font-extrabold leading-tight">{it.label}</span>
                    {it.season && <span className="text-label-sm font-bold text-secondary">{SEASON_LABELS[it.season]}</span>}
                    <span className="text-label-sm text-on-surface-variant">{worn ? "Đang đeo" : owned ? "Đã có · bấm để đeo" : closed ? "Hết mùa" : <><EmojiIcon e="🪙" size={14} /> {it.price}</>}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <div className="mt-space-sm flex flex-wrap items-center gap-2">
        {selected && !shop.owned.includes(selected.id) && <Button3d type="button" variant="bright" onClick={() => buy(selected.id)} disabled={balance < selected.price || !inSeason(selected)}>Mua {selected.label} · {selected.price} xu</Button3d>}
        {selected && !shop.owned.includes(selected.id) && inSeason(selected) && balance < selected.price && <span className="text-label-md text-on-surface-variant">Còn thiếu {selected.price - balance} xu</span>}
      </div>

      <div className="mt-space-sm rounded-xl border-2 border-dashed border-ink p-space-sm" role="group" aria-label="Rương may mắn hằng ngày">
        <p className="text-label-md font-extrabold">Rương may mắn hôm nay</p>
        {chestOpened && !chest ? (
          <p className="text-label-md text-on-surface-variant">Bạn đã mở rương hôm nay rồi. Mai quay lại nhé!</p>
        ) : (
          <>
            <p className="text-label-md text-on-surface-variant">Chọn một rương, nhận {CHEST_MIN}–{CHEST_MAX} xu. Mỗi ngày một lần.</p>
            <div className="mt-1 flex gap-2">
              {[0, 1, 2].map((i) => (
                <button key={i} type="button" onClick={() => pickChest(i)} disabled={chest !== null} aria-label={chest ? (chest.picked === i ? `Rương ${i + 1}: ${chest.xu} xu` : `Rương ${i + 1}`) : `Mở rương ${i + 1}`} className={`flex min-h-14 min-w-14 flex-col items-center justify-center rounded-xl border-2 border-ink px-3 ${chest?.picked === i ? "bg-primary-container" : "bg-surface-container-lowest"}`}>
                  {chest?.picked === i ? <span className="anim-badge-pop inline-flex items-center gap-1 text-label-md font-extrabold"><EmojiIcon e="🪙" size={20} />+{chest.xu}</span> : <EmojiIcon e="🎁" size={30} />}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="mt-space-sm flex flex-wrap items-center gap-2">
        <button type="button" onClick={onClose} className="cursor-pointer min-h-11 rounded-full px-4 text-label-md font-bold underline">Đóng</button>
      </div>
      <p role="status" className="mt-1 text-label-md font-bold text-secondary">{note}</p>
    </section>
  );
}
