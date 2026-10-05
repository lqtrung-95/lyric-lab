"use client";

import { useCallback, useEffect, useState } from "react";
import { ensureAnonymousSession } from "@/lib/auth/ensure-anonymous-session";

export interface NicknameState {
  /** undefined = đang tải; null = chưa đặt biệt danh. */
  nickname: string | null | undefined;
  optedIn: boolean;
  /** Lưu biệt danh (không tự tham gia bảng xếp hạng). Trả mã lỗi hoặc null nếu thành công. */
  save: (nickname: string) => Promise<string | null>;
}

/**
 * Biệt danh của tài khoản: MỘT giá trị dùng chung cho phòng thi đấu và bảng xếp hạng (đặt ở Cài đặt, hoặc ngay lúc cần ở phòng thi đấu).
 * Lưu qua `/api/leaderboard/profile`; tạo phiên ẩn danh nếu người dùng chưa có.
 */
export function useNickname(): NicknameState {
  const [state, setState] = useState<{ nickname: string | null | undefined; optedIn: boolean }>({ nickname: undefined, optedIn: false });
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/leaderboard/profile", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { profile: null }))
      .then((d: { profile: { nickname: string; optedIn: boolean } | null }) => {
        if (!cancelled) setState({ nickname: d.profile?.nickname ?? null, optedIn: d.profile?.optedIn ?? false });
      })
      .catch(() => { if (!cancelled) setState({ nickname: null, optedIn: false }); });
    return () => { cancelled = true; };
  }, [reload]);

  const save = useCallback(async (nickname: string): Promise<string | null> => {
    if (!(await ensureAnonymousSession())) return "network";
    const res = await fetch("/api/leaderboard/profile", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ nickname }) }).catch(() => null);
    if (!res) return "network";
    if (!res.ok) return ((await res.json().catch(() => ({}))) as { error?: string }).error ?? "server_error";
    setReload((n) => n + 1);
    return null;
  }, []);

  return { ...state, save };
}
