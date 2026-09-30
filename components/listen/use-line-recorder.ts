"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type RecorderState = "idle" | "requesting" | "recording" | "recorded" | "denied" | "unsupported";

/**
 * Ghi âm giọng hát theo câu, chỉ lưu tạm trong trình duyệt (không gửi lên server) để người học tự nghe lại so với
 * bản gốc — không chấm điểm tự động, bản tối giản để thử phản ứng người dùng trước khi đầu tư nhận diện giọng nói.
 */
export function useLineRecorder(onRecorded?: () => void) {
  const [state, setState] = useState<RecorderState>("idle");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  // Ref để onstop (đăng ký một lần lúc start) luôn gọi callback mới nhất mà không phải liệt kê onRecorded
  // vào dependency của start — tránh phải tạo lại MediaRecorder khi component cha truyền hàm mới mỗi lần vẽ.
  const onRecordedRef = useRef(onRecorded);
  useEffect(() => { onRecordedRef.current = onRecorded; }, [onRecorded]);

  const cleanupStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  useEffect(() => () => { cleanupStream(); if (audioUrl) URL.revokeObjectURL(audioUrl); }, [cleanupStream, audioUrl]);

  const start = useCallback(async () => {
    if (typeof MediaRecorder === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setState("unsupported");
      return;
    }
    setState("requesting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
        setAudioUrl((prev) => { if (prev) URL.revokeObjectURL(prev); return URL.createObjectURL(blob); });
        setState("recorded");
        cleanupStream();
        onRecordedRef.current?.();
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      setState("recording");
    } catch {
      setState("denied");
    }
  }, [cleanupStream]);

  const stop = useCallback(() => {
    mediaRecorderRef.current?.stop();
  }, []);

  const reset = useCallback(() => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    setState("idle");
  }, [audioUrl]);

  return { state, audioUrl, start, stop, reset };
}
