"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { otherRole, validPhrase, type CoopRole } from "@/lib/explore/coop/coop-state";
import { parseProposal, parseReply, parseReport, parseVerdict, sharedFlags, type CaseIds, type ProposalEvent, type ReplyEvent, type ReportEvent, type VerdictEvent, type VerdictKind } from "@/lib/explore/coop/coop-events";
import { parseMessage } from "@/lib/explore/coop/coop-messages";
import type { VoiceClip } from "@/lib/speech/voice-clip";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";

export interface SharedState { flags: string[] }
export interface CoopSay { from: CoopRole; zh: string; at: number }

/** Các việc cần làm khi nhận tin từ đồng đội (đã kiểm tra dạng). */
export interface CoopHandlers {
  onPartnerState: (s: SharedState) => void;
  onReport: (e: ReportEvent) => void;
  onProposal: (e: ProposalEvent) => void;
  onReply: (e: ReplyEvent) => void;
  onVerdict: (e: VerdictEvent) => void;
}

interface Options {
  code: string;
  caseId: string;
  role: CoopRole;
  /** Cờ hiện tại của mình để gửi cho đồng đội (khi đồng đội mới vào, hoặc khi mình có thay đổi). Manh mối KHÔNG chia sẻ tự động: chỉ vào sổ người kia khi được báo. */
  state: SharedState;
  /** Id manh mối và nghi phạm của vụ án, để bỏ tin có id lạ. */
  ids: CaseIds;
  handlers: CoopHandlers;
  /** Tắt hẳn (chơi một mình): không mở kênh. */
  enabled: boolean;
}

const isStrings = (v: unknown): v is string[] => Array.isArray(v) && v.every((x) => typeof x === "string") && v.length < 500;
/** Câu nói hợp lệ: một câu nói nhanh có sẵn hoặc một câu ghép từ mẫu. */
const validSay = (v: unknown): string | null => validPhrase(v) ?? parseMessage(v)?.zh ?? null;

/**
 * Kênh thời gian thực giữa hai người chơi chung (Supabase Realtime, broadcast + presence; không lưu gì vào cơ sở dữ liệu, nên không cần migration).
 * Trao đổi: cờ tiến độ (chỉ ghép thêm), câu nói, báo manh mối, đề nghị buộc tội và trả lời, kết quả buộc tội. Dữ liệu nhận về được kiểm tra dạng; nội dung lạ bị bỏ.
 * Lỗi kết nối chỉ làm mất đồng bộ (`connected` = false), người chơi vẫn chơi tiếp phần mình.
 */
export function useCoopChannel({ code, caseId, role, state, ids, handlers, enabled }: Options) {
  const [connected, setConnected] = useState(false);
  const [partnerOnline, setPartnerOnline] = useState(false);
  const [said, setSaid] = useState<CoopSay[]>([]);
  const chanRef = useRef<ReturnType<ReturnType<typeof createSupabaseBrowserClient>["channel"]> | null>(null);
  const stateRef = useRef(state);
  const handlersRef = useRef(handlers);
  const idsRef = useRef(ids);
  useEffect(() => { stateRef.current = state; handlersRef.current = handlers; idsRef.current = ids; });

  const send = useCallback((event: string, payload: Record<string, unknown>) => {
    void chanRef.current?.send({ type: "broadcast", event, payload: { from: role, ...payload } });
  }, [role]);
  const sendState = useCallback(() => send("state", { flags: sharedFlags(stateRef.current.flags) }), [send]);

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
          const p = payload as { from?: unknown; flags?: unknown };
          if (p?.from === role || !isStrings(p?.flags)) return;
          handlersRef.current.onPartnerState({ flags: sharedFlags(p.flags) });
        })
        .on("broadcast", { event: "say" }, ({ payload }) => {
          const p = payload as { from?: unknown; zh?: unknown };
          const zh = validSay(p?.zh);
          if (p?.from === role || (p?.from !== "a" && p?.from !== "b") || !zh) return;
          setSaid((cur) => [...cur.slice(-4), { from: p.from as CoopRole, zh, at: Date.now() }]);
        })
        .on("broadcast", { event: "report" }, ({ payload }) => { const e = parseReport(payload, idsRef.current); if (e && e.from !== role) handlersRef.current.onReport(e); })
        .on("broadcast", { event: "propose" }, ({ payload }) => { const e = parseProposal(payload, idsRef.current); if (e && e.from !== role) handlersRef.current.onProposal(e); })
        .on("broadcast", { event: "reply" }, ({ payload }) => { const e = parseReply(payload); if (e && e.from !== role) handlersRef.current.onReply(e); })
        .on("broadcast", { event: "verdict" }, ({ payload }) => { const e = parseVerdict(payload); if (e && e.from !== role) handlersRef.current.onVerdict(e); })
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

  // Mỗi khi cờ của mình đổi thì báo cho đồng đội (gộp thay đổi liên tiếp).
  const stamp = sharedFlags(state.flags).length;
  useEffect(() => {
    if (!connected) return;
    const t = setTimeout(sendState, 200);
    return () => clearTimeout(t);
  }, [stamp, connected, sendState]);

  const say = useCallback((zh: string) => {
    const ok = validSay(zh);
    if (!ok) return;
    setSaid((cur) => [...cur.slice(-4), { from: role, zh: ok, at: Date.now() }]);
    send("say", { zh: ok });
  }, [role, send]);

  const sendReport = useCallback((clueId: string, clip?: VoiceClip) => send("report", { clueId, ...(clip ? { clip } : {}) }), [send]);
  const sendProposal = useCallback((suspectIds: string[], clueIds: string[]) => send("propose", { suspectIds, clueIds }), [send]);
  const sendReply = useCallback((ok: boolean) => send("reply", { ok }), [send]);
  const sendVerdict = useCallback((kind: VerdictKind) => send("verdict", { kind }), [send]);

  return { connected, partnerOnline, said, say, sendReport, sendProposal, sendReply, sendVerdict };
}
