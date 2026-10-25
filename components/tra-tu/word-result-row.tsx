import Link from "next/link";
import { MATCH_LABEL } from "./match-label";
import type { WordResult } from "@/lib/tra-tu/types";

export const wordHref = (simplified: string) => `/tra-tu/${encodeURIComponent(simplified)}`;

/** Một kết quả tra: chữ Hán, pinyin các cách đọc, Hán Việt, cấp HSK, nghĩa tiếng Việt (nếu đã duyệt) hoặc tiếng Anh. Cả hàng là một liên kết sang trang chi tiết. */
export function WordResultRow({ word, compact = false, onPick }: { word: WordResult; compact?: boolean; onPick?: () => void }) {
  const main = word.readings[0];
  const showTraditional = word.traditional !== word.simplified;
  return (
    <Link
      href={wordHref(word.simplified)}
      onClick={onPick}
      className="flex min-h-14 items-start gap-space-sm rounded-xl px-space-sm py-2 hover:bg-surface-container-low focus-visible:bg-surface-container-low"
    >
      <span lang="zh-Hans" className={`${compact ? "min-w-14 text-2xl" : "min-w-20 text-4xl"} shrink-0 font-extrabold leading-tight`}>{word.simplified}</span>
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-baseline gap-x-2">
          <span className="text-body-lg font-bold text-primary">{word.readings.slice(0, 3).map((r) => r.pinyin).filter((p, i, a) => a.indexOf(p) === i).join(" · ")}</span>
          {showTraditional && <span lang="zh-Hant" className="text-label-md text-on-surface-variant">phồn thể {word.traditional}</span>}
          {word.sinoViet && <span className="text-label-md text-on-surface-variant">Hán Việt: <b className="text-on-surface">{word.sinoViet}</b></span>}
          {word.hskLevel != null && <span className="rounded-full border-2 border-ink/30 bg-surface-container px-2 text-label-sm font-bold">HSK {word.hskLevel}</span>}
        </span>
        {word.gloss && <span className="block text-body-md font-bold">{word.gloss}</span>}
        <span className="block text-body-md text-on-surface-variant">{main.meanings.slice(0, compact ? 1 : 3).join("; ")}</span>
        {!compact && <span className="mt-0.5 block text-label-sm text-on-surface-variant">{MATCH_LABEL[word.match]}</span>}
      </span>
    </Link>
  );
}
