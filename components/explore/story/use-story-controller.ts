"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { refreshGameSummary } from "@/components/layout/use-game-summary";
import { judge, linkClues, type LinkResult, type Verdict } from "@/lib/explore/story/deduction";
import { enterNode, pickEntry, step, visibleChoices } from "@/lib/explore/story/dialogue";
import type { StoryPayload } from "@/lib/explore/story/load-story";
import { currentObjective, objectiveProgress } from "@/lib/explore/story/objectives";
import { addFlag, applyEffects, holds } from "@/lib/explore/story/story-state";
import { standPoint, type Interactable, type Vec } from "@/lib/explore/player-movement";
import { playSfx } from "@/lib/feedback/sfx";
import { submitRoundScore } from "@/lib/practice/submit-score";
import { coopStorageId, sceneOwner, type CoopRole } from "@/lib/explore/coop/coop-state";
import { coopPoints } from "@/lib/explore/coop/coop-reward";
import { recordRemoteCoopSolve } from "@/lib/explore/sync/explore-state-repo";
import { storyRoute } from "@/lib/explore/story/story-route";
import { sceneUnlocked } from "@/lib/explore/story/objectives";
import { useCoopSession } from "./use-coop-session";
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
export interface CoopOptions { code: string; role: CoopRole }

export function useStoryController(payload: StoryPayload, sceneNpcId: string, coop?: CoopOptions) {
  const { progress, ready, update, reset } = useStoryProgress(payload.story.id, coop ? { storageId: coopStorageId(payload.story.id, coop.code, coop.role), isolated: true } : {});
  const [view, setView] = useState<StoryView>(null);
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [celebrating, setCelebrating] = useState(false);
  /** Phá án xong khi đang ở cảnh không phải cảnh kết thúc: bảng buộc tội đóng, rồi đưa người chơi về cảnh kết thúc để nghe đoạn kết. */
  const [epilogueElsewhere, setEpilogueElsewhere] = useState(false);
  const endCelebration = useCallback(() => setCelebrating(false), []);
  const { story, scene } = payload;
  const flags = progress.flags;
  const solved = flags.includes(story.solvedFlag);

  // Chơi chung: cảnh nào của ai (xem `sceneOwner`); manh mối, buộc tội và hộp thư ở `useCoopSession`.
  const route = useMemo(() => storyRoute(story.objectives, story.startScene), [story.objectives, story.startScene]);
  const [blocked, setBlocked] = useState<string | null>(null);
  /** Chơi chung: mọi cảnh đều mở (hai người chia nhau đi); chơi một mình: mở dần theo mục tiêu. */
  const isSceneOpen = useCallback((id: string) => !!coop || !!story.freeRoam || sceneUnlocked(story.objectives, story.startScene, flags, id), [coop, story.freeRoam, story.objectives, story.startScene, flags]);

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
    // Chơi chung: nhân vật và chỗ xem xét ở cảnh của đồng đội thì để họ lo; riêng cảnh buộc tội thì ai cũng dùng được khi đã đủ điều kiện buộc tội.
    const storyThing = id === sceneNpcId || scene.npcs?.some((n) => n.id === id) || scene.spots?.some((s) => s.id === id);
    const accuseOpen = scene.sceneId === story.accuseScene && holds(story.accuseWhen, flags);
    if (coop && storyThing && !accuseOpen && sceneOwner(route, scene.sceneId) !== coop.role) {
      setBlocked("Cảnh này do đồng đội phụ trách. Hãy nhờ họ điều tra rồi báo lại cho bạn.");
      return true;
    }
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
  }, [scene, sceneNpcId, flags, openNode, update, coop, route, story.accuseScene, story.accuseWhen]);

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

  /** Chấm lời buộc tội ở máy này: đúng thì đặt cờ phá án, mừng và mở đoạn kết. */
  const runAccuse = useCallback((suspectIds: string[], clueIds: string[]): Verdict => {
    const v = judge(story, suspectIds, clueIds);
    setVerdict(v);
    if (v.type === "solved") {
      playSfx("complete");
      setCelebrating(true);
      update((p) => addFlag(p, story.solvedFlag));
      if (scene.dialogues[story.epilogueNode]) openNode(story.epilogueNode);
      else { setView(null); setEpilogueElsewhere(true); }
    } else playSfx("wrong");
    return v;
  }, [story, scene, update, openNode]);

  const session = useCoopSession({ enabled: !!coop, code: coop?.code ?? "", role: coop?.role ?? "a", payload, progress, update, runAccuse, onPartnerSolved: () => setCelebrating(true) });

  /** Chơi một mình: chấm ngay. Chơi chung: gửi đề nghị cho đồng đội, họ đồng ý thì máy này mới chấm (xem `useCoopSession`). */
  const accuse = useCallback((suspectIds: string[], clueIds: string[]) => {
    if (!coop) { runAccuse(suspectIds, clueIds); return; }
    setVerdict(null);
    if (session.propose(suspectIds, clueIds) === "offline") setBlocked("Buộc tội cần cả hai người đồng ý, hãy chờ đồng đội vào phòng rồi thử lại.");
  }, [coop, runAccuse, session]);

  /** Mở đoạn kết ở cảnh kết thúc (sau khi được đưa về từ cảnh khác) và mừng. */
  const playEpilogue = useCallback(() => {
    setCelebrating(true);
    openNode(story.epilogueNode);
  }, [story.epilogueNode, openNode]);

  /** Nối hai manh mối trong sổ vụ án: cặp đúng thì thêm suy luận vào sổ. */
  const link = useCallback((a: string, b: string): LinkResult => {
    const r = linkClues(story, progress, a, b);
    if (r.status === "linked") { update(() => r.progress); playSfx("correct"); } else playSfx("wrong");
    return r;
  }, [story, progress, update]);

  // Phá án xong: ghi điểm một lần (câu kiểm tra hiểu đúng/tổng), làm mới cấp/XP ở thanh trên.
  useEffect(() => {
    if (!ready || !solved || progress.scored) return;
    update((p) => ({ ...p, scored: true }));
    const total = Math.min(20, Math.max(1, progress.checks.total));
    const correct = Math.min(total, progress.checks.right);
    const points = coop ? coopPoints(correct * 100) : correct * 100; // chơi cùng bạn được thưởng thêm
    if (coop) void recordRemoteCoopSolve(story.id, new Date().toLocaleDateString("sv-SE")).catch(() => undefined);
    void submitRoundScore("explore", { points, correct, total, durationSec: Math.max(total * 3, 60) }).then((ok) => { if (ok) refreshGameSummary(); });
  }, [ready, solved, progress.scored, progress.checks, update, coop, story.id]);

  return {
    ready, progress, view, setView, verdict, solved, isSceneOpen,
    coop: coop ? { role: coop.role, code: coop.code, ...session, blocked, route, clearBlocked: () => setBlocked(null) } : null, celebrating, endCelebration, extras, extraInteractables,
    objective: story.freeRoam ? null : currentObjective(story.objectives, flags),
    objectiveCount: story.freeRoam ? { done: 0, total: 0 } : objectiveProgress(story.objectives, flags),
    canAccuse: holds(story.accuseWhen, flags),
    interact, choose, accuse, link, reset, epilogueElsewhere, playEpilogue,
    close: () => setView(null),
  };
}
