"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { refreshGameSummary } from "@/components/layout/use-game-summary";
import { judge, type Verdict } from "@/lib/explore/story/deduction";
import { enterNode, pickEntry, step, visibleChoices } from "@/lib/explore/story/dialogue";
import type { StoryPayload } from "@/lib/explore/story/load-story";
import { currentObjective, objectiveProgress } from "@/lib/explore/story/objectives";
import { addFlag, applyEffects, holds } from "@/lib/explore/story/story-state";
import { standPoint, type Interactable, type Vec } from "@/lib/explore/player-movement";
import { playSfx } from "@/lib/feedback/sfx";
import { submitRoundScore } from "@/lib/practice/submit-score";
import { useStoryProgress } from "./use-story-progress";

export type StoryView =
  | { kind: "dialogue"; nodeId: string }
  | { kind: "clue"; clueId: string }
  | { kind: "case" }
  | { kind: "accuse" }
  | { kind: "map" }
  | null;

/** Thứ của cốt truyện vẽ thêm trong cảnh: NPC của vụ án hoặc chỗ có thể xem xét lấy manh mối. */
export interface StoryExtra {
  id: string;
  kind: "npc" | "spot";
  sprite: string;
  label: string;
  x: number;
  y: number;
  w: number;
  stand?: Vec;
}

/**
 * Điều khiển cốt truyện của một cảnh: nói chuyện (hội thoại có lựa chọn và câu kiểm tra hiểu), xem xét manh mối, sổ vụ án, bản đồ, buộc tội.
 * `interact(id)` trả true nếu cốt truyện đã xử lý lần tương tác đó (NPC của cảnh, NPC phụ, chỗ xem xét) để bộ điều khiển cảnh không xử lý nữa.
 * Phá án xong thì ghi điểm một lần (đúng/tổng câu kiểm tra hiểu) để tính XP như một lượt luyện tập.
 */
export function useStoryController(payload: StoryPayload, sceneNpcId: string) {
  const { progress, ready, update, reset } = useStoryProgress();
  const [view, setView] = useState<StoryView>(null);
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const { story, scene } = payload;
  const flags = progress.flags;
  const solved = flags.includes(story.solvedFlag);

  const extras = useMemo<StoryExtra[]>(() => [
    ...(scene.npcs ?? []).filter((n) => holds(n.when, flags)).map((n): StoryExtra => ({ id: n.id, kind: "npc", sprite: n.sprite, label: n.name, x: n.x, y: n.y, w: n.w })),
    ...(scene.spots ?? []).filter((s) => holds(s.when, flags)).map((s): StoryExtra => ({ id: s.id, kind: "spot", sprite: s.sprite, label: s.label, x: s.x, y: s.y, w: s.w, stand: s.stand })),
  ], [scene, flags]);
  const extraInteractables = useMemo<Interactable[]>(() => extras.map((e) => ({ id: e.id, at: standPoint(e) })), [extras]);

  const openNode = useCallback((id: string) => {
    const node = scene.dialogues[id];
    if (!node) return;
    update((p) => enterNode(p, node));
    setView({ kind: "dialogue", nodeId: id });
  }, [scene, update]);

  const interact = useCallback((id: string): boolean => {
    const npc = scene.npcs?.find((n) => n.id === id && holds(n.when, flags));
    const entries = id === sceneNpcId ? scene.sceneNpcEntries : npc?.entries;
    if (entries !== undefined) {
      const entry = pickEntry(entries, flags);
      if (entry) openNode(entry);
      return true;
    }
    const spot = scene.spots?.find((s) => s.id === id && holds(s.when, flags));
    if (spot) {
      update((p) => applyEffects(p, [{ clue: spot.clue }]));
      setView({ kind: "clue", clueId: spot.clue });
      return true;
    }
    return false;
  }, [scene, sceneNpcId, flags, openNode, update]);

  /** Chọn một lựa chọn trong hội thoại (`index`), hoặc null để bấm "Tiếp". */
  const choose = useCallback((index: number | null) => {
    if (view?.kind !== "dialogue") return;
    const node = scene.dialogues[view.nodeId];
    const picked = index === null ? undefined : visibleChoices(node, flags)[index];
    const r = step(node, progress, index);
    if (!r.moved) return;
    if (picked?.check) playSfx(picked.check === "right" ? "correct" : "wrong");
    update(() => r.progress);
    if (picked?.action === "accuse") { setVerdict(null); setView({ kind: "accuse" }); return; }
    if (r.next) openNode(r.next);
    else setView(null);
  }, [view, scene, flags, progress, openNode, update]);

  const accuse = useCallback((suspectId: string, clueIds: string[]) => {
    const v = judge(story, suspectId, clueIds);
    setVerdict(v);
    if (v.type === "solved") {
      playSfx("complete");
      update((p) => addFlag(p, story.solvedFlag));
      openNode(story.epilogueNode);
    } else playSfx("wrong");
  }, [story, update, openNode]);

  // Phá án xong: ghi điểm một lần (câu kiểm tra hiểu đúng/tổng), làm mới cấp/XP ở thanh trên.
  useEffect(() => {
    if (!ready || !solved || progress.scored) return;
    update((p) => ({ ...p, scored: true }));
    const total = Math.min(20, Math.max(1, progress.checks.total));
    const correct = Math.min(total, progress.checks.right);
    void submitRoundScore("explore", { points: correct * 100, correct, total, durationSec: Math.max(total * 3, 60) }).then((ok) => { if (ok) refreshGameSummary(); });
  }, [ready, solved, progress.scored, progress.checks, update]);

  return {
    ready, progress, view, setView, verdict, solved, extras, extraInteractables,
    objective: currentObjective(story.objectives, flags),
    objectiveCount: objectiveProgress(story.objectives, flags),
    canAccuse: holds(story.accuseWhen, flags),
    interact, choose, accuse, reset,
    close: () => setView(null),
  };
}
