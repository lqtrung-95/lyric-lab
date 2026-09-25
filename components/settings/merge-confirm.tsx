"use client";

import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import { MERGE_TOKEN_KEY } from "@/lib/auth/account-client";

interface Preview { knownTerms: number; cards: number; reviews: number }
type Fetched = { kind: "ready"; preview: Preview } | { kind: "none" } | { kind: "error" } | { kind: "merging" };

const post = (body: object) => fetch("/api/account/merge", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

const noop = () => () => {};
function readToken(): string | null {
  try {
    return localStorage.getItem(MERGE_TOKEN_KEY);
  } catch {
    return null; // Không đọc được: coi như không có dữ liệu để gộp.
  }
}

/** Màn xác nhận gộp dữ liệu ẩn danh vào tài khoản Google đã có, sau khi đăng nhập Google xong. */
export function MergeConfirm() {
  // undefined khi render trên server: chưa biết có mã hay không.
  const token = useSyncExternalStore(noop, readToken, () => undefined);
  const [fetched, setFetched] = useState<Fetched | null>(null);
  const state: { kind: "loading" } | Fetched = token === null ? { kind: "none" } : (fetched ?? { kind: "loading" });

  useEffect(() => {
    if (!token) return;
    post({ token }).then(async (res) => {
      if (res.ok) return setFetched({ kind: "ready", preview: await res.json() });
      setFetched({ kind: res.status === 400 || res.status === 409 ? "none" : "error" });
    }, () => setFetched({ kind: "error" }));
  }, [token]);

  async function confirm() {
    setFetched({ kind: "merging" });
    const res = await post({ token, confirm: true }).catch(() => null);
    if (!res?.ok) return setFetched({ kind: "error" });
    localStorage.removeItem(MERGE_TOKEN_KEY);
    // Tải lại toàn trang để trạng thái học được nạp lại từ tài khoản đã gộp.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.assign("/settings");
  }

  const wrap = "mx-auto mt-space-lg max-w-xl rounded-2xl bg-surface-container-low p-space-lg text-center";
  if (state.kind === "loading" || state.kind === "merging") {
    return <p role="status" className="py-space-xl text-center text-body-md text-on-surface-variant">{state.kind === "loading" ? "Đang kiểm tra dữ liệu…" : "Đang gộp dữ liệu…"}</p>;
  }
  if (state.kind === "none") {
    return (
      <div className={wrap}>
        <h1 className="font-serif text-headline-md text-on-surface">Không có dữ liệu cần gộp</h1>
        <p className="mt-space-sm text-body-md text-on-surface-variant">Bạn đã đăng nhập vào tài khoản Google của mình.</p>
        <Link href="/" className="mt-space-md inline-flex min-h-11 items-center rounded-full bg-primary px-6 text-label-md font-medium text-on-primary">Về trang chủ</Link>
      </div>
    );
  }
  if (state.kind === "error") return <div role="alert" className={wrap}><h1 className="font-serif text-headline-md text-on-surface">Chưa gộp được dữ liệu</h1><p className="mt-space-sm text-body-md text-on-surface-variant">Thử tải lại trang sau ít phút. Dữ liệu ẩn danh của bạn vẫn còn nguyên.</p></div>;

  const { knownTerms, cards, reviews } = state.preview;
  return (
    <div className={wrap}>
      <h1 className="font-serif text-headline-md text-on-surface">Gộp dữ liệu vào tài khoản Google?</h1>
      <p className="mt-space-sm text-body-md text-on-surface-variant">
        Sẽ gộp <strong>{cards}</strong> thẻ ôn, <strong>{knownTerms}</strong> từ đã biết và <strong>{reviews}</strong> lượt ôn vào tài khoản của bạn.
        Thẻ trùng giữ bản bạn đã ôn nhiều hơn; thiết lập của tài khoản Google được giữ nguyên.
      </p>
      <div className="mt-space-md flex flex-wrap justify-center gap-space-sm">
        <button type="button" onClick={confirm} className="min-h-11 rounded-full bg-primary px-6 text-label-md font-medium text-on-primary hover:bg-primary-container">Gộp dữ liệu</button>
        <Link href="/" className="inline-flex min-h-11 items-center rounded-full px-6 text-label-md font-medium text-on-surface hover:bg-surface-container-high">Bỏ qua</Link>
      </div>
    </div>
  );
}
