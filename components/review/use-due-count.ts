"use client";

import { useReviewSummary } from "./use-review-summary";

/** Số thẻ cần ôn hôm nay; null khi chưa biết hoặc chưa có phiên (người mới chưa có thẻ nào). */
export function useDueCount(): number | null {
  return useReviewSummary()?.total ?? null;
}
