"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { msUntilAdvance, serverOffsetMs } from "@/lib/rooms/room-clock";
import type { AnswerFeedback, RoomView } from "@/lib/rooms/room-types";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";

export type RoomLoadError = "not_found" | "auth_required" | "network";

const POLL_MS = 4000;
const PING_DEBOUNCE_MS = 120;

async function call(path: string, body?: unknown): Promise<{ ok: boolean; status: number; data: Record<string, unknown> }> {
  try {
    const res = await fetch(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: body === undefined ? undefined : JSON.stringify(body) });
    return { ok: res.ok, status: res.status, data: (await res.json().catch(() => ({}))) as Record<string, unknown> };
  } catch {
    return { ok: false, status: 0, data: {} };
  }
}

/**
 * Trạng thái một phòng thi đấu cho client. Nguồn sự thật là API `GET /api/rooms/[code]`; Supabase Realtime (Postgres Changes trên
 * `rooms` và `room_players`, chỉ thành viên nhận được nhờ RLS) chỉ là TÍN HIỆU để tải lại, nên đáp án và câu hỏi không đi qua kênh đó.
 * Có thêm thăm dò 4 giây làm lưới an toàn khi Realtime lỗi/bị chặn. Máy này cũng tự gọi "tiến câu" khi mọi người đã trả lời hoặc hết giờ
 * (server không có timer nền); gọi thừa vô hại vì hàm SQL idempotent.
 */
export function useRoom(code: string) {
  const [view, setView] = useState<RoomView | null>(null);
  const [error, setError] = useState<RoomLoadError | null>(null);
  const [offsetMs, setOffsetMs] = useState(0);
  const offsetRef = useRef(0);
  const advancedKeyRef = useRef<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch(`/api/rooms/${code}`, { cache: "no-store" });
      if (res.status === 401) return setError("auth_required");
      if (res.status === 404) return setError("not_found");
      if (!res.ok) return setError("network");
      const next = (await res.json()) as RoomView;
      offsetRef.current = serverOffsetMs(next.serverNow, Date.now());
      setOffsetMs(offsetRef.current);
      setView(next);
      setError(null);
    } catch {
      setError("network");
    }
  }, [code]);

  // Tải lần đầu (hoãn sang tác vụ kế để không đặt state đồng bộ trong effect).
  useEffect(() => {
    const timer = setTimeout(() => void refresh(), 0);
    return () => clearTimeout(timer);
  }, [refresh]);

  // Realtime làm tín hiệu tải lại (gộp nhiều sự kiện liên tiếp thành một lần tải).
  const roomId = view?.id;
  useEffect(() => {
    if (!roomId) return;
    const supabase = createSupabaseBrowserClient();
    let timer: ReturnType<typeof setTimeout> | undefined;
    let cancelled = false;
    let channel: ReturnType<typeof supabase.channel> | undefined;
    const ping = () => {
      clearTimeout(timer);
      timer = setTimeout(() => void refresh(), PING_DEBOUNCE_MS);
    };
    // Truyền token phiên cho Realtime trước khi đăng ký: thiếu token thì kênh chạy với vai trò anon và RLS chặn hết sự kiện của phòng.
    void supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return;
      if (data.session) supabase.realtime.setAuth(data.session.access_token);
      channel = supabase.channel(`room-${roomId}`)
        .on("postgres_changes", { event: "*", schema: "public", table: "rooms", filter: `id=eq.${roomId}` }, ping)
        .on("postgres_changes", { event: "*", schema: "public", table: "room_players", filter: `room_id=eq.${roomId}` }, ping)
        .subscribe();
    });
    return () => {
      cancelled = true;
      clearTimeout(timer);
      if (channel) void supabase.removeChannel(channel);
    };
  }, [roomId, refresh]);

  // Lưới an toàn: thăm dò khi phòng còn diễn ra và tab đang hiện; tải lại ngay khi tab hiện lại.
  const status = view?.status;
  useEffect(() => {
    if (status !== "waiting" && status !== "playing") return;
    const tick = () => { if (document.visibilityState === "visible") void refresh(); };
    const interval = setInterval(tick, POLL_MS);
    document.addEventListener("visibilitychange", tick);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [status, refresh]);

  // Tự gọi "tiến câu" đúng lúc (mỗi câu một lần cho mỗi lý do; kết quả `not_ready` thì tải lại và hẹn lại ở lần render sau).
  useEffect(() => {
    if (!view) return;
    const delay = msUntilAdvance(view, Date.now() + offsetRef.current);
    if (delay === null) return;
    const key = `${view.id}:${view.currentQuestion?.index}:${delay === 0 ? "now" : "deadline"}`;
    const timer = setTimeout(async () => {
      if (advancedKeyRef.current === key) return;
      advancedKeyRef.current = key;
      await call(`/api/rooms/${code}/advance`);
      void refresh();
    }, delay);
    return () => clearTimeout(timer);
  }, [view, code, refresh]);

  const act = useCallback(async (path: string, body?: unknown) => {
    const result = await call(`/api/rooms/${code}/${path}`, body);
    void refresh();
    return result;
  }, [code, refresh]);

  return {
    view,
    error,
    refresh,
    /** Độ lệch đồng hồ (giờ server = giờ máy + độ lệch), để tính trong lúc render cùng `useNow`. */
    offsetMs,
    /** Giờ server hiện tại (ms); chỉ gọi trong trình xử lý sự kiện (không gọi lúc render). */
    serverNow: () => Date.now() + offsetRef.current,
    setReady: (ready: boolean) => act("ready", { ready }),
    start: () => act("start"),
    leave: () => act("leave"),
    answer: async (index: number, choice: number): Promise<{ feedback: AnswerFeedback | null; error: string | null }> => {
      const result = await act("answer", { index, choice });
      return result.ok ? { feedback: result.data as unknown as AnswerFeedback, error: null } : { feedback: null, error: typeof result.data.error === "string" ? result.data.error : "server_error" };
    },
  };
}
