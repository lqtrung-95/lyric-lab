"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { Spinner } from "@/components/ui/spinner";
import { SKIP_LABEL, type QueueStatus } from "@/lib/video/ingest-queue";
import { useVideoIngest } from "./use-video-ingest";

function StatusText({ status }: { status: QueueStatus }) {
  switch (status.state) {
    case "waiting": return <span className="text-on-surface-variant">Chờ</span>;
    case "running": return <span className="flex items-center gap-1 text-primary"><Spinner size={14} />{status.note ?? "Đang nạp…"}</span>;
    case "done": return <span className="flex items-center gap-1 text-secondary"><Icon name="check_circle" filled size={16} />{status.lineCount} dòng, dịch {status.translatedLineCount}/{status.lineCount}</span>;
    case "skipped": return <span className="text-on-surface-variant">Bỏ qua: {SKIP_LABEL[status.reason]}</span>;
    case "failed": return <span className="text-error">{status.blocked ? "YouTube đang chặn tạm" : "Lỗi"}</span>;
  }
}

/**
 * Nạp video từ một kênh YouTube ngay trên trang quản trị: tìm video, rồi nạp lần lượt (chạy trên server nên không vướng việc YouTube chặn IP
 * máy bạn). Video mới vào ở trạng thái Nháp, duyệt ở danh sách bên dưới. Chỉ nhận video nhúng được có phụ đề tiếng Trung do người làm.
 */
export function VideoIngestPanel({ onIngested }: { onIngested: () => void }) {
  const [handle, setHandle] = useState("");
  const [owned, setOwned] = useState(false);
  const ingest = useVideoIngest(onIngested);
  const { summary, items } = ingest;
  const hasFailed = summary.failed > 0;

  return (
    <section aria-labelledby="ingest-heading" className="rounded-2xl bg-surface-container-lowest p-space-md shadow-sm">
      <h2 id="ingest-heading" className="font-serif text-headline-md text-on-surface">Nạp video từ kênh YouTube</h2>
      <p className="mt-1 text-body-md text-on-surface-variant">Nhập tên kênh rồi bấm tìm. Chỉ nạp video nhúng được và có phụ đề tiếng Trung do người làm; video mới vào ở trạng thái Nháp.</p>
      <form onSubmit={(e) => { e.preventDefault(); void ingest.find(handle); }} className="mt-space-sm flex flex-wrap items-center gap-2">
        <label className="min-w-0 flex-1">
          <span className="sr-only">Tên kênh YouTube</span>
          <input value={handle} onChange={(e) => setHandle(e.target.value)} placeholder="@ChineseGlow" autoComplete="off" disabled={ingest.running}
            className="min-h-11 w-full min-w-48 rounded-full bg-surface-container-high px-4 text-body-md text-on-surface outline-none ring-2 ring-transparent focus:ring-primary" />
        </label>
        <button type="submit" disabled={ingest.finding || ingest.running || handle.trim() === ""} className="min-h-11 rounded-full bg-surface-container-high px-5 text-label-md font-semibold text-on-surface disabled:opacity-50">
          {ingest.finding ? "Đang tìm…" : "Tìm video"}
        </button>
      </form>
      <label className="mt-1 inline-flex min-h-11 items-center gap-2 text-label-md text-on-surface">
        <input type="checkbox" checked={owned} onChange={(e) => setOwned(e.target.checked)} className="h-5 w-5 accent-primary" />
        Đây là kênh của tôi
      </label>

      {ingest.message && <p role="alert" className="mt-1 rounded-xl bg-error-container p-3 text-label-md text-on-error-container">{ingest.message}</p>}

      {ingest.plan && (
        <div className="mt-space-sm">
          <p className="text-label-md text-on-surface-variant">
            {ingest.plan.channel.title}: {ingest.plan.videos.length} video gần đây, {ingest.plan.videos.filter((v) => v.exists).length} đã có, {items.length} có thể nạp.
          </p>
          {items.length > 0 && (
            <div className="mt-1 flex flex-wrap items-center gap-2">
              {summary.waiting > 0 && !ingest.running && (
                <button type="button" onClick={() => void ingest.run(owned)} className="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-primary px-5 text-label-md font-semibold text-on-primary hover:bg-primary-container">
                  <Icon name="add" size={18} />Nạp {summary.waiting} video
                </button>
              )}
              {hasFailed && !ingest.running && (
                <button type="button" onClick={() => void ingest.run(owned, true)} className="inline-flex min-h-11 items-center rounded-full bg-surface-container-high px-5 text-label-md font-semibold text-on-surface">Thử lại video lỗi</button>
              )}
              {ingest.running && (
                <button type="button" onClick={ingest.stop} className="inline-flex min-h-11 items-center rounded-full bg-surface-container-high px-5 text-label-md font-semibold text-on-surface">Dừng sau video này</button>
              )}
              <span role="status" className="text-label-md text-on-surface-variant">Xong {summary.done} · bỏ qua {summary.skipped} · lỗi {summary.failed} · còn {summary.waiting}</span>
            </div>
          )}
          <ul className="mt-space-sm divide-y divide-outline-variant">
            {items.map((i) => (
              <li key={i.video.videoId} className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 py-2 text-label-md">
                <span lang="zh" className="min-w-0 flex-1 truncate text-on-surface">{i.video.title} <span className="text-on-surface-variant">({Math.max(1, Math.round(i.video.durationSec / 60))} phút)</span></span>
                <StatusText status={i.status} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
