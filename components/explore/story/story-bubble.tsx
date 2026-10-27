"use client";

import type { RefObject } from "react";
import type { SceneDetail } from "@/lib/explore/explore-types";
import { visibleChoices } from "@/lib/explore/story/dialogue";
import type { StoryPayload } from "@/lib/explore/story/load-story";
import { AVATAR_WIDTH } from "../player-avatar";
import { DialogueBubble, type BubbleAnchor } from "./dialogue-bubble";
import { useStoryHints } from "./use-story-hints";
import type { useStoryController } from "./use-story-controller";

type Controller = ReturnType<typeof useStoryController>;

/** Vị trí người nói: Gấu Trúc theo vị trí hiện tại của nhân vật, người khác theo NPC của cảnh (không có thì dùng NPC của cảnh làm chỗ neo). */
function anchorOf(speakerId: string, scene: SceneDetail, playerEl: HTMLElement | null): BubbleAnchor {
  if (speakerId === "player") {
    const x = parseFloat(playerEl?.style.left ?? "");
    const y = parseFloat(playerEl?.style.top ?? "");
    if (Number.isFinite(x) && Number.isFinite(y)) return { x, y, w: AVATAR_WIDTH, sprite: "guide" };
  }
  const n = scene.npc;
  return { x: n.x, y: n.y, w: n.w, sprite: n.id };
}

/** Câu thoại hiện tại của cốt truyện dưới dạng bong bóng chat trong khung cảnh; không có câu thoại thì không vẽ gì. Đặt làm con của `SceneCanvas`. */
export function StoryBubble({ payload, sc, scene, playerEl }: { payload: StoryPayload; sc: Controller; scene: SceneDetail; playerEl: RefObject<HTMLElement | null> }) {
  const { hints, toggle } = useStoryHints(payload.story.readingFirst);
  const view = sc.view;
  if (!view || view.kind !== "dialogue") return null;
  const node = payload.scene.dialogues[view.nodeId];
  if (!node) return null;
  const newClues = (node.effects ?? []).flatMap((e) => ("clue" in e ? payload.story.clues.filter((c) => c.id === e.clue) : []));
  return (
    <DialogueBubble
      node={node}
      choices={visibleChoices(node, sc.progress.flags)}
      speaker={payload.story.speakers[node.speaker]}
      anchor={anchorOf(node.speaker, scene, playerEl.current)}
      pinyin={payload.pinyin}
      hints={hints}
      onToggleHint={toggle}
      newClues={newClues}
      onChoose={sc.choose}
      onClose={sc.close}
    />
  );
}
