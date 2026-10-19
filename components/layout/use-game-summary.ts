"use client";

import { useEffect, useState } from "react";
import { ensureAnonymousSession } from "@/lib/auth/ensure-anonymous-session";
import type { GameSummary } from "@/lib/game/game-types";

// Dùng chung cho mọi nơi trên trang (chip cấp ở thanh trên, trang Hôm nay...): một lần gọi cho cả trang, gọi lại sau 60 giây nếu cần.
let cache: { at: number; promise: Promise<GameSummary | null> } | null = null;
const TTL_MS = 60_000;

function load(): Promise<GameSummary | null> {
  if (cache && Date.now() - cache.at < TTL_MS) return cache.promise;
  const promise = (async () => {
    try {
      if (!(await ensureAnonymousSession())) return null;
      const res = await fetch("/api/game/summary", { cache: "no-store" });
      return res.ok ? ((await res.json()) as GameSummary) : null;
    } catch {
      return null;
    }
  })();
  cache = { at: Date.now(), promise };
  return promise;
}

/** Tóm tắt game hóa (XP, cấp, chuỗi, nhiệm vụ). undefined = đang tải; null = chưa có (chưa chạy migration, chưa có phiên, lỗi): giao diện ẩn phần đó thay vì hiện số giả. */
export function useGameSummary(): GameSummary | null | undefined {
  const [data, setData] = useState<GameSummary | null | undefined>(undefined);
  useEffect(() => {
    let cancelled = false;
    void load().then((d) => { if (!cancelled) setData(d); });
    return () => { cancelled = true; };
  }, []);
  return data;
}
