"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MAX_WRONG_PER_ROUND, type QuestRound } from "@/lib/explore/build-explore-quests";

export type QuestPhase = "asking" | "correct" | "reveal" | "done";
export interface RoundResult { id: string; firstTry: boolean }

const ADVANCE_CORRECT_MS = 1100;
const ADVANCE_REVEAL_MS = 1900;

/**
 * Một lượt nhiệm vụ: lần lượt từng câu. Chạm đúng thì sang câu sau; chạm sai tối đa `MAX_WRONG_PER_ROUND` lần rồi cảnh chỉ đáp án và sang câu sau.
 * `onResult` báo từng lần chạm (đúng/sai) để cập nhật tiến độ và âm thanh ở nơi gọi.
 */
export function useQuestRun(onResult: (id: string, ok: boolean) => void) {
  const [rounds, setRounds] = useState<QuestRound[]>([]);
  const [index, setIndex] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [phase, setPhase] = useState<QuestPhase>("done");
  const [results, setResults] = useState<RoundResult[]>([]);
  const [lastWrongId, setLastWrongId] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clear = () => { if (timer.current) { clearTimeout(timer.current); timer.current = null; } };
  useEffect(() => clear, []);

  const finishRound = useCallback((next: QuestPhase, firstTry: boolean, id: string, delay: number) => {
    setPhase(next);
    setResults((r) => [...r, { id, firstTry }]);
    clear();
    timer.current = setTimeout(() => {
      setIndex((i) => {
        if (i + 1 >= rounds.length) { setPhase("done"); return i; }
        setPhase("asking");
        setWrong(0);
        return i + 1;
      });
    }, delay);
  }, [rounds.length]);

  const start = useCallback((r: QuestRound[]) => {
    clear();
    setRounds(r); setIndex(0); setWrong(0); setResults([]); setLastWrongId(null);
    setPhase(r.length ? "asking" : "done");
  }, []);

  const stop = useCallback(() => { clear(); setRounds([]); setPhase("done"); setResults([]); }, []);

  const tap = useCallback((tappedId: string) => {
    const round = rounds[index];
    if (!round || phase !== "asking") return;
    if (tappedId === round.targetId) {
      onResult(round.targetId, true);
      finishRound("correct", wrong === 0, round.targetId, ADVANCE_CORRECT_MS);
      return;
    }
    onResult(round.targetId, false);
    setLastWrongId(tappedId);
    if (wrong + 1 >= MAX_WRONG_PER_ROUND) finishRound("reveal", false, round.targetId, ADVANCE_REVEAL_MS);
    else setWrong(wrong + 1);
  }, [rounds, index, phase, wrong, onResult, finishRound]);

  const active = rounds.length > 0 && phase !== "done";
  return { active, rounds, round: rounds[index] ?? null, index, phase, results, lastWrongId, wrong, start, stop, tap };
}
