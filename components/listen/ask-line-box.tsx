"use client";

import { useRef, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { InlineBoldText } from "@/components/ui/inline-bold-text";
import { MAX_QUESTION_CHARS } from "@/lib/lookup/ask-line-schema";
import { useAskLine } from "./use-ask-line";

const SUGGESTIONS = ["Câu này dùng ngoài đời được không?", "Giải thích ngữ pháp câu này"];
const FAIL_TEXT = {
  rate_limited: "Hôm nay bạn đã hỏi AI nhiều rồi, mai hỏi tiếp nhé.",
  error: "Chưa trả lời được lúc này. Thử lại sau nhé.",
} as const;

/** Khung hỏi AI tự do về MỘT câu (nghĩa, ngữ pháp, cách dùng...): mỗi lượt hỏi-đáp hiện nối tiếp và được gửi kèm làm ngữ cảnh cho lượt sau. */
export function AskLineBox({ videoId, lineIndex }: { videoId: string; lineIndex: number }) {
  const { turns, status, ask } = useAskLine(videoId, lineIndex);
  const [question, setQuestion] = useState("");
  const loading = status === "loading";
  const inputRef = useRef<HTMLInputElement>(null);

  const submit = async (text: string) => {
    const q = text.trim();
    if (q.length < 2 || loading) return;
    const ok = await ask(q);
    if (ok) setQuestion("");
    // Nút Hỏi bị khóa lúc chờ làm mất tiêu điểm: trả về ô nhập để gõ tiếp và Esc vẫn đóng được bảng.
    inputRef.current?.focus({ preventScroll: true });
  };

  return (
    <section aria-label="Hỏi AI về câu này" className="mt-4 border-t border-outline-variant/40 pt-4">
      <h3 className="flex items-center gap-1.5 text-label-sm font-semibold uppercase tracking-wider text-on-surface-variant"><Icon name="auto_awesome" size={16} />Hỏi AI về câu này</h3>
      {turns.length > 0 && (
        <ol className="mt-2 space-y-3">
          {turns.map((t, i) => (
            <li key={i} className="space-y-1">
              <p className="text-label-md font-semibold text-on-surface">{t.q}</p>
              <p className="whitespace-pre-line text-label-md text-on-surface-variant"><InlineBoldText text={t.a} /></p>
            </li>
          ))}
        </ol>
      )}
      {turns.length === 0 && (
        <ul className="mt-2 flex flex-wrap gap-1.5">
          {SUGGESTIONS.map((s) => (
            <li key={s}><button type="button" onClick={() => void submit(s)} disabled={loading} className="min-h-9 rounded-full bg-surface-container px-3 text-label-sm text-on-surface hover:bg-surface-container-high disabled:opacity-60">{s}</button></li>
          ))}
        </ul>
      )}
      {loading && <p role="status" className="mt-2 text-label-md text-on-surface-variant">AI đang trả lời…</p>}
      {(status === "rate_limited" || status === "error") && <p role="alert" className="mt-2 text-label-md text-on-surface-variant">{FAIL_TEXT[status]}</p>}
      <form onSubmit={(e) => { e.preventDefault(); void submit(question); }} className="mt-2 flex gap-2">
        <label htmlFor={`ask-${lineIndex}`} className="sr-only">Câu hỏi của bạn về câu này</label>
        <input
          id={`ask-${lineIndex}`} ref={inputRef} value={question} onChange={(e) => setQuestion(e.target.value)} maxLength={MAX_QUESTION_CHARS}
          autoComplete="off" placeholder="Hỏi thêm, ví dụ: vì sao dùng 了 ở đây?"
          className="min-h-11 min-w-0 flex-1 rounded-full bg-surface-container-high px-4 text-label-md text-on-surface outline-none ring-2 ring-transparent focus:ring-primary"
        />
        <button type="submit" disabled={loading || question.trim().length < 2} className="min-h-11 rounded-full bg-primary px-4 text-label-md font-semibold text-on-primary hover:bg-primary-container disabled:opacity-50">Hỏi</button>
      </form>
    </section>
  );
}
