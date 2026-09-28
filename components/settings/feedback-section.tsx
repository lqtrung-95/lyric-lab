"use client";

import { useState } from "react";
import { SelectField } from "@/components/ui/select-field";
import { FEEDBACK_CATEGORIES, FEEDBACK_CATEGORY_LABELS, type FeedbackCategory } from "@/lib/feedback/feedback-schema";

/** Góp ý / báo lỗi gửi thẳng cho người làm app, ghi vào bảng `feedback`. Không cần tài khoản thật, tài khoản ẩn danh vẫn gửi được. */
export function FeedbackSection() {
  const [category, setCategory] = useState<FeedbackCategory>("bug");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setError(null);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, message, pageUrl: typeof window !== "undefined" ? window.location.pathname : undefined }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        setError(body.error === "rate_limited" ? "Bạn gửi hơi nhiều trong hôm nay, thử lại vào ngày mai nhé." : "Chưa gửi được. Viết thêm một chút hoặc thử lại sau.");
        setStatus("error");
        return;
      }
      setMessage("");
      setStatus("sent");
    } catch {
      setError("Chưa gửi được, thử lại sau nhé.");
      setStatus("error");
    }
  }

  return (
    <section aria-labelledby="feedback-heading" className="rounded-2xl bg-surface-container-lowest p-space-md shadow-sm">
      <h2 id="feedback-heading" className="font-serif text-headline-md text-on-surface">Góp ý &amp; báo lỗi</h2>
      <p className="mt-1 text-body-md text-on-surface-variant">Thấy lỗi, dịch chưa tự nhiên, hay muốn đề xuất tính năng mới? Viết ở đây, mình đọc hết.</p>
      {status === "sent" ? (
        <p role="status" className="mt-space-md rounded-xl bg-secondary-container/50 p-space-sm text-body-md text-on-secondary-container">Cảm ơn bạn đã góp ý! Mình sẽ xem sớm.</p>
      ) : (
        <form onSubmit={submit} className="mt-space-md flex flex-col gap-space-sm">
          <label className="flex items-center gap-2 text-label-md text-on-surface-variant">
            <span>Loại góp ý</span>
            <SelectField value={category} onChange={(e) => setCategory(e.target.value as FeedbackCategory)}>
              {FEEDBACK_CATEGORIES.map((c) => <option key={c} value={c}>{FEEDBACK_CATEGORY_LABELS[c]}</option>)}
            </SelectField>
          </label>
          <label htmlFor="feedback-message" className="sr-only">Nội dung góp ý</label>
          <textarea
            id="feedback-message" value={message} onChange={(e) => setMessage(e.target.value)} required minLength={5} maxLength={2000} rows={4}
            placeholder="Ví dụ: câu dịch ở bài X nghe hơi gượng, hoặc mình muốn có tính năng…"
            aria-invalid={status === "error" ? true : undefined} aria-describedby={error ? "feedback-error" : undefined}
            className="min-h-28 rounded-2xl bg-surface-container px-4 py-3 text-body-md text-on-surface outline-none ring-2 ring-transparent focus:ring-secondary aria-[invalid=true]:ring-error"
          />
          <button type="submit" disabled={status === "sending"} className="self-start rounded-full bg-primary px-6 py-2.5 text-label-md font-semibold text-on-primary hover:bg-primary-container disabled:opacity-60">
            {status === "sending" ? "Đang gửi…" : "Gửi góp ý"}
          </button>
          {error && <p id="feedback-error" role="alert" className="text-label-md text-error">{error}</p>}
        </form>
      )}
    </section>
  );
}
