"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState, useTransition } from "react";
import { useIsAdmin } from "@/components/library/use-is-admin";

export type RefreshState = "idle" | "refreshing" | "done" | "error";

/**
 * Quản trị viên làm mới ngay cache dữ liệu của bài (bản phân tích được Next giữ 1 giờ) rồi tải lại dữ liệu bài trên màn này. Dùng sau khi sửa dữ liệu trực tiếp trong DB.
 * Không phải quản trị viên thì `canRefresh` là false và nút không hiện (quyền thật được kiểm lại ở server).
 */
export function useRefreshSongCache(videoId: string) {
  const canRefresh = useIsAdmin() === true;
  const router = useRouter();
  const [state, setState] = useState<RefreshState>("idle");
  const [, startTransition] = useTransition();

  const refresh = useCallback(async () => {
    setState("refreshing");
    try {
      const res = await fetch(`/api/admin/songs/${videoId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "refresh_cache" }) });
      if (!res.ok) return setState("error");
      setState("done");
      startTransition(() => router.refresh());
    } catch {
      setState("error");
    }
  }, [videoId, router]);

  return { canRefresh, state, refresh };
}
