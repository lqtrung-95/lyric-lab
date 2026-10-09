"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { ensureAnonymousSession } from "@/lib/auth/ensure-anonymous-session";
import { VIDEO_REPORT_LABELS, VIDEO_REPORT_REASONS, type VideoReportReason } from "@/lib/video/video-report-reasons";

const ERRORS: Record<string, string> = {
  user_limit: "Hôm nay bạn đã báo nhiều rồi, mai báo tiếp nhé.",
  not_found: "Video này không còn trong thư viện.",
};

/**
 * "Báo video sai": mở danh sách lý do (phụ đề sai/lệch, bản dịch sai nhiều, không phải tiếng Trung, nội dung không phù hợp) rồi gửi tới
 * /api/videos/[videoId]/report. Đủ người báo thì video do người dùng thêm tự ẩn chờ admin xem.
 */
export function ReportVideoButton({ videoId }: { videoId: string }) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Bấm ra ngoài hoặc nhấn Esc thì đóng danh sách.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => { if (!wrapRef.current?.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("pointerdown", onDown); document.removeEventListener("keydown", onKey); };
  }, [open]);

  async function send(reason: VideoReportReason) {
    setStatus("sending");
    setError(null);
    const post = () => fetch(`/api/videos/${videoId}/report`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ reason }) });
    try {
      await ensureAnonymousSession();
      let res = await post();
      if (res.status === 401 && (await ensureAnonymousSession())) res = await post();
      if (res.ok) { setStatus("sent"); setOpen(false); return; }
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setError(ERRORS[data.error ?? ""] ?? "Chưa gửi được, thử lại nhé.");
    } catch {
      setError("Chưa gửi được, thử lại nhé.");
    }
    setStatus("idle");
  }

  if (status === "sent") return <p role="status" className="inline-flex min-h-11 items-center text-label-md text-on-surface-variant">Cảm ơn bạn đã báo. Mình sẽ kiểm tra video này.</p>;
  return (
    <div ref={wrapRef} className="relative">
      <button type="button" aria-expanded={open} aria-label="Báo video sai" title="Báo video sai" onClick={() => setOpen((o) => !o)} className="inline-flex min-h-11 items-center gap-1.5 rounded-full px-2.5 text-label-sm font-medium text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface">
        <Icon name="flag" size={16} /><span className="hidden 2xl:inline">Báo video sai</span>
      </button>
      {open && (
        <fieldset className="absolute right-0 top-full z-30 mt-1 flex w-max max-w-[calc(100vw-2rem)] flex-col gap-1.5 rounded-2xl bg-surface-container-lowest p-2 shadow-lg ring-1 ring-outline-variant" disabled={status === "sending"}>
          <legend className="sr-only">Lý do báo video sai</legend>
          {VIDEO_REPORT_REASONS.map((r) => (
            <button key={r} type="button" onClick={() => void send(r)} className="min-h-11 rounded-full bg-surface-container px-4 text-left text-label-md text-on-surface hover:bg-surface-container-high disabled:opacity-60">{VIDEO_REPORT_LABELS[r]}</button>
          ))}
        </fieldset>
      )}
      {error && <p role="alert" className="absolute right-0 top-full mt-1 w-max max-w-[calc(100vw-2rem)] rounded-lg bg-error-container px-3 py-1 text-label-sm text-on-error-container">{error}</p>}
    </div>
  );
}
