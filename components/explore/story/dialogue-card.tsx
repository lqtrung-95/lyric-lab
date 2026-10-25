"use client";

import { Button3d } from "@/components/ui/button-3d";
import { PronounceButton } from "@/components/ui/pronounce-button";
import type { ClueDef, DialogueChoice, DialogueNode, Speaker } from "@/lib/explore/story/story-types";
import { ArtSprite } from "../art/art-sprite";
import { FLAT_SPRITES } from "../art/flat/flat-sprites";
import { HintToggles } from "./hint-toggles";
import type { Hints } from "./use-story-hints";

interface Props {
  node: DialogueNode;
  choices: DialogueChoice[];
  speaker: Speaker | undefined;
  pinyin: Record<string, string>;
  hints: Hints;
  onToggleHint: (k: keyof Hints) => void;
  /** Manh mối vừa được ghi vào sổ khi câu này hiện ra. */
  newClues: ClueDef[];
  onChoose: (index: number | null) => void;
}

/** Một câu thoại: người nói, câu tiếng Trung (kèm pinyin và nghĩa tùy gợi ý, có nút nghe), các lựa chọn hoặc nút "Tiếp". Câu rỗng tiếng Trung là suy nghĩ/câu hỏi kiểm tra của người chơi. */
export function DialogueCard({ node, choices, speaker, pinyin, hints, onToggleHint, newClues, onChoose }: Props) {
  const sprite = speaker && FLAT_SPRITES[speaker.sprite];
  return (
    <section aria-label="Hội thoại" className="card-ink p-space-md">
      <div className="flex items-start gap-space-sm">
        {sprite && <div className="w-12 shrink-0"><ArtSprite sprite={sprite} /></div>}
        <div className="min-w-0 flex-1">
          <p className="text-label-md font-extrabold text-primary">{speaker?.name ?? node.speaker}</p>
          {node.zh ? (
            <>
              <div className="flex items-center gap-2">
                <p lang="zh-Hans" className="min-w-0 flex-1 text-headline-md font-bold leading-snug">{node.zh}</p>
                <PronounceButton text={node.zh} className="size-11" />
              </div>
              {hints.pinyin && pinyin[node.zh] && <p className="text-body-sm text-primary">{pinyin[node.zh]}</p>}
              {hints.vi && <p className="text-body-md text-on-surface-variant">{node.vi}</p>}
            </>
          ) : <p className="text-body-md italic">{node.vi}</p>}
        </div>
        <HintToggles hints={hints} onToggle={onToggleHint} />
      </div>
      {newClues.map((c) => <p key={c.id} role="status" className="mt-space-sm rounded-xl bg-secondary-container px-space-sm py-1.5 text-label-md font-extrabold text-on-secondary-container">Manh mối mới: {c.title}</p>)}
      <div className="mt-space-sm flex flex-col gap-2">
        {choices.length > 0 ? choices.map((c, i) => (
          <button key={i} type="button" onClick={() => onChoose(i)} className="flex min-h-11 w-full flex-col items-start rounded-xl border-2 border-ink bg-surface-container-lowest px-space-sm py-2 text-left hover:bg-surface-container-low">
            <span lang="zh-Hans" className="text-body-lg font-bold">{c.zh}</span>
            {hints.pinyin && pinyin[c.zh] && <span className="text-body-sm text-primary">{pinyin[c.zh]}</span>}
            {hints.vi && <span className="text-body-sm text-on-surface-variant">{c.vi}</span>}
          </button>
        )) : <Button3d variant="secondary" onClick={() => onChoose(null)} className="self-start">{node.next ? "Tiếp" : "Đóng"}</Button3d>}
      </div>
    </section>
  );
}
