"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { otherRole, type CoopRole } from "@/lib/explore/coop/coop-state";
import { parsePicks, type Picks } from "@/lib/practice/truth-room";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";

interface Options {
  code: string;
  role: CoopRole;
  rounds: number;
  /** Đáp án hiện tại của mình để gửi cho đồng đội (khi họ mới vào, và mỗi khi mình trả lời). */
  mine: Picks;
  onTheirs: (picks: Picks) => void;
}

/**
 * Kênh thời gian thực của phòng Hai thật một giả (Supabase Realtime broadcast + presence, không lưu gì vào cơ sở dữ liệu): mỗi người gửi toàn bộ đáp án của mình,
 * đồng đội mới vào thì nhận lại ngay. Tin nhận được được kiểm dạng (`parsePicks`). Mất kết nối chỉ làm ngừng đồng bộ.
 */
export function useTruthRoomChannel({ code, role, rounds, mine, onTheirs }: Options) {
  const [connected, setConnected] = useState(false);
  const [partnerOnline, setPartnerOnline] = useState(false);
  const chanRef = useRef<ReturnType<ReturnType<typeof createSupabaseBrowserClient>["channel"]> | null>(null);
  const mineRef = useRef(mine);
  const theirsRef = useRef(onTheirs);
  useEffect(() => { mineRef.current = mine; theirsRef.current = onTheirs; });

  const send = useCallback(() => { void chanRef.current?.send({ type: "broadcast", event: "picks", payload: { from: role, picks: mineRef.current } }); }, [role]);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    let cancelled = false;
    let channel: ReturnType<typeof supabase.channel> | undefined;
    void supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return;
      if (data.session) supabase.realtime.setAuth(data.session.access_token);
      channel = supabase.channel(`tol:${code}`, { config: { broadcast: { self: false }, presence: { key: role } } });
      chanRef.current = channel;
      channel
        .on("broadcast", { event: "picks" }, ({ payload }) => { const e = parsePicks(payload, rounds); if (e && e.from !== role) theirsRef.current(e.picks); })
        .on("presence", { event: "sync" }, () => setPartnerOnline(otherRole(role) in channel!.presenceState()))
        .on("presence", { event: "join" }, ({ key }) => { if (key !== role) send(); })
        .subscribe((status) => {
          const ok = status === "SUBSCRIBED";
          setConnected(ok);
          if (ok) { void channel?.track({ at: Date.now() }); send(); }
        });
    });
    return () => {
      cancelled = true;
      chanRef.current = null;
      if (channel) void supabase.removeChannel(channel);
    };
  }, [code, role, rounds, send]);

  // Mỗi khi mình trả lời thêm một vòng thì báo cho đồng đội.
  const answered = mine.filter((p) => p !== null).length;
  useEffect(() => { if (connected) send(); }, [answered, connected, send]);

  return { connected, partnerOnline };
}
