import { LEARNER_STATE_KEY, parseLearnerState, type LearnerState } from "./learner-state";

// Bản làm việc của trạng thái học trong localStorage: vẽ giao diện ngay, không chờ mạng. Bản gốc nằm ở Supabase.
export const LEARNER_STATE_EVENT = "lyric-lab-learner-state";

export function readLearnerRaw(): string | null {
  try {
    return localStorage.getItem(LEARNER_STATE_KEY);
  } catch {
    return null;
  }
}

export const readLearnerState = (): LearnerState => parseLearnerState(readLearnerRaw());

export function writeLearnerState(state: LearnerState) {
  try {
    localStorage.setItem(LEARNER_STATE_KEY, JSON.stringify(state));
  } catch {
    // localStorage bị chặn: thay đổi chỉ tồn tại tới khi tải lại trang.
  }
  window.dispatchEvent(new Event(LEARNER_STATE_EVENT));
}
