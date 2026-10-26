"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { otherRole, validPhrase, type CoopRole } from "@/lib/explore/coop/coop-state";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";

export interface SharedState { flags: string[]; clues: string[] }
export interface CoopSay { from: CoopRole; zh: string; at: number }

interface Options {
  code: string;
  caseId: string;
  role: CoopRole;
  /** Trạng thái hiện tại của mình để gửi cho đồng đội (khi đồng đội mới vào, hoặc khi mình có thay đổi). */
  state: SharedState;
  onPartnerState: (s: SharedState) => void;
  /** Tắt hẳn (chơi một mình): không mở kênh. */
  enabled: boolean;
}

const isStrings = (v: unknown): v is string[] => Array.isArray(v) && v.every((x) => typeof x === "string") && v.length < 500;

/**
 * Kênh thời gian thực giữa hai người chơi chung (Supabase Realtime, broadcast + presence; không lưu gì vào cơ sở dữ liệu, nên không cần migration).
 * Trao đổi: tiến độ (cờ và manh mối, chỉ ghép thêm) và câu nói nhanh có sẵn. Dữ liệu nhận về được kiểm tra dạng; nội dung lạ bị bỏ.
 * Lỗi kết nối chỉ làm mất đồng bộ (`connected` = false), người chơi vẫn chơi tiếp phần mình.
 */
export function useCoopChannel({ code, caseId, role, state, onPartnerState, enabled }: Options) {
  const [connected, setConnected] = useState(false);
  const [partnerOnline, setPartnerOnline] = useState(false);
  const [said, setSaid] = useState<CoopSay[]>([]);
  const chanRef = useRef<ReturnType<ReturnType<typeof createSupabaseBrowserClient>["channel"]> | null>(null);
  const stateRef = useRef(state);
  const handlerRef = useRef(onPartnerState);
  useEffect(() => { stateRef.current = state; handlerRef.current = onPartnerState; });

  const sendState = useCallback(() => {
    void chanRef.current?.send({ type: "broadcast", event: "state", payload: { from: role, ...stateRef.current } });
  }, [role]);

  useEffect(() => {
    if (!enabled) return;
    const supabase = createSupabaseBrowserClient();
    let cancelled = false;
    let channel: ReturnType<typeof supabase.channel> | undefined;
    void supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return;
      if (data.session) supabase.realtime.setAuth(data.session.access_token);
      channel = supabase.channel(`coop:${caseId}:${code}`, { config: { broadcast: { self: false }, presence: { key: role } } });
      chanRef.current = channel;
      channel
        .on("broadcast", { event: "state" }, ({ payload }) => {
          const p = payload as { from?: unknown; flags?: unknown; clues?: unknown };
          if (p?.from === role || !isStrings(p?.flags) || !isStrings(p?.clues)) return;
          handlerRef.current({ flags: p.flags, clues: p.clues });
        })
        .on("broadcast", { event: "say" }, ({ payload }) => {
          const p = payload as { from?: unknown; zh?: unknown };
          const zh = validPhrase(p?.zh);
          if (p?.from === role || (p?.from !== "a" && p?.from !== "b") || !zh) return;
          setSaid((cur) => [...cur.slice(-4), { from: p.from as CoopRole, zh, at: Date.now() }]);
        })
        .on("presence", { event: "sync" }, () => setPartnerOnline(otherRole(role) in channel!.presenceState()))
        // Đồng đội vừa vào: gửi ngay trạng thái của mình để họ bắt kịp.
        .on("presence", { event: "join" }, ({ key }) => { if (key !== role) sendState(); })
        .subscribe((status) => {
          const ok = status === "SUBSCRIBED";
          setConnected(ok);
          if (ok) { void channel?.track({ at: Date.now() }); sendState(); }
        });
    });
    return () => {
      cancelled = true;
      chanRef.current = null;
      if (channel) void supabase.removeChannel(channel);
    };
  }, [code, caseId, role, sendState, enabled]);

  // Mỗi khi tiến độ của mình đổi thì báo cho đồng đội (gộp thay đổi liên tiếp).
  const stamp = `${state.flags.length}:${state.clues.length}`;
  useEffect(() => {
    if (!connected) return;
    const t = setTimeout(sendState, 200);
    return () => clearTimeout(t);
  }, [stamp, connected, sendState]);

  const say = useCallback((zh: string) => {
    const ok = validPhrase(zh);
    if (!ok) return;
    setSaid((cur) => [...cur.slice(-4), { from: role, zh: ok, at: Date.now() }]);
    void chanRef.current?.send({ type: "broadcast", event: "say", payload: { from: role, zh: ok } });
  }, [role]);

  return { connected, partnerOnline, said, say };
}
