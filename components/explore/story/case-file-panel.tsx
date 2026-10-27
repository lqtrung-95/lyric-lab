"use client";

import { PanelFrame } from "./panel-frame";
import { Button3d } from "@/components/ui/button-3d";
import type { StoryDef, StoryProgress } from "@/lib/explore/story/story-types";
import { ArtSprite } from "../art/art-sprite";
import { FLAT_SPRITES } from "../art/flat/flat-sprites";
import { ClueBody } from "./clue-card";
import { HintToggles } from "./hint-toggles";
import type { Hints } from "./use-story-hints";

interface Props {
  story: Omit<StoryDef, "scenes">;
  progress: StoryProgress;
  pinyin: Record<string, string>;
  hints: Hints;
  onToggleHint: (k: keyof Hints) => void;
  canAccuse: boolean;
  solved: boolean;
  onAccuse: () => void;
  onClose: () => void;
}

/** Sổ vụ án: các manh mối đã tìm (đọc lại, nghe lại), các nghi phạm và lời khai của họ, nút buộc tội khi đủ điều kiện. */
export function CaseFilePanel({ story, progress, pinyin, hints, onToggleHint, canAccuse, solved, onAccuse, onClose }: Props) {
  const found = story.clues.filter((c) => progress.clues.includes(c.id));
  return (
    <PanelFrame label="Sổ vụ án" title="Sổ vụ án" extra={<div className="max-sm:[&_button]:!min-h-9 max-sm:[&_button]:!px-2.5 max-sm:[&_button]:!text-[13px]"><HintToggles hints={hints} onToggle={onToggleHint} /></div>} onClose={onClose}>
      <p className="text-body-md text-on-surface-variant">{story.title}</p>

      <h3 className="mt-space-sm text-label-md font-extrabold">Nghi phạm</h3>
      <ul className="mt-1 grid gap-2 sm:grid-cols-2">
        {story.suspects.map((s) => {
          const met = progress.flags.includes(s.metFlag);
          const sprite = FLAT_SPRITES[s.sprite];
          return (
            <li key={s.id} className="flex items-start gap-2 rounded-xl bg-surface-container-low p-2">
              {sprite && <div className="w-10 shrink-0"><ArtSprite sprite={sprite} /></div>}
              <div className="min-w-0"><p className="text-label-md font-extrabold">{s.name}</p><p className="text-body-sm text-on-surface-variant">{met ? s.note : "Chưa gặp. Hãy đến hỏi."}</p></div>
            </li>
          );
        })}
      </ul>

      <h3 className="mt-space-sm text-label-md font-extrabold">Manh mối ({found.length}/{story.clues.length})</h3>
      {found.length === 0 ? <p className="text-body-md text-on-surface-variant">Chưa có manh mối nào. Hãy xem xét căn phòng và hỏi mọi người.</p> : (
        <ul className="mt-1 space-y-2">{found.map((c) => <li key={c.id} className="rounded-xl bg-surface-container-low p-space-sm"><ClueBody clue={c} pinyin={pinyin} hints={hints} /></li>)}</ul>
      )}

      <div className="mt-space-sm flex flex-wrap items-center gap-3">
        {!solved && <Button3d variant="secondary" disabled={!canAccuse} onClick={onAccuse}>Buộc tội</Button3d>}
        {!solved && !canAccuse && <p className="text-label-md text-on-surface-variant">Cần hỏi hết mọi người và nghe nhân chứng trước.</p>}
        {solved && <p role="status" className="text-label-md font-extrabold text-secondary">Vụ án đã được giải!</p>}
      </div>
    </PanelFrame>
  );
}
