"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { ensureAnonymousSession } from "@/lib/auth/ensure-anonymous-session";
import { SONG_REPORT_LABELS, SONG_REPORT_REASONS, type SongReportReason } from "@/lib/analysis/song-report-reasons";

/** "Báo bài này sai": mở danh sách lý do, gửi tới /api/reports/song. Giúp gỡ bài lỗi khỏi tab Khám phá. */
/** `prominent`: nút viền có biểu tượng (màn nghe, nơi người dùng nhận ra bài sai); mặc định là liên kết chữ nhỏ (màn xem trước). */
export function ReportSongButton({ videoId, prominent = false }: { videoId: string; prominent?: boolean }) {
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
    <div className="relative">
      <button type="button" aria-expanded={open} onClick={() => setOpen((o) => !o)} className={prominent ? "inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-label-md font-medium text-on-surface ring-1 ring-outline hover:bg-surface-container" : "inline-flex min-h-11 items-center text-label-md text-on-surface-variant underline decoration-outline-variant underline-offset-4 hover:text-on-surface"}>
        {prominent && <Icon name="warning" size={18} />}
        {prominent ? "Lời hoặc bài hát không đúng? Báo lỗi" : "Báo bài này sai"}
      </button>
      {/* Danh sách lý do nổi lên trên nội dung (absolute) để mở ra không đẩy cao khối và làm ảnh bìa bị dịch chỗ. */}
      {open && (
        <fieldset className="absolute left-0 top-full z-20 mt-1 flex w-max max-w-[calc(100vw-2rem)] flex-wrap gap-2 rounded-2xl bg-surface-container-lowest p-2 shadow-lg ring-1 ring-outline-variant" disabled={status === "sending"}>
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
