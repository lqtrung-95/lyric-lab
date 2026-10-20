import { goalFraction } from "@/lib/home/home-logic";

const R = 34;
const C = 2 * Math.PI * R;

/** Vòng tròn mục tiêu ngày: số thẻ mới đã bắt đầu học hôm nay trên hạn mức đã đặt. Số nằm giữa vòng, chú thích bên dưới. */
export function DailyGoalRing({ started, perDay }: { started: number; perDay: number }) {
  const done = perDay > 0 && started >= perDay;
  return (
    <div className="flex flex-col items-center gap-1 text-center">
      <div className="relative size-28 shrink-0">
        <svg viewBox="0 0 80 80" role="img" aria-label={`Mục tiêu hôm nay: đã học ${started} trên ${perDay} thẻ mới`} className="size-full -rotate-90">
          <circle cx="40" cy="40" r={R} fill="none" strokeWidth="8" className="stroke-surface-container-highest" />
          <circle cx="40" cy="40" r={R} fill="none" strokeWidth="8" strokeLinecap="round" strokeDasharray={C}
            strokeDashoffset={C * (1 - goalFraction(started, perDay))} className={`${done ? "stroke-secondary" : "stroke-primary"} transition-[stroke-dashoffset] duration-700`} />
        </svg>
        <p aria-hidden="true" className="absolute inset-0 flex flex-col items-center justify-center font-serif text-headline-md leading-none text-on-surface">
          {started}<span className="mt-1 text-label-md text-on-surface-variant">/ {perDay}</span>
        </p>
      </div>
      <p className="text-label-md text-on-surface-variant">{done ? "Đã đạt mục tiêu hôm nay" : "thẻ mới hôm nay"}</p>
    </div>
  );
}
