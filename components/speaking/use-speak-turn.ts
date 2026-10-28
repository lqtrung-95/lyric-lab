"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ensureAnonymousSession } from "@/lib/auth/ensure-anonymous-session";
import { blobToWavBase64 } from "@/lib/practice/audio-to-wav";
import type { VadOptions } from "@/lib/speaking/vad";
import { micSupported, startVadRecording, type VadRecording } from "@/lib/speaking/vad-recorder";

export type SpeakPhase = "idle" | "recording" | "processing";
export type SpeakError = "mic_denied" | "mic_unsupported" | "rate_limited" | "unavailable" | "error";
export interface SpeakResult {
  /** Chữ nhận diện được ("" nếu không nghe thấy gì). */
  text: string;
  /** Từ lúc bắt đầu ghi tới lúc bắt đầu nói (ms); null nếu không phát hiện được. */
  onsetMs: number | null;
  durationMs: number;
}

async function transcribe(audio: string): Promise<{ text: string } | { error: SpeakError }> {
  const call = () => fetch("/api/speech/transcribe", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ audio }) });
  let res = await call();
  if (res.status === 401 && (await ensureAnonymousSession())) res = await call();
  if (res.ok) return { text: ((await res.json()) as { text?: string }).text ?? "" };
  const code = ((await res.json().catch(() => null)) as { error?: string } | null)?.error;
  return { error: code === "rate_limited" ? "rate_limited" : code === "transcribe_unavailable" ? "unavailable" : "error" };
}

/**
 * Một lượt nói: `start()` mở micro, tự dừng khi người học nói xong (hoặc hết `maxSec`), rồi gửi lên nhận diện giọng.
 * `onResult` nhận kết quả; lỗi nằm ở `error` (giao diện chuyển sang gõ chữ khi mic không dùng được). `cancel()` bỏ lượt đang ghi mà không gửi.
 */
export function useSpeakTurn(maxSec: number, onResult: (r: SpeakResult) => void, vad?: VadOptions) {
  const [phase, setPhase] = useState<SpeakPhase>("idle");
  const [error, setError] = useState<SpeakError | null>(null);
  const rec = useRef<VadRecording | null>(null);
  const cancelled = useRef(false);
  const cb = useRef(onResult);
  useEffect(() => { cb.current = onResult; });

  const finish = useCallback(async () => {
    const r = rec.current;
    if (!r) return;
    rec.current = null;
    const out = await r.stop();
    if (cancelled.current) { setPhase("idle"); return; }
    setPhase("processing");
    try {
      const res = await transcribe(await blobToWavBase64(out.blob));
      if (cancelled.current) { setPhase("idle"); return; }
      if ("error" in res) { setError(res.error); setPhase("idle"); return; }
      setPhase("idle");
      cb.current({ text: res.text, onsetMs: out.onsetMs, durationMs: out.durationMs });
    } catch {
      setError("error");
      setPhase("idle");
    }
  }, []);

  const start = useCallback(async () => {
    if (rec.current) return;
    if (!micSupported()) { setError("mic_unsupported"); return; }
    cancelled.current = false;
    setError(null);
    try {
      rec.current = await startVadRecording({ maxMs: maxSec * 1000, vad, onVoiceEnd: () => void finish() });
      setPhase("recording");
    } catch (e) {
      setError((e as { name?: string })?.name === "NotAllowedError" ? "mic_denied" : "mic_unsupported");
    }
  }, [maxSec, vad, finish]);

  const cancel = useCallback(() => {
    cancelled.current = true;
    const r = rec.current;
    rec.current = null;
    void r?.stop();
    setPhase("idle");
  }, []);

  useEffect(() => () => { cancelled.current = true; void rec.current?.stop(); }, []);
  return { phase, error, start, stop: finish, cancel, clearError: useCallback(() => setError(null), []) };
}

export const SPEAK_ERROR_TEXT: Record<SpeakError, string> = {
  mic_denied: "Chưa cho phép dùng micro. Hãy bật quyền micro cho trang này, hoặc gõ câu trả lời.",
  mic_unsupported: "Trình duyệt này chưa ghi âm được. Bạn gõ câu trả lời nhé.",
  rate_limited: "Hôm nay bạn đã dùng hết lượt nhận diện giọng nói. Bạn vẫn gõ câu trả lời được.",
  unavailable: "Dịch vụ nhận diện giọng nói đang bận. Thử lại, hoặc gõ câu trả lời.",
  error: "Không nghe rõ được. Thử nói lại, hoặc gõ câu trả lời.",
};
