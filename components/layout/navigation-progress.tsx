"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * Thanh mỏng trên đầu trang hiện ngay khi bấm một liên kết nội bộ và biến mất khi trang mới hiện (đường dẫn đổi),
 * để người dùng biết app đang chuyển trang thay vì tưởng bị treo. Không phụ thuộc thư viện ngoài.
 */
export function NavigationProgress() {
  const pathname = usePathname();
  // Ghi lại đường dẫn lúc bấm: thanh chỉ hiện khi đường dẫn hiện tại vẫn là đường dẫn đó, nên đổi trang là tự tắt.
  const [startedAt, setStartedAt] = useState<string | null>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const anchor = (e.target as HTMLElement | null)?.closest?.("a");
      if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download")) return;
      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin || url.pathname === window.location.pathname || url.hash) return;
      setStartedAt(window.location.pathname);
    }
    // Pha capture: chạy trước trình xử lý của <Link> (nó gọi preventDefault để tự chuyển trang).
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  if (startedAt === null || startedAt !== pathname) return null;
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-x-0 top-0 z-[200] h-0.5">
      <div className="h-full bg-primary" style={{ animation: "nav-progress 8s cubic-bezier(0.1, 0.6, 0.2, 1) forwards" }} />
    </div>
  );
}
