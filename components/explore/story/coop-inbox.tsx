"use client";

import { PronounceButton } from "@/components/ui/pronounce-button";
import { RubyLine } from "@/components/ui/ruby-text";
import { ROLE_LABEL } from "@/lib/explore/coop/coop-state";
import type { StoryPayload } from "@/lib/explore/story/load-story";
import type { InboxItem } from "./use-coop-session";
import type { Hints } from "./use-story-hints";

interface Props {
  items: InboxItem[];
  payload: StoryPayload;
  hints: Hints;
  hasClue: (id: string) => boolean;
  onAccept: (item: InboxItem) => void;
  onDismiss: (id: number) => void;
  onAnswer: (item: InboxItem, ok: boolean) => void;
}

const btn = "min-h-11 rounded-full border-2 border-ink px-4 text-label-md font-extrabold";

/**
 * Hộp thư của đồng đội: manh mối được báo (đọc bằng tiếng Trung rồi quyết định ghi vào sổ), đề nghị buộc tội cần trả lời, và thông báo ngắn.
 * Nội dung tiếng Trung là chính; pinyin và nghĩa Việt chỉ hiện khi bật gợi ý. Tên manh mối (tiếng Việt) cố ý không hiện để người nhận phải đọc.
 */
export function CoopInbox({ items, payload, hints, hasClue, onAccept, onDismiss, onAnswer }: Props) {
  const { story, pinyin } = payload;
  const clueOf = (id: string) => story.clues.find((c) => c.id === id);
  const zhLine = (id: string) => {
    const c = clueOf(id);
    if (!c) return null;
    return (
      <div key={id} className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <p lang="zh-Hans" className={`text-body-lg font-bold ${hints.pinyin ? "leading-[2.2]" : ""}`}><RubyLine zh={c.zh} pinyin={pinyin[c.zh]} show={hints.pinyin} /></p>
          {hints.vi && <p className="text-body-sm text-on-surface-variant">{c.vi}</p>}
        </div>
        <PronounceButton text={c.zh} className="size-10" />
      </div>
    );
  };
  if (items.length === 0) return null;
  return (
    <ul aria-label="Hộp thư của đồng đội" className="flex flex-col gap-2">
      {items.map((item) => (
        <li key={item.id} className="rounded-xl border-2 border-ink bg-tertiary-container p-space-sm text-on-tertiary-container">
          {item.kind === "report" && (
            <>
              <p className="text-label-md font-extrabold">{ROLE_LABEL[item.from]} báo một manh mối cho bạn:</p>
              <div className="mt-1">{zhLine(item.clueId)}</div>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {hasClue(item.clueId)
                  ? <span className="text-label-md font-bold">Bạn đã có manh mối này rồi.</span>
                  : <button type="button" onClick={() => onAccept(item)} className={`${btn} bg-secondary text-on-secondary`}>Ghi vào sổ</button>}
                <button type="button" onClick={() => onDismiss(item.id)} className={`${btn} bg-surface-container-lowest text-on-surface`}>Bỏ qua</button>
              </div>
            </>
          )}
          {item.kind === "proposal" && (
            <>
              <p className="text-label-md font-extrabold">{ROLE_LABEL[item.from]} đề nghị buộc tội: {item.suspectIds.map((id) => story.suspects.find((s) => s.id === id)?.name ?? id).join(" và ")}</p>
              <p className="text-label-md">Bằng chứng họ đưa ra (đọc rồi quyết định có đồng ý không):</p>
              <div className="mt-1 flex flex-col gap-1.5">{item.clueIds.map(zhLine)}</div>
              <div className="mt-2 flex flex-wrap gap-2">
                <button type="button" onClick={() => onAnswer(item, true)} className={`${btn} bg-secondary text-on-secondary`}>Đồng ý</button>
                <button type="button" onClick={() => onAnswer(item, false)} className={`${btn} bg-surface-container-lowest text-on-surface`}>Chưa đồng ý</button>
              </div>
            </>
          )}
          {item.kind === "note" && (
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p role="status" className="text-label-md font-extrabold">{item.text}</p>
              <button type="button" onClick={() => onDismiss(item.id)} className={`${btn} bg-surface-container-lowest text-on-surface`}>Đã hiểu</button>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
