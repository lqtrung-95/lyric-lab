import { Icon } from "@/components/ui/icon";
import type { ReviewContext, ReviewLine } from "@/lib/review/review-context-types";
import { levelLabel } from "@/lib/preview/preview-format";
import type { ReviewCard } from "@/lib/user-data/review-repo";

interface FlashCardProps {
  card: ReviewCard;
  flipped: boolean;
  line: ReviewLine | null;
  context: ReviewContext | null;
  onFlip: () => void;
  onReplay: () => void;
}

/** Thẻ ôn (S7): mặt trước chỉ có chữ Hán để tự nhớ; mặt sau hiện pinyin, Hán Việt, nghĩa và câu hát chứa từ. */
export function FlashCard({ card, flipped, line, context, onFlip, onReplay }: FlashCardProps) {
  const kind = card.kind === "grammar" ? "Ngữ pháp" : "Từ vựng";
  return (
    <div className="w-full max-w-[720px] overflow-hidden rounded-xl bg-surface-container-lowest shadow-[0_8px_30px_rgb(32,27,21,0.06)]">
      <div className="flex items-center justify-between gap-3 bg-surface-container-low/50 px-6 py-4">
        <div className="flex flex-wrap items-center gap-2 text-label-sm">
          <span className="rounded-full bg-surface-container px-3 py-1 text-on-surface-variant">{kind}</span>
          <span className="rounded-full bg-surface-container-high px-2.5 py-1 text-on-surface-variant">{levelLabel(card.hsk_level)}</span>
        </div>
        <button
          type="button"
          onClick={onFlip}
          aria-pressed={flipped}
          className="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-surface-container px-4 text-label-md text-on-surface hover:bg-surface-container-high"
        >
          <Icon name="sync" size={16} />
          Đổi mặt thẻ
          <kbd aria-hidden="true" className="ml-1 rounded bg-surface-container-highest px-1.5 text-[10px] font-semibold text-on-surface-variant">Space</kbd>
        </button>
      </div>

      <div className="flex flex-col items-center px-6 pb-8 pt-8 text-center sm:px-12">
        <h2 lang="zh" className="font-serif text-[56px] font-medium leading-tight tracking-wide text-on-surface sm:text-[72px]">{card.term}</h2>

        {!flipped ? (
          <p className="mt-6 text-body-md text-on-surface-variant">Nhớ nghĩa của từ này rồi bấm Space (hoặc “Đổi mặt thẻ”) để kiểm tra.</p>
        ) : (
          <div aria-live="polite" className="mt-3 flex w-full flex-col items-center">
            <p className="flex flex-wrap items-center justify-center gap-x-3 text-pinyin-reading text-primary">
              {card.pinyin && <span>{card.pinyin}</span>}
              {card.han_viet && (
                <span className="text-hanviet-reading uppercase tracking-wider text-secondary">
                  <span className="sr-only">Hán Việt: </span>{card.han_viet}
                </span>
              )}
            </p>
            <p className="mt-4 rounded-full bg-surface-container px-5 py-2 text-body-lg font-medium text-on-surface">{card.meaning}</p>
            {line && <ContextBlock card={card} line={line} context={context} onReplay={onReplay} />}
          </div>
        )}
      </div>
    </div>
  );
}

function ContextBlock({ card, line, context, onReplay }: { card: ReviewCard; line: ReviewLine; context: ReviewContext | null; onReplay: () => void }) {
  const at = line.text.indexOf(card.term);
  return (
    <div className="mt-6 w-full rounded-xl bg-surface-container-low p-4 text-left">
      {context && (
        <p className="text-label-sm font-semibold uppercase tracking-wider text-secondary">
          Ngữ cảnh bài hát{context.title ? `: ${context.title}` : ""}
        </p>
      )}
      <p lang="zh" className="mt-2 text-hanzi-body text-on-surface">
        {at >= 0 ? (
          <>
            {line.text.slice(0, at)}
            <mark className="bg-transparent font-semibold text-primary underline decoration-primary/40 underline-offset-4">{card.term}</mark>
            {line.text.slice(at + card.term.length)}
          </>
        ) : line.text}
      </p>
      <p className="text-label-md text-on-surface-variant">{line.pinyin}</p>
      {line.translation && <p className="mt-1 text-body-md text-on-surface-variant">{line.translation}</p>}
      <button
        type="button"
        onClick={onReplay}
        className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-4 text-label-md font-medium text-on-primary hover:bg-primary-container"
      >
        <Icon name="play_arrow" size={18} />
        Nghe lại câu hát
      </button>
    </div>
  );
}
