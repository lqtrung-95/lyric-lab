"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { levelLabel } from "@/lib/preview/preview-format";
import { NEW_CARDS_OPTIONS, saveProfile } from "@/lib/user-data/profile-repo";
import { useLearnerState } from "@/lib/user-state/use-learner-state";
import { ONBOARDED_KEY } from "@/components/home/onboarding-banner";

const LEVEL_HINTS = ["~150 từ, câu đơn giản", "~300 từ, giao tiếp cơ bản", "~600 từ, bắt đầu hiểu lời ca C-pop", "~1.200 từ, diễn đạt cảm xúc", "~2.500 từ, đọc hiểu sâu hơn", "5.000+ từ, đọc cả lời cổ phong"];
const LEVELS = [1, 2, 3, 4, 5, 6];

/** Làm quen (S2 rút gọn): chọn level và số thẻ mới mỗi ngày. Cả hai đổi lại được trong Cài đặt. */
export function OnboardingScreen() {
  const router = useRouter();
  const { state, setLevel } = useLearnerState();
  const [perDay, setPerDay] = useState(15);
  const [busy, setBusy] = useState(false);

  async function start() {
    setBusy(true);
    try {
      localStorage.setItem(ONBOARDED_KEY, "1");
    } catch {
      // Bỏ qua: chỉ để ẩn lời mời làm quen ở trang chủ.
    }
    await saveProfile({ newCardsPerDay: perDay, onboarded: true });
    router.push("/app");
  }

  const choice = "flex min-h-11 items-center justify-between gap-3 rounded-xl px-4 py-3 text-left transition-colors has-[:checked]:bg-primary-container has-[:checked]:text-on-primary-container bg-surface-container-low hover:bg-surface-container";
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-serif text-headline-lg-mobile md:text-headline-lg">Chào mừng đến Lyric Lab</h1>
      <p className="mt-space-sm text-body-lg text-on-surface-variant">Chọn level hiện tại để danh sách từ vựng vừa sức. Bạn đổi lại được bất cứ lúc nào.</p>

      <fieldset className="mt-space-lg">
        <legend className="text-label-md font-semibold uppercase tracking-wider text-secondary">Bước 1 · Trình độ</legend>
        <div className="mt-space-sm grid gap-space-sm sm:grid-cols-2">
          {LEVELS.map((l) => (
            <label key={l} className={choice}>
              <span><span className="font-semibold">{levelLabel(l)}</span><span className="block text-label-md">{LEVEL_HINTS[l - 1]}</span></span>
              <input type="radio" name="level" value={l} checked={state.level === l} onChange={() => setLevel(l)} className="h-5 w-5 accent-primary" />
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="mt-space-lg">
        <legend className="text-label-md font-semibold uppercase tracking-wider text-secondary">Bước 2 · Thẻ mới mỗi ngày</legend>
        <div className="mt-space-sm flex flex-wrap gap-space-sm">
          {NEW_CARDS_OPTIONS.map((n) => (
            <label key={n} className={`${choice} min-w-24 justify-center`}>
              <span className="font-semibold">{n} thẻ</span>
              <input type="radio" name="perDay" value={n} checked={perDay === n} onChange={() => setPerDay(n)} className="sr-only" />
            </label>
          ))}
        </div>
      </fieldset>

      <button type="button" disabled={busy} onClick={start} className="mt-space-xl min-h-12 rounded-full bg-primary px-8 text-label-md font-semibold text-on-primary hover:bg-primary-container disabled:opacity-60">
        Bắt đầu học
      </button>
    </div>
  );
}
