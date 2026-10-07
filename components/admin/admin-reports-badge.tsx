"use client";

import { useIsAdmin } from "@/components/library/use-is-admin";
import { useSongReports } from "./use-song-reports";

/** Huy hiệu số bài đang bị báo sai (chỉ admin, chỉ khi có). Nằm cạnh "Quản trị" để admin thấy ngay có việc cần xử lý. */
export function AdminReportsBadge() {
  const isAdmin = useIsAdmin();
  const { items } = useSongReports(isAdmin === true);
  if (!items?.length) return null;
  return <span aria-label={`${items.length} bài đang bị báo sai`} className="inline-flex min-w-6 items-center justify-center rounded-full bg-error px-2 text-label-sm font-semibold text-on-error">{items.length}</span>;
}
