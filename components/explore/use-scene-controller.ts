"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { refreshGameSummary } from "@/components/layout/use-game-summary";
import { buildQuestRounds } from "@/lib/explore/build-explore-quests";
import { isDiscovered, isFaded } from "@/lib/explore/explore-progress";
import type { SceneDetail, SceneWord } from "@/lib/explore/explore-types";
import { keyToDir, standPoint, type Interactable } from "@/lib/explore/player-movement";
import { playSfx } from "@/lib/feedback/sfx";
import { answerPoints } from "@/lib/practice/scoring";
import { submitRoundScore } from "@/lib/practice/submit-score";
import { savedItemForWord } from "@/lib/explore/saved-item";
import { useLearnerState } from "@/lib/user-state/use-learner-state";
import { practiceRoundXp } from "@/lib/game/xp-rules";
import { playChinese } from "@/lib/speech/play-chinese";
import type { AvatarFx } from "./player-avatar";
import type { ObjectMark } from "./scene-canvas";
import type { CardState } from "./word-card";
import { useExploreProgress } from "./use-explore-progress";
import { usePlayerMovement } from "./use-player-movement";
import { useQuestRun } from "./use-quest-run";

export const MIN_WORDS_FOR_QUEST = 3;
export type Panel = { kind: "word"; word: SceneWord } | { kind: "npc" } | null;

/**
 * Điều khiển cả cảnh: tiến độ học, nhiệm vụ, nhân vật di chuyển và tương tác. Tương tác (`interact`) là một chỗ duy nhất cho mọi đường vào:
 * nhấn E khi đứng gần vật, hoặc bấm/chạm vào vật (nhân vật tự đi tới rồi mới tương tác). Ngoài nhiệm vụ: học từ (nghe + ghi sổ tay + thẻ từ);
 * trong nhiệm vụ: là câu trả lời; với NPC: nói chuyện/nhận nhiệm vụ.
 */
