"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { Spinner } from "@/components/ui/spinner";
import { parseVideoId } from "@/lib/youtube/parse-video-id";

/** Ô dán link YouTube. Link sai định dạng báo lỗi ngay, không gọi server (IN-01). */
export function PasteLinkForm() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  function submit(value: string) {
    const videoId = parseVideoId(value);
    if (!videoId) {
      setError("Link chưa đúng. Hãy dán link video YouTube, ví dụ https://www.youtube.com/watch?v=…");
      inputRef.current?.focus();
      return;
    }
    setError(null);
    setPending(true);
    router.push(`/learn/${videoId}`);
  }

  async function pasteFromClipboard() {
    try {
      const text = await navigator.clipboard.readText();
      if (inputRef.current) inputRef.current.value = text;
      if (text.trim()) submit(text);
    } catch {
      // Trình duyệt từ chối quyền clipboard: để người dùng dán tay vào ô.
      inputRef.current?.focus();
    }
  }

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        submit(inputRef.current?.value ?? "");
      }}
      className="rounded-3xl bg-surface-container-lowest p-space-md shadow-[0_2px_16px_rgba(30,26,22,0.06)] md:p-space-lg"
    >
      <label htmlFor="video-link" className="flex items-center gap-2 text-label-md text-on-surface">
        <Icon name="smart_display" size={18} className="text-primary" />
        Dán link YouTube của bài hát
      </label>
      <div className="mt-space-sm flex flex-col gap-space-sm md:flex-row">
        <div
          className={`flex min-h-12 flex-1 items-center gap-2 rounded-2xl bg-surface-container px-3 ring-2 transition-shadow focus-within:ring-secondary ${
            error ? "ring-error" : "ring-transparent"
          }`}
        >
          <Icon name="link" size={20} className="text-on-surface-variant" />
          <input
            ref={inputRef}
            id="video-link"
            type="text"
            inputMode="url"
            autoComplete="off"
            placeholder="Dán link YouTube của bài hát…"
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? "video-link-error" : undefined}
            onChange={() => error && setError(null)}
            className="min-h-11 flex-1 bg-transparent text-body-md text-on-surface outline-none placeholder:text-on-surface-variant/70"
          />
          <button
            type="button"
            onClick={pasteFromClipboard}
            className="flex min-h-11 items-center gap-1 rounded-full px-3 text-label-md text-secondary transition-colors hover:bg-surface-container-high"
          >
            <Icon name="content_paste" size={16} />
            Dán
          </button>
        </div>
        <button
          type="submit"
          disabled={pending}
          aria-busy={pending}
          className="flex min-h-12 items-center justify-center gap-2 rounded-full bg-primary-container px-6 text-label-md font-semibold text-on-primary-container transition-opacity hover:opacity-90 disabled:opacity-70"
        >
          {pending ? "Đang mở bài hát…" : "Phân tích bài hát"}
          {pending ? <Spinner size={16} /> : <Icon name="arrow_forward" size={18} />}
        </button>
      </div>
      {error && (
        <p id="video-link-error" role="alert" className="mt-space-sm text-label-md text-error">
          {error}
        </p>
      )}
    </form>
  );
}
