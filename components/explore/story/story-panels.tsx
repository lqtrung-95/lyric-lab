"use client";

import { useEffect, useRef } from "react";
import { visibleChoices } from "@/lib/explore/story/dialogue";
import type { StoryPayload } from "@/lib/explore/story/load-story";
import { SCENES } from "@/lib/explore/scenes";
import { AccusePanel } from "./accuse-panel";
import { CaseFilePanel } from "./case-file-panel";
import { ClueCard } from "./clue-card";
import { DialogueCard } from "./dialogue-card";
import { MapPanel, type MapEntry } from "./map-panel";
import type { useStoryController } from "./use-story-controller";
import { useStoryHints } from "./use-story-hints";

type Controller = ReturnType<typeof useStoryController>;

/** Bảng đang mở của cốt truyện (hội thoại, manh mối vừa tìm, sổ vụ án, buộc tội, bản đồ); null khi không có bảng nào. */
function PanelBody({ payload, sc, basePath, sceneId }: { payload: StoryPayload; sc: Controller; basePath: string; sceneId: string }) {
  const { hints, toggle } = useStoryHints();
  const { story, scene, pinyin } = payload;
  const view = sc.view;
  if (!view) return null;

  if (view.kind === "dialogue") {
    const node = scene.dialogues[view.nodeId];
    if (!node) return null;
    const newClues = (node.effects ?? []).flatMap((e) => ("clue" in e ? story.clues.filter((c) => c.id === e.clue) : []));
    return <DialogueCard node={node} choices={visibleChoices(node, sc.progress.flags)} speaker={story.speakers[node.speaker]} pinyin={pinyin} hints={hints} onToggleHint={toggle} newClues={newClues} onChoose={sc.choose} />;
  }
  if (view.kind === "clue") {
    const clue = story.clues.find((c) => c.id === view.clueId);
    return clue ? <ClueCard clue={clue} pinyin={pinyin} hints={hints} onToggleHint={toggle} onClose={sc.close} onOpenCase={() => sc.setView({ kind: "case" })} /> : null;
  }
  if (view.kind === "case") {
    return <CaseFilePanel story={story} progress={sc.progress} pinyin={pinyin} hints={hints} onToggleHint={toggle} canAccuse={sc.canAccuse} solved={sc.solved} onAccuse={() => sc.setView({ kind: "accuse" })} onClose={sc.close} />;
  }
  if (view.kind === "accuse") return <AccusePanel story={story} progress={sc.progress} hints={hints} verdict={sc.verdict} onSubmit={sc.accuse} onClose={sc.close} />;

  const entries: MapEntry[] = Object.keys(SCENES).map((id) => ({ id, title: SCENES[id].title, here: id === sceneId, target: sc.objective?.sceneId === id, available: id in payloadScenes(story) }));
  return <MapPanel entries={entries} basePath={basePath} onClose={sc.close} />;
}

/** Các cảnh có tham gia cốt truyện: mục tiêu, nghi phạm, manh mối nhắc tới chúng. */
export function payloadScenes(story: StoryPayload["story"]): Record<string, true> {
  const ids = new Set<string>([story.startScene, story.accuseScene, ...story.clues.map((c) => c.sceneId), ...story.suspects.map((s) => s.sceneId), ...story.objectives.flatMap((o) => (o.sceneId ? [o.sceneId] : []))]);
  return Object.fromEntries([...ids].map((i) => [i, true as const]));
}

/** Bảng nằm dưới khung cảnh nên dễ ngoài màn hình: mỗi lần bảng hoặc câu thoại đổi thì cuộn nó vào tầm nhìn. */
export function StoryPanels(props: { payload: StoryPayload; sc: Controller; basePath: string; sceneId: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const key = JSON.stringify(props.sc.view);
  useEffect(() => { ref.current?.scrollIntoView({ block: "nearest", behavior: "smooth" }); }, [key]);
  if (!props.sc.view) return null;
  return <div ref={ref}><PanelBody {...props} /></div>;
}
