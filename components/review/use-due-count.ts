"use client";

import { useEffect, useState } from "react";
import { hasExistingSession } from "@/lib/auth/ensure-anonymous-session";
import { DUE_COUNT_EVENT } from "@/lib/review/due-count-event";
import { loadReviewSession } from "@/lib/user-data/review-repo";

/** Số thẻ cần ôn hôm nay; null khi chưa biết hoặc chưa có phiên (người mới chưa có thẻ nào). */
export function useDueCount(): number | null {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    const refresh = async () => {
      try {
        if (!(await hasExistingSession())) return;
        const { total } = await loadReviewSession();
        if (!cancelled) setCount(total);
      } catch {
        // Huy hiệu chỉ là phụ: lỗi mạng thì không hiện.
      }
    };
    void refresh();
    window.addEventListener(DUE_COUNT_EVENT, refresh);
    return () => {
      cancelled = true;
      window.removeEventListener(DUE_COUNT_EVENT, refresh);
    };
  }, []);

  return count;
}
