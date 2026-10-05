import { Icon } from "@/components/ui/icon";
import type { RoomChoice } from "@/lib/rooms/room-question-types";

const LETTERS = ["A", "B", "C", "D"];

interface ChoiceListProps {
  choices: RoomChoice[];
  /** Có thể bấm chọn (câu đang mở và mình chưa trả lời). */
  enabled: boolean;
  /** Lựa chọn của mình (đã trả lời) hoặc null. */
  chosen: number | null;
  /** Đáp án đúng nếu đã được phép lộ, ngược lại null. */
  correctIndex: number | null;
  onChoose: (index: number) => void;
}

/** Bốn đáp án A–D với chữ Hán, pinyin, âm Hán-Việt và nghĩa. Tô màu đúng/sai chỉ khi đáp án đúng đã được phép lộ; không chỉ dựa vào màu (có chữ và icon). */
export function RoomChoiceList({ choices, enabled, chosen, correctIndex, onChoose }: ChoiceListProps) {
  return (
    <ul aria-label="Đáp án" className="grid grid-cols-1 gap-space-sm sm:grid-cols-2">
      {choices.map((c, i) => {
        const isCorrect = correctIndex === i;
        const isWrongPick = chosen === i && correctIndex !== null && correctIndex !== i;
        const tone = isCorrect ? "bg-secondary-container ring-2 ring-secondary" : isWrongPick ? "bg-error-container ring-2 ring-error" : chosen === i ? "bg-primary/10 ring-2 ring-primary" : "bg-surface-container-lowest hover:bg-surface-container-high";
        return (
          <li key={c.term}>
            <button
              type="button" disabled={!enabled} onClick={() => onChoose(i)} aria-keyshortcuts={String(i + 1)}
              aria-label={`Đáp án ${LETTERS[i]}: ${c.term}${c.reading ? `, ${c.reading}` : ""}${isCorrect ? ", đáp án đúng" : isWrongPick ? ", bạn chọn sai" : chosen === i ? ", bạn đã chọn" : ""}`}
              className={`flex min-h-16 w-full items-center gap-3 rounded-2xl p-3 text-left shadow-sm transition-colors disabled:cursor-default ${tone}`}
            >
              <span aria-hidden="true" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-container-high text-label-md font-semibold text-on-surface">{LETTERS[i]}</span>
              <span className="min-w-0 flex-1">
                <span lang="zh" className="block font-serif text-headline-md text-on-surface">{c.term}</span>
                <span className="block truncate text-label-sm text-on-surface-variant">{[c.reading, c.sinoViet?.toUpperCase()].filter(Boolean).join(" · ")}</span>
              </span>
              <span className="max-w-[40%] text-right text-label-sm text-on-surface-variant">{c.meaning}</span>
              {isCorrect && <Icon name="check_circle" filled size={22} className="shrink-0 text-secondary" />}
              {isWrongPick && <Icon name="close" size={22} className="shrink-0 text-error" />}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
