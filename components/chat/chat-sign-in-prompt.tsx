"use client";

import { useState } from "react";
import { signInGoogle } from "@/lib/auth/account-client";

/** Thay ô soạn tin cho người chưa đăng nhập Google: đọc chat thoải mái, muốn nhắn thì đăng nhập (dữ liệu học đang có được gộp vào tài khoản Google). */
export function ChatSignInPrompt() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function signIn() {
    setBusy(true);
    setError(await signInGoogle());
    setBusy(false);
  }
  return (
    <div className="rounded-2xl bg-surface-container-low p-space-md">
      <p className="text-body-md text-on-surface">Bạn xem được mọi tin mà không cần tài khoản. Muốn nhắn tin trong cộng đồng, hãy đăng nhập Google (thẻ ôn và tiến độ học của bạn được giữ nguyên).</p>
      <button type="button" disabled={busy} onClick={() => void signIn()} className="mt-space-sm inline-flex min-h-11 items-center rounded-full bg-primary px-5 text-label-md font-semibold text-on-primary hover:brightness-110 disabled:opacity-60">
        {busy ? "Đang chuyển sang Google…" : "Đăng nhập bằng Google để nhắn tin"}
      </button>
      {error && <p role="alert" className="mt-2 text-label-md text-error">{error}</p>}
    </div>
  );
}
