"use client";

import { track } from "@/lib/analytics/track";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Grade } from "ts-fsrs";
import { fetchReviewContext } from "@/lib/review/review-context-client";
import type { ReviewContext } from "@/lib/review/review-context-types";
import { gradeCard } from "@/lib/srs/fsrs-scheduler";
import { srsFieldsOf } from "@/lib/srs/card-fields";
import { requeueAfterGrade } from "@/lib/srs/review-queue";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { loadReviewSession, saveGrade, undoGrade, type ReviewCard } from "@/lib/user-data/review-repo";
import { notifyDueCountChanged } from "@/lib/review/due-count-event";

interface LastGrade {
  before: ReviewCard;
  logId: Promise<number | null>;
}

export type SessionStatus = "loading" | "error" | "empty" | "active" | "finished";

/**
 * Phiên ôn: tải hàng đợi, chấm thẻ (cập nhật giao diện ngay, ghi Supabase ở nền theo thứ tự), hoàn tác lần chấm cuối.
 * Câu hát của thẻ tải theo từng video (cache riêng), chỉ để hiển thị; thẻ vẫn ôn được khi không có câu hát.
 */
export function useReviewSession() {
  const [status, setStatus] = useState<SessionStatus>("loading");
  const [queue, setQueue] = useState<ReviewCard[]>([]);
  const [initialTotal, setInitialTotal] = useState(0);
  const [cardCount, setCardCount] = useState(0);
  const [waitingNew, setWaitingNew] = useState(0);
  const [newStarted, setNewStarted] = useState(0);
  const [newPerDay, setNewPerDay] = useState(0);
  const bonus = useRef(0);
  const [contexts, setContexts] = useState<Record<string, ReviewContext | null>>({});
  const [canUndo, setCanUndo] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const last = useRef<LastGrade | null>(null);
  const userId = useRef<string | null>(null);
  const writes = useRef<Promise<unknown>>(Promise.resolve());

  const loadContexts = useCallback((cards: ReviewCard[]) => {
    const videoIds = [...new Set(cards.map((c) => c.video_id).filter((v): v is string => Boolean(v)))];
    for (const id of videoIds) {
      fetchReviewContext(id).then((ctx) => setContexts((prev) => ({ ...prev, [id]: ctx })));
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [{ data }, session] = await Promise.all([createSupabaseBrowserClient().auth.getSession(), loadReviewSession()]);
        if (cancelled) return;
        userId.current = data.session?.user.id ?? null;
        setCardCount(session.cardCount);
        setWaitingNew(session.waitingNew);
        setNewStarted(session.newStartedToday);
        setNewPerDay(session.newPerDay);
        setInitialTotal(session.total);
        setQueue(session.queue);
        setStatus(session.total > 0 ? "active" : "empty");
        loadContexts(session.queue);
      } catch {
        if (!cancelled) setStatus("error");
      }
    })();
    return () => { cancelled = true; };
  }, [loadContexts]);

  /** Học thêm `count` thẻ mới ngoài hạn mức hôm nay (không đổi cài đặt): nạp lại hàng đợi với phần cộng thêm. */
  const learnMore = useCallback(async (count: number) => {
    bonus.current += count;
    setStatus("loading");
    try {
      const session = await loadReviewSession(new Date(), bonus.current);
      setWaitingNew(session.waitingNew);
      setInitialTotal(session.total);
      setQueue(session.queue);
      setStatus(session.total > 0 ? "active" : "empty");
      loadContexts(session.queue);
    } catch {
      setStatus("error");
    }
  }, [loadContexts]);

  const grade = useCallback((rating: Grade) => {
    const card = queue[0];
    const uid = userId.current;
    if (!card || !uid) return;
    const now = new Date();
    const { next, log } = gradeCard(srsFieldsOf(card), rating, now);
    const graded: ReviewCard = { ...card, ...next };
    const rest = requeueAfterGrade(queue.slice(1), graded, now);
    setQueue(rest);
    if (rest.length === 0) {
      setStatus("finished");
      track("review_session_done");
    }

    const logId = writes.current
      .then(() => saveGrade(uid, card.item_key, next, log))
      .catch(() => { setSaveError(true); return null; });
    writes.current = logId;
    last.current = { before: card, logId };
    setCanUndo(true);
    notifyDueCountChanged();
  }, [queue]);

  const undo = useCallback(async () => {
    const prev = last.current;
    if (!prev) return;
    last.current = null;
    setCanUndo(false);
    // Bỏ bản đã chấm (nếu còn trong hàng đợi) và đưa thẻ cũ về đầu.
    setQueue((q) => [prev.before, ...q.filter((c) => c.item_key !== prev.before.item_key)]);
    setStatus("active");
    const write = writes.current.then(async () => {
      const id = await prev.logId;
      if (id !== null) await undoGrade(prev.before.item_key, srsFieldsOf(prev.before), id);
    }).catch(() => setSaveError(true));
    writes.current = write;
    await write;
    notifyDueCountChanged();
  }, []);

  const current = queue[0] ?? null;
  return {
    status, current, remaining: queue.length, initialTotal, cardCount, canUndo, saveError, grade, undo,
    waitingNew, newStarted, newPerDay, learnMore,
    context: current?.video_id ? contexts[current.video_id] ?? null : null,
  };
}
