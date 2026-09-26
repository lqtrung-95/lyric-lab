"use client";

import { useEffect, useRef } from "react";

/**
 * Cho một khối hiện dần (mờ → rõ, trượt lên nhẹ) khi cuộn tới. Khối đã nằm trong màn hình lúc tải thì hiện luôn, và nếu
 * JavaScript không chạy thì khối vẫn hiện bình thường (chỉ ẩn sau khi hydrate). Tắt hẳn khi người dùng chọn giảm chuyển động.
 */
export function Reveal({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) return;
    if (el.getBoundingClientRect().top < window.innerHeight * 0.9) return; // đã thấy được: giữ nguyên
    el.dataset.reveal = "hidden";
    // Ép trình duyệt ghi nhận trạng thái ẩn trước khi chuyển sang hiện để hiệu ứng chạy.
    void el.offsetHeight;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        el.dataset.reveal = "shown";
        observer.disconnect();
      }
    }, { rootMargin: "0px 0px -8% 0px" });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return <div ref={ref} data-reveal="shown" className={className}>{children}</div>;
}
