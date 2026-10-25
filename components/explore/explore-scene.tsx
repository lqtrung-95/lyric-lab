"use client";

import type { SceneDetail } from "@/lib/explore/explore-types";
import { Button3d } from "@/components/ui/button-3d";
import { ArtSprite } from "./art/art-sprite";
import { FLAT_SPRITES } from "./art/flat/flat-sprites";
import { MusicToggle } from "./music-toggle";
import { NotebookChips } from "./notebook-chips";
import { NpcCard } from "./npc-card";
import { PlayerAvatar } from "./player-avatar";
import { QuestPanel, QuestSummary } from "./quest-panel";
import { SceneCanvas } from "./scene-canvas";
import { useAmbientMusic } from "./use-ambient-music";
import { MIN_WORDS_FOR_QUEST, useSceneController } from "./use-scene-controller";
import { WordCard } from "./word-card";

/**
 * Màn khám phá một cảnh: người chơi điều khiển Gấu Trúc đi quanh phòng (mũi tên/WASD, hoặc chạm vào sàn/đồ vật), lại gần đồ vật và nhấn E để học từ,
 * nói chuyện với NPC Cú Thầy để nhận nhiệm vụ rồi đi tới đúng đồ vật để trả lời. Tiến độ lưu trong trình duyệt.
 */
export function ExploreScene({ scene }: { scene: SceneDetail }) {
  const c = useSceneController(scene);
  const music = useAmbientMusic(scene.theme);
  const { quest, player } = c;
  const inSummary = !quest.active && quest.rounds.length > 0;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-space-md">
      <header className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-headline-lg">{scene.title}</h1>
          <p className="text-body-md text-on-surface-variant">{scene.subtitle}</p>
        </div>
        <MusicToggle enabled={music.enabled} onToggle={music.toggle} />
      </header>

      <div {...c.stageProps} onPointerDown={(e) => e.currentTarget.focus({ preventScroll: true })} className="rounded-2xl outline-offset-4 focus-visible:outline-2 focus-visible:outline-primary">
        <SceneCanvas theme={scene.theme} objects={scene.objects} npc={scene.npc} decor={scene.decor ?? []} exits={scene.exits} marks={c.marks} hideLabels={quest.active} highlightId={c.highlightId} shakeId={c.shakeId} nearId={player.nearId} onActivate={c.activate} onFloorPoint={(p) => player.walkTo(p)}>
          <PlayerAvatar elRef={player.elRef} walking={player.walking} facing={player.facing} fx={c.fx} carrying={quest.carrying} />
        </SceneCanvas>
      </div>
      <p className="-mt-2 text-label-md text-on-surface-variant">Phím mũi tên hoặc WASD để đi · E để tương tác · hoặc chạm vào sàn/đồ vật để nhân vật tự đi tới.</p>

      {quest.active ? (
        <QuestPanel rounds={quest.rounds} index={quest.index} phase={quest.phase} wrong={quest.wrong} words={c.words} carrying={quest.carrying} npcName={scene.npc.name} onQuit={quest.stop} />
      ) : inSummary ? (
        <QuestSummary results={quest.results} words={c.words} xp={c.xpEarned} onAgain={c.startQuest} onBack={quest.stop} />
      ) : c.panel?.kind === "word" ? (
        <WordCard word={c.panel.word} cardState={c.cardStateOf(c.panel.word)} onClose={() => c.setPanel(null)} />
      ) : c.panel?.kind === "npc" ? (
        <NpcCard npc={scene.npc} learned={c.learnedWords.length} total={scene.objects.length} canQuest={c.canQuest} onStart={c.startQuest} onClose={() => c.setPanel(null)} />
      ) : (
        <section aria-label={scene.npc.name} className="card-ink flex items-center gap-space-sm p-space-md">
          <div className="w-14 shrink-0"><ArtSprite sprite={FLAT_SPRITES[scene.npc.id]} /></div>
          <p className="text-body-md font-bold">{scene.npc.greeting}</p>
        </section>
      )}

      {!quest.active && (
        <div className="flex flex-wrap items-center gap-space-sm">
          <Button3d variant="secondary" disabled={!c.ready || !c.canQuest} onClick={c.startQuest}>Nhận nhiệm vụ</Button3d>
          {!c.canQuest && <p className="text-label-md text-on-surface-variant">Học ít nhất {MIN_WORDS_FOR_QUEST} từ để mở nhiệm vụ (hoặc đến gặp {scene.npc.name}).</p>}
        </div>
      )}
      <NotebookChips words={scene.objects} marks={c.marks} onPick={c.openWord} />
      {c.learnedWords.length > 0 && !quest.active && (
        <button type="button" onClick={() => { c.reset(); c.setPanel(null); quest.stop(); }} className="min-h-11 self-start text-label-md text-on-surface-variant underline">Học lại từ đầu</button>
      )}
    </div>
  );
}
