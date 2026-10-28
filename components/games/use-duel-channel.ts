"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { DUEL_WORDS, parseDuelState, type DuelRole, type DuelState } from "@/lib/games/duel";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";

interface Options { code: string; role: DuelRole; mine: DuelState; onTheirs: (s: DuelState) => void }

/**
 * Kênh thời gian thực của phòng Đấu 1–1 (Supabase Realtime broadcast + presence, không lưu gì vào cơ sở dữ liệu): mỗi người gửi trạng thái của mình (sẵn sàng, số từ đã xong, thời gian về đích),
 * người mới vào thì nhận lại ngay. Tin nhận được được kiểm dạng (`parseDuelState`). Mất kết nối chỉ làm ngừng đồng bộ.
 */
export function useDuelChannel({ code, role, mine, onTheirs }: Options) {
  const [connected, setConnected] = useState(false);
  const [partnerOnline, setPartnerOnline] = useState(false);
  const chanRef = useRef<ReturnType<ReturnType<typeof createSupabaseBrowserClient>["channel"]> | null>(null);
  const mineRef = useRef(mine);
  const theirsRef = useRef(onTheirs);
  useEffect(() => { mineRef.current = mine; theirsRef.current = onTheirs; });
  const send = useCallback(() => { void chanRef.current?.send({ type: "broadcast", event: "state", payload: mineRef.current }); }, []);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    let cancelled = false;
    let channel: ReturnType<typeof supabase.channel> | undefined;
    void supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return;
      if (data.session) supabase.realtime.setAuth(data.session.access_token);
      channel = supabase.channel(`duel:${code}`, { config: { broadcast: { self: false }, presence: { key: role } } });
      chanRef.current = channel;
      channel
        .on("broadcast", { event: "state" }, ({ payload }) => { const s = parseDuelState(payload, DUEL_WORDS); if (s && s.from !== role) theirsRef.current(s); })
        .on("presence", { event: "sync" }, () => setPartnerOnline((role === "a" ? "b" : "a") in channel!.presenceState()))
        .on("presence", { event: "join" }, ({ key }) => { if (key !== role) send(); })
        .subscribe((status) => {
          const ok = status === "SUBSCRIBED";
          setConnected(ok);
          if (ok) { void channel?.track({ at: Date.now() }); send(); }
        });
    });
    return () => { cancelled = true; chanRef.current = null; if (channel) void supabase.removeChannel(channel); };
  }, [code, role, send]);

  useEffect(() => { if (connected) send(); }, [mine.ready, mine.done, mine.finishedMs, connected, send]);
  return { connected, partnerOnline };
}
