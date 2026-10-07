"use client";

import Link from "next/link";
import { useState } from "react";

/** Nút xác nhận hủy nhận email tổng kết tuần và nhắc quay lại (bật lại được ở Cài đặt). */
export function UnsubscribeForm({ token }: { token: string }) {
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");

  async function submit() {
    setState("sending");
    const res = await fetch(`/api/email/unsubscribe?token=${encodeURIComponent(token)}`, { method: "POST" }).catch(() => null);
    setState(res?.ok ? "done" : "error");
  }

  if (state === "done") {
    return (
      <>
        <p role="status" className="text-body-md text-on-surface-variant">Đã hủy. Bạn sẽ không nhận email tổng kết tuần và nhắc học nữa. Có thể bật lại ở Cài đặt khi đăng nhập.</p>
        <Link href="/app" className="inline-flex min-h-11 items-center rounded-full bg-primary px-6 text-label-md font-semibold text-on-primary">Về SongHanzi</Link>
      </>
    );
  }
  return (
    <>
      <p className="text-body-md text-on-surface-variant">Bạn sẽ không nhận email tổng kết tuần và nhắc học từ SongHanzi nữa.</p>
      <button type="button" disabled={state === "sending"} onClick={() => void submit()} className="min-h-12 rounded-full bg-primary px-8 text-label-md font-semibold text-on-primary disabled:opacity-60">Hủy nhận email</button>
      {state === "error" && <p role="alert" className="text-label-md text-error">Link không hợp lệ hoặc có lỗi. Hãy thử lại từ email mới nhất.</p>}
    </>
  );
}
