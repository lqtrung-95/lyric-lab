"use client";

import { useState } from "react";
import { signOutAndReset } from "@/lib/auth/account-client";

/** Xóa toàn bộ dữ liệu (AC-04): xác nhận hai bước, xóa tài khoản trên server rồi đưa về trang chủ như người mới. */
export function DeleteDataSection() {
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  async function remove() {
    setBusy(true);
    setFailed(false);
    try {
      const res = await fetch("/api/account/delete", { method: "POST" });
      if (!res.ok) throw new Error();
      await signOutAndReset();
    } catch {
      setFailed(true);
      setBusy(false);
    }
  }

  return (
    <section aria-labelledby="delete-heading" className="rounded-2xl bg-surface-container-lowest p-space-md shadow-sm">
      <h2 id="delete-heading" className="font-serif text-headline-md text-on-surface">Xóa dữ liệu</h2>
      <p className="mt-1 text-body-md text-on-surface-variant">
        Xóa tài khoản cùng toàn bộ thẻ ôn, từ đã biết, nhật ký ôn và thiết lập. Việc này không hoàn tác được.
      </p>
      {!confirming ? (
        <button type="button" onClick={() => setConfirming(true)}
          className="mt-space-md min-h-11 rounded-full px-5 text-label-md font-medium text-error hover:bg-error-container/40">
          Xóa toàn bộ dữ liệu của tôi
        </button>
      ) : (
        <div role="alertdialog" aria-label="Xác nhận xóa dữ liệu" className="mt-space-md rounded-xl bg-error-container/40 p-space-md">
          <p className="text-body-md font-medium text-on-error-container">Bạn chắc chắn muốn xóa toàn bộ dữ liệu?</p>
          <div className="mt-space-sm flex flex-wrap gap-space-sm">
            <button type="button" disabled={busy} onClick={remove}
              className="min-h-11 rounded-full bg-error px-5 text-label-md font-medium text-on-error disabled:opacity-60">
              {busy ? "Đang xóa…" : "Xóa vĩnh viễn"}
            </button>
            <button type="button" disabled={busy} onClick={() => setConfirming(false)}
              className="min-h-11 rounded-full px-5 text-label-md font-medium text-on-surface hover:bg-surface-container-high">
              Giữ lại
            </button>
          </div>
          {failed && <p role="alert" className="mt-space-sm text-label-md text-error">Chưa xóa được. Thử lại sau ít phút nhé.</p>}
        </div>
      )}
    </section>
  );
}
