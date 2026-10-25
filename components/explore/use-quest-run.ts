"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MAX_WRONG_PER_ROUND, roundNeedsDelivery, type QuestRound } from "@/lib/explore/build-explore-quests";
import { resolveTap, type TapOutcome } from "@/lib/explore/quest-step";

export type QuestPhase = "asking" | "correct" | "reveal" | "done";
export interface RoundResult { id: string; firstTry: boolean }

const ADVANCE_CORRECT_MS = 1100;
const ADVANCE_REVEAL_MS = 1900;

/**
 * Một lượt nhiệm vụ: lần lượt từng câu. Chạm/giao đúng thì sang câu sau; chọn sai tối đa `MAX_WRONG_PER_ROUND` lần rồi cảnh chỉ đáp án và sang câu sau.
 * Câu "mang đồ": nhặt đúng vật (`carrying`) rồi giao cho NPC mới tính đúng. `onResult` báo từng lần đúng/sai để cập nhật tiến độ và âm thanh ở nơi gọi.
 * `tap` trả kết quả lần tương tác để nơi gọi làm hiệu ứng (lắc vật sai...).
 */
export function useQuestRun(onResult: (id: string, ok: boolean) => void, npcId: string, isPortable: (id: string) => boolean) {
  const [rounds, setRounds] = useState<QuestRound[]>([]);
  const [index, setIndex] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [phase, setPhase] = useState<QuestPhase>("done");
  const [results, setResults] = useState<RoundResult[]>([]);
  const [carrying, setCarrying] = useState<string | null>(null);
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
        setCarrying(null);
        return i + 1;
      });
    }, delay);
  }, [rounds.length]);

  const start = useCallback((r: QuestRound[]) => {
    clear();
    setRounds(r); setIndex(0); setWrong(0); setResults([]); setCarrying(null);
    setPhase(r.length ? "asking" : "done");
  }, []);

  const stop = useCallback(() => { clear(); setRounds([]); setPhase("done"); setResults([]); setCarrying(null); }, []);

  const tap = useCallback((tappedId: string): TapOutcome => {
    const round = rounds[index];
    if (!round || phase !== "asking") return { type: "ignore" };
    const outcome = resolveTap({ targetId: round.targetId, needsDelivery: roundNeedsDelivery(round.kind, isPortable(round.targetId)), tappedId, carrying, npcId });
    if (outcome.type === "pickup") setCarrying(outcome.id);
    else if (outcome.type === "correct") {
      onResult(round.targetId, true);
      finishRound("correct", wrong === 0, round.targetId, ADVANCE_CORRECT_MS);
    } else if (outcome.type === "wrong") {
      onResult(round.targetId, false);
      if (wrong + 1 >= MAX_WRONG_PER_ROUND) finishRound("reveal", false, round.targetId, ADVANCE_REVEAL_MS);
      else setWrong(wrong + 1);
    }
    return outcome;
  }, [rounds, index, phase, wrong, carrying, npcId, isPortable, onResult, finishRound]);

  const active = rounds.length > 0 && phase !== "done";
  return { active, rounds, round: rounds[index] ?? null, index, phase, results, carrying, wrong, start, stop, tap };
}
