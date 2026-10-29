"use client";

import { PronounceButton } from "@/components/ui/pronounce-button";
import type { CharInfo } from "@/lib/games/load-radical-recipes";
import { itemKey, type SavedItem } from "@/lib/user-state/learner-state";

/** Thẻ chữ vừa ghép được: chữ lớn, pinyin, Hán Việt, nghĩa Việt (từ từ điển) và nút thêm vào bộ ôn. Mảnh trung gian không có nghĩa thì chỉ hiện chữ. */
export function ForgeCard({ han, info, saved, onToggleSave }: { han: string; info: CharInfo | undefined; saved: boolean; onToggleSave: (item: SavedItem) => void }) {
  const item = (): SavedItem => ({ key: itemKey({ type: "vocab", term: han }), videoId: "", type: "vocab", term: han, lineIndex: 0, start: 0, savedAt: Date.now(), reading: info?.pinyin, sinoViet: info?.sinoViet ?? undefined, meaning: info?.meaning });
  return (
    <li className="forge-new flex flex-wrap items-center gap-x-3 gap-y-1 rounded-2xl border-2 border-secondary bg-secondary-container px-3 py-2 text-on-secondary-container">
      <span lang="zh" className="font-serif text-hanzi-display">{han}</span>
      {info ? (
        <>
          <span className="text-pinyin-reading">{info.pinyin}</span>
          {info.sinoViet && <span className="text-label-md font-bold">{info.sinoViet}</span>}
          <span className="text-body-md">{info.meaning}</span>
          <PronounceButton text={han} />
          <button type="button" aria-pressed={saved} onClick={() => onToggleSave(item())} className="min-h-11 rounded-full border-2 border-ink bg-surface-container-lowest px-3 text-label-md font-bold">{saved ? "Đã thêm vào bộ ôn" : "Thêm vào bộ ôn"}</button>
        </>
      ) : <span className="text-body-md">Mảnh ghép trung gian</span>}
    </li>
  );
}
