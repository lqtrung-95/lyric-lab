"use client";

import { PronounceButton } from "@/components/ui/pronounce-button";
import { EtymologyAiNote } from "@/components/tra-tu/etymology-ai-note";
import type { CharInfo } from "@/lib/games/load-radical-recipes";
import { forgeWhy, type ForgeEty } from "@/lib/games/radical-forge-why";
import { itemKey, type SavedItem } from "@/lib/user-state/learner-state";

/** Thẻ chữ vừa ghép được: chữ lớn, pinyin, Hán Việt, nghĩa Việt (từ từ điển) và nút thêm vào bộ ôn. Kèm công thức có nghĩa từng mảnh và lời giải thích vì sao ghép được (từ dữ kiện chiết tự, không qua AI), cùng nút nhờ AI giải thích sâu hơn. */
export function ForgeCard({ han, info, parts, infoOf, ety, saved, onToggleSave }: { han: string; info: CharInfo | undefined; /** Hai mảnh vừa ghép ra chữ này. */ parts: [string, string]; infoOf: (c: string) => CharInfo | undefined; ety: ForgeEty | undefined; saved: boolean; onToggleSave: (item: SavedItem) => void }) {
  const item = (): SavedItem => ({ key: itemKey({ type: "vocab", term: han }), videoId: "", type: "vocab", term: han, lineIndex: 0, start: 0, savedAt: Date.now(), reading: info?.pinyin, sinoViet: info?.sinoViet ?? undefined, meaning: info?.meaning });
  return (
    <li className="forge-new flex flex-wrap items-center gap-x-3 gap-y-1 rounded-2xl border-2 border-secondary bg-secondary-container px-3 py-2 text-on-secondary-container">
      <span lang="zh" className="font-serif text-hanzi-display">{han}</span>
      {info ? (
        <>
          <span className="text-pinyin-reading">{info.pinyin}</span>
          {info.sinoViet && <span className="text-label-md font-bold">{info.sinoViet}</span>}
          <span className="text-body-md">{info.meaning}{info.meaningLang === "en" && <span className="ml-1 text-label-md text-on-surface-variant">(nghĩa tiếng Anh)</span>}</span>
          <PronounceButton text={han} />
          <button type="button" aria-pressed={saved} onClick={() => onToggleSave(item())} className="min-h-11 rounded-full border-2 border-ink bg-surface-container-lowest px-3 text-label-md font-bold">{saved ? "Đã thêm vào bộ ôn" : "Thêm vào bộ ôn"}</button>
        </>
      ) : <span className="text-body-md">Mảnh ghép trung gian</span>}
      <div className="basis-full space-y-1 border-t border-secondary/40 pt-2 text-body-md">
        <p lang="zh" className="font-serif text-body-lg font-bold">
          {parts[0]} <span className="font-sans text-label-md font-medium">{infoOf(parts[0])?.meaning}</span> + {parts[1]} <span className="font-sans text-label-md font-medium">{infoOf(parts[1])?.meaning}</span> = {han}
        </p>
        <p>{forgeWhy(parts[0], parts[1], han, (c) => infoOf(c), ety)}</p>
        <EtymologyAiNote char={han} initial={null} canAskAi />
      </div>
    </li>
  );
}
