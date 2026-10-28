"use client";

import { useMemo, useSyncExternalStore } from "react";
import { parseHints, readHintsRaw, subscribeHints, writeHints, type ArcadeHints } from "@/lib/games/arcade-hints";

/** Tùy chọn hiện pinyin / nghĩa dùng chung cho mọi game giải trí (đồng bộ giữa các tab và các game). */
export function useArcadeHints(): ArcadeHints & { set: (patch: Partial<ArcadeHints>) => void } {
  const raw = useSyncExternalStore(subscribeHints, readHintsRaw, () => "");
  const hints = useMemo(() => parseHints(raw), [raw]);
  return { ...hints, set: (patch) => writeHints({ ...hints, ...patch }) };
}
