"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { Button3d } from "@/components/ui/button-3d";
import { buildQuestRounds } from "@/lib/explore/build-explore-quests";
import { isDiscovered, isFaded } from "@/lib/explore/explore-progress";
import type { SceneDetail, SceneWord } from "@/lib/explore/explore-types";
import { playSfx } from "@/lib/feedback/sfx";
import { playChinese } from "@/lib/speech/play-chinese";
import { ArtSprite } from "./art/art-sprite";
import { AI_SPRITES, resolveGuideArt, type ArtStyle } from "./art/scene-art";
import { ArtToggle } from "./art-toggle";
import { NotebookChips } from "./notebook-chips";
import { QuestPanel, QuestSummary } from "./quest-panel";
import { SceneCanvas, type ObjectMark } from "./scene-canvas";
import { useExploreProgress } from "./use-explore-progress";
import { useQuestRun } from "./use-quest-run";
import { WordCard } from "./word-card";

const MIN_WORDS_FOR_QUEST = 3;

/** Màn khám phá một cảnh: chạm vật để học (nghe, ghi sổ tay) rồi nhận nhiệm vụ của Gấu Trúc để dùng lại từ. Tiến độ lưu trong trình duyệt. */
export function ExploreScene({ scene }: { scene: SceneDetail }) {
  const { progress, ready, now, discover, answer, reset } = useExploreProgress();
  const [art, setArt] = useState<ArtStyle>("flat");
  const [selected, setSelected] = useState<SceneWord | null>(null);
  const [shakeId, setShakeId] = useState<string | null>(null);
  const shakeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const words = useMemo(() => Object.fromEntries(scene.objects.map((o) => [o.id, o])) as Record<string, SceneWord>, [scene.objects]);
  const marks = useMemo(() => Object.fromEntries(scene.objects.map((o): [string, ObjectMark] => [o.id, !isDiscovered(progress, o.id) ? "new" : isFaded(progress, o.id, now) ? "faded" : "learned"])), [scene.objects, progress, now]);
  const learnedWords = scene.objects.filter((o) => marks[o.id] !== "new");

  const onResult = useCallback((id: string, ok: boolean) => { answer(id, ok); playSfx(ok ? "correct" : "wrong"); }, [answer]);
  const quest = useQuestRun(onResult);
  const inSummary = !quest.active && quest.rounds.length > 0;

  function startQuest() {
    const priority = new Set(learnedWords.filter((o) => marks[o.id] === "faded" || (progress.terms[o.id]?.wrong ?? 0) > (progress.terms[o.id]?.correct ?? 0)).map((o) => o.id));
    setSelected(null);
    quest.start(buildQuestRounds(learnedWords, priority));
  }

  function onTap(o: SceneWord) {
    if (quest.active) {
      if (quest.phase === "asking" && quest.round && o.id !== quest.round.targetId) {
        setShakeId(o.id);
        if (shakeTimer.current) clearTimeout(shakeTimer.current);
        shakeTimer.current = setTimeout(() => setShakeId(null), 450);
      }
      quest.tap(o.id);
      return;
    }
    discover(o.id);
    setSelected(o);
    void playChinese(o.term);
  }

  const highlightId = quest.active && (quest.phase === "correct" || quest.phase === "reveal") ? quest.round?.targetId ?? null : null;
  const canQuest = learnedWords.length >= MIN_WORDS_FOR_QUEST;
  const missingAi = art === "ai" ? scene.objects.filter((o) => !(o.id in AI_SPRITES)).length : 0;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-space-md">
      <header className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-headline-lg">{scene.title}</h1>
          <p className="text-body-md text-on-surface-variant">{scene.subtitle}</p>
        </div>
        <ArtToggle value={art} onChange={setArt} />
      </header>
      {missingAi > 0 && <p className="rounded-xl bg-surface-container-low px-space-sm py-2 text-label-md text-on-surface-variant">Tranh AI chưa đủ bộ: {missingAi} vật chưa có tranh AI nên tạm dùng sprite pixel (tạo thêm bằng scripts/generate-explore-art.mts).</p>}
      <SceneCanvas objects={scene.objects} art={art} marks={marks} hideLabels={quest.active} highlightId={highlightId} shakeId={shakeId} onTap={onTap} />

      {quest.active ? (
        <QuestPanel rounds={quest.rounds} index={quest.index} phase={quest.phase} wrong={quest.wrong} words={words} onQuit={quest.stop} />
      ) : inSummary ? (
        <QuestSummary results={quest.results} words={words} onAgain={startQuest} onBack={quest.stop} />
      ) : selected ? (
        <WordCard word={selected} onClose={() => setSelected(null)} />
      ) : (
        <section aria-label={scene.guide.name} className="card-ink flex items-center gap-space-sm p-space-md">
          <div className="w-14 shrink-0"><ArtSprite art={resolveGuideArt(art)} /></div>
          <p className="text-body-md font-bold">{scene.guide.greeting}</p>
        </section>
      )}

      {!quest.active && (
        <div className="flex flex-wrap items-center gap-space-sm">
          <Button3d variant="secondary" disabled={!ready || !canQuest} onClick={startQuest}>Nhận nhiệm vụ</Button3d>
          {!canQuest && <p className="text-label-md text-on-surface-variant">Chạm ít nhất {MIN_WORDS_FOR_QUEST} vật để mở nhiệm vụ.</p>}
        </div>
      )}
      <NotebookChips words={scene.objects} marks={marks} onPick={(w) => { setSelected(w); void playChinese(w.term); }} />
      {learnedWords.length > 0 && !quest.active && <button type="button" onClick={() => { reset(); setSelected(null); quest.stop(); }} className="min-h-11 self-start text-label-md text-on-surface-variant underline">Học lại từ đầu</button>}
    </div>
  );
}
