"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Ghi âm giọng người học cho từng câu của hội thoại (MediaRecorder). Bản ghi chỉ nằm trong bộ nhớ của trình duyệt dưới dạng blob URL,
 * không tải lên server; đóng trang hoặc đổi vai thì xóa. `recordings` map chỉ số câu → blob URL.
 */
export function useDialogueRecorder() {
  const [recordings, setRecordings] = useState<Record<number, string>>({});
  const [recordingIndex, setRecordingIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const recorder = useRef<MediaRecorder | null>(null);
  const urls = useRef<Map<number, string>>(new Map());

  const stop = useCallback(() => {
    if (recorder.current?.state === "recording") recorder.current.stop();
  }, []);

  const clear = useCallback(() => {
    stop();
    for (const u of urls.current.values()) URL.revokeObjectURL(u);
    urls.current.clear();
    setRecordings({});
  }, [stop]);

  const start = useCallback(async (index: number) => {
    setError(null);
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setError("Trình duyệt này chưa hỗ trợ ghi âm.");
      return;
    }
    try {
      stop();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      const chunks: Blob[] = [];
      rec.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
      rec.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        if (chunks.length > 0) {
          const old = urls.current.get(index);
          if (old) URL.revokeObjectURL(old);
          const url = URL.createObjectURL(new Blob(chunks, { type: rec.mimeType || "audio/webm" }));
          urls.current.set(index, url);
          setRecordings((r) => ({ ...r, [index]: url }));
        }
        setRecordingIndex(null);
      };
      recorder.current = rec;
      rec.start();
      setRecordingIndex(index);
    } catch {
      setError("Không dùng được micro. Hãy cho phép trình duyệt truy cập micro rồi thử lại.");
      setRecordingIndex(null);
    }
  }, [stop]);

  useEffect(() => {
    const map = urls.current;
    return () => {
      if (recorder.current?.state === "recording") recorder.current.stop();
      for (const u of map.values()) URL.revokeObjectURL(u);
      map.clear();
    };
  }, []);

  return { recordings, recordingIndex, error, start, stop, clear };
}
