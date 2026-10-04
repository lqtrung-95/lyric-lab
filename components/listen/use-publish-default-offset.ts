"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState, useTransition } from "react";
import { useIsAdmin } from "@/components/library/use-is-admin";

export type PublishState = "idle" | "saving" | "saved" | "error";

/**
 * Quản trị viên lưu độ lệch đang chỉnh thành độ lệch mặc định của bài cho mọi người dùng. Không phải quản trị viên thì
 * `canPublish` là false và nút không hiện (quyền thật được kiểm lại ở server). Sau khi lưu, tải lại dữ liệu bài để mốc mới
 * về; bản chỉnh cá nhân của chính admin tự bị bỏ khi nhận mức mặc định mới (xem `resolveOffset`), nên không bị cộng đôi.
 */
export function usePublishDefaultOffset(videoId: string, offset: number) {
  const canPublish = useIsAdmin() === true;
  const router = useRouter();
  const [state, setState] = useState<PublishState>("idle");
  const [, startTransition] = useTransition();

  const publish = useCallback(async () => {
    if (offset === 0) return;
    setState("saving");
    try {
      const res = await fetch(`/api/admin/songs/${videoId}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "shift_lyrics", deltaSec: offset }),
      });
      if (!res.ok) return setState("error");
      setState("saved");
      startTransition(() => router.refresh());
    } catch {
      setState("error");
    }
  }, [offset, videoId, router]);

  return { canPublish, state, publish };
}
