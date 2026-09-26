"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { gradeCard } from "@/lib/srs/fsrs-scheduler";
import { srsFieldsOf } from "@/lib/srs/card-fields";
import { gradeFromOutcome, isGradable, type PracticeOutcome } from "@/lib/practice/practice-grade";
import { notifyDueCountChanged } from "@/lib/review/due-count-event";
import { loadPracticeCards } from "@/lib/user-data/practice-repo";
import { saveGrade, type ReviewCard } from "@/lib/user-data/review-repo";

export type PoolStatus = "loading" | "error" | "ready";

/**
 * Nạp thẻ của người dùng cho một chế độ luyện tập và cung cấp hàm chấm vào lịch ôn FSRS.
 * `grade` chỉ ghi khi thẻ đã học và đã đến hạn (xem `isGradable`); trả true nếu thẻ được cập nhật lịch.
 */
export function usePracticePool() {
  const [status, setStatus] = useState<PoolStatus>("loading");
  const [cards, setCards] = useState<ReviewCard[]>([]);
  const userId = useRef<string | null>(null);
  const writes = useRef<Promise<unknown>>(Promise.resolve());

  useEffect(() => {
    let cancelled = false;
    loadPracticeCards().then(
      (res) => {
        if (cancelled) return;
        userId.current = res.userId;
        setCards(res.cards);
        setStatus("ready");
      },
      () => { if (!cancelled) setStatus("error"); },
    );
    return () => { cancelled = true; };
  }, []);

  const grade = useCallback((card: ReviewCard, outcome: PracticeOutcome): boolean => {
    const now = new Date();
    const uid = userId.current;
    if (!uid || !isGradable(card, now)) return false;
    const { next, log } = gradeCard(srsFieldsOf(card), gradeFromOutcome(outcome), now);
    // Ghi tuần tự để hai lượt chấm liên tiếp không chạy chồng nhau; lỗi mạng chỉ mất một lần cập nhật lịch.
    writes.current = writes.current.then(() => saveGrade(uid, card.item_key, next, log)).then(notifyDueCountChanged).catch(() => {});
    return true;
  }, []);

  return { status, cards, grade };
}