export function useSceneController(scene: SceneDetail) {
  const { progress, ready, now, discover, answer, reset } = useExploreProgress();
  const { state: learner, toggleSaved } = useLearnerState();
  const [panel, setPanel] = useState<Panel>(null);
  const [shakeId, setShakeId] = useState<string | null>(null);
  const [fx, setFx] = useState<AvatarFx>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const words = useMemo(() => Object.fromEntries(scene.objects.map((o) => [o.id, o])) as Record<string, SceneWord>, [scene.objects]);
  const marks = useMemo(() => Object.fromEntries(scene.objects.map((o): [string, ObjectMark] => [o.id, !isDiscovered(progress, o.id) ? "new" : isFaded(progress, o.id, now) ? "faded" : "learned"])), [scene.objects, progress, now]);
  const learnedWords = scene.objects.filter((o) => marks[o.id] !== "new");
  const canQuest = learnedWords.length >= MIN_WORDS_FOR_QUEST;

  const interactables = useMemo<Interactable[]>(() => [...scene.objects.map((o) => ({ id: o.id, at: standPoint(o) })), { id: scene.npc.id, at: standPoint(scene.npc) }], [scene]);
  const player = usePlayerMovement(interactables);

  const later = useCallback((ms: number, fn: () => void) => { timers.current.push(setTimeout(fn, ms)); }, []);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  const flash = useCallback((kind: "hop" | "oops") => { setFx(kind); later(600, () => setFx(null)); }, [later]);

  const onResult = useCallback((id: string, ok: boolean) => { answer(id, ok); playSfx(ok ? "correct" : "wrong"); flash(ok ? "hop" : "oops"); }, [answer, flash]);
  const isPortable = useCallback((id: string) => words[id]?.portable === true, [words]);
  const quest = useQuestRun(onResult, scene.npc.id, isPortable);

  const runStartedAt = useRef(0);
  const submittedRun = useRef(-1);
  const runNo = useRef(0);

  function startQuest() {
    runNo.current += 1;
    runStartedAt.current = Date.now();
    const priority = new Set(learnedWords.filter((o) => marks[o.id] === "faded" || (progress.terms[o.id]?.wrong ?? 0) > (progress.terms[o.id]?.correct ?? 0)).map((o) => o.id));
    setPanel(null);
    quest.start(buildQuestRounds(learnedWords, priority));
  }

  function interact(id: string) {
    if (quest.active) {
      // Trong nhiệm vụ mọi tương tác (kể cả với NPC để giao đồ) là một lần trả lời; chỉ vật hoặc NPC của cảnh mới hợp lệ.
      if (id !== scene.npc.id && !words[id]) return;
      const outcome = quest.tap(id);
      if (outcome.type === "wrong") { setShakeId(id); later(450, () => setShakeId(null)); }
      else if (outcome.type === "pickup") playSfx("correct");
      return;
    }
    if (id === scene.npc.id) { setPanel({ kind: "npc" }); return; }
    const o = words[id];
    if (!o) return;
    discover(id);
    // Từ học ở đây vào bộ ôn (thẻ FSRS) nếu có câu thật làm nguồn; đã lưu rồi thì thôi (toggleSaved sẽ bỏ lưu nếu gọi lại).
    const card = savedItemForWord(o);
    if (card && !learner.saved.some((x) => x.key === card.key)) toggleSaved(card);
    setPanel({ kind: "word", word: o });
    void playChinese(o.term);
  }
  // Nhân vật đi mất một lúc rồi mới tương tác: dùng bản `interact` mới nhất lúc tới nơi (trạng thái nhiệm vụ có thể đã đổi).
  const interactRef = useRef(interact);
  useEffect(() => { interactRef.current = interact; });

  // Xong một lượt nhiệm vụ: ghi điểm (tính XP, chuỗi ngày, nhiệm vụ ngày như các lượt luyện tập khác) rồi làm mới cấp/XP ở thanh trên.
  const finished = !quest.active && quest.rounds.length > 0 && quest.results.length === quest.rounds.length;
  const firstTry = quest.results.filter((r) => r.firstTry).length;
  useEffect(() => {
    if (!finished || submittedRun.current === runNo.current) return;
    submittedRun.current = runNo.current;
    playSfx("complete");
    void submitRoundScore("explore", {
      points: firstTry * answerPoints("correct", 0), correct: firstTry, total: quest.rounds.length,
      durationSec: Math.max(quest.rounds.length * 2, (Date.now() - runStartedAt.current) / 1000),
    }).then((ok) => { if (ok) refreshGameSummary(); });
  }, [finished, firstTry, quest.rounds.length]);

  const walkTo = player.walkTo;
  const activate = useCallback((id: string) => {
    const it = interactables.find((i) => i.id === id);
    if (it) walkTo(it.at, () => interactRef.current(id));
  }, [interactables, walkTo]);

  const cardStateOf = (w: SceneWord): CardState => {
    const card = savedItemForWord(w);
    if (!card) return "no_example";
    return learner.saved.some((x) => x.key === card.key) ? "saved" : "pending";
  };

  const stageProps = {
    tabIndex: 0,
    role: "group" as const,
    "aria-label": "Khung cảnh. Dùng phím mũi tên hoặc WASD để đi, phím E để tương tác với vật ở gần.",
    onKeyDown: (e: KeyboardEvent<HTMLElement>) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const d = keyToDir(e.key);
      if (d) { e.preventDefault(); player.press(d); return; }
      if (e.key.toLowerCase() === "e" && player.nearId) { e.preventDefault(); interact(player.nearId); }
    },
    onKeyUp: (e: KeyboardEvent<HTMLElement>) => { const d = keyToDir(e.key); if (d) player.release(d); },
    onBlur: () => player.releaseAll(),
  };

  return {
    ready, marks, words, cardStateOf, learnedWords, canQuest, panel, setPanel, quest, player, fx, shakeId, stageProps,
    startQuest, activate, reset, learner, xpEarned: practiceRoundXp(firstTry, quest.rounds.length),
    highlightId: quest.active && (quest.phase === "correct" || quest.phase === "reveal") ? quest.round?.targetId ?? null : null,
    openWord: (w: SceneWord) => { setPanel({ kind: "word", word: w }); void playChinese(w.term); },
  };
}
