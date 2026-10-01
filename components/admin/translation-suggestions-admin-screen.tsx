"use client";

import { useCallback, useEffect, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { Spinner } from "@/components/ui/spinner";

interface Suggestion {
  id: number;
  videoId: string;
  songTitle: string;
  lineIndex: number;
  currentTranslation: string;
  suggestedTranslation: string;
  createdAt: string;
  /** Số câu khác trong cùng bài có nguyên văn Hán tự giống hệt câu này (điệp khúc lặp lại). */
  matchingLineCount: number;
}

/** Chỉ quản trị viên thấy được gì (whoami server xác thực thật; client chỉ ẩn/hiện giao diện). */
export function TranslationSuggestionsAdminScreen() {
  const [items, setItems] = useState<Suggestion[] | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [applyAllIds, setApplyAllIds] = useState<Set<number>>(new Set());

  const load = useCallback(() => {
    fetch("/api/admin/translation-suggestions")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d: { items: Suggestion[] }) => setItems(d.items))
      .catch(() => setItems([]));
  }, []);

  useEffect(() => { load(); }, [load]);

  async function review(id: number, action: "apply" | "dismiss") {
    setBusyId(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/translation-suggestions/${id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, applyToMatchingLines: action === "apply" && applyAllIds.has(id) }),
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
      <h1 className="font-serif text-headline-lg-mobile md:text-headline-lg">Duyệt góp ý bản dịch</h1>
      <p className="text-body-md text-on-surface-variant">Người học đề xuất bản dịch tự nhiên hơn cho từng câu. Áp dụng thì ghi đè ngay bản dịch của câu đó.</p>

      {error && <p role="alert" className="rounded-xl bg-error-container p-3 text-label-md text-on-error-container">{error}</p>}

      {items === null ? (
        <p role="status" className="flex items-center gap-2 text-body-md text-on-surface-variant"><Spinner size={18} />Đang tải…</p>
      ) : items.length === 0 ? (
        <p className="rounded-2xl bg-surface-container-low p-space-lg text-body-md text-on-surface-variant">Không còn góp ý nào đang chờ.</p>
      ) : (
        <ul className="flex flex-col gap-space-sm">
          {items.map((s) => (
            <li key={s.id} className="rounded-2xl bg-surface-container-lowest p-space-md shadow-sm">
              <p className="text-label-sm text-on-surface-variant">{s.songTitle} · câu {s.lineIndex + 1}</p>
              <p className="mt-2 text-body-md text-on-surface-variant line-through decoration-error/60">{s.currentTranslation}</p>
              <p className="mt-1 text-body-md font-medium text-on-surface">{s.suggestedTranslation}</p>
              {s.matchingLineCount > 0 && (
                <label className="mt-space-sm flex min-h-11 w-fit cursor-pointer items-center gap-2 text-label-md text-on-surface-variant">
                  <input
                    type="checkbox" checked={applyAllIds.has(s.id)}
                    onChange={(e) => setApplyAllIds((prev) => {
                      const next = new Set(prev);
                      if (e.target.checked) next.add(s.id); else next.delete(s.id);
                      return next;
                    })}
                    className="h-5 w-5 rounded"
                  />
                  Áp dụng cho {s.matchingLineCount} câu giống hệt khác trong bài
                </label>
              )}
              <div className="mt-space-sm flex items-center gap-2">
                <button
                  type="button" disabled={busyId === s.id} onClick={() => void review(s.id, "apply")}
                  className="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-primary px-4 text-label-md font-semibold text-on-primary disabled:opacity-60"
                >
                  <Icon name="check" size={18} />Áp dụng
                </button>
                <button
                  type="button" disabled={busyId === s.id} onClick={() => void review(s.id, "dismiss")}
                  className="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-surface-container-high px-4 text-label-md font-medium text-on-surface disabled:opacity-60"
                >
                  <Icon name="close" size={18} />Bỏ qua
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
