/** Cấu hình lặp câu: số lần lặp (null = vô hạn tới khi người dùng tắt) và khoảng nghỉ giữa mỗi lần (giây). */
export interface RepeatConfig {
  times: number | null;
  delaySec: number;
}

export const REPEAT_COUNT_OPTIONS: (number | null)[] = [null, 1, 2, 3, 5];
export const REPEAT_DELAY_OPTIONS = [0, 0.5, 1, 2] as const;

export const defaultRepeatConfig: RepeatConfig = { times: null, delaySec: 0 };

export const repeatCountLabel = (times: number | null): string => (times === null ? "Vô hạn" : `${times} lần`);
export const repeatDelayLabel = (delaySec: number): string => (delaySec === 0 ? "Không nghỉ" : `${String(delaySec).replace(".", ",")}s`);
