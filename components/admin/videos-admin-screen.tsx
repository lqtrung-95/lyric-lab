"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import type { AdminLessonSummary } from "@/lib/video/video-repo";
import type { LessonStatus } from "@/lib/video/video-lesson-types";
import { videoThumbnailUrl } from "@/lib/youtube/video-thumbnail";
import { STATUS_LABEL } from "./video-admin-actions";
import { VideoIngestPanel } from "./video-ingest-panel";
import { VideoStatusButtons } from "./video-status-buttons";

type AdminVideo = AdminLessonSummary & { openReportCount?: number };

const BADGE: Record<LessonStatus, string> = {
  draft: "bg-surface-container-high text-on-surface-variant",
  listed: "bg-secondary-container text-on-secondary-container",
  hidden: "bg-error-container text-on-error-container",
};

/** Quản lý video luyện nghe: duyệt bản nháp thành "đang hiện", ẩn hoặc xóa; bấm vào một video để xem bản chép và sửa bản dịch. */
export function VideosAdminScreen() {
  const [videos, setVideos] = useState<AdminVideo[] | null | "error">(null);

  const [reload, setReload] = useState(0);
  const refresh = useCallback(() => setReload((n) => n + 1), []);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/videos", { cache: "no-store" })
      .then(async (r) => (r.ok ? ((await r.json()) as { videos: AdminVideo[] }).videos : Promise.reject(new Error("videos"))))
      // Video đang bị người học báo xếp lên đầu để admin thấy ngay (giữ nguyên thứ tự cũ trong từng nhóm).
      .then((v) => { if (!cancelled) setVideos([...v].sort((a, b) => Number((b.openReportCount ?? 0) > 0) - Number((a.openReportCount ?? 0) > 0))); })
      .catch(() => { if (!cancelled) setVideos("error"); });
    return () => { cancelled = true; };
  }, [reload]);

  const setStatus = (id: string, status: LessonStatus) => setVideos((v) => (Array.isArray(v) ? v.map((x) => (x.videoId === id ? { ...x, status } : x)) : v));
  const remove = (id: string) => setVideos((v) => (Array.isArray(v) ? v.filter((x) => x.videoId !== id) : v));

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-space-md">
      <h1 className="font-serif text-headline-lg-mobile md:text-headline-lg">Quản lý video</h1>
      <p className="text-body-md text-on-surface-variant">Video mới nạp ở trạng thái Nháp. Duyệt thì hiện ở trang Video cho người dùng; ẩn thì giữ dữ liệu nhưng không hiện. Nạp thêm video bằng ô bên dưới.</p>
      <VideoIngestPanel onIngested={refresh} />
      {videos === null ? (
        <p role="status" className="flex items-center gap-2 text-body-md text-on-surface-variant"><Spinner size={18} />Đang tải…</p>
      ) : videos === "error" ? (
        <p role="alert" className="rounded-xl bg-error-container p-3 text-label-md text-on-error-container">Chưa tải được danh sách video.</p>
      ) : videos.length === 0 ? (
        <p className="rounded-2xl bg-surface-container-low p-space-lg text-body-md text-on-surface-variant">Chưa có video nào. Chạy script nạp video trước.</p>
      ) : (
        <ul className="flex flex-col gap-space-sm">
          {videos.map((v) => (
            <li key={v.videoId} className="rounded-2xl bg-surface-container-lowest p-space-md shadow-sm">
              <div className="flex items-start gap-space-sm">
                <Link href={`/admin/videos/${v.videoId}`} tabIndex={-1} aria-hidden className="relative aspect-video w-28 shrink-0 overflow-hidden rounded-lg bg-surface-container-high sm:w-36">
                  <Image src={videoThumbnailUrl(v.videoId, "mqdefault")} alt="" fill sizes="144px" unoptimized className="object-cover" />
                </Link>
                <div className="flex min-w-0 flex-1 flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <Link href={`/admin/videos/${v.videoId}`} className="block truncate text-body-lg font-medium text-primary hover:underline">{v.title}</Link>
                  {(v.openReportCount ?? 0) > 0 && <span className="mt-0.5 inline-block rounded-full bg-error px-2 py-0.5 text-label-sm font-semibold text-on-error">Bị báo {v.openReportCount} lần</span>}
                  <p className="text-label-md text-on-surface-variant">{v.channelTitle} · {Math.max(1, Math.round(v.durationSec / 60))} phút · {v.lineCount} dòng · dịch {v.translatedLineCount}/{v.lineCount}{v.levelAvg !== null && ` · HSK ~${v.levelAvg.toFixed(1)}`}</p>
                </div>
                <span className={`rounded-full px-3 py-0.5 text-label-md font-semibold ${BADGE[v.status]}`}>{STATUS_LABEL[v.status]}</span>
                </div>
              </div>
              <div className="mt-space-sm">
                <VideoStatusButtons videoId={v.videoId} status={v.status} onStatus={(s) => setStatus(v.videoId, s)} onDeleted={() => remove(v.videoId)} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
