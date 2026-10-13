"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ensureAnonymousSession } from "@/lib/auth/ensure-anonymous-session";

export interface FilledTranslation {
  idx: number;
  translation: string;
}

export type TranslateState =
  | { status: "idle" }
  | { status: "running"; remaining: number }
  | { status: "stopped"; message: string };

interface ProgressBody { kind?: string; translated?: number; remaining?: number; filled?: FilledTranslation[]; error?: string }

/** Giới hạn số lượt gọi liên tiếp của một lần bấm (video 480 câu cần ~5–8 lượt) và số lần chờ khi người khác đang dịch cùng video. */
const MAX_CALLS = 20;
const MAX_BUSY_WAITS = 6;
const BUSY_WAIT_MS = 5000;
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

const STOP_MESSAGES: Record<string, string> = {
  user_limit: "Hôm nay bạn đã dùng hết lượt dịch, mai dịch tiếp nhé.",
  ai_unavailable: "AI đang quá tải, chưa dịch thêm được. Thử lại sau ít phút nhé (lượt này không bị tính).",
  not_found: "Không tìm thấy video này.",
  busy: "Video đang được người khác dịch. Thử lại sau ít phút nhé.",
};

/**
 * Dịch bù các câu còn trống của video bằng AI: một lần bấm gọi API lặp tới khi hết (mỗi lượt dịch được vài chục đến ~một trăm câu trong giới hạn thời gian của máy chủ),
 * mỗi lượt xong thì `onFilled` cập nhật ngay các câu vừa dịch. Dừng khi hết hạn mức, AI quá tải hoặc người xem rời trang.
 */
export function useTranslateMissing(videoId: string, onFilled: (entries: FilledTranslation[]) => void) {
  const [state, setState] = useState<TranslateState>({ status: "idle" });
  const alive = useRef(true);
  const running = useRef(false);
  useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);

  const start = useCallback(async (initialRemaining: number) => {
    if (running.current) return;
    running.current = true;
    setState({ status: "running", remaining: initialRemaining });
    const post = () => fetch(`/api/videos/${videoId}/translate-missing`, { method: "POST" });
    let busyWaits = 0;
    try {
      for (let call = 0; call < MAX_CALLS && alive.current; call++) {
        await ensureAnonymousSession();
        let res = await post();
        if (res.status === 401 && (await ensureAnonymousSession())) res = await post();
        const body = (await res.json().catch(() => ({}))) as ProgressBody;
        if (!alive.current) return;
        if (res.ok && body.kind === "busy") {
          if (++busyWaits > MAX_BUSY_WAITS) { setState({ status: "stopped", message: STOP_MESSAGES.busy }); return; }
          await wait(BUSY_WAIT_MS);
          call--; // chờ khóa không tính là một lượt dịch
          continue;
        }
        if (!res.ok) { setState({ status: "stopped", message: STOP_MESSAGES[body.error ?? ""] ?? "Chưa dịch được, thử lại sau nhé." }); return; }
        if (body.filled?.length) onFilled(body.filled);
        const remaining = body.remaining ?? 0;
        if (remaining <= 0) { setState({ status: "idle" }); return; }
        setState({ status: "running", remaining });
      }
      if (alive.current) setState({ status: "stopped", message: "Còn một số câu chưa dịch. Bấm lại để dịch tiếp." });
    } catch {
      if (alive.current) setState({ status: "stopped", message: "Chưa dịch được, kiểm tra kết nối rồi thử lại nhé." });
    } finally {
      running.current = false;
    }
  }, [videoId, onFilled]);

  return { state, start };
}
