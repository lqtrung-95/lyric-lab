"use client";

import { useCallback, useState } from "react";
import { blobToWavBase64 } from "@/lib/practice/audio-to-wav";
import type { FeedbackOutput } from "@/lib/pronunciation/feedback-schema";

export type VoiceFeedbackState =
  | { status: "loading" }
  | { status: "ok"; value: FeedbackOutput }
  | { status: "error"; reason: "rate_limited" | "unavailable" | "error" };

/**
 * Nhờ AI nghe một lần ghi âm và nhận xét phát âm. Chỉ chạy khi người học bấm nút (âm thanh được chuyển sang Gemini để nghe, không lưu ở server).
 * Kết quả giữ theo mốc thời gian của lần ghi (`at`) nên mỗi lần nói có nhận xét riêng.
 */
export function useVoiceFeedback(videoId: string) {
  const [byAttempt, setByAttempt] = useState<Record<number, VoiceFeedbackState>>({});

  const request = useCallback(async (at: number, blob: Blob, lineIndex: number) => {
    setByAttempt((s) => ({ ...s, [at]: { status: "loading" } }));
    const done = (state: VoiceFeedbackState) => setByAttempt((s) => ({ ...s, [at]: state }));
    try {
      const audio = await blobToWavBase64(blob);
      const res = await fetch("/api/pronunciation-feedback", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoId, lineIndex, mimeType: "audio/wav", audio }),
      });
      if (!res.ok) {
        const code = ((await res.json().catch(() => null)) as { error?: string } | null)?.error;
        done({ status: "error", reason: code === "rate_limited" ? "rate_limited" : code === "feedback_unavailable" ? "unavailable" : "error" });
        return;
      }
      done({ status: "ok", value: (await res.json()) as FeedbackOutput });
    } catch {
      done({ status: "error", reason: "error" });
    }
  }, [videoId]);

  return { byAttempt, request };
}
