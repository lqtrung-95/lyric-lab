"use client";

import { useEffect, useState } from "react";

/** Tài khoản hiện tại có phải quản trị viên không. `undefined` khi đang chờ xác thực (chưa biết, không phải "không phải admin"). */
export function useIsAdmin(): boolean | undefined {
  const [isAdmin, setIsAdmin] = useState<boolean | undefined>(undefined);
  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/whoami")
      .then((r) => (r.ok ? r.json() : { isAdmin: false }))
      .then((d: { isAdmin?: boolean }) => { if (!cancelled) setIsAdmin(Boolean(d.isAdmin)); })
      .catch(() => { if (!cancelled) setIsAdmin(false); });
    return () => { cancelled = true; };
  }, []);
  return isAdmin;
}
