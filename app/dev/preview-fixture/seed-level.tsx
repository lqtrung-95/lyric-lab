"use client";

import { useLayoutEffect } from "react";
import { initialLearnerState, setLevel } from "@/lib/user-state/learner-state";
import { readLearnerRaw, writeLearnerState } from "@/lib/user-state/local-learner-store";

/**
 * Chỉ cho trang dữ liệu mẫu (dev/test): mặc định của app là HSK 1 ("chưa biết gì") nhưng các test e2e dựa vào dữ liệu mẫu ở level HSK 3
 * (ẩn mục HSK 1–2). Chưa có trạng thái nào thì đặt HSK 3 trước khi vẽ lần đầu; đã có (ví dụ người thử đã đổi level) thì giữ nguyên.
 */
export function SeedFixtureLevel() {
  useLayoutEffect(() => {
    if (readLearnerRaw() === null) writeLearnerState(setLevel(initialLearnerState, 3));
  }, []);
  return null;
}
