"use client";

import { useEffect, useState } from "react";
import { REFRESH_EVENT } from "@/components/layout/use-game-summary";
import { ensureAnonymousSession } from "@/lib/auth/ensure-anonymous-session";
import { DUE_COUNT_EVENT } from "@/lib/review/due-count-event";
import type { StreakData } from "@/lib/streak/load-streak";

/** Gộp nhiều tín hiệu liên tiếp (mỗi lần chấm thẻ phát một tín hiệu) thành một lần tải lại. */
const REFETCH_DEBOUNCE_MS = 800;

async function fetchStreak(): Promise<StreakData> {
  if (!(await ensureAnonymousSession())) throw new Error("no session");
  const res = await fetch("/api/streak", { cache: "no-store" });
  if (!res.ok) throw new Error("bad status");
  return (await res.json()) as StreakData;
}

/**
 * Chuỗi ngày học của người dùng hiện tại. undefined = đang tải, null = chưa có phiên hoặc lỗi.
 * Tải lại (có gộp) khi vừa ôn/luyện xong (`DUE_COUNT_EVENT`, `REFRESH_EVENT` của tóm tắt game) hoặc khi tab được mở lại, để các nơi như
 * linh vật nhận ra "đạt mục tiêu hôm nay" ngay mà không cần tải lại trang. Lần tải lại lỗi thì giữ số liệu cũ (không đổi thành null).
 */
export function useStreak(): StreakData | null | undefined {
  const [data, setData] = useState<StreakData | null | undefined>(undefined);
  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const load = (keepOnError: boolean) => {
      fetchStreak().then(
        (json) => { if (!cancelled) setData(json); },
        () => { if (!cancelled && !keepOnError) setData(null); },
      );
    };
    const refetchSoon = () => {
      clearTimeout(timer);
      timer = setTimeout(() => load(true), REFETCH_DEBOUNCE_MS);
    };
    const onVisible = () => { if (document.visibilityState === "visible") refetchSoon(); };
    load(false);
    window.addEventListener(DUE_COUNT_EVENT, refetchSoon);
    window.addEventListener(REFRESH_EVENT, refetchSoon);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      cancelled = true;
      clearTimeout(timer);
      window.removeEventListener(DUE_COUNT_EVENT, refetchSoon);
      window.removeEventListener(REFRESH_EVENT, refetchSoon);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);
  return data;
}
