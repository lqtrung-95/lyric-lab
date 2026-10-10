"use client";

import Link from "next/link";
import { useState } from "react";
import { useIsAdmin } from "@/components/library/use-is-admin";
import { Icon } from "@/components/ui/icon";
import { reasonSummary } from "./song-report-summary";
import { useSongReports } from "./use-song-reports";

/**
 * Dải cảnh báo CHỈ cho quản trị viên ở trang bài hát: bài này đang bị người dùng báo sai (kèm lý do và số người), lối tới sửa lời và danh sách báo cáo.
 * Không hiện với người dùng thường và không hiện khi bài không có báo cáo. "Đã xử lý" xóa báo cáo của bài.
 */
export function SongReportBanner({ videoId }: { videoId: string }) {
  const isAdmin = useIsAdmin();
  const { items, reload } = useSongReports(isAdmin === true, videoId);
  const [busy, setBusy] = useState(false);
  const report = items?.[0];
  if (isAdmin !== true || !report) return null;

  async function dismiss() {
    setBusy(true);
    await fetch(`/api/admin/song-reports/${videoId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "dismiss" }) }).catch(() => null);
    setBusy(false);
    reload();
  }

  return (
    <div role="status" className="mx-auto mt-space-sm flex max-w-page flex-wrap items-center gap-3 rounded-2xl bg-error-container px-space-md py-3 text-on-error-container">
      <Icon name="warning" size={22} />
      <p className="min-w-0 flex-1 text-label-md">
        <strong className="font-semibold">Bài này đang bị báo sai ({report.total} báo cáo{report.hidden ? ", đang ẩn" : ""}):</strong> {reasonSummary(report.byReason)}. Sửa lời bằng nút bút chì ở từng dòng trong màn Nghe.
      </p>
      <Link href="/admin/reports" className="inline-flex min-h-11 items-center rounded-full px-4 text-label-md font-medium underline underline-offset-4">Tất cả báo cáo</Link>
      <button type="button" disabled={busy} onClick={() => void dismiss()} className="inline-flex min-h-11 items-center rounded-full bg-on-error-container px-4 text-label-md font-semibold text-error-container disabled:opacity-60">Đã xử lý</button>
    </div>
  );
}
