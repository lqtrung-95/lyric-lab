"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { buildQuestRounds } from "@/lib/explore/build-explore-quests";
import { isDiscovered, isFaded } from "@/lib/explore/explore-progress";
import type { SceneDetail, SceneWord } from "@/lib/explore/explore-types";
import { keyToDir, standPoint, type Interactable } from "@/lib/explore/player-movement";
import { playSfx } from "@/lib/feedback/sfx";
import { playChinese } from "@/lib/speech/play-chinese";
import type { AvatarFx } from "./player-avatar";
import type { ObjectMark } from "./scene-canvas";
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
  const quest = useQuestRun(onResult);

  function startQuest() {
    const priority = new Set(learnedWords.filter((o) => marks[o.id] === "faded" || (progress.terms[o.id]?.wrong ?? 0) > (progress.terms[o.id]?.correct ?? 0)).map((o) => o.id));
    setPanel(null);
    quest.start(buildQuestRounds(learnedWords, priority));
  }

  function interact(id: string) {
    if (id === scene.npc.id) { if (!quest.active) setPanel({ kind: "npc" }); return; }
    const o = words[id];
    if (!o) return;
    if (quest.active) {
      if (quest.phase === "asking" && quest.round && id !== quest.round.targetId) {
        setShakeId(id);
        later(450, () => setShakeId(null));
      }
      quest.tap(id);
      return;
    }
    discover(id);
    setPanel({ kind: "word", word: o });
    void playChinese(o.term);
  }
  // Nhân vật đi mất một lúc rồi mới tương tác: dùng bản `interact` mới nhất lúc tới nơi (trạng thái nhiệm vụ có thể đã đổi).
  const interactRef = useRef(interact);
  useEffect(() => { interactRef.current = interact; });

  const walkTo = player.walkTo;
  const activate = useCallback((id: string) => {
    const it = interactables.find((i) => i.id === id);
    if (it) walkTo(it.at, () => interactRef.current(id));
  }, [interactables, walkTo]);

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
    ready, marks, words, learnedWords, canQuest, panel, setPanel, quest, player, fx, shakeId, stageProps,
    startQuest, activate, reset,
    highlightId: quest.active && (quest.phase === "correct" || quest.phase === "reveal") ? quest.round?.targetId ?? null : null,
    openWord: (w: SceneWord) => { setPanel({ kind: "word", word: w }); void playChinese(w.term); },
  };
}
