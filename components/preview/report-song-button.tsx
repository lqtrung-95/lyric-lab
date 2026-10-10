"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { ensureAnonymousSession } from "@/lib/auth/ensure-anonymous-session";
import { SONG_REPORT_LABELS, SONG_REPORT_REASONS, type SongReportReason } from "@/lib/analysis/song-report-reasons";

/** "Báo bài này sai": mở danh sách lý do, gửi tới /api/reports/song. Giúp gỡ bài lỗi khỏi tab Khám phá. */
/** `bar`: nút gọn (cờ + chữ khi đủ rộng) đặt ở thanh tiêu đề dính của màn nghe, danh sách lý do mở lệch phải để không tràn màn hình. */
/** `prominent`: nút viền có biểu tượng (màn nghe, nơi người dùng nhận ra bài sai); mặc định là liên kết chữ nhỏ (màn xem trước). */
export function ReportSongButton({ videoId, prominent = false, bar = false }: { videoId: string; prominent?: boolean; bar?: boolean }) {
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
      {bar ? (
        <button type="button" aria-expanded={open} aria-label="Báo bài này sai" title="Báo bài này sai" onClick={() => setOpen((o) => !o)} className="inline-flex min-h-11 min-w-11 items-center justify-center gap-1.5 rounded-full px-2.5 text-label-sm font-medium text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface">
          <Icon name="flag" size={16} /><span className="hidden 2xl:inline">Báo bài sai</span>
        </button>
      ) : (
      <button type="button" aria-expanded={open} onClick={() => setOpen((o) => !o)} className={prominent ? "inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-label-md font-medium text-on-surface ring-1 ring-outline hover:bg-surface-container" : "inline-flex min-h-11 items-center text-label-md text-on-surface-variant underline decoration-outline-variant underline-offset-4 hover:text-on-surface"}>
        {prominent && <Icon name="warning" size={18} />}
        {prominent ? "Lời hoặc bài hát không đúng? Báo lỗi" : "Báo bài này sai"}
      </button>
      )}
      {/* Danh sách lý do nổi lên trên nội dung (absolute) để mở ra không đẩy cao khối và làm ảnh bìa bị dịch chỗ. */}
      {open && (
        <fieldset className={`absolute top-full z-30 mt-1 flex w-max max-w-[calc(100vw-2rem)] flex-wrap gap-2 rounded-2xl bg-surface-container-lowest p-2 shadow-lg ring-1 ring-outline-variant ${bar ? "right-0" : "left-0"}`} disabled={status === "sending"}>
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
