"use client";

import Link from "next/link";
import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { Spinner } from "@/components/ui/spinner";
import type { ReportedSong } from "@/lib/admin/song-report-types";
import { reasonSummary } from "./song-report-summary";
import { useSongReports } from "./use-song-reports";

const date = (iso: string) => new Date(iso).toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" });

/** Danh sách bài bị người dùng báo sai (lời không khớp, sai ngôn ngữ, không phải bài hát): mở bài để sửa lời, ẩn/hiện lại, hoặc đánh dấu đã xử lý. */
export function SongReportsAdminScreen() {
  const { items, reload } = useSongReports(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run(song: ReportedSong, action: "dismiss" | "hide" | "unhide") {
    setBusy(song.videoId);
    setError(null);
    const url = action === "dismiss" ? `/api/admin/song-reports/${song.videoId}` : `/api/admin/songs/${song.videoId}`;
    const res = await fetch(url, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action }) }).catch(() => null);
    setBusy(null);
    if (!res?.ok) return setError("Chưa xử lý được, thử lại nhé.");
    reload();
  }

  const pill = "inline-flex min-h-11 items-center gap-1.5 rounded-full px-4 text-label-md font-medium disabled:opacity-60";
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-space-md">
      <h1 className="font-serif text-headline-lg-mobile md:text-headline-lg">Báo cáo bài hát</h1>
      <p className="text-body-md text-on-surface-variant">Người học báo bài sai (lời không khớp với video, không phải tiếng Trung, không phải bài hát). Mở bài để sửa lời từng dòng, rồi bấm “Đã xử lý” để xóa báo cáo.</p>
      {error && <p role="alert" className="rounded-xl bg-error-container p-3 text-label-md text-on-error-container">{error}</p>}

      {items === undefined ? (
        <p role="status" className="flex items-center gap-2 text-body-md text-on-surface-variant"><Spinner size={18} />Đang tải…</p>
      ) : items.length === 0 ? (
        <p className="rounded-2xl bg-surface-container-low p-space-lg text-body-md text-on-surface-variant">Không có bài nào đang bị báo.</p>
      ) : (
        <ul className="flex flex-col gap-space-sm">
          {items.map((s) => (
            <li key={s.videoId} className="rounded-2xl bg-surface-container-lowest p-space-md shadow-sm">
              <div className="flex flex-wrap items-center gap-2">
                <p lang="zh" className="min-w-0 flex-1 truncate font-serif text-headline-md text-on-surface">{s.title}</p>
                <span className="rounded-full bg-error-container px-3 py-1 text-label-sm font-semibold text-on-error-container">{s.total} báo cáo</span>
                {s.hidden && <span className="rounded-full bg-surface-container-high px-3 py-1 text-label-sm font-semibold text-on-surface">Đang ẩn</span>}
              </div>
              <p className="mt-1 text-label-md text-on-surface-variant">{reasonSummary(s.byReason)} · gần nhất {date(s.latestAt)}</p>
              <div className="mt-space-sm flex flex-wrap items-center gap-2">
                <Link href={`/learn/${s.videoId}/listen`} className={`${pill} bg-primary font-semibold text-on-primary`}><Icon name="edit" size={18} />Mở bài để sửa lời</Link>
                <button type="button" disabled={busy === s.videoId} onClick={() => void run(s, "dismiss")} className={`${pill} bg-secondary-container text-on-secondary-container`}><Icon name="check" size={18} />Đã xử lý</button>
                <button type="button" disabled={busy === s.videoId} onClick={() => void run(s, s.hidden ? "unhide" : "hide")} className={`${pill} bg-surface-container-high text-on-surface`}>
                  <Icon name={s.hidden ? "visibility" : "visibility_off"} size={18} />{s.hidden ? "Hiện lại" : "Ẩn bài"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
