"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import type { LessonStatus } from "@/lib/video/video-lesson-types";
import { patchVideo } from "./video-admin-actions";

const btn = "inline-flex min-h-11 items-center gap-1.5 rounded-full px-4 text-label-md font-medium disabled:opacity-60";

/** Nút duyệt/ẩn/xóa một video luyện nghe. Xóa cần xác nhận hai bước vì không hoàn tác được. */
export function VideoStatusButtons({ videoId, status, onStatus, onDeleted }: { videoId: string; status: LessonStatus; onStatus: (s: LessonStatus) => void; onDeleted: () => void }) {
  const [busy, setBusy] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState(false);

  async function run(body: Record<string, unknown>, after: () => void) {
    setBusy(true);
    setError(false);
    const ok = await patchVideo(videoId, body);
    setBusy(false);
    if (ok) after(); else setError(true);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {status !== "listed" && (
        <button type="button" disabled={busy} onClick={() => void run({ action: "list" }, () => onStatus("listed"))} className={`${btn} bg-primary font-semibold text-on-primary`}>
          <Icon name="check" size={18} />Duyệt, hiện công khai
        </button>
      )}
      {status === "listed" && (
        <button type="button" disabled={busy} onClick={() => void run({ action: "hide" }, () => onStatus("hidden"))} className={`${btn} bg-surface-container-high text-on-surface`}>
          <Icon name="visibility_off" size={18} />Ẩn
        </button>
      )}
      {confirming ? (
        <span role="alertdialog" aria-label="Xác nhận xóa video" className="inline-flex items-center gap-2 rounded-full bg-error-container px-3 py-1 text-label-md text-on-error-container">
          Xóa vĩnh viễn?
          <button type="button" disabled={busy} onClick={() => void run({ action: "delete" }, onDeleted)} className="min-h-11 rounded-full bg-error px-4 font-semibold text-on-error">Xóa</button>
          <button type="button" disabled={busy} onClick={() => setConfirming(false)} className="min-h-11 rounded-full px-3 font-medium">Giữ lại</button>
        </span>
      ) : (
        <button type="button" disabled={busy} onClick={() => setConfirming(true)} className={`${btn} text-error hover:bg-error-container`}>Xóa</button>
      )}
      {error && <span role="alert" className="text-label-md text-error">Chưa xử lý được, thử lại nhé.</span>}
    </div>
  );
}
