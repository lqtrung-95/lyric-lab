"use client";

import { useEffect, useState } from "react";

/** Người xem đã đăng nhập Google chưa (nhắn tin cần tài khoản): undefined = đang tải. Hỏi server (`/api/chat/me`) để khớp đúng với quyền thật khi gửi. */
export function useChatAccount(): boolean | undefined {
  const [registered, setRegistered] = useState<boolean | undefined>(undefined);
  useEffect(() => {
    let cancelled = false;
    fetch("/api/chat/me", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { registered: false }))
      .then((d: { registered: boolean }) => { if (!cancelled) setRegistered(d.registered); })
      .catch(() => { if (!cancelled) setRegistered(false); });
    return () => { cancelled = true; };
  }, []);
  return registered;
}
