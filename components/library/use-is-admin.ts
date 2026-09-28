"use client";

import { useEffect, useState } from "react";

/** Tài khoản hiện tại có phải quản trị viên không (ẩn/xóa bài ở Khám phá). false khi đang tải hoặc lỗi. */
export function useIsAdmin(): boolean {
  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/whoami")
      .then((r) => (r.ok ? r.json() : { isAdmin: false }))
      .then((d: { isAdmin?: boolean }) => { if (!cancelled) setIsAdmin(Boolean(d.isAdmin)); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);
  return isAdmin;
}
