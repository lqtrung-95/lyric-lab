"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";
import { PET_GIFT_EVENT, PET_GIFT_KEY, parseGift, type PetGift } from "@/lib/pet/pet-gift";

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(PET_GIFT_EVENT, onChange);
  return () => { window.removeEventListener("storage", onChange); window.removeEventListener(PET_GIFT_EVENT, onChange); };
}
function readRaw(): string | null {
  try { return localStorage.getItem(PET_GIFT_KEY); } catch { return null; }
}

/** Ghi quà mới (gọi khi người dùng nghe hết một bài). Không lưu được (localStorage bị chặn) thì thôi, chỉ là phần thưởng thêm. */
export function leavePetGift(gift: PetGift): void {
  try { localStorage.setItem(PET_GIFT_KEY, JSON.stringify(gift)); } catch { return; }
  window.dispatchEvent(new Event(PET_GIFT_EVENT));
}

/** Quà đang chờ ở thẻ pet (null = không có) và hàm "nhận" để xóa quà. */
export function usePetGift(): { gift: PetGift | null; take: () => void } {
  const raw = useSyncExternalStore(subscribe, readRaw, () => null);
  const gift = useMemo(() => {
    if (!raw) return null;
    try { return parseGift(JSON.parse(raw)); } catch { return null; }
  }, [raw]);
  const take = useCallback(() => {
    try { localStorage.removeItem(PET_GIFT_KEY); } catch { /* bỏ qua */ }
    window.dispatchEvent(new Event(PET_GIFT_EVENT));
  }, []);
  return { gift, take };
}
