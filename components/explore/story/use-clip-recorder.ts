"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { recordClip, type ClipRecording } from "@/lib/speech/record-clip";
import type { VoiceClip } from "@/lib/speech/voice-clip";

/**
 * Ghi một đoạn thoại ngắn rồi giao cho `onClip` (tự dừng sau vài giây). `recording` là id đối tượng đang ghi (ví dụ id manh mối) để mỗi nút biết mình có đang ghi không.
 * Lỗi micro thành thông báo tiếng Việt; rời trang thì dừng và bỏ.
 */
export function useClipRecorder(onClip: (key: string, clip: VoiceClip) => void) {
  const [recording, setRecording] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const active = useRef<{ key: string; rec: ClipRecording } | null>(null);
  const cb = useRef(onClip);
  useEffect(() => { cb.current = onClip; });

  const finish = useCallback(async () => {
    const cur = active.current;
    if (!cur) return;
    active.current = null;
    setRecording(null);
    const clip = await cur.rec.stop();
    if (clip) cb.current(cur.key, clip);
  }, []);

  const start = useCallback(async (key: string) => {
    setError(null);
    if (active.current) await finish();
    try {
      const rec = await recordClip();
      active.current = { key, rec };
      setRecording(key);
      // Tự dừng của `recordClip` kết thúc đoạn ghi; theo dõi để giao đoạn đó đi ngay cả khi người dùng không bấm dừng.
      setTimeout(() => { if (active.current?.rec === rec) void finish(); }, 6200);
    } catch {
      setError("Không dùng được micro. Hãy cho phép trình duyệt truy cập micro rồi thử lại.");
    }
  }, [finish]);

  useEffect(() => () => { void active.current?.rec.stop(); active.current = null; }, []);
  return { recording, error, start, stop: finish };
}
