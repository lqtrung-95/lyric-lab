import type { SrsFields } from "./fsrs-scheduler";

/** Phần FSRS của một thẻ (bỏ các cột nội dung) để đưa vào `gradeCard`. */
export const srsFieldsOf = (c: SrsFields): SrsFields => ({
  due: c.due, stability: c.stability, difficulty: c.difficulty, elapsed_days: c.elapsed_days, scheduled_days: c.scheduled_days,
  learning_steps: c.learning_steps, reps: c.reps, lapses: c.lapses, state: c.state, last_review: c.last_review,
});
