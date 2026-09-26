"use client";

import { useSyncExternalStore } from "react";
import { LEARNER_STATE_KEY } from "@/lib/user-state/learner-state";
import { RECENT_SONGS_KEY } from "@/lib/user-state/recent-songs";
import { FaqSection } from "./faq-section";
import { FeaturesGrid } from "./features-grid";
import { FinalCta } from "./final-cta";
import { HowItWorks } from "./how-it-works";

const noop = () => () => {};
const isReturning = () => {
  try {
    return localStorage.getItem(RECENT_SONGS_KEY) !== null || localStorage.getItem(LEARNER_STATE_KEY) !== null;
  } catch {
    return false;
  }
};

/** Phần giới thiệu dưới hero. Chỉ hiện cho người dùng mới; người đã học rồi thấy trang chủ gọn (hero + bài gần đây + thẻ ôn). */
export function LandingSections() {
  const returning = useSyncExternalStore(noop, isReturning, () => false);
  if (returning) return null;
  return (
    <>
      <HowItWorks />
      <FeaturesGrid />
      <FaqSection />
      <FinalCta />
      <p className="mt-space-xl text-center text-label-md text-on-surface-variant">
        Lyric Lab không tải hay lưu nhạc. Lời bài hát thuộc về chủ sở hữu quyền tác giả và chỉ hiện cạnh video gốc để học tập.
      </p>
    </>
  );
}
