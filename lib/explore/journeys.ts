// "Hành trình trong ngày": chuỗi nhiều cảnh nối thành một câu chuyện ngắn (đi làm, cuối tuần, đón Tết...). Mỗi bước dẫn tới một cảnh với 3 từ mục tiêu.
// Tiến độ KHÔNG lưu riêng: luôn tính lại từ tiến độ khám phá (từ nào đã học, đã trả lời đúng mấy lần), nên đồng bộ tài khoản và "Học lại từ đầu" tự đúng.

import { JOURNEYS } from "./journeys-data";
import { progressKey, type ExploreProgress } from "./explore-progress";

export interface JourneyStep {
  sceneId: string;
  /** Id vật trong cảnh (đúng 3 từ). */
  targets: string[];
  /** Câu hướng dẫn tiếng Trung dùng đủ 3 từ mục tiêu, và nghĩa tiếng Việt. */
  zh: string;
  vi: string;
}
export interface Journey {
  id: string;
  emoji: string;
  title: { zh: string; vi: string };
  blurb: string;
  steps: JourneyStep[];
}

export { JOURNEYS };

/** Tổng số lần trả lời đúng (trên cả 3 từ mục tiêu) để coi bước là xong: phải thật sự làm nhiệm vụ của cảnh, không chỉ chạm học. */
export const STEP_MIN_CORRECT = 2;

export interface StepStatus {
  done: boolean;
  /** Số từ mục tiêu đã học / tổng. */
  learned: number;
  total: number;
  /** Số lần trả lời đúng đã có (tính tối đa tới mức yêu cầu) / mức yêu cầu. */
  correct: number;
  need: number;
}

export function stepStatus(step: JourneyStep, p: ExploreProgress): StepStatus {
  let learned = 0, correct = 0;
  for (const id of step.targets) {
    const t = p.terms[progressKey(step.sceneId, id)];
    if (!t) continue;
    learned++;
    correct += t.correct;
  }
  const total = step.targets.length;
  return { done: learned === total && correct >= STEP_MIN_CORRECT, learned, total, correct: Math.min(correct, STEP_MIN_CORRECT), need: STEP_MIN_CORRECT };
}

export interface JourneyStatus {
  steps: StepStatus[];
  doneCount: number;
  /** Bước đầu tiên chưa xong (gợi ý đi tiếp); null khi đã hoàn thành cả hành trình. */
  current: number | null;
  complete: boolean;
}

export function journeyStatus(j: Journey, p: ExploreProgress): JourneyStatus {
  const steps = j.steps.map((s) => stepStatus(s, p));
  const doneCount = steps.filter((s) => s.done).length;
  const current = steps.findIndex((s) => !s.done);
  return { steps, doneCount, current: current < 0 ? null : current, complete: doneCount === steps.length };
}

/** Các bước của mọi hành trình đặt ở cảnh này (để cảnh nhắc "bạn đang trong hành trình…"). */
/** Các bước của mọi hành trình đặt ở cảnh này (để cảnh nhắc "bạn đang trong hành trình…"). */
export function stepsAtScene(sceneId: string): { journey: Journey; index: number }[] {
  const out: { journey: Journey; index: number }[] = [];
  for (const journey of JOURNEYS) journey.steps.forEach((s, index) => { if (s.sceneId === sceneId) out.push({ journey, index }); });
  return out;
}

/** Số hành trình đã hoàn thành. */
export const completedJourneys = (p: ExploreProgress): number => JOURNEYS.filter((j) => journeyStatus(j, p).complete).length;
