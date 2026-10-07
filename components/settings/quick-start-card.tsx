"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { SettingsCard } from "./settings-card";

/** Mở bài đang xem trên YouTube trong app: lấy videoId từ link rồi chuyển sang trang bài của app (cùng tên miền với trang này). */
const bookmarklet = (origin: string) => `javascript:(function(){var u=new URL(location.href),i=u.searchParams.get('v');if(!i){var s=u.pathname.split('/').filter(Boolean);i=u.hostname==='youtu.be'?s[0]:s[1]}if(i)location.href='${origin}/learn/'+i;else alert('Hãy mở một video YouTube trước')})()`;

const noop = () => () => {};

/** Thẻ "Học nhanh từ YouTube": ba cách mở một video YouTube trong app mà khỏi dán link. */
export function QuickStartCard() {
  const linkRef = useRef<HTMLAnchorElement>(null);
  const host = useSyncExternalStore(noop, () => location.host, () => "");
  useEffect(() => {
    // React không cho đặt href dạng javascript: qua JSX, nên gán thẳng vào phần tử để bookmarklet kéo thả được.
    linkRef.current?.setAttribute("href", bookmarklet(location.origin));
  }, []);

  return (
    <SettingsCard id="quick-start-heading" title="Học nhanh từ YouTube">
      <div className="space-y-space-sm py-space-sm text-body-md text-on-surface-variant">
        <p><strong className="font-medium text-on-surface">Đổi tên miền:</strong> đang xem video trên YouTube, sửa <code>youtube.com</code> trong thanh địa chỉ thành <code className="break-all">{host || "tên miền của app"}</code> (giữ nguyên phần <code>/watch?v=…</code>) rồi Enter.</p>
        <p><strong className="font-medium text-on-surface">Nút trên thanh dấu trang (máy tính):</strong> kéo nút này lên thanh dấu trang, rồi bấm khi đang xem video YouTube.{" "}
          <a ref={linkRef} onClick={(e) => e.preventDefault()} draggable className="mt-1 inline-flex min-h-11 items-center rounded-full bg-primary-container px-4 text-label-md font-semibold text-on-primary-container">Học trên SongHanzi</a>
        </p>
        <p><strong className="font-medium text-on-surface">Điện thoại Android:</strong> cài SongHanzi vào màn hình chính (menu trình duyệt → Cài đặt ứng dụng). Sau đó ở app YouTube bấm Chia sẻ → SongHanzi là mở thẳng bài. iPhone chưa hỗ trợ cách này.</p>
      </div>
    </SettingsCard>
  );
}
