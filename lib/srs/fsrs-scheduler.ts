import { Rating, State, createEmptyCard, default_w, fsrs, generatorParameters, type Card, type Grade } from "ts-fsrs";
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

// Lịch ôn tính theo NGÀY, không có bước học trong ngày (phút): người học ôn mỗi ngày một buổi.
// Lần chấm đầu tiên của thẻ mới cho đúng 1 / 2 / 5 / 10 ngày (Quên / Khó / Được / Dễ): ghi đè 4 độ ổn định ban đầu của FSRS
// (w[0..3], với retention 0,9 thì khoảng ôn bằng độ ổn định). Từ lần sau FSRS tự tính và giãn dần theo trí nhớ từng thẻ.
// Trần 180 ngày để từ đã "Dễ" nhiều lần vẫn quay lại vài lần mỗi năm. Tắt fuzz để khoảng hiện trên nút đúng bằng lịch thật.
export const FIRST_REVIEW_DAYS = { again: 1, hard: 2, good: 5, easy: 10 } as const;
// ts-fsrs cho khoảng ôn lớn nhất là `maximum_interval + 1` ngày (đã kiểm tra bằng test), nên đặt 179 để trần thật là 180.
const MAX_INTERVAL_DAYS = 179;
const weights = [...default_w];
weights[0] = FIRST_REVIEW_DAYS.again;
weights[1] = FIRST_REVIEW_DAYS.hard;
weights[2] = FIRST_REVIEW_DAYS.good;
weights[3] = FIRST_REVIEW_DAYS.easy;
const scheduler = fsrs(generatorParameters({
  w: weights, learning_steps: [], relearning_steps: [], enable_short_term: false, enable_fuzz: false, maximum_interval: MAX_INTERVAL_DAYS,
}));

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
