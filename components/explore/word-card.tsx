"use client";

import Link from "next/link";
import { useState } from "react";
import { SnippetPlayer, type SnippetRequest } from "@/components/player/snippet-player";
import { Icon } from "@/components/ui/icon";
import { PronounceButton } from "@/components/ui/pronounce-button";
import type { SceneWord } from "@/lib/explore/explore-types";
import { snippetRange } from "@/lib/preview/preview-format";

/** Trạng thái thẻ ôn của từ: đã vào bộ ôn, chưa có câu thật để làm nguồn thẻ, hoặc đang chờ lưu. */
export type CardState = "saved" | "no_example" | "pending";

/** Tô đậm từ đang học trong câu (chỉ lần xuất hiện đầu tiên). */
function Highlighted({ text, term }: { text: string; term: string }) {
  const at = text.indexOf(term);
  if (at < 0) return <>{text}</>;
  return <>{text.slice(0, at)}<mark className="rounded bg-primary-container px-0.5 text-on-primary-container">{term}</mark>{text.slice(at + term.length)}</>;
}

/**
 * Thẻ từ hiện sau khi học một vật: chữ Hán lớn, pinyin, Hán Việt, nghĩa và nút nghe (pinyin, Hán Việt, cấp HSK lấy từ từ điển). Cầu nối sang bài nghe:
 * nếu từ xuất hiện trong video/bài hát đã duyệt thì hiện câu thật đó (nghe câu, xem đúng đoạn video ngay trong trang), không thì hiện câu ví dụ ta viết.
 */
export function WordCard({ word, cardState, onClose }: { word: SceneWord; cardState: CardState; onClose: () => void }) {
  const real = word.examples[0];
  const [clip, setClip] = useState<{ videoId: string; request: SnippetRequest } | null>(null);
  const playClip = () => real && setClip((prev) => ({ videoId: real.videoId, request: { nonce: (prev?.request.nonce ?? 0) + 1, label: word.term, ...snippetRange({ start: real.start, end: real.end }) } }));
  return (
    <section aria-label={`Từ ${word.term}`} className="card-ink p-space-md">
      <div className="flex items-start gap-space-sm">
        <div className="min-w-0 flex-1">
          <p lang="zh-Hans" className="text-5xl font-extrabold leading-tight">{word.term}</p>
          <p className="text-headline-md text-primary">{word.pinyin}</p>
          <p className="text-body-lg font-bold">{word.gloss}</p>
          <p className="mt-1 flex flex-wrap gap-x-3 text-label-md text-on-surface-variant">
            {word.sinoViet && <span>Hán Việt: <b className="text-on-surface">{word.sinoViet}</b></span>}
            {word.hskLevel != null && <span>HSK {word.hskLevel}</span>}
          </p>
        </div>
        <PronounceButton text={word.term} className="size-14" />
      </div>

      <div className="mt-space-sm rounded-xl bg-surface-container-low px-space-sm py-2">
        {real ? (
          <>
            <p className="text-label-md font-bold text-on-surface-variant">Câu thật trong bài hát/video</p>
            <div className="flex items-center gap-2">
              <p lang="zh-Hans" className="min-w-0 flex-1 text-body-lg font-bold"><Highlighted text={real.text} term={word.term} /></p>
              <PronounceButton text={real.text} className="size-11" />
            </div>
            {real.pinyin && <p className="text-body-sm text-primary">{real.pinyin}</p>}
            <p className="text-body-md text-on-surface-variant">{real.translation}</p>
            <button type="button" onClick={playClip} className="mt-1 inline-flex min-h-11 items-center gap-1 text-label-md font-bold text-primary hover:underline">
              <Icon name="smart_display" size={18} /> Xem đoạn video
            </button>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <p lang="zh-Hans" className="min-w-0 flex-1 text-body-lg font-bold">{word.example.zh}</p>
              <PronounceButton text={word.example.zh} className="size-11" />
            </div>
            <p className="text-body-md text-on-surface-variant">{word.example.vi}</p>
          </>
        )}
      </div>
      {clip && <div className="mt-space-sm"><SnippetPlayer key={clip.videoId} videoId={clip.videoId} request={clip.request} /></div>}

      <p role="status" className="mt-space-sm flex flex-wrap items-center gap-x-2 text-label-md text-on-surface-variant">
        {cardState === "saved" && <><Icon name="check_circle" size={18} filled /> Đã thêm vào bộ ôn tập. <Link href="/review/cards" className="font-bold text-primary hover:underline">Ôn ngay</Link></>}
        {cardState === "no_example" && "Từ này chưa có câu thật trong kho nên chưa tạo được thẻ ôn."}
        {cardState === "pending" && "Đang thêm vào bộ ôn tập…"}
      </p>
      <button type="button" onClick={onClose} className="mt-1 min-h-11 text-label-md font-extrabold text-primary hover:underline">Đóng</button>
    </section>
  );
}
