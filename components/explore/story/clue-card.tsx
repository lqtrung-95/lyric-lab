"use client";

import { PanelFrame } from "./panel-frame";
import { Icon } from "@/components/ui/icon";
import { PronounceButton } from "@/components/ui/pronounce-button";
import type { ClueDef } from "@/lib/explore/story/story-types";
import { HintToggles } from "./hint-toggles";
import type { Hints } from "./use-story-hints";

const KIND_LABEL: Record<ClueDef["kind"], string> = { document: "Tài liệu", object: "Vật chứng", testimony: "Lời khai", deduction: "Suy luận" };

/** Một manh mối: tiêu đề, loại, câu tiếng Trung (kèm pinyin/nghĩa theo gợi ý, nghe được). Dùng ở thẻ "đã tìm thấy" và trong sổ vụ án. */
export function ClueBody({ clue, pinyin, hints }: { clue: ClueDef; pinyin: Record<string, string>; hints: Hints }) {
  return (
    <div>
      <p className="text-label-md font-extrabold text-primary">{KIND_LABEL[clue.kind]} · {clue.title}</p>
      <div className="flex items-center gap-2">
        <p lang="zh-Hans" className="min-w-0 flex-1 text-body-lg font-bold leading-snug">{clue.zh}</p>
        <PronounceButton text={clue.zh} className="size-10 sm:size-11" />
      </div>
      {hints.pinyin && pinyin[clue.zh] && <p className="text-body-sm text-primary">{pinyin[clue.zh]}</p>}
      {hints.vi && <p className="text-body-md text-on-surface-variant">{clue.vi}</p>}
    </div>
  );
}

/** Thẻ hiện ngay sau khi xem xét một chỗ và tìm ra manh mối. */
export function ClueCard({ clue, pinyin, hints, onToggleHint, onClose, onOpenCase }: { clue: ClueDef; pinyin: Record<string, string>; hints: Hints; onToggleHint: (k: keyof Hints) => void; onClose: () => void; onOpenCase: () => void }) {
  return (
    <PanelFrame label={`Manh mối: ${clue.title}`} title="Manh mối mới" onClose={onClose}>
      <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
        <p role="status" className="flex items-center gap-1 text-label-md font-extrabold text-secondary"><Icon name="check_circle" size={18} filled />Đã ghi vào sổ vụ án</p>
        <div className="max-sm:[&_button]:!min-h-9 max-sm:[&_button]:!px-3 max-sm:[&_button]:!text-[13px]"><HintToggles hints={hints} onToggle={onToggleHint} /></div>
      </div>
      <div className="mt-1"><ClueBody clue={clue} pinyin={pinyin} hints={hints} /></div>
      <div className="mt-space-sm flex gap-3">
        <button type="button" onClick={onOpenCase} className="min-h-11 text-label-md font-extrabold text-primary hover:underline">Mở sổ vụ án</button>
        <button type="button" onClick={onClose} className="min-h-11 text-label-md font-extrabold text-primary hover:underline">Đóng</button>
      </div>
    </PanelFrame>
  );
}
