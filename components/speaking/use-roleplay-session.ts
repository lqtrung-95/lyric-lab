"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { recordFluency } from "@/lib/speaking/fluency-stats";
import { playAndWait, stopChinese } from "@/lib/speaking/play-and-wait";
import { hanChars } from "@/lib/speaking/reply-match";
import { MAX_ROLEPLAY_TURNS } from "@/lib/roleplay/turn-schema";
import type { Scenario } from "@/lib/roleplay/scenarios";
import { useSpeakTurn } from "./use-speak-turn";

export interface Feedback { issue: string; better: string; pinyin?: string }
export interface Tip { zh: string; pinyin?: string }
export interface Msg { id: number; role: "ai" | "user"; zh: string; vi?: string; pinyin?: string; feedback?: Feedback | null; tips?: Tip[] }
export type Status = "ai_speaking" | "your_turn" | "thinking" | "ended";
export type SessionError = "rate_limited" | "account_required" | "failed" | "no_speech";

interface TurnResponse { reply: string; replyVi: string; tips: string[]; feedback: { issue: string; better: string } | null; pinyin: Record<string, string> }

async function fetchTurn(body: unknown): Promise<{ ok: true; data: TurnResponse } | { ok: false; error: SessionError }> {
  try {
    const res = await fetch("/api/roleplay/turn", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (res.ok) return { ok: true, data: (await res.json()) as TurnResponse };
    const code = ((await res.json().catch(() => null)) as { error?: string } | null)?.error;
    return { ok: false, error: code === "rate_limited" ? "rate_limited" : code === "account_required" ? "account_required" : "failed" };
  } catch {
    return { ok: false, error: "failed" };
  }
}

/**
 * Điều phối một buổi trò chuyện: AI nói (đọc to) → micro tự bật → người học nói (hoặc gõ) → gọi AI đáp → lặp tới `MAX_ROLEPLAY_TURNS` lượt hoặc khi người học kết thúc.
 * Ghi chỉ số lưu loát khi buổi kết thúc. Lượt nói không nghe rõ không gọi AI (không tốn hạn mức trò chuyện).
 */
export function useRoleplaySession(scenario: Scenario, level: number, openingPinyin: string | undefined, typingOnly: boolean) {
  const [msgs, setMsgs] = useState<Msg[]>([{ id: 0, role: "ai", zh: scenario.opening.zh, vi: scenario.opening.vi, pinyin: openingPinyin }]);
  const [status, setStatus] = useState<Status>("ai_speaking");
  const [error, setError] = useState<SessionError | null>(null);
  const [pending, setPending] = useState<string | null>(null);
  const stats = useRef({ turns: 0, reactions: [] as number[], han: 0 });
  const [shown, setShown] = useState({ turns: 0, reactions: [] as number[], han: 0 });
  const msgsRef = useRef(msgs);
  useEffect(() => { msgsRef.current = msgs; });
  const nextId = useRef(1);
  const startRef = useRef<() => Promise<void>>(async () => {});
  const submitRef = useRef<(text: string, onsetMs: number | null) => Promise<void>>(async () => {});

  const turnHook = useSpeakTurn(15, (r) => {
    if (hanChars(r.text).length < 2) { setError("no_speech"); setStatus("your_turn"); return; }
    void submitRef.current(r.text, r.onsetMs);
  });
  useEffect(() => { startRef.current = turnHook.start; });

  const yourTurn = useCallback(() => { setStatus("your_turn"); if (!typingOnly) void startRef.current(); }, [typingOnly]);

  // Câu mở đầu: đọc to rồi tới lượt người học.
  useEffect(() => {
    let live = true;
    void playAndWait(scenario.opening.zh).then(() => { if (live) yourTurn(); });
    return () => { live = false; stopChinese(); };
  }, [scenario, yourTurn]);

  async function submit(text: string, onsetMs: number | null) {
    setError(null);
    setPending(text);
    setStatus("thinking");
    const history = msgsRef.current.map((m) => ({ role: m.role, zh: m.zh }));
    const res = await fetchTurn({ scenarioId: scenario.id, level, history, userText: text });
    if (!res.ok) { setError(res.error); setStatus("your_turn"); return; }
    setPending(null);
    const { data } = res;
    stats.current.turns += 1;
    stats.current.han += hanChars(text).length;
    if (onsetMs !== null) stats.current.reactions = [...stats.current.reactions, onsetMs];
    setShown({ ...stats.current });
    const withPy = (zh: string) => data.pinyin[zh];
    const user: Msg = { id: nextId.current++, role: "user", zh: text, feedback: data.feedback ? { ...data.feedback, pinyin: withPy(data.feedback.better) } : null };
    const ai: Msg = { id: nextId.current++, role: "ai", zh: data.reply, vi: data.replyVi, pinyin: withPy(data.reply), tips: data.tips.map((t) => ({ zh: t, pinyin: withPy(t) })) };
    setMsgs((m) => [...m, user, ai]);
    setStatus("ai_speaking");
    await playAndWait(data.reply);
    if (stats.current.turns >= MAX_ROLEPLAY_TURNS) end(); else yourTurn();
  }

  useEffect(() => { submitRef.current = submit; });
  const loggedEnd = useRef(false);
  function end() {
    turnHook.cancel();
    stopChinese();
    if (!loggedEnd.current) {
      loggedEnd.current = true;
      const s = stats.current;
      recordFluency({ source: "roleplay", turns: s.turns, reactionMs: s.reactions, hanChars: s.han, words: [] });
    }
    setStatus("ended");
  }

  return {
    msgs, status, error, pending, turns: shown.turns, reactions: shown.reactions, han: shown.han,
    speak: turnHook, submit: (t: string) => void submit(t, null), retry: () => { if (pending) void submit(pending, null); }, end,
    clearError: () => { setError(null); turnHook.clearError(); },
  };
}
