"use client";

import { useSyncExternalStore } from "react";
import { DEFAULT_COURSE, readLastCourse } from "@/lib/courses/last-course";

const noop = () => () => {};

/** Khóa học xem gần nhất (đọc localStorage sau hydrate, trước đó là HSK 1 để khớp với HTML do server dựng). */
export function useLastCourse(): string {
  return useSyncExternalStore(noop, readLastCourse, () => DEFAULT_COURSE);
}
