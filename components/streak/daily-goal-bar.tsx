import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { dailyGoalProgress } from "@/lib/streak/daily-goal";

/** Thanh tiến độ mục tiêu hằng ngày ("Hôm nay 6/10 mục"). Tắt mục tiêu thì chỉ còn lời mời đặt mục tiêu ở Cài đặt. */
export function DailyGoalBar({ items, goal }: { items: number; goal: number }) {
  const p = dailyGoalProgress(items, goal);
  if (!p.enabled) {
    return <p className="text-label-md text-on-surface-variant">Chưa đặt mục tiêu hằng ngày. <Link href="/settings?tab=learning" className="font-medium text-primary underline">Đặt mục tiêu</Link></p>;
  }
  return (
    <div>
      <div className="flex items-center justify-between gap-2 text-label-md">
        <p className="flex items-center gap-1.5 font-medium text-on-surface">
          {p.done && <Icon name="check_circle" filled size={18} className="text-secondary" />}
          {p.done ? "Đã đạt mục tiêu hôm nay" : "Mục tiêu hôm nay"}
        </p>
        <p className="text-on-surface-variant">{p.items}/{p.goal} mục</p>
      </div>
      <div role="progressbar" aria-label="Tiến độ mục tiêu hôm nay" aria-valuemin={0} aria-valuemax={p.goal} aria-valuenow={Math.min(p.items, p.goal)} className="mt-1.5 h-2 overflow-hidden rounded-full bg-surface-container-high">
        <div className={`h-full rounded-full transition-[width] motion-reduce:transition-none ${p.done ? "bg-secondary" : "bg-primary"}`} style={{ width: `${p.fraction * 100}%` }} />
      </div>
    </div>
  );
}
