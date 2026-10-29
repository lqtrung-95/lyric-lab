"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { socialNetworks } from "@/lib/share/social-networks";
import { isMobileDevice } from "@/lib/streak/share-card";
import { SocialShareButtons } from "./social-share-buttons";

interface Props {
  /** Tiêu đề hộp thoại, ví dụ "Chia sẻ tên tiếng Trung". */
  heading: string;
  /** Mô tả ảnh cho trình đọc màn hình. */
  alt: string;
  /** Dựng ảnh PNG ngay trên máy; đổi hàm (hoặc dữ liệu bên trong) thì dựng lại. */
  render: () => Promise<Blob>;
  filename: string;
  /** Văn bản kèm khi chia sẻ (mạng xã hội và share sheet). */
  text: string;
  /** Link công khai của trang (mạng xã hội chỉ nhận link, không nhận file ảnh qua các nút này). */
  shareUrl: string;
  onClose: () => void;
}

/**
 * Hộp thoại chia sẻ một thẻ ảnh dựng tại chỗ, cùng kiểu với chia sẻ câu hát: xem trước ảnh, rồi điện thoại dùng share sheet của hệ điều hành kèm file ảnh
 * (không hỗ trợ thì tải ảnh về); máy tính có tải ảnh, sao chép ảnh và nút từng mạng xã hội + sao chép link. Ảnh không gửi lên server.
 */
export function ImageShareDialog({ heading, alt, render, filename, text, shareUrl, onClose }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [imageCopied, setImageCopied] = useState(false);
  const desktop = useMemo(() => !isMobileDevice(), []);
  const networks = useMemo(() => socialNetworks("SongHanzi", text), [text]);

  useEffect(() => {
    const dialog = ref.current;
    if (dialog && !dialog.open) { dialog.showModal(); dialog.focus({ preventScroll: true }); }
    let cancelled = false;
    let url: string | null = null;
    render()
      .then((b) => { if (cancelled) return; url = URL.createObjectURL(b); setBlob(b); setPreviewUrl(url); })
      .catch(() => { if (!cancelled) setError("Chưa tạo được ảnh. Thử lại sau nhé."); });
    return () => { cancelled = true; if (url) URL.revokeObjectURL(url); };
  }, [render]);

  const file = blob ? new File([blob], filename, { type: "image/png" }) : null;
  const canShareFile = Boolean(file && typeof navigator.canShare === "function" && navigator.canShare({ files: [file] }));

  async function share() {
    if (!file) return;
    try { await navigator.share({ files: [file], title: "SongHanzi", text }); }
    catch (e) { if ((e as Error).name !== "AbortError") setError("Không chia sẻ được. Hãy tải ảnh về rồi đăng."); }
  }
  // Link blob mới ngay lúc bấm và gắn thẻ <a> vào trang rồi mới bấm: vài trình duyệt di động bỏ qua click lên thẻ chưa nằm trong tài liệu.
  function download() {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 30_000);
    setSaved(true);
  }
  async function copyImage() {
    if (!blob) return;
    try { await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]); setImageCopied(true); }
    catch { setError("Trình duyệt không cho sao chép ảnh. Hãy tải ảnh về rồi đăng."); }
  }

  const desktopBtn = "inline-flex min-h-11 flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-surface-container px-3 text-label-md font-medium text-on-surface hover:bg-surface-container-high";
  const btn = "inline-flex min-h-11 flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-full px-5 text-label-md font-semibold";
  return (
    <dialog
      ref={ref} aria-labelledby="image-share-title" tabIndex={-1} onClose={onClose} onClick={(e) => { if (e.target === ref.current) onClose(); }}
      className="m-auto w-[min(94vw,26rem)] max-h-[94dvh] overflow-y-auto rounded-3xl bg-surface-container-lowest p-0 text-on-surface shadow-[0_24px_60px_-20px_rgba(20,10,5,0.5)] outline-none backdrop:bg-black/50 backdrop:backdrop-blur-[2px]"
    >
      <div className="space-y-space-md p-space-lg">
        <div className="flex items-center justify-between gap-2">
          <h2 id="image-share-title" className="font-serif text-headline-md">{heading}</h2>
          {desktop && (
            <button type="button" aria-label="Đóng" onClick={onClose} className="-mr-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-high">
              <Icon name="close" size={20} />
            </button>
          )}
        </div>
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- ảnh blob dựng tại chỗ, không qua tối ưu ảnh
          <img src={previewUrl} alt={alt} className="w-full rounded-2xl shadow-sm" />
        ) : (
          <div role="status" className="flex aspect-[4/5] items-center justify-center rounded-2xl bg-surface-container text-label-md text-on-surface-variant">{error ?? "Đang tạo ảnh…"}</div>
        )}
        {saved && !error && <p role="status" className="text-label-md text-on-surface-variant">Đã gửi yêu cầu tải ảnh.{!desktop && " Không thấy file thì bấm Chia sẻ rồi chọn Lưu."}</p>}
        {error && previewUrl && <p role="alert" className="text-label-md text-error">{error}</p>}
        {desktop ? (
          <>
            <div className="flex gap-2">
              <button type="button" onClick={download} disabled={!previewUrl} className={`${desktopBtn} disabled:opacity-50`}>Tải ảnh</button>
              <button type="button" onClick={() => void copyImage()} disabled={!previewUrl} className={`${desktopBtn} disabled:opacity-50`}>
                <Icon name={imageCopied ? "check" : "content_copy"} size={18} />{imageCopied ? "Đã sao chép ảnh" : "Sao chép ảnh"}
              </button>
            </div>
            <div><SocialShareButtons networks={networks} url={shareUrl} /></div>
          </>
        ) : (
          <div className="flex flex-wrap gap-2">
            {canShareFile && <button type="button" onClick={() => void share()} className={`${btn} basis-full bg-primary text-on-primary hover:brightness-110`}><Icon name="share" size={18} />Chia sẻ</button>}
            {previewUrl && <button type="button" onClick={download} className={`${btn} ${canShareFile ? "bg-surface-container-high text-on-surface" : "bg-primary text-on-primary"}`}>Tải ảnh</button>}
            <button type="button" onClick={onClose} className={`${btn} bg-surface-container-high text-on-surface`}>Đóng</button>
          </div>
        )}
      </div>
    </dialog>
  );
}
