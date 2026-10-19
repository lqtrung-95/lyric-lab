"use client";

import { useEffect, useState } from "react";
import { ensureAnonymousSession } from "@/lib/auth/ensure-anonymous-session";
import type { BadgeCatalogItem } from "@/lib/game/evaluate-badges";

/** Danh mục huy hiệu kèm trạng thái mở/khóa. undefined = đang tải; null = chưa có (chưa chạy migration, chưa có phiên, lỗi): màn hình báo rõ thay vì dựng số giả. */
export function useBadgeCatalog(): BadgeCatalogItem[] | null | undefined {
  const [data, setData] = useState<BadgeCatalogItem[] | null | undefined>(undefined);
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        if (!(await ensureAnonymousSession())) return void (!cancelled && setData(null));
        const res = await fetch("/api/game/badges", { cache: "no-store" });
        const body = res.ok ? ((await res.json()) as { badges: BadgeCatalogItem[] }) : null;
        if (!cancelled) setData(body?.badges ?? null);
      } catch {
        if (!cancelled) setData(null);
      }
    })();
    return () => { cancelled = true; };
  }, []);
  return data;
}
