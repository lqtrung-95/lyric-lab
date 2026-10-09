"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { LISTEN_TOUR_STEPS, placeTourCard, unionBox, type Box } from "@/lib/listen/listen-tour";

/** Khung (toạ độ cửa sổ) của các phần tử đang hiển thị khớp các bộ chọn; phần tử ẩn (rộng/cao 0) bị bỏ qua. */
function measure(targets: string[]): Box | null {
  const boxes: Box[] = [];
  for (const selector of targets) {
    for (const el of document.querySelectorAll(selector)) {
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.height > 0) boxes.push({ top: r.top, left: r.left, width: r.width, height: r.height });
    }
  }
  return unionBox(boxes);
}

const PAD = 6;

/**
 * Hướng dẫn màn Nghe từng bước: khung sáng quanh nút/khu vực đang nói tới và thẻ mô tả bên cạnh. Không chặn thao tác (lớp tối chỉ để nhìn, không bắt chạm)
 * nên người dùng vẫn bấm được mọi thứ; Esc hoặc "Bỏ qua" đóng. Bước nào không có đích hiển thị (ví dụ nút ẩn ở cỡ màn hình này) thì bị bỏ qua.
 */
export function ListenTour({ onClose }: { onClose: () => void }) {
  const [steps] = useState(() => LISTEN_TOUR_STEPS.filter((s) => measure(s.targets) !== null));
  const [index, setIndex] = useState(0);
  const [box, setBox] = useState<Box | null>(null);
  const [card, setCard] = useState<{ top: number; left: number } | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const step = steps[index];

  const layout = useCallback(() => {
    if (!step) return;
    const target = measure(step.targets);
    if (!target) return;
    setBox(target);
    const size = cardRef.current ? { width: cardRef.current.offsetWidth, height: cardRef.current.offsetHeight } : { width: 320, height: 200 };
    setCard(placeTourCard({ top: target.top - PAD, left: target.left - PAD, width: target.width + 2 * PAD, height: target.height + 2 * PAD }, size, { width: window.innerWidth, height: window.innerHeight }));
  }, [step]);

  // Đưa đích vào tầm nhìn (khu vực lời nằm dưới phần video dính ở đầu trang) rồi đo lại sau khi cuộn xong.
  useLayoutEffect(() => {
    if (!step) return;
    const first = document.querySelector<HTMLElement>(step.targets[0]);
    const stickyBottom = document.querySelector("[data-sticky-player]")?.getBoundingClientRect().bottom ?? 0;
    const rect = first?.getBoundingClientRect();
    // Đích bị phần video dính che hoặc nằm ngoài màn hình: cuộn để đích nằm ngay dưới phần dính (không căn giữa vì giữa màn hình có thể đang bị phần dính che).
    if (rect && (rect.top < stickyBottom + 8 || rect.bottom > window.innerHeight - 8)) window.scrollBy({ top: rect.top - (stickyBottom + 24), behavior: "instant" });
    const frame = requestAnimationFrame(layout);
    return () => cancelAnimationFrame(frame);
  }, [step, layout]);

  useEffect(() => {
    let frame = 0;
    const schedule = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(layout); };
    window.addEventListener("resize", schedule);
    window.addEventListener("scroll", schedule, { passive: true });
    schedule(); // đo lại khi thẻ đã có kích thước thật
    return () => { cancelAnimationFrame(frame); window.removeEventListener("resize", schedule); window.removeEventListener("scroll", schedule); };
  }, [layout, index]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Chuyển bước thì đưa tiêu điểm vào thẻ để trình đọc màn hình đọc nội dung mới và bàn phím bấm tiếp được ngay.
  useEffect(() => { cardRef.current?.focus({ preventScroll: true }); }, [index]);

  // Không có bước nào hiển thị được: tự đóng thay vì để một khung trống.
  const empty = steps.length === 0;
  useEffect(() => {
    if (!empty) return;
    const timer = setTimeout(onClose, 0);
    return () => clearTimeout(timer);
  }, [empty, onClose]);
  if (!step) return null;

  const last = index === steps.length - 1;
  const button = "inline-flex min-h-11 items-center justify-center rounded-full px-4 text-label-md font-semibold";
  return (
    <>
      {box && (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed z-[60] rounded-2xl ring-2 ring-primary shadow-[0_0_0_9999px_rgba(20,10,5,0.5)] transition-all duration-200 motion-reduce:transition-none"
          style={{ top: box.top - PAD, left: box.left - PAD, width: box.width + 2 * PAD, height: box.height + 2 * PAD }}
        />
      )}
      <div
        ref={cardRef} role="dialog" aria-modal="false" aria-labelledby="listen-tour-title" aria-describedby="listen-tour-body" tabIndex={-1}
        className="fixed z-[61] w-[min(calc(100vw-1.5rem),22rem)] rounded-3xl bg-surface-container-lowest p-4 text-on-surface shadow-[0_16px_48px_-12px_rgba(20,10,5,0.55)] outline-none"
        style={{ top: card?.top ?? 0, left: card?.left ?? 0, visibility: card ? "visible" : "hidden" }}
      >
        <p className="text-label-sm font-semibold text-on-surface-variant">Hướng dẫn {index + 1}/{steps.length}</p>
        <h2 id="listen-tour-title" className="mt-1 font-serif text-headline-md">{step.title}</h2>
        <p id="listen-tour-body" className="mt-1 text-body-md text-on-surface-variant">{step.body}</p>
        <div className="mt-3 flex items-center justify-between gap-2">
          <button type="button" onClick={onClose} className={`${button} -ml-2 text-on-surface-variant hover:bg-surface-container`}>Bỏ qua</button>
          <div className="flex gap-2">
            {index > 0 && <button type="button" onClick={() => setIndex((i) => i - 1)} className={`${button} bg-surface-container-high text-on-surface`}>Quay lại</button>}
            <button type="button" onClick={() => (last ? onClose() : setIndex((i) => i + 1))} className={`${button} bg-primary text-on-primary hover:bg-primary-container`}>{last ? "Xong" : "Tiếp"}</button>
          </div>
        </div>
      </div>
    </>
  );
}
