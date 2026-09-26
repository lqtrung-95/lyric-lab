import { goalFraction } from "@/lib/home/home-logic";

const R = 34;
const C = 2 * Math.PI * R;

/** Vòng tròn mục tiêu ngày: số thẻ mới đã bắt đầu học hôm nay trên hạn mức đã đặt. */
export function DailyGoalRing({ started, perDay }: { started: number; perDay: number }) {
  const done = perDay > 0 && started >= perDay;
  return (
    <div className="flex items-center gap-3">
      <svg viewBox="0 0 80 80" role="img" aria-label={`Mục tiêu hôm nay: đã học ${started} trên ${perDay} thẻ mới`} className="h-16 w-16 shrink-0 -rotate-90">
        <circle cx="40" cy="40" r={R} fill="none" strokeWidth="8" className="stroke-surface-container-highest" />
        <circle cx="40" cy="40" r={R} fill="none" strokeWidth="8" strokeLinecap="round" strokeDasharray={C}
          strokeDashoffset={C * (1 - goalFraction(started, perDay))} className={`${done ? "stroke-secondary" : "stroke-primary"} transition-[stroke-dashoffset] duration-700`} />
      </svg>
      <div>
        <p className="font-serif text-headline-md text-on-surface">{started}<span className="text-on-surface-variant"> / {perDay}</span></p>
        <p className="text-label-md text-on-surface-variant">{done ? "Đã đạt mục tiêu hôm nay" : "thẻ mới hôm nay"}</p>
      </div>
    </div>
  );
}
