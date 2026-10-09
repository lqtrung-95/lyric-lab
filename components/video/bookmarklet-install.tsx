"use client";

import { useState } from "react";
import { buildBookmarklet } from "@/lib/video/bookmarklet";

/**
 * Hướng dẫn cài dấu trang "Gửi sang SongHanzi" (chỉ máy tính). React chặn địa chỉ `javascript:` đặt qua thuộc tính href, nên gắn bằng ref sau khi
 * dựng; bấm thẳng vào nút ở trang này thì không chạy mà nhắc kéo lên thanh dấu trang.
 */
export function BookmarkletInstall() {
  const [hint, setHint] = useState(false);

  return (
    <div className="space-y-3 rounded-2xl bg-surface-container-low p-space-md">
      <p className="text-label-md font-semibold text-on-surface">Dấu trang trên máy tính (khi không lấy tự động được)</p>
      <ol className="list-decimal space-y-1 pl-5 text-body-md text-on-surface-variant">
        <li>Kéo nút dưới đây lên thanh dấu trang của trình duyệt (một lần duy nhất).</li>
        <li>Mở video trên youtube.com và bấm dấu trang <b>Gửi sang SongHanzi</b>: nó tự mở bản chép lời và gửi sang đây.</li>
        <li>Nếu YouTube hiện bản chép lời không phải tiếng Trung, đổi ngôn ngữ ở cuối bảng bản chép lời rồi bấm lại.</li>
      </ol>
      <div className="flex flex-wrap items-center gap-2">
        <a
          ref={(el) => el?.setAttribute("href", buildBookmarklet(window.location.origin))}
          onClick={(e) => { e.preventDefault(); setHint(true); }}
          draggable
          className="inline-flex min-h-11 cursor-grab items-center rounded-full bg-primary-container px-4 text-label-md font-semibold text-on-primary-container"
        >Gửi sang SongHanzi</a>
      </div>
      {hint && <p role="status" className="text-label-md text-on-surface-variant">Hãy <b>kéo</b> nút này lên thanh dấu trang thay vì bấm. Không thấy thanh dấu trang thì bật bằng Ctrl/Cmd + Shift + B.</p>}
      <p className="text-label-sm text-on-surface-variant">Điện thoại chưa dùng được dấu trang: hãy dán phụ đề ở ô bên trên.</p>
    </div>
  );
}
