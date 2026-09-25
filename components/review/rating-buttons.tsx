import type { Grade } from "ts-fsrs";
import { RATINGS } from "@/lib/srs/fsrs-scheduler";

const STYLE: Record<Grade, string> = {
  1: "bg-error-container/60 text-on-error-container hover:bg-error-container",
  2: "bg-surface-container-high text-on-surface hover:bg-surface-container-highest",
  3: "bg-secondary-container/60 text-on-secondary-container hover:bg-secondary-container",
  4: "bg-primary text-on-primary hover:bg-primary-container",
};

/** Bốn nút chấm (phím 1–4). Dưới mỗi nút là khoảng thời gian tới lần ôn kế do FSRS tính cho đúng thẻ này. */
export function RatingButtons({ intervals, onGrade }: { intervals: Record<Grade, string>; onGrade: (rating: Grade) => void }) {
  return (
    <div role="group" aria-label="Bạn nhớ từ này thế nào?" className="grid w-full grid-cols-2 gap-3 sm:grid-cols-4">
      {RATINGS.map(({ rating, label }) => (
        <button
          key={rating}
          type="button"
          onClick={() => onGrade(rating)}
          className={`flex min-h-16 flex-col items-center justify-center rounded-xl p-3 text-center shadow-sm transition-transform active:scale-95 ${STYLE[rating]}`}
        >
          <span className="flex items-center gap-1.5 text-label-md font-semibold">
            <kbd aria-hidden="true" className="rounded bg-surface-container-lowest px-1.5 font-mono text-[10px] text-on-surface">{rating}</kbd>
            {label}
          </span>
          <span className="mt-0.5 text-body-md font-semibold">{intervals[rating]}</span>
        </button>
      ))}
    </div>
  );
}
