"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { renderLineCard, type LineCardData } from "@/lib/share/line-card";
import { SITE_URL } from "@/lib/seo/site-url";

/**
 * Hộp thoại chia sẻ một câu lời dưới dạng ảnh. Ảnh dựng ngay trên máy (không gửi lời lên server, không có trang công khai). Điện thoại
 * dùng share sheet của hệ điều hành kèm file ảnh; nơi không hỗ trợ thì tải ảnh về.
 */
export function LineShareDialog({ card, onClose }: { card: Omit<LineCardData, "site">; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const dialog = ref.current;
    if (dialog && !dialog.open) {
      dialog.showModal();
      // showModal tự đưa tiêu điểm vào nút đầu tiên có mặt lúc đó; nút Chia sẻ chỉ xuất hiện sau khi dựng ảnh xong nên "Đóng" bị chọn và hiện viền
      // tiêu điểm (nhất là trên iOS). Đặt tiêu điểm ở chính hộp thoại: trình đọc màn hình vẫn đọc tiêu đề, bàn phím vẫn Tab được vào các nút.
      dialog.focus({ preventScroll: true });
    }
    let cancelled = false;
    let url: string | null = null;
    renderLineCard({ ...card, site: SITE_URL.replace(/^https?:\/\//, "") })
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

  // Tạo link blob mới ngay lúc bấm (không dùng lại link của ảnh xem trước): link cũ có thể đã bị thu hồi khi popup dựng lại ảnh, khiến Android báo
  // tải thất bại. Gắn thẻ <a> vào trang rồi mới bấm vì vài trình duyệt di động bỏ qua click lên thẻ chưa nằm trong tài liệu.
  function download() {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "songhanzi-cau-hat.png";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 30_000);
    setSaved(true);
  }

  const btn = "inline-flex min-h-11 flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-full px-5 text-label-md font-semibold";
  return (
    <dialog
      ref={ref} aria-labelledby="line-share-title" tabIndex={-1} onClose={onClose} onClick={(e) => { if (e.target === ref.current) onClose(); }}
      className="m-auto w-[min(94vw,26rem)] rounded-3xl outline-none bg-surface-container-lowest p-0 text-on-surface shadow-[0_24px_60px_-20px_rgba(20,10,5,0.5)] backdrop:bg-black/50 backdrop:backdrop-blur-[2px]"
    >
      <div className="space-y-space-md p-space-lg">
        <h2 id="line-share-title" className="font-serif text-headline-md">Chia sẻ câu này</h2>
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- ảnh blob dựng tại chỗ, không qua tối ưu ảnh
          <img src={previewUrl} alt={`Thẻ câu hát: ${card.han}`} className="w-full rounded-2xl shadow-sm" />
        ) : (
          <div role="status" className="flex aspect-[4/5] items-center justify-center rounded-2xl bg-surface-container text-label-md text-on-surface-variant">{error ?? "Đang tạo ảnh…"}</div>
        )}
        {saved && !error && <p role="status" className="text-label-md text-on-surface-variant">Đã gửi yêu cầu tải ảnh. Không thấy file thì bấm Chia sẻ rồi chọn Lưu.</p>}
        {error && previewUrl && <p role="alert" className="text-label-md text-error">{error}</p>}
        <div className="flex flex-wrap gap-2">
          {canShareFile && <button type="button" onClick={() => void share()} className={`${btn} basis-full bg-primary text-on-primary hover:bg-primary-container`}><Icon name="share" size={18} />Chia sẻ</button>}
          {previewUrl && <button type="button" onClick={download} className={`${btn} ${canShareFile ? "bg-surface-container-high text-on-surface" : "bg-primary text-on-primary"}`}>Tải ảnh</button>}
          <button type="button" onClick={onClose} className={`${btn} bg-surface-container-high text-on-surface`}>Đóng</button>
        </div>
      </div>
    </dialog>
  );
}
