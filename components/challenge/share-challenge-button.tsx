"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { isMobileDevice, shareLinkNative } from "@/lib/streak/share-card";
import { ChallengeShareDialog } from "./challenge-share-dialog";

/** Chia sẻ thử thách giống chia sẻ chuỗi ngày học: điện thoại mở share sheet của hệ điều hành, desktop mở popup có xem trước, nút từng mạng và sao chép link. */
export function ShareChallengeButton({ code, points, songTitle }: { code: string; points: number; songTitle: string | null }) {
  const [dialog, setDialog] = useState(false);
  const text = `Mình được ${points} điểm ở thử thách điền lời${songTitle ? ` bài ${songTitle}` : ""} trên SongHanzi. Thử vượt mình nhé!`;

  async function share() {
    if (!isMobileDevice()) return setDialog(true);
    const result = await shareLinkNative(`${location.origin}/challenge/${code}`, "SongHanzi", text).catch(() => "unsupported" as const);
    if (result === "unsupported") setDialog(true);
  }

  return (
    <>
      <button type="button" onClick={() => void share()} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-primary px-8 text-label-md font-semibold text-on-primary hover:bg-primary-container">
        <Icon name="share" size={20} />Thách bạn bè
      </button>
      {dialog && <ChallengeShareDialog code={code} text={text} onClose={() => setDialog(false)} />}
    </>
  );
}
