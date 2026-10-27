"use client";

import { PanelFrame } from "./panel-frame";
import { useState } from "react";
import { Button3d } from "@/components/ui/button-3d";
import type { Verdict } from "@/lib/explore/story/deduction";
import type { StoryDef, StoryProgress } from "@/lib/explore/story/story-types";
import { ArtSprite } from "../art/art-sprite";
import { FLAT_SPRITES } from "../art/flat/flat-sprites";
import type { Hints } from "./use-story-hints";

interface Props {
  story: Omit<StoryDef, "scenes">;
  progress: StoryProgress;
  hints: Hints;
  verdict: Verdict | null;
  onSubmit: (suspectIds: string[], clueIds: string[]) => void;
  onClose: () => void;
}

/**
 * Buộc tội: chọn nghi phạm rồi chọn đúng `needed` manh mối làm bằng chứng. Sai người thì biết là sai; đúng người mà bằng chứng yếu thì biết còn thiếu bao nhiêu
 * (không lộ manh mối nào đúng), để người chơi tự đọc lại sổ vụ án và suy luận.
 */
export function AccusePanel({ story, progress, hints, verdict, onSubmit, onClose }: Props) {
  const [chosen, setChosen] = useState<string[]>([]);
  const [picked, setPicked] = useState<string[]>([]);
  const { needed } = story.solution;
  const clues = story.clues.filter((c) => progress.clues.includes(c.id));
  const toggleSuspect = (id: string) => setChosen((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : cur.length < 2 ? [...cur, id] : cur));
  const toggle = (id: string) => setPicked((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : cur.length < needed ? [...cur, id] : cur));
  return (
    <PanelFrame label="Buộc tội" title="Ai là thủ phạm?" onClose={onClose}>
      <p className="text-body-md text-on-surface-variant">Chọn người bạn cho là thủ phạm (có thể chọn tối đa hai người nếu nghi có đồng phạm), rồi chọn {needed} manh mối chứng minh điều đó.</p>
      <div role="group" aria-label="Nghi phạm" className="mt-space-sm flex flex-wrap gap-2">
        {story.suspects.map((s) => (
          <button key={s.id} type="button" aria-pressed={chosen.includes(s.id)} onClick={() => toggleSuspect(s.id)}
            className={`flex min-h-11 items-center gap-2 rounded-xl border-2 border-ink px-2 py-1 text-label-md font-extrabold ${chosen.includes(s.id) ? "bg-primary-container text-on-primary-container" : "bg-surface-container-lowest"}`}>
            {!s.virtual && FLAT_SPRITES[s.sprite] && <span className="w-8"><ArtSprite sprite={FLAT_SPRITES[s.sprite]} /></span>}{s.name}
          </button>
        ))}
      </div>
      <p className="mt-space-sm text-label-md font-extrabold">Bằng chứng ({picked.length}/{needed})</p>
      <ul className="mt-1 space-y-1.5">
        {clues.map((c) => (
          <li key={c.id}>
            <button type="button" aria-pressed={picked.includes(c.id)} onClick={() => toggle(c.id)}
              className={`flex min-h-11 w-full flex-col items-start rounded-xl border-2 border-ink px-space-sm py-1.5 text-left ${picked.includes(c.id) ? "bg-secondary-container" : "bg-surface-container-lowest"}`}>
              <span className="text-label-md font-extrabold">{c.title}</span>
              <span lang="zh-Hans" className="text-body-md">{c.zh}</span>
              {hints.vi && !c.noTranslation && <span className="text-body-sm text-on-surface-variant">{c.vi}</span>}
            </button>
          </li>
        ))}
      </ul>
      {verdict?.type === "wrong_suspect" && <p role="alert" className="mt-space-sm text-label-md font-bold text-error">Kết luận này chưa đúng: có người có bằng chứng ngoại phạm, hoặc còn thiếu/thừa người. Hãy đọc lại lời khai và sổ vụ án.</p>}
      {verdict?.type === "weak_evidence" && <p role="alert" className="mt-space-sm text-label-md font-bold text-error">Bạn chọn đúng người! Nhưng chỉ {verdict.matched}/{verdict.needed} manh mối thật sự chỉ vào người đó. Hãy chọn lại bằng chứng.</p>}
      <div className="mt-space-sm flex items-center gap-3">
        <Button3d variant="secondary" disabled={chosen.length === 0 || picked.length !== needed} onClick={() => onSubmit(chosen, picked)}>Buộc tội</Button3d>
        <button type="button" onClick={onClose} className="min-h-11 text-label-md font-extrabold text-primary hover:underline">Để tôi xem lại</button>
      </div>
    </PanelFrame>
  );
}
