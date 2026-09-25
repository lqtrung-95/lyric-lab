import { Rating, State, createEmptyCard, fsrs, type Card, type Grade } from "ts-fsrs";
import { formatInterval } from "./interval-label";

/** Cột FSRS của một thẻ trong bảng `user_cards` (ISO string cho thời điểm). */
export interface SrsFields {
  due: string;
  stability: number;
  difficulty: number;
  elapsed_days: number;
  scheduled_days: number;
  learning_steps: number;
  reps: number;
  lapses: number;
  state: number;
  last_review: string | null;
}

/** Dòng nhật ký ôn: trạng thái của thẻ TRƯỚC khi chấm (khớp bảng `review_logs`). */
export interface ReviewLogFields {
  rating: number;
  state: number;
  due: string;
  stability: number;
  difficulty: number;
  elapsed_days: number;
  scheduled_days: number;
  reviewed_at: string;
}

export const RATINGS = [
  { rating: Rating.Again, label: "Quên" },
  { rating: Rating.Hard, label: "Khó" },
  { rating: Rating.Good, label: "Được" },
  { rating: Rating.Easy, label: "Dễ" },
] as const;

// Tham số chuẩn, retention 0,9. Tắt fuzz để khoảng thời gian hiện trên nút đúng bằng lịch thật.
const scheduler = fsrs({ enable_fuzz: false });

export const toCard = (f: SrsFields): Card => ({
  due: new Date(f.due), stability: f.stability, difficulty: f.difficulty, elapsed_days: f.elapsed_days,
  scheduled_days: f.scheduled_days, learning_steps: f.learning_steps, reps: f.reps, lapses: f.lapses,
  state: f.state as State, last_review: f.last_review ? new Date(f.last_review) : undefined,
});

export const fromCard = (c: Card): SrsFields => ({
  due: c.due.toISOString(), stability: c.stability, difficulty: c.difficulty, elapsed_days: c.elapsed_days,
  scheduled_days: c.scheduled_days, learning_steps: c.learning_steps, reps: c.reps, lapses: c.lapses,
  state: c.state, last_review: c.last_review ? c.last_review.toISOString() : null,
});

/** Trạng thái FSRS của thẻ mới tinh. */
export const newCardFields = (now: Date): SrsFields => fromCard(createEmptyCard(now));

/** Khoảng tới lần ôn kế cho từng nút chấm, để hiện dưới nút (khoảng thật do FSRS tính, khác nhau theo thẻ). */
export function previewIntervals(card: SrsFields, now: Date): Record<Grade, string> {
  const result = scheduler.repeat(toCard(card), now);
  const label = (g: Grade) => formatInterval(result[g].card.due.getTime() - now.getTime());
  return { [Rating.Again]: label(Rating.Again), [Rating.Hard]: label(Rating.Hard), [Rating.Good]: label(Rating.Good), [Rating.Easy]: label(Rating.Easy) };
}

/** Chấm một thẻ: trả trạng thái mới của thẻ và dòng nhật ký (trạng thái trước khi chấm). */
export function gradeCard(card: SrsFields, rating: Grade, now: Date): { next: SrsFields; log: ReviewLogFields } {
  const { card: nextCard, log } = scheduler.next(toCard(card), now, rating);
  return {
    next: fromCard(nextCard),
    log: {
      rating, state: log.state, due: log.due.toISOString(), stability: log.stability, difficulty: log.difficulty,
      elapsed_days: log.elapsed_days, scheduled_days: log.scheduled_days, reviewed_at: now.toISOString(),
    },
  };
}
