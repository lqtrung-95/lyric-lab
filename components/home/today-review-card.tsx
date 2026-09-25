"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { useDueCount } from "@/components/review/use-due-count";

/** Thẻ "Hôm nay" trên trang chủ: số thẻ cần ôn và lối vào buổi ôn. Không hiện khi chưa có thẻ nào cần ôn. */
export function TodayReviewCard() {
  const count = useDueCount();
  if (!count) return null;
  return (
    <section aria-label="Ôn tập hôm nay" className="mt-space-lg flex flex-wrap items-center justify-between gap-space-md rounded-2xl bg-surface-container-lowest p-space-md shadow-sm">
      <div className="flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-container text-on-primary-container">
          <Icon name="style" size={24} />
        </span>
        <div>
          <h2 className="font-serif text-headline-md text-on-surface">Hôm nay có {count} thẻ cần ôn</h2>
          <p className="text-label-md text-on-surface-variant">Ôn ngắn mỗi ngày giúp bạn nhớ lâu hơn.</p>
        </div>
      </div>
      <Link href="/review" className="inline-flex min-h-11 items-center rounded-full bg-primary px-6 text-label-md font-medium text-on-primary hover:bg-primary-container">
        Bắt đầu ôn
      </Link>
    </section>
  );
}
