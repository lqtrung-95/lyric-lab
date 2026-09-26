"use client";

import { useEffect, useState } from "react";
import { ensureAnonymousSession } from "@/lib/auth/ensure-anonymous-session";
import type { StreakData } from "@/lib/streak/load-streak";

/** Chuỗi ngày học của người dùng hiện tại. undefined = đang tải, null = chưa có phiên hoặc lỗi. */
export function useStreak(): StreakData | null | undefined {
  const [data, setData] = useState<StreakData | null | undefined>(undefined);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (!(await ensureAnonymousSession())) throw new Error("no session");
        const res = await fetch("/api/streak", { cache: "no-store" });
        if (!res.ok) throw new Error("bad status");
        const json = (await res.json()) as StreakData;
        if (!cancelled) setData(json);
      } catch {
        if (!cancelled) setData(null);
      }
    })();
    return () => { cancelled = true; };
  }, []);
  return data;
}
