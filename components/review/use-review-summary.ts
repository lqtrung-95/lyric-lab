"use client";

import { useEffect, useState } from "react";
import { hasExistingSession } from "@/lib/auth/ensure-anonymous-session";
import { DUE_COUNT_EVENT } from "@/lib/review/due-count-event";
import { loadReviewSession } from "@/lib/user-data/review-repo";

export interface ReviewSummary {
  /** Thẻ cần ôn hôm nay (đến hạn + thẻ mới trong hạn mức). */
  total: number;
  cardCount: number;
  newPerDay: number;
  newStartedToday: number;
}

// Huy hiệu ở nav và bảng "Hôm nay" cùng cần số liệu này: gộp các lần tải đang chạy để chỉ hỏi Supabase một lần.
let inflight: Promise<ReviewSummary | null> | null = null;
function fetchSummary(): Promise<ReviewSummary | null> {
  inflight ??= (async () => {
    try {
      if (!(await hasExistingSession())) return null;
      const { total, cardCount, newPerDay, newStartedToday } = await loadReviewSession();
      return { total, cardCount, newPerDay, newStartedToday };
    } catch {
      return null; // Chỉ là thông tin phụ: lỗi mạng thì không hiện.
    } finally {
      setTimeout(() => { inflight = null; }, 0);
    }
  })();
  return inflight;
}

export interface ReviewSummaryState {
  summary: ReviewSummary | null;
  /** Đã hỏi xong (kể cả khi kết quả là "chưa có phiên"): giao diện dùng để hiện khung chờ cho tới lúc này, tránh nhảy bố cục. */
  loaded: boolean;
}

/** Tóm tắt buổi ôn hôm nay kèm cờ đã tải xong. Tự làm mới khi chấm/lưu thẻ. */
export function useReviewSummaryState(): ReviewSummaryState {
  const [state, setState] = useState<ReviewSummaryState>({ summary: null, loaded: false });

  useEffect(() => {
    let cancelled = false;
    const refresh = () => {
      void fetchSummary().then((summary) => {
        if (!cancelled) setState((prev) => ({ summary: summary ?? prev.summary, loaded: true }));
      });
    };
    refresh();
    window.addEventListener(DUE_COUNT_EVENT, refresh);
    return () => {
      cancelled = true;
      window.removeEventListener(DUE_COUNT_EVENT, refresh);
    };
  }, []);

  return state;
}

/** Tóm tắt buổi ôn hôm nay; null khi chưa biết hoặc chưa có phiên (người mới chưa có thẻ nào). */
export const useReviewSummary = (): ReviewSummary | null => useReviewSummaryState().summary;
