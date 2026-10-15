"use client";

import { useCallback, useState } from "react";
import { ensureAnonymousSession } from "@/lib/auth/ensure-anonymous-session";
import { blobToWavBase64 } from "@/lib/practice/audio-to-wav";
import type { AssessmentResult } from "@/lib/pronunciation/assessment-normalize";

export type AssessState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ok"; value: AssessmentResult }
  | { status: "error"; reason: "no_speech" | "rate_limited" | "unavailable" | "error" };

/** Gửi bản ghi lên `/api/pronunciation-assess` để chấm từng chữ so với câu mẫu. Chưa có phiên thì tự đăng nhập ẩn danh rồi gọi lại một lần. */
export function usePronunciationAssess() {
  const [state, setState] = useState<AssessState>({ status: "idle" });

  const assess = useCallback(async (blob: Blob, text: string) => {
    setState({ status: "loading" });
    try {
      const audio = await blobToWavBase64(blob);
      const call = () => fetch("/api/pronunciation-assess", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text, audio }) });
      let res = await call();
      if (res.status === 401 && (await ensureAnonymousSession())) res = await call();
      if (!res.ok) {
        const code = ((await res.json().catch(() => null)) as { error?: string } | null)?.error;
        setState({ status: "error", reason: code === "no_speech" ? "no_speech" : code === "rate_limited" ? "rate_limited" : code === "assessment_unavailable" ? "unavailable" : "error" });
        return;
      }
      setState({ status: "ok", value: (await res.json()) as AssessmentResult });
    } catch {
      setState({ status: "error", reason: "error" });
    }
  }, []);

  return { state, assess, reset: useCallback(() => setState({ status: "idle" }), []) };
}
