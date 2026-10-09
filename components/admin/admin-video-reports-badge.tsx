"use client";

import { useEffect, useState } from "react";
import { useIsAdmin } from "@/components/library/use-is-admin";

/** Huy hiệu số video đang bị người học báo (chỉ admin, chỉ khi có), đặt cạnh mục "Quản lý video" để admin thấy ngay có việc cần xử lý. */
export function AdminVideoReportsBadge() {
  const isAdmin = useIsAdmin();
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (isAdmin !== true) return;
    let cancelled = false;
    fetch("/api/admin/video-reports", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { videos: 0 }))
      .then((d: { videos?: number }) => { if (!cancelled) setCount(d.videos ?? 0); })
      .catch(() => { if (!cancelled) setCount(0); });
    return () => { cancelled = true; };
  }, [isAdmin]);
  if (count <= 0) return null;
  return <span aria-label={`${count} video đang bị báo`} className="inline-flex min-w-6 items-center justify-center rounded-full bg-error px-2 text-label-sm font-semibold text-on-error">{count}</span>;
}
