"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { socialNetworks } from "@/lib/share/social-networks";

/**
 * Popup chia sẻ thử thách cho desktop, cùng kiểu popup chia sẻ chuỗi ngày học: xem trước ảnh link (chính ảnh mạng xã hội sẽ hiện),
 * nút từng mạng và sao chép link. Điện thoại dùng share sheet của hệ điều hành thay cho popup này.
 */
export function ChallengeShareDialog({ code, text, onClose }: { code: string; text: string; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const url = `${location.origin}/challenge/${code}`;
  const networks = socialNetworks("SongHanzi", text);

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    ref.current?.focus({ preventScroll: true });
    return () => previous?.focus?.({ preventScroll: true });
  }, []);

  async function copy() {
    try { await navigator.clipboard.writeText(`${text} ${url}`); setCopied(true); } catch { /* clipboard bị chặn: tự sao chép từ thanh địa chỉ */ }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div
        ref={ref} role="dialog" aria-label="Chia sẻ thử thách" tabIndex={-1}
        onKeyDown={(e) => e.key === "Escape" && onClose()} onClick={(e) => e.stopPropagation()}
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-surface-container-highest p-4 shadow-[0_8px_40px_rgba(30,26,22,0.3)] outline-none"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-label-md font-semibold text-on-surface">Thách bạn bè</h2>
          <button type="button" aria-label="Đóng" onClick={onClose} className="flex h-11 w-11 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-high"><Icon name="close" size={20} /></button>
        </div>
        <div className="mt-3 overflow-hidden rounded-xl bg-surface-container" style={{ aspectRatio: "1200 / 630" }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- ảnh og tạo động ở server, không phải asset tĩnh */}
          <img src={`/api/challenges/${code}/og`} alt="Xem trước thẻ thử thách" className="h-full w-full object-cover" />
        </div>
        <p className="mt-2 text-label-md text-on-surface-variant">{text}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {networks.map((n) => (
            <a key={n.label} href={n.href(url)} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 flex-1 basis-[calc(33%-6px)] items-center justify-center rounded-full bg-surface-container px-3 text-label-md font-medium text-on-surface hover:bg-surface-container-high">{n.label}</a>
          ))}
        </div>
        <button type="button" onClick={() => void copy()} className="mt-2 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-surface-container px-4 text-label-md font-medium text-on-surface hover:bg-surface-container-high">
          <Icon name={copied ? "check" : "content_copy"} size={18} />{copied ? "Đã sao chép" : "Sao chép link"}
        </button>
      </div>
    </div>
  );
}
