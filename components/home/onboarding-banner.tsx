"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";

export const ONBOARDED_KEY = "lyric-lab-onboarded";

const noop = () => () => {};
const read = () => {
  try {
    return localStorage.getItem(ONBOARDED_KEY) === "1";
  } catch {
    return true; // Không đọc được thì đừng nhắc mãi.
  }
};

/** Lời mời làm quen (chọn level, số thẻ mới/ngày) cho người dùng mới ở trang chủ. Biến mất sau khi hoàn tất. */
export function OnboardingBanner() {
  const onboarded = useSyncExternalStore(noop, read, () => true);
  if (onboarded) return null;
  return (
    <aside aria-label="Làm quen" className="mt-space-lg flex flex-wrap items-center justify-between gap-space-md rounded-2xl bg-secondary-container/40 p-space-md">
      <p className="text-body-md text-on-secondary-container">Mới dùng lần đầu? Chọn level và số thẻ mới mỗi ngày để danh sách từ vừa sức bạn.</p>
      <Link href="/welcome" className="inline-flex min-h-11 items-center rounded-full bg-secondary px-5 text-label-md font-medium text-on-secondary">Thiết lập nhanh</Link>
    </aside>
  );
}
