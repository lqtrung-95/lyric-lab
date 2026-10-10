"use client";

import { useCallback, useState } from "react";

export interface AskTurn { q: string; a: string }
export type AskStatus = "idle" | "loading" | "rate_limited" | "error";

/** Số lượt hỏi đáp trước đó gửi kèm để câu hỏi tiếp theo nối được mạch (server cũng giới hạn). */
const HISTORY_TURNS = 3;

/** Hỏi AI tự do về một câu (/api/ask-line): giữ chuỗi hỏi-đáp của câu đó trong phiên mở hộp thoại. */
export function useAskLine(videoId: string, lineIndex: number) {
  const [turns, setTurns] = useState<AskTurn[]>([]);
  const [status, setStatus] = useState<AskStatus>("idle");

  const ask = useCallback(async (question: string): Promise<boolean> => {
    setStatus("loading");
    try {
      const res = await fetch("/api/ask-line", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoId, lineIndex, question, history: turns.slice(-HISTORY_TURNS) }),
      });
      if (!res.ok) {
        const code = ((await res.json().catch(() => null)) as { error?: string } | null)?.error;
        setStatus(code === "rate_limited" ? "rate_limited" : "error");
        return false;
      }
      const { answer } = (await res.json()) as { answer: string };
      setTurns((t) => [...t, { q: question, a: answer }]);
      setStatus("idle");
      return true;
    } catch {
      setStatus("error");
      return false;
    }
  }, [videoId, lineIndex, turns]);

  return { turns, status, ask };
}
