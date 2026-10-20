"use client";

import { useSyncExternalStore } from "react";
import { readSfxEnabled, subscribeSfx } from "@/lib/feedback/sfx";

/** Âm thanh hiệu ứng đang bật? (trước hydrate là false để HTML server và client khớp nhau.) */
export function useSfxEnabled(): boolean {
  return useSyncExternalStore(subscribeSfx, readSfxEnabled, () => false);
}
