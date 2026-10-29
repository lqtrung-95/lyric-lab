"use client";

import { useEffect, useMemo, useRef } from "react";
import { Icon } from "@/components/ui/icon";
import { socialNetworks } from "@/lib/share/social-networks";
import { SocialShareButtons } from "./social-share-buttons";

/**
 * Hộp thoại chia sẻ một đường link kèm lời nhắn (không có ảnh): xem trước lời nhắn, rồi nút từng mạng xã hội và sao chép link.
 * Dùng cho máy tính (không có share sheet của hệ điều hành); điện thoại nên gọi `navigator.share` trực tiếp ở chỗ dùng.
 */
export function LinkShareDialog({ heading, text, url, onClose }: { heading: string; text: string; url: string; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const networks = useMemo(() => socialNetworks("SongHanzi", text), [text]);
  useEffect(() => {
    const dialog = ref.current;
    if (dialog && !dialog.open) { dialog.showModal(); dialog.focus({ preventScroll: true }); }
  }, []);
  return (
    <dialog
      ref={ref} aria-labelledby="link-share-title" tabIndex={-1} onClose={onClose} onClick={(e) => { if (e.target === ref.current) onClose(); }}
      className="m-auto w-[min(94vw,26rem)] max-h-[94dvh] overflow-y-auto rounded-3xl bg-surface-container-lowest p-0 text-on-surface shadow-[0_24px_60px_-20px_rgba(20,10,5,0.5)] outline-none backdrop:bg-black/50 backdrop:backdrop-blur-[2px]"
    >
      <div className="space-y-space-md p-space-lg">
        <div className="flex items-center justify-between gap-2">
          <h2 id="link-share-title" className="font-serif text-headline-md">{heading}</h2>
          <button type="button" aria-label="Đóng" onClick={onClose} className="-mr-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-high"><Icon name="close" size={20} /></button>
        </div>
        <blockquote className="rounded-2xl bg-surface-container-low p-space-md text-body-lg">
          {text}
          <span className="mt-1 block truncate text-label-md text-primary">{url.replace(/^https?:\/\//, "")}</span>
        </blockquote>
        <SocialShareButtons networks={networks} url={url} />
      </div>
    </dialog>
  );
}
