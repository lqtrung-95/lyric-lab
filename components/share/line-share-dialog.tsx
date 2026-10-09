"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { renderLineCard, type LineCardData } from "@/lib/share/line-card";
import { SITE_URL } from "@/lib/seo/site-url";
import { socialNetworks } from "@/lib/share/social-networks";
import { isMobileDevice } from "@/lib/streak/share-card";
import { SocialShareButtons } from "./social-share-buttons";

/**
 * Hộp thoại chia sẻ một câu lời dưới dạng ảnh. Ảnh dựng ngay trên máy (không gửi lời lên server, không có trang công khai). Điện thoại
 * dùng share sheet của hệ điều hành kèm file ảnh; nơi không hỗ trợ thì tải ảnh về. Máy tính (không có share sheet dùng được) giống popup
 * chia sẻ chuỗi ngày học: nút các mạng xã hội + sao chép link tới bài (link chỉ mở bài trong app, không chứa lời), kèm tải/sao chép ảnh để đính vào bài đăng.
 */
export function LineShareDialog({ card, shareUrl, onClose }: { card: Omit<LineCardData, "site">; shareUrl: string; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [imageCopied, setImageCopied] = useState(false);
  const desktop = useMemo(() => !isMobileDevice(), []);
  const networks = useMemo(() => socialNetworks("SongHanzi", `Câu hát hay trong “${card.title}”: học tiếng Trung qua bài hát với SongHanzi`), [card.title]);

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

  async function copyImage() {
    if (!blob) return;
    try {
      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      setImageCopied(true);
    } catch {
      setError("Trình duyệt không cho sao chép ảnh. Hãy tải ảnh về rồi đăng.");
    }
  }

  const btn = "inline-flex min-h-11 flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-full px-5 text-label-md font-semibold";
  return (
    <dialog
      ref={ref} aria-labelledby="line-share-title" tabIndex={-1} onClose={onClose} onClick={(e) => { if (e.target === ref.current) onClose(); }}
      className="m-auto w-[min(94vw,26rem)] max-h-[94dvh] overflow-y-auto rounded-3xl outline-none bg-surface-container-lowest p-0 text-on-surface shadow-[0_24px_60px_-20px_rgba(20,10,5,0.5)] backdrop:bg-black/50 backdrop:backdrop-blur-[2px]"
    >
      <div className="space-y-space-md p-space-lg">
        <div className="flex items-center justify-between gap-2">
          <h2 id="line-share-title" className="font-serif text-headline-md">Chia sẻ câu này</h2>
          {desktop && (
            <button type="button" aria-label="Đóng" onClick={onClose} className="-mr-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-high">
              <Icon name="close" size={20} />
            </button>
          )}
        </div>
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- ảnh blob dựng tại chỗ, không qua tối ưu ảnh
          <img src={previewUrl} alt={`Thẻ câu hát: ${card.han}`} className="w-full rounded-2xl shadow-sm" />
        ) : (
          <div role="status" className="flex aspect-[4/5] items-center justify-center rounded-2xl bg-surface-container text-label-md text-on-surface-variant">{error ?? "Đang tạo ảnh…"}</div>
        )}
        {saved && !error && <p role="status" className="text-label-md text-on-surface-variant">Đã gửi yêu cầu tải ảnh.{!desktop && " Không thấy file thì bấm Chia sẻ rồi chọn Lưu."}</p>}
        {error && previewUrl && <p role="alert" className="text-label-md text-error">{error}</p>}
        {desktop ? (
          <>
            <div className="flex gap-2">
              <button type="button" onClick={download} disabled={!previewUrl} className={`${btn} bg-surface-container-high text-on-surface disabled:opacity-50`}>Tải ảnh</button>
              <button type="button" onClick={() => void copyImage()} disabled={!previewUrl} className={`${btn} bg-surface-container-high text-on-surface disabled:opacity-50`}>
                <Icon name={imageCopied ? "check" : "content_copy"} size={18} />
                {imageCopied ? "Đã sao chép ảnh" : "Sao chép ảnh"}
              </button>
            </div>
            <div>
              <SocialShareButtons networks={networks} url={shareUrl} />
            </div>
          </>
        ) : (
          <div className="flex flex-wrap gap-2">
            {canShareFile && <button type="button" onClick={() => void share()} className={`${btn} basis-full bg-primary text-on-primary hover:bg-primary-container`}><Icon name="share" size={18} />Chia sẻ</button>}
            {previewUrl && <button type="button" onClick={download} className={`${btn} ${canShareFile ? "bg-surface-container-high text-on-surface" : "bg-primary text-on-primary"}`}>Tải ảnh</button>}
            <button type="button" onClick={onClose} className={`${btn} bg-surface-container-high text-on-surface`}>Đóng</button>
          </div>
        )}
      </div>
    </dialog>
  );
}
