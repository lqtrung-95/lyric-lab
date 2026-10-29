"use client";

import Link from "next/link";
import { useState } from "react";
import { SnippetPlayer, type SnippetRequest } from "@/components/player/snippet-player";
import { Icon } from "@/components/ui/icon";
import { PronounceButton } from "@/components/ui/pronounce-button";
import type { SceneWord } from "@/lib/explore/explore-types";
import { snippetRange } from "@/lib/preview/preview-format";

/** Trạng thái và hành động thẻ ôn của một từ (do người học tự chọn, không tự thêm khi chạm). */
export interface WordActions {
  /** Đã có thẻ trong bộ ôn. */
  saved: boolean;
  /** Người học đã đánh dấu "đã biết" từ này. */
  known: boolean;
  /** Có câu thật làm nguồn (thẻ nghe lại được đoạn video/bài hát). */
  hasSource: boolean;
  add: () => void;
  remove: () => void;
  /** Đánh dấu đã biết; `alsoRemoveCard` = bỏ luôn thẻ đang có khỏi bộ ôn. */
  markKnown: (alsoRemoveCard: boolean) => void;
  unmarkKnown: () => void;
}

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
export function WordCard({ word, actions, onClose }: { word: SceneWord; actions: WordActions; onClose: () => void }) {
  const real = word.examples[0];
  const [confirmKnown, setConfirmKnown] = useState(false);
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

      <CardChoice term={word.term} actions={actions} confirmKnown={confirmKnown} setConfirmKnown={setConfirmKnown} />
      <button type="button" onClick={onClose} className="mt-1 min-h-11 text-label-md font-extrabold text-primary hover:underline">Đóng</button>
    </section>
  );
}

const PILL = "min-h-11 cursor-pointer rounded-full border-2 border-ink px-4 text-label-md font-bold";

/** Chọn của người học về thẻ ôn: thêm vào bộ ôn, hoặc đánh dấu đã biết (có hỏi bỏ thẻ nếu đã lưu). */
function CardChoice({ term, actions, confirmKnown, setConfirmKnown }: { term: string; actions: WordActions; confirmKnown: boolean; setConfirmKnown: (v: boolean) => void }) {
  const { saved, known, hasSource } = actions;
  return (
    <div className="mt-space-sm space-y-2">
      <p role="status" className="flex flex-wrap items-center gap-x-2 text-label-md text-on-surface-variant">
        {saved && <><Icon name="check_circle" size={18} filled /> Đã thêm vào bộ ôn tập. <Link href="/review/cards" className="font-bold text-primary hover:underline">Ôn ngay</Link></>}
        {!saved && known && <><Icon name="check_circle" size={18} /> Bạn đã đánh dấu từ này là đã biết nên không thêm vào bộ ôn.</>}
        {!saved && !known && (hasSource
          ? "Thẻ ôn sẽ nghe lại được câu thật trong bài hát/video ở trên."
          : "Từ này chưa có câu thật trong kho. Vẫn thêm được thẻ ôn, mặt thẻ có chữ, pinyin, nghĩa và câu ví dụ của cảnh, nhưng không có nút nghe lại đoạn video.")}
      </p>
      {confirmKnown ? (
        <div role="group" aria-label={`Đánh dấu ${term} đã biết`} className="flex flex-wrap items-center gap-2">
          <span className="text-label-md font-bold">Bỏ thẻ này khỏi bộ ôn luôn?</span>
          <button type="button" className={`${PILL} bg-primary-container`} onClick={() => { actions.markKnown(true); setConfirmKnown(false); }}>Bỏ thẻ</button>
          <button type="button" className={`${PILL} bg-surface-container-low`} onClick={() => { actions.markKnown(false); setConfirmKnown(false); }}>Giữ thẻ</button>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {!saved && !known && <button type="button" className={`${PILL} bg-primary-container`} onClick={actions.add}>Thêm vào bộ ôn</button>}
          {saved && <button type="button" className={`${PILL} bg-surface-container-low`} onClick={actions.remove}>Bỏ khỏi bộ ôn</button>}
          {known
            ? <button type="button" className={`${PILL} bg-surface-container-low`} onClick={actions.unmarkKnown}>Bỏ đánh dấu đã biết</button>
            : <button type="button" className={`${PILL} bg-surface-container-low`} onClick={() => (saved ? setConfirmKnown(true) : actions.markKnown(false))}>Mình đã biết từ này</button>}
          {known && !saved && <button type="button" className={`${PILL} bg-primary-container`} onClick={() => { actions.unmarkKnown(); actions.add(); }}>Thêm vào bộ ôn</button>}
        </div>
      )}
    </div>
  );
}
