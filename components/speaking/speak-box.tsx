"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { Spinner } from "@/components/ui/spinner";
import { SPEAK_ERROR_TEXT, type SpeakError, type SpeakPhase } from "./use-speak-turn";

interface Props {
  phase: SpeakPhase;
  error: SpeakError | null;
  onStart: () => void;
  onStop: () => void;
  /** Người học gõ câu trả lời thay vì nói. */
  onType: (text: string) => void;
  disabled?: boolean;
  startLabel?: string;
  /** Mic không dùng được từ đầu: chỉ hiện ô gõ. */
  typingOnly?: boolean;
}

/** Nút nói + chỗ gõ thay thế. Mic lỗi/bị chặn thì tự mở ô gõ kèm lời giải thích để vẫn luyện được. */
export function SpeakBox({ phase, error, onStart, onStop, onType, disabled, startLabel = "Bấm để nói", typingOnly }: Props) {
  const [typing, setTyping] = useState(false);
  const [text, setText] = useState("");
  const showTyping = typing || typingOnly || error === "mic_denied" || error === "mic_unsupported" || error === "rate_limited";
  const submit = () => { if (text.trim()) { onType(text.trim()); setText(""); } };
  return (
    <div className="flex flex-col items-center gap-2">
      {phase === "recording" ? (
        <button type="button" onClick={onStop} className="flex min-h-14 items-center gap-2 rounded-full bg-error px-6 text-label-lg font-extrabold text-on-error">
          <span aria-hidden className="size-3 animate-pulse rounded-full bg-on-error" />Đang nghe… nói xong sẽ tự dừng (bấm để dừng)
        </button>
      ) : phase === "processing" ? (
        <p role="status" className="flex min-h-14 items-center gap-2 text-label-lg font-bold"><Spinner size={18} />Đang nghe lại câu bạn nói…</p>
      ) : typingOnly ? null : (
        <button type="button" onClick={onStart} disabled={disabled} className="flex min-h-14 items-center gap-2 rounded-full bg-primary px-6 text-label-lg font-extrabold text-on-primary hover:brightness-110 disabled:opacity-50">
          <Icon name="mic" size={22} />{startLabel}
        </button>
      )}
      {error && <p role="alert" className="max-w-md text-center text-body-sm text-error">{SPEAK_ERROR_TEXT[error]}</p>}
      {phase === "idle" && !showTyping && (
        <button type="button" onClick={() => setTyping(true)} className="min-h-11 px-3 text-label-md font-semibold text-on-surface-variant underline">Gõ thay vì nói</button>
      )}
      {phase === "idle" && showTyping && (
        <form onSubmit={(e) => { e.preventDefault(); submit(); }} className="flex w-full max-w-md gap-2">
          <input lang="zh-Hans" value={text} onChange={(e) => setText(e.target.value)} placeholder="Gõ câu tiếng Trung" aria-label="Gõ câu trả lời tiếng Trung"
            className="min-h-11 min-w-0 flex-1 rounded-full border-2 border-ink bg-surface-container-lowest px-4 text-body-md" />
          <button type="submit" disabled={!text.trim() || disabled} className="min-h-11 rounded-full bg-primary px-5 text-label-md font-bold text-on-primary disabled:opacity-50">Gửi</button>
        </form>
      )}
    </div>
  );
}
