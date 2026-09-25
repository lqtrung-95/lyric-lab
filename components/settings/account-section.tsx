"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { linkGoogle, signInGoogleForMerge, signOutAndReset } from "@/lib/auth/account-client";
import { useAccount } from "./use-account";

const btn = "min-h-11 rounded-full px-5 text-label-md font-medium";

/** Tài khoản: ẩn danh (nhắc đăng nhập Google để giữ thẻ) hoặc đã đăng nhập Google. Xử lý cả trường hợp Google đã có tài khoản. */
export function AccountSection() {
  const account = useAccount();
  const link = useSearchParams().get("link");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function run(action: () => Promise<string | null>) {
    setBusy(true);
    setError(await action());
    setBusy(false);
  }

  return (
    <section aria-labelledby="account-heading" className="rounded-2xl bg-surface-container-lowest p-space-md shadow-sm">
      <h2 id="account-heading" className="font-serif text-headline-md text-on-surface">Tài khoản</h2>
      {account === undefined ? (
        <p className="mt-2 text-body-md text-on-surface-variant">Đang tải…</p>
      ) : account && !account.isAnonymous ? (
        <div className="mt-2">
          <p className="text-body-md text-on-surface">Đã đăng nhập bằng Google{account.email ? `: ${account.email}` : ""}. Thẻ ôn của bạn được lưu theo tài khoản này trên mọi thiết bị.</p>
          <button type="button" onClick={() => signOutAndReset()} className={`${btn} mt-space-md bg-surface-container-high text-on-surface hover:bg-surface-container-highest`}>Đăng xuất</button>
        </div>
      ) : (
        <div className="mt-2">
          <p className="text-body-md text-on-surface-variant">
            Bạn đang dùng không cần tài khoản. Nếu xóa dữ liệu trình duyệt hoặc đổi thiết bị, thẻ ôn sẽ mất. Đăng nhập Google để giữ thẻ và dùng trên mọi thiết bị.
          </p>
          {link === "exists" && (
            <div role="status" className="mt-space-md rounded-xl bg-secondary-container/50 p-space-md">
              <p className="text-body-md text-on-secondary-container">Tài khoản Google này đã có dữ liệu trên Lyric Lab. Bạn có thể đăng nhập vào tài khoản đó và gộp dữ liệu đang có ở đây vào.</p>
              <button type="button" disabled={busy} onClick={() => run(signInGoogleForMerge)} className={`${btn} mt-space-sm bg-primary text-on-primary hover:bg-primary-container disabled:opacity-60`}>
                Đăng nhập và gộp dữ liệu
              </button>
            </div>
          )}
          {link === "error" && <p role="alert" className="mt-space-sm text-label-md text-error">Đăng nhập Google chưa thành công. Thử lại nhé.</p>}
          <button type="button" disabled={busy} onClick={() => run(linkGoogle)} className={`${btn} mt-space-md bg-primary text-on-primary hover:bg-primary-container disabled:opacity-60`}>
            Đăng nhập bằng Google
          </button>
        </div>
      )}
      {error && <p role="alert" className="mt-space-sm text-label-md text-error">{error}</p>}
    </section>
  );
}
