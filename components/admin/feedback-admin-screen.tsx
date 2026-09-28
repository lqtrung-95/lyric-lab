"use client";

import { useCallback, useEffect, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { Spinner } from "@/components/ui/spinner";
import { FEEDBACK_CATEGORY_LABELS, type FeedbackCategory } from "@/lib/feedback/feedback-schema";

interface FeedbackItem { id: number; category: FeedbackCategory; message: string; pageUrl: string | null; createdAt: string }

/** Duyệt góp ý để hiện ở trang /feedback công khai. Chỉ quản trị viên thấy được gì (bọc ngoài bằng AdminGate). */
export function FeedbackAdminScreen() {
  const [items, setItems] = useState<FeedbackItem[] | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    fetch("/api/admin/feedback")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d: { items: FeedbackItem[] }) => setItems(d.items))
      .catch(() => setItems([]));
  }, []);

  useEffect(() => { load(); }, [load]);

  async function review(id: number, action: "approve" | "reject") {
    setBusyId(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/feedback/${id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action }),
      });
      if (!res.ok) { setError("Chưa xử lý được, thử lại nhé."); return; }
      setItems((prev) => (prev ?? []).filter((i) => i.id !== id));
    } catch {
      setError("Chưa xử lý được, thử lại nhé.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-space-md">
      <h1 className="font-serif text-headline-lg-mobile md:text-headline-lg">Duyệt góp ý</h1>
      <p className="text-body-md text-on-surface-variant">Duyệt thì góp ý hiện công khai ở trang /feedback; từ chối thì vẫn giữ lại, chỉ không hiện.</p>

      {error && <p role="alert" className="rounded-xl bg-error-container p-3 text-label-md text-on-error-container">{error}</p>}

      {items === null ? (
        <p role="status" className="flex items-center gap-2 text-body-md text-on-surface-variant"><Spinner size={18} />Đang tải…</p>
      ) : items.length === 0 ? (
        <p className="rounded-2xl bg-surface-container-low p-space-lg text-body-md text-on-surface-variant">Không còn góp ý nào đang chờ.</p>
      ) : (
        <ul className="flex flex-col gap-space-sm">
          {items.map((f) => (
            <li key={f.id} className="rounded-2xl bg-surface-container-lowest p-space-md shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-label-sm font-medium text-secondary">{FEEDBACK_CATEGORY_LABELS[f.category]}</span>
                <span className="text-label-sm text-on-surface-variant">{f.pageUrl ?? "—"}</span>
              </div>
              <p className="mt-2 text-body-md text-on-surface">{f.message}</p>
              <div className="mt-space-sm flex items-center gap-2">
                <button
                  type="button" disabled={busyId === f.id} onClick={() => void review(f.id, "approve")}
                  className="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-primary px-4 text-label-md font-semibold text-on-primary disabled:opacity-60"
                >
                  <Icon name="check" size={18} />Duyệt, hiện công khai
                </button>
                <button
                  type="button" disabled={busyId === f.id} onClick={() => void review(f.id, "reject")}
                  className="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-surface-container-high px-4 text-label-md font-medium text-on-surface disabled:opacity-60"
                >
                  <Icon name="close" size={18} />Không hiện
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
