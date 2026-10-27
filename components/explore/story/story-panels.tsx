"use client";

import { useEffect, useRef } from "react";
import type { StoryPayload } from "@/lib/explore/story/load-story";
import { SCENES } from "@/lib/explore/scenes";
import { AccusePanel } from "./accuse-panel";
import { CaseFilePanel } from "./case-file-panel";
import { ClueCard } from "./clue-card";
import { MapPanel, type MapEntry } from "./map-panel";
import type { useStoryController } from "./use-story-controller";
import { useStoryHints } from "./use-story-hints";

type Controller = ReturnType<typeof useStoryController>;

/** Bảng đang mở của cốt truyện (hội thoại, manh mối vừa tìm, sổ vụ án, buộc tội, bản đồ); null khi không có bảng nào. */
function PanelBody({ payload, sc, basePath, sceneId }: { payload: StoryPayload; sc: Controller; basePath: string; sceneId: string }) {
  const { hints, toggle } = useStoryHints(payload.story.readingFirst);
  const { story, pinyin } = payload;
  const view = sc.view;
  if (!view) return null;

  if (view.kind === "clue") {
    const clue = story.clues.find((c) => c.id === view.clueId);
    return clue ? <ClueCard clue={clue} pinyin={pinyin} hints={hints} onToggleHint={toggle} onClose={sc.close} onOpenCase={() => sc.setView({ kind: "case" })} /> : null;
  }
  if (view.kind === "case") {
    return <CaseFilePanel story={story} progress={sc.progress} pinyin={pinyin} hints={hints} onToggleHint={toggle} canAccuse={sc.canAccuse} solved={sc.solved} onAccuse={() => sc.setView({ kind: "accuse" })} onLink={sc.link} onClose={sc.close} />;
  }
  if (view.kind === "accuse") return <AccusePanel story={story} progress={sc.progress} hints={hints} verdict={sc.verdict} onSubmit={sc.accuse} onClose={sc.close} />;

  const entries: MapEntry[] = Object.keys(SCENES).map((id) => ({ id, title: SCENES[id].title, here: id === sceneId, target: sc.objective?.sceneId === id, available: id in payloadScenes(story), locked: !sc.isSceneOpen(id) }));
  return <MapPanel entries={entries} basePath={basePath} onClose={sc.close} />;
}

/** Các cảnh có tham gia cốt truyện: mục tiêu, nghi phạm, manh mối nhắc tới chúng. */
export function payloadScenes(story: StoryPayload["story"]): Record<string, true> {
  const ids = new Set<string>([story.startScene, story.accuseScene, ...story.clues.map((c) => c.sceneId), ...story.suspects.map((s) => s.sceneId), ...story.objectives.flatMap((o) => (o.sceneId ? [o.sceneId] : []))]);
  return Object.fromEntries([...ids].map((i) => [i, true as const]));
}

/**
 * Mọi bảng của cốt truyện (hội thoại, manh mối, sổ vụ án, buộc tội, bản đồ) hiện thành hộp thoại giữa màn hình bằng <dialog> gốc: nền mờ phía sau, khóa focus (nên phím di chuyển của cảnh không bắt nhầm),
 * Esc để đóng, đóng xong trả focus về chỗ cũ.
 */
export function StoryPanels(props: { payload: StoryPayload; sc: Controller; basePath: string; sceneId: string }) {
  const ref = useRef<HTMLDialogElement>(null);
  const { view, close } = props.sc;
  const open = !!view && view.kind !== "dialogue"; // hội thoại là bong bóng trong khung cảnh (xem DialogueBubble), không phải hộp thoại
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);
  if (!open) return null;
  return (
    <dialog
      ref={ref}
      aria-label="Vụ án"
      onCancel={(e) => { e.preventDefault(); close(); }} // Esc đi qua trạng thái của cha
      onClick={(e) => { if (e.target === ref.current) close(); }}
      className="m-auto w-[min(94vw,40rem)] overflow-visible rounded-3xl bg-transparent p-0 text-on-surface backdrop:bg-black/55 backdrop:backdrop-blur-[2px]"
    >
      <PanelBody {...props} />
    </dialog>
  );
}
