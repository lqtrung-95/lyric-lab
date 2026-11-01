"use client";

import { EMPTY_SHOP, parseShop, type PetShopState } from "@/lib/pet/pet-shop";
import { useLocalJson } from "./use-local-json-store";

const SHOP_KEY = "songhanzi-pet-shop-v1";
const SHOP_EVENT = "songhanzi:pet-shop-change";

/** Đồ đã mua và đang đeo của pet (chỉ lưu trên thiết bị này). */
export function usePetShop(): [PetShopState, (next: PetShopState) => void] {
  return useLocalJson(SHOP_KEY, SHOP_EVENT, parseShop, EMPTY_SHOP);
}
