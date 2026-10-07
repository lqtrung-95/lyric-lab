"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";

/** Chia sẻ link thử thách: share sheet của hệ điều hành nếu có, không thì sao chép link. */
export function ShareChallengeButton({ code, points, songTitle }: { code: string; points: number; songTitle: string | null }) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = `${location.origin}/challenge/${code}`;
    const text = `Mình được ${points} điểm ở thử thách bài ${songTitle ?? "hát"} trên SongHanzi. Thử vượt mình nhé!`;
    if (typeof navigator.share === "function") {
      try { await navigator.share({ title: "SongHanzi", text, url }); return; } catch (e) { if ((e as Error).name === "AbortError") return; }
    }
    try {
      await navigator.clipboard.writeText(`${text} ${url}`);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch { /* clipboard bị chặn: người dùng tự sao chép link từ thanh địa chỉ */ }
  }

  return (
    <button type="button" onClick={() => void share()} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-primary px-8 text-label-md font-semibold text-on-primary hover:bg-primary-container">
      <Icon name={copied ? "check" : "share"} size={20} />{copied ? "Đã sao chép link" : "Thách bạn bè"}
    </button>
  );
}
