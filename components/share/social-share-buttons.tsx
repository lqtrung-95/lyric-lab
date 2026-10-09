"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import type { SocialNetwork } from "@/lib/share/social-networks";

/**
 * Lưới nút chia sẻ link lên từng mạng xã hội kèm nút sao chép link, dùng ở popup chia sẻ của máy tính (không có share sheet của hệ điều hành).
 * `url` null nghĩa là link chưa sẵn sàng: các nút mờ đi và không bấm được.
 */
export function SocialShareButtons({ networks, url }: { networks: SocialNetwork[]; url: string | null }) {
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {networks.map((n) => (
          <a
            key={n.label} href={url ? n.href(url) : undefined} target="_blank" rel="noopener noreferrer"
            aria-disabled={!url}
            className="inline-flex min-h-11 flex-1 basis-[calc(33%-6px)] items-center justify-center rounded-full bg-surface-container px-3 text-label-md font-medium text-on-surface hover:bg-surface-container-high aria-disabled:pointer-events-none aria-disabled:opacity-50"
          >
            {n.label}
          </a>
        ))}
      </div>
      <button
        type="button" onClick={() => void copyLink()} disabled={!url}
        className="mt-2 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-surface-container px-4 text-label-md font-medium text-on-surface hover:bg-surface-container-high disabled:opacity-50"
      >
        <Icon name={copied ? "check" : "content_copy"} size={18} />
        {copied ? "Đã sao chép" : "Sao chép link"}
      </button>
    </>
  );
}
