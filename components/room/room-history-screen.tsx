"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AvatarCircle } from "@/components/leaderboard/avatar-circle";
import { Icon } from "@/components/ui/icon";
import { Skeleton } from "@/components/ui/skeleton";
import type { HistoryEntry, HistoryResult, HistoryStats } from "@/lib/rooms/room-history-types";

const RESULT: Record<HistoryResult, { label: string; tone: string }> = {
  win: { label: "Thắng", tone: "bg-secondary-container text-on-secondary-container" },
  loss: { label: "Thua", tone: "bg-surface-container-high text-on-surface-variant" },
  draw: { label: "Hòa", tone: "bg-primary-container text-on-primary-container" },
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-surface-container-low p-space-md text-center">
      <p className="font-serif text-headline-md text-primary">{value}</p>
      <p className="text-label-md text-on-surface-variant">{label}</p>
    </div>
  );
}

function Row({ e }: { e: HistoryEntry }) {
  const result = RESULT[e.result];
  return (
    <li>
      <Link href={`/room/history/${e.roomId}`} className="flex min-h-16 items-center gap-3 rounded-2xl bg-surface-container-lowest p-space-sm shadow-sm hover:bg-surface-container-low">
        <AvatarCircle nickname={e.opponent?.name ?? "?"} avatarUrl={e.opponent?.avatarUrl} size={44} />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-body-md font-semibold text-on-surface">vs {e.opponent?.name ?? "Đối thủ đã rời"}</span>
          <span className="block truncate text-label-md text-on-surface-variant">{e.song?.title || "Bài ngẫu nhiên"}</span>
          <span className="block text-label-sm text-on-surface-variant">{formatDate(e.finishedAt)}{e.forfeit && " · có người rời ván"}</span>
        </span>
        <span className="text-right">
          <span className={`inline-block rounded-full px-3 py-0.5 text-label-md font-semibold ${result.tone}`}>{result.label}</span>
          <span className="mt-1 block font-serif text-body-lg text-on-surface">{e.myScore} – {e.theirScore}</span>
        </span>
        <Icon name="chevron_right" size={20} className="text-on-surface-variant" />
      </Link>
    </li>
  );
}

/** Lịch sử thi đấu của bạn: thống kê thắng/thua và danh sách các ván gần nhất, bấm vào để xem lại từng câu. */
export function RoomHistoryScreen() {
  const [data, setData] = useState<{ entries: HistoryEntry[]; stats: HistoryStats } | null | "error">(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/rooms/history", { cache: "no-store" })
      // Chưa có phiên (401) nghĩa là chưa chơi ván nào: hiện trống thay vì báo lỗi.
      .then((r) => (r.ok ? r.json() : r.status === 401 ? { entries: [], stats: { played: 0, wins: 0, losses: 0, draws: 0, winRate: 0 } } : Promise.reject(new Error("history"))))
      .then((d) => { if (!cancelled) setData(d); })
      .catch(() => { if (!cancelled) setData("error"); });
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="mx-auto max-w-3xl space-y-space-md">
      <Link href="/room" className="inline-flex min-h-11 items-center gap-1 text-label-md font-medium text-primary hover:underline"><Icon name="arrow_back" size={18} /> Về sảnh Thi đấu</Link>
      <h1 className="font-serif text-headline-lg-mobile md:text-headline-lg">Lịch sử thi đấu</h1>

      {data === null ? (
        <div role="status" aria-label="Đang tải lịch sử" className="space-y-space-sm">
          <div className="grid grid-cols-2 gap-space-sm sm:grid-cols-4">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-20" />)}</div>
          {[0, 1, 2].map((i) => <Skeleton key={i} className="h-20 w-full" />)}
        </div>
      ) : data === "error" ? (
        <p role="alert" className="rounded-xl bg-error-container p-3 text-label-md text-on-error-container">Chưa tải được lịch sử, thử lại sau nhé.</p>
      ) : data.entries.length === 0 ? (
        <div className="rounded-2xl bg-surface-container-low p-space-lg text-center">
          <p className="text-body-lg text-on-surface">Bạn chưa có ván thi đấu nào.</p>
          <Link href="/room" className="mt-space-sm inline-flex min-h-11 items-center rounded-full bg-primary px-6 text-label-md font-semibold text-on-primary hover:bg-primary-container">Thi đấu ngay</Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-space-sm sm:grid-cols-4">
            <Stat label="Đã chơi" value={String(data.stats.played)} />
            <Stat label="Thắng" value={String(data.stats.wins)} />
            <Stat label="Thua · Hòa" value={`${data.stats.losses} · ${data.stats.draws}`} />
            <Stat label="Tỉ lệ thắng" value={`${data.stats.winRate}%`} />
          </div>
          <ul className="space-y-space-sm">{data.entries.map((e) => <Row key={e.roomId} e={e} />)}</ul>
        </>
      )}
    </div>
  );
}
