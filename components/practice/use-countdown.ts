"use client";

import { useEffect, useState } from "react";
import { secondsLeft } from "@/lib/practice/round-timer";

/**
 * Đếm ngược `limitSec` giây (cập nhật mỗi 250 ms) và làm lại từ đầu mỗi khi `resetKey` đổi; `active` = false thì dừng. Trả số giây còn lại.
 * Chỉ để vẽ thanh đếm ngược: việc xử lý khi hết giờ do bộ hẹn giờ riêng của chỗ gọi lo, nên tab bị ẩn làm chậm đồng hồ cũng không sai kết quả.
 */
export function useCountdown(resetKey: unknown, active: boolean, limitSec: number): number {
  const [left, setLeft] = useState(limitSec);
  useEffect(() => {
    if (!active) return;
    const start = Date.now();
    const tick = () => setLeft(secondsLeft(start, Date.now(), limitSec));
    const first = setTimeout(tick, 0); // làm lại ngay thay vì chờ nhịp đầu
    const id = setInterval(tick, 250);
    return () => { clearTimeout(first); clearInterval(id); };
  }, [resetKey, active, limitSec]);
  return left;
}
