"use client";

import { useState } from "react";
import { ensureAnonymousSession } from "@/lib/auth/ensure-anonymous-session";
import { SONG_REPORT_LABELS, SONG_REPORT_REASONS, type SongReportReason } from "@/lib/analysis/song-report-reasons";

/** "Báo bài này sai": mở danh sách lý do, gửi tới /api/reports/song. Giúp gỡ bài lỗi khỏi tab Khám phá. */
export function ReportSongButton({ videoId }: { videoId: string }) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function send(reason: SongReportReason) {
    setStatus("sending");
    try {
      if (!(await ensureAnonymousSession())) throw new Error("no session");
      const res = await fetch("/api/reports/song", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ videoId, reason }) });
      setStatus(res.ok ? "sent" : "error");
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") return <p role="status" className="text-label-md text-on-surface-variant">Cảm ơn bạn đã báo. Mình sẽ kiểm tra bài này.</p>;
  return (
    <div>
      <button type="button" aria-expanded={open} onClick={() => setOpen((o) => !o)} className="inline-flex min-h-11 items-center text-label-md text-on-surface-variant underline decoration-outline-variant underline-offset-4 hover:text-on-surface">
        Báo bài này sai
      </button>
      {open && (
        <fieldset className="mt-1 flex flex-wrap gap-2" disabled={status === "sending"}>
          <legend className="sr-only">Lý do báo bài sai</legend>
          {SONG_REPORT_REASONS.map((r) => (
            <button key={r} type="button" onClick={() => void send(r)} className="min-h-11 rounded-full bg-surface-container px-4 text-label-md text-on-surface hover:bg-surface-container-high disabled:opacity-60">{SONG_REPORT_LABELS[r]}</button>
          ))}
        </fieldset>
      )}
      {status === "error" && <p role="alert" className="text-label-sm text-error">Chưa gửi được, thử lại nhé.</p>}
    </div>
  );
}
