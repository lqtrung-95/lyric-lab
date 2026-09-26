"use client";

import { useSyncExternalStore } from "react";
import { Icon } from "@/components/ui/icon";
import type { IconName } from "@/components/ui/icon-names";
import { RECENT_SONGS_KEY, parseRecentSongs } from "@/lib/user-state/recent-songs";

const STEPS: { icon: IconName; title: string; body: string }[] = [
  { icon: "link", title: "Dán link YouTube", body: "Bài hát tiếng Phổ thông nào cũng được." },
  { icon: "auto_awesome", title: "Xem trước", body: "Từ vựng và ngữ pháp đáng học, lọc theo level của bạn." },
  { icon: "headphones", title: "Nghe cùng lời", body: "Lời chạy theo nhạc, chạm vào từ để biết nghĩa." },
];

const noop = () => () => {};
const isNewcomer = () => {
  try {
    return parseRecentSongs(localStorage.getItem(RECENT_SONGS_KEY)).length === 0;
  } catch {
    return false;
  }
};

/** Ba bước làm quen, chỉ hiện khi người dùng chưa mở bài nào (thay cho phần "Bài hát gần đây" trống). */
export function NewcomerSteps() {
  const newcomer = useSyncExternalStore(noop, isNewcomer, () => false);
  if (!newcomer) return null;
  return (
    <section aria-labelledby="steps-heading" className="mt-space-xl">
      <h2 id="steps-heading" className="font-serif text-headline-md text-on-surface">Bắt đầu chỉ với ba bước</h2>
      <ol className="mt-space-md grid gap-space-md md:grid-cols-3">
        {STEPS.map((s, i) => (
          <li key={s.title} className="flex gap-3 rounded-2xl bg-surface-container-low p-space-md">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-container text-on-primary-container"><Icon name={s.icon} size={22} /></span>
            <div>
              <p className="text-body-md font-semibold text-on-surface"><span className="sr-only">Bước {i + 1}: </span>{s.title}</p>
              <p className="text-label-md text-on-surface-variant">{s.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
