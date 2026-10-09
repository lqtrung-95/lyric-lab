"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { socialNetworks } from "@/lib/share/social-networks";
import { SocialShareButtons } from "@/components/share/social-share-buttons";
import { renderShareCard } from "@/lib/streak/share-card";
import type { StreakData } from "@/lib/streak/load-streak";

const SHARE_TITLE = "SongHanzi";
const SHARE_TEXT = "Chuỗi ngày học tiếng Trung qua bài hát của tôi trên SongHanzi";

const NETWORKS = socialNetworks(SHARE_TITLE, SHARE_TEXT);

/**
 * Popup chia sẻ cho desktop (không có share sheet của hệ điều hành như mobile): xem trước banner, nút mở trang chia
 * sẻ trên từng mạng xã hội (mạng xã hội chỉ nhận link + tự đọc og:image của trang đó, không nhận file ảnh đính kèm
 * trực tiếp qua các nút này), và sao chép link.
 */
export function ShareDialog({ streak, onClose }: { streak: Pick<StreakData, "current" | "learnedWords" | "weekCount">; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    ref.current?.focus({ preventScroll: true });
    return () => previous?.focus?.({ preventScroll: true });
  }, []);

  useEffect(() => {
    let cancelled = false;
    let objectUrl: string | null = null;
    (async () => {
      try {
        const [blob, res] = await Promise.all([
          renderShareCard(streak),
          fetch("/api/streak/share", { method: "POST" }).then((r) => (r.ok ? r.json() : Promise.reject())),
        ]);
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setPreviewUrl(objectUrl);
        setShareUrl((res as { url: string }).url);
      } catch {
        if (!cancelled) setError("Chưa tạo được link chia sẻ. Thử lại sau nhé.");
      }
    })();
    return () => { cancelled = true; if (objectUrl) URL.revokeObjectURL(objectUrl); };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- chỉ tạo 1 lần lúc mở, không theo dõi thay đổi streak giữa chừng.
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div
        ref={ref} role="dialog" aria-label="Chia sẻ chuỗi ngày học" tabIndex={-1}
        onKeyDown={(e) => e.key === "Escape" && onClose()} onClick={(e) => e.stopPropagation()}
        className="max-h-[90vh] w-full max-w-sm overflow-y-auto rounded-2xl bg-surface-container-highest p-4 shadow-[0_8px_40px_rgba(30,26,22,0.3)] outline-none"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-label-md font-semibold text-on-surface">Chia sẻ</h2>
          <button type="button" aria-label="Đóng" onClick={onClose} className="flex h-11 w-11 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-high">
            <Icon name="close" size={20} />
          </button>
        </div>

        <div className="mt-3 overflow-hidden rounded-xl bg-surface-container" style={{ aspectRatio: "1080 / 1350" }}>
          {previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- ảnh tạo động từ canvas (blob URL), không phải asset tĩnh.
            <img src={previewUrl} alt="Xem trước ảnh chia sẻ" className="h-full w-full object-cover" />
          ) : (
            <div role="status" aria-label="Đang tạo ảnh" className="h-full w-full animate-pulse" />
          )}
        </div>

        {error ? (
          <p role="alert" className="mt-3 text-label-md text-error">{error}</p>
        ) : (
          <>
            <div className="mt-3">
              <SocialShareButtons networks={NETWORKS} url={shareUrl} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
