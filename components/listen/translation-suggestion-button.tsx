"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Icon } from "@/components/ui/icon";

interface TranslationSuggestionButtonProps {
  videoId: string;
  promptVersion: string;
  lineIndex: number;
  currentTranslation: string;
}

/** Nút bút chì nhỏ cạnh bản dịch một câu: mở form góp ý bản dịch tự nhiên hơn, gửi cho admin duyệt. */
export function TranslationSuggestionButton({ videoId, promptVersion, lineIndex, currentTranslation }: TranslationSuggestionButtonProps) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const [value, setValue] = useState(currentTranslation);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Dòng lời đã nghe qua bị làm mờ bằng CSS opacity, mà opacity < 1 tự tạo stacking context riêng nên "nhốt" luôn
  // z-index của popover bên trong — dòng kế tiếp (opacity đầy đủ) vẫn vẽ đè lên. Thoát hẳn bằng cổng React (render
  // thẳng vào <body>, định vị theo tọa độ nút bấm) là cách chắc chắn tránh mọi kiểu nhốt stacking context như vậy.
  function toggle(e: React.MouseEvent) {
    e.stopPropagation();
    if (!open && buttonRef.current) {
      const r = buttonRef.current.getBoundingClientRect();
      setPos({ top: r.bottom + 4, left: r.left });
    }
    setOpen((o) => !o);
  }

  // Cuộn trang thì tọa độ đã tính không còn đúng nữa: đóng popover cho đơn giản, thay vì phải tính lại liên tục.
  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    window.addEventListener("scroll", close, { capture: true, passive: true });
    return () => window.removeEventListener("scroll", close, { capture: true });
  }, [open]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    e.stopPropagation();
    setStatus("sending");
    try {
      const res = await fetch("/api/translation-suggestions", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoId, promptVersion, lineIndex, currentTranslation, suggestedTranslation: value }),
      });
      setStatus(res.ok ? "sent" : "error");
    } catch {
      setStatus("error");
    }
  }

  return (
    <>
      <button
        ref={buttonRef}
        type="button" onClick={toggle}
        aria-expanded={open}
        aria-label="Góp ý bản dịch câu này"
        title="Góp ý bản dịch"
        className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-on-surface-variant/70 transition-opacity hover:bg-surface-container-high hover:text-on-surface focus-visible:opacity-100 ${
          open ? "bg-surface-container-high opacity-100" : "opacity-0 group-hover/line:opacity-100"
        }`}
      >
        <Icon name="edit" size={15} />
      </button>
      {open && pos && createPortal(
        <form
          onClick={(e) => e.stopPropagation()} onSubmit={submit}
          style={{ top: pos.top, left: pos.left }}
          className="fixed z-[100] flex w-72 max-w-[calc(100vw-2rem)] flex-col gap-1.5 rounded-xl bg-surface-container-lowest p-2.5 shadow-lg ring-1 ring-outline-variant"
        >
          {status === "sent" ? (
            <p role="status" className="text-label-md text-on-surface-variant">Cảm ơn góp ý! Mình sẽ xem lại câu này.</p>
          ) : (
            <>
              <label htmlFor={`translation-suggest-${videoId}-${lineIndex}`} className="text-label-sm text-on-surface-variant">Bản dịch tự nhiên hơn cho câu này:</label>
              <textarea
                id={`translation-suggest-${videoId}-${lineIndex}`} value={value} onChange={(e) => setValue(e.target.value)}
                required minLength={3} maxLength={500} rows={3} autoFocus
                className="rounded-lg bg-surface-container px-3 py-2 text-body-md text-on-surface outline-none ring-2 ring-transparent focus:ring-secondary"
              />
              <div className="flex flex-wrap items-center gap-2">
                <button type="submit" disabled={status === "sending"} className="min-h-9 rounded-full bg-primary px-4 text-label-md font-semibold text-on-primary disabled:opacity-60">
                  {status === "sending" ? "Đang gửi…" : "Gửi góp ý"}
                </button>
                <button type="button" onClick={() => setOpen(false)} className="min-h-9 rounded-full px-4 text-label-md text-on-surface-variant hover:bg-surface-container-high">Hủy</button>
              </div>
              {status === "error" && <p role="alert" className="text-label-sm text-error">Chưa gửi được, thử lại nhé.</p>}
            </>
          )}
        </form>,
        document.body,
      )}
    </>
  );
}
