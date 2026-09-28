"use client";

import { useCallback, useEffect, useState } from "react";
import { SelectField } from "@/components/ui/select-field";
import { Skeleton } from "@/components/ui/skeleton";
import { FEEDBACK_CATEGORIES, FEEDBACK_CATEGORY_LABELS, type FeedbackCategory } from "@/lib/feedback/feedback-schema";
import { AvatarCircle } from "@/components/leaderboard/avatar-circle";

interface MineItem { id: number; category: FeedbackCategory; message: string; status: "pending" | "approved" | "rejected"; createdAt: string }
interface PublicItem { id: number; category: FeedbackCategory; message: string; createdAt: string; nickname: string | null; avatarUrl: string | null }

const STATUS_LABEL: Record<MineItem["status"], string> = { pending: "Đang chờ duyệt", approved: "Đã công khai", rejected: "Không hiện công khai" };
const fmtDate = (iso: string) => new Date(iso).toLocaleDateString("vi-VN");

/** Trang Góp ý (thay cho mục nhỏ ở Cài đặt): form gửi + danh sách góp ý của mình + góp ý cộng đồng đã được duyệt. */
export function FeedbackPageScreen() {
  const [category, setCategory] = useState<FeedbackCategory>("bug");
  const [message, setMessage] = useState("");
  const [sendStatus, setSendStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [mine, setMine] = useState<MineItem[] | null>(null);
  const [community, setCommunity] = useState<PublicItem[] | null>(null);

  const loadMine = useCallback(() => {
    fetch("/api/feedback/mine").then((r) => (r.ok ? r.json() : { items: [] })).then((d: { items: MineItem[] }) => setMine(d.items)).catch(() => setMine([]));
  }, []);
  useEffect(() => { loadMine(); }, [loadMine]);
  useEffect(() => {
    fetch("/api/feedback/public").then((r) => (r.ok ? r.json() : { items: [] })).then((d: { items: PublicItem[] }) => setCommunity(d.items)).catch(() => setCommunity([]));
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSendStatus("sending");
    setError(null);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, message, pageUrl: typeof window !== "undefined" ? window.location.pathname : undefined }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        setError(body.error === "rate_limited" ? "Bạn gửi hơi nhiều trong hôm nay, thử lại vào ngày mai nhé." : "Chưa gửi được. Viết thêm một chút hoặc thử lại sau.");
        setSendStatus("error");
        return;
      }
      setMessage("");
      setSendStatus("sent");
      loadMine();
      setTimeout(() => setSendStatus("idle"), 2500);
    } catch {
      setError("Chưa gửi được, thử lại sau nhé.");
      setSendStatus("error");
    }
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-space-lg">
      <div>
        <h1 className="font-serif text-headline-lg-mobile md:text-headline-lg">Góp ý</h1>
        <p className="mt-1 text-body-md text-on-surface-variant">Bạn muốn Lyric Lab thêm tính năng gì, hay chỗ nào chưa tiện? Mọi góp ý đều được đọc.</p>
      </div>

      <form onSubmit={submit} className="rounded-2xl bg-surface-container-lowest p-space-md shadow-sm">
        <label htmlFor="feedback-message" className="sr-only">Nội dung góp ý</label>
        <textarea
          id="feedback-message" value={message} onChange={(e) => setMessage(e.target.value)} required minLength={5} maxLength={2000} rows={4}
          placeholder="Viết góp ý của bạn…"
          aria-invalid={sendStatus === "error" ? true : undefined} aria-describedby={error ? "feedback-error" : undefined}
          className="min-h-28 w-full rounded-2xl bg-surface-container px-4 py-3 text-body-md text-on-surface outline-none ring-2 ring-transparent focus:ring-secondary aria-[invalid=true]:ring-error"
        />
        <div className="mt-space-sm flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-col gap-1">
            <span className="text-label-sm text-on-surface-variant">{message.length}/2000 · Góp ý sẽ hiện công khai sau khi được đội ngũ duyệt.</span>
            {error && <p id="feedback-error" role="alert" className="text-label-md text-error">{error}</p>}
          </div>
          <div className="flex items-center gap-2">
            <SelectField value={category} onChange={(e) => setCategory(e.target.value as FeedbackCategory)}>
              {FEEDBACK_CATEGORIES.map((c) => <option key={c} value={c}>{FEEDBACK_CATEGORY_LABELS[c]}</option>)}
            </SelectField>
            <button type="submit" disabled={sendStatus === "sending"} className="min-h-11 rounded-full bg-primary px-6 text-label-md font-semibold text-on-primary hover:bg-primary-container disabled:opacity-60">
              {sendStatus === "sending" ? "Đang gửi…" : "Gửi góp ý"}
            </button>
          </div>
        </div>
        {sendStatus === "sent" && <p role="status" className="mt-2 text-label-md text-secondary">Cảm ơn bạn đã góp ý! Mình sẽ xem sớm.</p>}
      </form>

      <div className="grid grid-cols-1 gap-space-md md:grid-cols-2">
        <section aria-labelledby="mine-heading">
          <h2 id="mine-heading" className="font-serif text-headline-md text-on-surface">Góp ý của bạn</h2>
          <div className="mt-space-sm flex flex-col gap-space-sm">
            {mine === null ? (
              <FeedbackCardSkeletons />
            ) : mine.length === 0 ? (
              <p className="rounded-2xl bg-surface-container-low p-space-md text-body-md text-on-surface-variant">Bạn chưa gửi góp ý nào.</p>
            ) : (
              mine.map((f) => (
                <article key={f.id} className="rounded-2xl bg-surface-container-lowest p-space-sm shadow-sm">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-label-sm font-medium text-secondary">{FEEDBACK_CATEGORY_LABELS[f.category]}</span>
                    <span className={`text-label-sm ${f.status === "approved" ? "text-secondary" : f.status === "rejected" ? "text-on-surface-variant" : "text-primary"}`}>{STATUS_LABEL[f.status]}</span>
                  </div>
                  <p className="mt-1 text-body-md text-on-surface">{f.message}</p>
                  <p className="mt-1 text-label-sm text-on-surface-variant">{fmtDate(f.createdAt)}</p>
                </article>
              ))
            )}
          </div>
        </section>

        <section aria-labelledby="community-heading">
          <h2 id="community-heading" className="font-serif text-headline-md text-on-surface">Góp ý từ cộng đồng</h2>
          <div className="mt-space-sm flex flex-col gap-space-sm">
            {community === null ? (
              <FeedbackCardSkeletons />
            ) : community.length === 0 ? (
              <p className="rounded-2xl bg-surface-container-low p-space-md text-body-md text-on-surface-variant">Chưa có góp ý nào được duyệt.</p>
            ) : (
              community.map((f) => (
                <article key={f.id} className="flex gap-3 rounded-2xl bg-surface-container-lowest p-space-sm shadow-sm">
                  <AvatarCircle nickname={f.nickname ?? "?"} avatarUrl={f.avatarUrl} size={36} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline gap-x-2">
                      <span className="text-label-md font-semibold text-on-surface">{f.nickname ?? "Người học ẩn danh"}</span>
                      <span className="text-label-sm text-on-surface-variant">{fmtDate(f.createdAt)}</span>
                    </div>
                    <p className="mt-0.5 text-body-md text-on-surface">{f.message}</p>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function FeedbackCardSkeletons() {
  return (
    <div role="status" aria-label="Đang tải" className="flex flex-col gap-space-sm">
      <span className="sr-only">Đang tải…</span>
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex gap-3 rounded-2xl bg-surface-container-lowest p-space-sm shadow-sm">
          <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}
