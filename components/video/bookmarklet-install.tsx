"use client";

import { useState } from "react";
import { buildBookmarklet } from "@/lib/video/bookmarklet";

/**
 * Hướng dẫn cài dấu trang "Gửi sang SongHanzi" (chỉ máy tính). React chặn địa chỉ `javascript:` đặt qua thuộc tính href, nên gắn bằng ref sau khi
 * dựng; bấm thẳng vào nút ở trang này thì không chạy mà nhắc kéo lên thanh dấu trang.
 */
export function BookmarkletInstall() {
  const [copied, setCopied] = useState(false);
  const [hint, setHint] = useState(false);
  const code = () => buildBookmarklet(window.location.origin);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code());
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="space-y-3 rounded-2xl bg-surface-container-low p-space-md">
      <p className="text-label-md font-semibold text-on-surface">Cách nhanh trên máy tính</p>
      <ol className="list-decimal space-y-1 pl-5 text-body-md text-on-surface-variant">
        <li>Kéo nút dưới đây lên thanh dấu trang của trình duyệt (một lần duy nhất).</li>
        <li>Mở video trên youtube.com, bật <b>Hiện bản chép lời</b> dưới phần mô tả (nếu có).</li>
        <li>Bấm dấu trang <b>Gửi sang SongHanzi</b>: phụ đề tự điền vào đây.</li>
      </ol>
      <div className="flex flex-wrap items-center gap-2">
        <a
          ref={(el) => el?.setAttribute("href", code())}
          onClick={(e) => { e.preventDefault(); setHint(true); }}
          draggable
          className="inline-flex min-h-11 cursor-grab items-center rounded-full bg-primary-container px-4 text-label-md font-semibold text-on-primary-container"
        >Gửi sang SongHanzi</a>
        <button type="button" onClick={() => void copy()} className="inline-flex min-h-11 items-center rounded-full bg-surface-container-high px-4 text-label-md font-medium text-on-surface hover:bg-surface-container-highest">
          {copied ? "Đã sao chép mã" : "Sao chép mã dấu trang"}
        </button>
      </div>
      {hint && <p role="status" className="text-label-md text-on-surface-variant">Hãy <b>kéo</b> nút này lên thanh dấu trang thay vì bấm. Không thấy thanh dấu trang thì bật bằng Ctrl/Cmd + Shift + B.</p>}
      <p className="text-label-sm text-on-surface-variant">Điện thoại chưa dùng được dấu trang: hãy dán phụ đề ở ô bên trên.</p>
    </div>
  );
}
