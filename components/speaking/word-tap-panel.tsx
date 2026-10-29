"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { PronounceButton } from "@/components/ui/pronounce-button";
import { levelLabel } from "@/lib/preview/preview-format";
import { itemKey, type SavedItem } from "@/lib/user-state/learner-state";
import { useLearnerState } from "@/lib/user-state/use-learner-state";

export interface TappedWord { term: string; pinyin: string; meaning: string; item: SavedItem | null }
interface Detail { term: string; pinyin: string; sinoViet: string | null; hskLevel: number | null; gloss: string | null; meanings: string[] }
type State = { status: "loading" } | { status: "ok"; detail: Detail; item: SavedItem | null } | { status: "none" } | { status: "error" };

/**
 * Tra nhanh một từ vừa bấm trong câu của AI: pinyin, Hán Việt, cấp HSK, nghĩa (từ từ điển) và nút Lưu thẻ ôn. Từ có câu thật trong kho video thì thẻ
 * nghe lại được đúng đoạn đó; chưa có thì vẫn lưu được thẻ không nguồn (chỉ chữ, pinyin, nghĩa) và nói rõ điều đó. Dùng `key={term}` ở chỗ gọi để mỗi từ có trạng thái riêng.
 * `onLooked` báo từ đã tra xong (để màn tổng kết liệt kê "Từ bạn đã tra").
 */
export function WordTapPanel({ term, onLooked, onClose }: { term: string; onLooked: (w: TappedWord) => void; onClose: () => void }) {
  const [state, setState] = useState<State>({ status: "loading" });
  const { state: learner, toggleSaved } = useLearnerState();

  useEffect(() => {
    let live = true;
    fetch(`/api/lookup/word?term=${encodeURIComponent(term)}`)
      .then((r) => (r.ok ? (r.json() as Promise<{ detail: Detail | null; item: SavedItem | null }>) : Promise.reject(new Error("bad"))))
      .then((d) => {
        if (!live) return;
        if (!d.detail) { setState({ status: "none" }); return; }
        setState({ status: "ok", detail: d.detail, item: d.item });
        onLooked({ term: d.detail.term, pinyin: d.detail.pinyin, meaning: d.detail.gloss ?? d.detail.meanings[0] ?? "", item: d.item });
      })
      .catch(() => { if (live) setState({ status: "error" }); });
    return () => { live = false; };
    // onLooked đổi mỗi lần vẽ ở chỗ gọi; chỉ tra lại khi đổi từ.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [term]);

  const saved = learner.saved.some((s) => s.key === itemKey({ type: "vocab", term }));
  return (
    <div role="region" aria-label={`Tra từ ${term}`} className="rounded-2xl border-2 border-ink bg-surface-container-lowest p-space-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-wrap items-baseline gap-x-3">
          <span lang="zh-Hans" className="font-serif text-hanzi-display">{term}</span>
          {state.status === "ok" && <span className="text-pinyin-reading text-primary">{state.detail.pinyin}</span>}
          {state.status === "ok" && state.detail.sinoViet && <span className="text-hanviet-reading uppercase tracking-wider text-secondary"><span className="sr-only">Hán Việt: </span>{state.detail.sinoViet}</span>}
          {state.status === "ok" && state.detail.hskLevel !== null && <span className="rounded-full bg-surface-container-high px-2 py-0.5 text-label-sm text-on-surface-variant">{levelLabel(state.detail.hskLevel)}</span>}
        </div>
        <button type="button" aria-label="Đóng phần tra từ" onClick={onClose} className="flex size-11 shrink-0 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-high"><Icon name="close" size={20} /></button>
      </div>
      {state.status === "loading" && <p role="status" className="mt-1 text-body-md text-on-surface-variant">Đang tra…</p>}
      {state.status === "error" && <p role="alert" className="mt-1 text-body-md text-error">Chưa tra được lúc này. Thử bấm lại từ nhé.</p>}
      {state.status === "none" && <p className="mt-1 text-body-md text-on-surface-variant">Chưa có từ này trong từ điển.</p>}
      {state.status === "ok" && (
        <>
          <p className="mt-1 text-body-lg font-medium">{state.detail.gloss ?? state.detail.meanings.join("; ")}</p>
          {state.detail.gloss && state.detail.meanings.length > 0 && <p className="text-body-md text-on-surface-variant">{state.detail.meanings.join("; ")}</p>}
        </>
      )}
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <PronounceButton text={term} />
        {state.status === "ok" && (
          <button type="button" aria-pressed={saved} disabled={!state.item && !saved} onClick={() => state.item && toggleSaved(state.item)}
            className={`inline-flex min-h-11 items-center gap-1 rounded-full border-2 border-ink px-4 text-label-md font-bold disabled:opacity-60 ${saved ? "bg-secondary-container" : "bg-primary-container"}`}>
            <Icon name={saved ? "check_circle" : "bookmark_add"} size={20} filled={saved} />{saved ? "Đã lưu thẻ ôn" : "Lưu thẻ ôn"}
          </button>
        )}
        <Link href={`/dictionary/${encodeURIComponent(term)}`} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center rounded-full px-3 text-label-md font-bold underline">Xem chi tiết</Link>
      </div>
      {state.status === "ok" && state.item && !state.item.videoId && <p className="mt-1 text-body-sm text-on-surface-variant">Từ này chưa có câu thật trong kho video nên thẻ ôn chỉ có chữ, pinyin và nghĩa, chưa nghe lại được đoạn nguồn.</p>}
      {state.status === "ok" && !state.item && !saved && <p className="mt-1 text-body-sm text-on-surface-variant">Từ này chưa có nghĩa trong từ điển nên chưa lưu được thẻ.</p>}
    </div>
  );
}
