"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { Skeleton } from "@/components/ui/skeleton";
import type { RoomView } from "@/lib/rooms/room-types";
import { RoomResultSummary } from "./room-result";

/** Xem lại một ván đã kết thúc từ lịch sử: kết quả, bảng điểm và từng câu (vẫn lưu được từ để ôn). */
export function RoomHistoryDetail({ roomId }: { roomId: string }) {
  const [view, setView] = useState<RoomView | null | "missing">(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/rooms/history/${roomId}`, { cache: "no-store" })
      .then(async (r): Promise<RoomView | "missing"> => (r.ok ? ((await r.json()) as RoomView) : "missing"))
      .then((v) => { if (!cancelled) setView(v); })
      .catch(() => { if (!cancelled) setView("missing"); });
    return () => { cancelled = true; };
  }, [roomId]);

  return (
    <div className="mx-auto max-w-3xl space-y-space-md">
      <Link href="/room/history" className="inline-flex min-h-11 items-center gap-1 text-label-md font-medium text-primary hover:underline"><Icon name="arrow_back" size={18} /> Lịch sử thi đấu</Link>
      {view === null ? (
        <div role="status" aria-label="Đang tải ván đấu" className="space-y-space-md"><Skeleton className="h-32 w-full" /><Skeleton className="h-28 w-full" /><Skeleton className="h-64 w-full" /></div>
      ) : view === "missing" ? (
        <div role="alert" className="rounded-2xl bg-surface-container-low p-space-lg text-center">
          <h1 className="font-serif text-headline-md">Không tìm thấy ván đấu này</h1>
          <p className="mt-1 text-body-md text-on-surface-variant">Ván không tồn tại hoặc bạn không tham gia ván này.</p>
        </div>
      ) : (
        <RoomResultSummary view={view} />
      )}
    </div>
  );
}
