"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { renderLineCard, type LineCardData } from "@/lib/share/line-card";

/**
 * Hộp thoại chia sẻ một câu lời dưới dạng ảnh. Ảnh dựng ngay trên máy (không gửi lời lên server, không có trang công khai). Điện thoại
 * dùng share sheet của hệ điều hành kèm file ảnh; nơi không hỗ trợ thì tải ảnh về.
 */
export function LineShareDialog({ card, onClose }: { card: Omit<LineCardData, "site">; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (dialog && !dialog.open) dialog.showModal();
    let cancelled = false;
    let url: string | null = null;
    renderLineCard({ ...card, site: location.host })
      .then((b) => { if (cancelled) return; url = URL.createObjectURL(b); setBlob(b); setPreviewUrl(url); })
      .catch(() => { if (!cancelled) setError("Chưa tạo được ảnh. Thử lại sau nhé."); });
    return () => { cancelled = true; if (url) URL.revokeObjectURL(url); };
  }, [card]);

  const file = blob ? new File([blob], "songhanzi-cau-hat.png", { type: "image/png" }) : null;
  const canShareFile = Boolean(file && typeof navigator.canShare === "function" && navigator.canShare({ files: [file] }));

  async function share() {
    if (!file) return;
    try {
      await navigator.share({ files: [file], title: "SongHanzi", text: `${card.han} · ${card.title}` });
    } catch (e) {
      if ((e as Error).name !== "AbortError") setError("Không chia sẻ được. Hãy tải ảnh về rồi đăng.");
    }
  }

  const btn = "inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full px-5 text-label-md font-semibold";
  return (
    <dialog
      ref={ref} aria-labelledby="line-share-title" onClose={onClose} onClick={(e) => { if (e.target === ref.current) onClose(); }}
      className="m-auto w-[min(94vw,26rem)] rounded-3xl bg-surface-container-lowest p-0 text-on-surface shadow-[0_24px_60px_-20px_rgba(20,10,5,0.5)] backdrop:bg-black/50 backdrop:backdrop-blur-[2px]"
    >
      <div className="space-y-space-md p-space-lg">
        <h2 id="line-share-title" className="font-serif text-headline-md">Chia sẻ câu này</h2>
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- ảnh blob dựng tại chỗ, không qua tối ưu ảnh
          <img src={previewUrl} alt={`Thẻ câu hát: ${card.han}`} className="w-full rounded-2xl shadow-sm" />
        ) : (
          <div role="status" className="flex aspect-[4/5] items-center justify-center rounded-2xl bg-surface-container text-label-md text-on-surface-variant">{error ?? "Đang tạo ảnh…"}</div>
        )}
        {error && previewUrl && <p role="alert" className="text-label-md text-error">{error}</p>}
        <div className="flex flex-wrap gap-2">
          {canShareFile && <button type="button" onClick={() => void share()} className={`${btn} bg-primary text-on-primary hover:bg-primary-container`}><Icon name="share" size={18} />Chia sẻ</button>}
          {previewUrl && <a href={previewUrl} download="songhanzi-cau-hat.png" className={`${btn} ${canShareFile ? "bg-surface-container-high text-on-surface" : "bg-primary text-on-primary"}`}>Tải ảnh</a>}
          <button type="button" onClick={onClose} className={`${btn} bg-surface-container-high text-on-surface`}>Đóng</button>
        </div>
      </div>
    </dialog>
  );
}
