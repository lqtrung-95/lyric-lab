import type { Metadata } from "next";
import { ReviewHub } from "@/components/review/review-hub";

export const metadata: Metadata = { title: "Ôn & Nói", robots: { index: false } };

/** Trang chủ Ôn & Nói: chọn chế độ luyện theo mục đích. Ôn thẻ theo lịch nằm ở `/review/cards`. */
export default function ReviewPage() {
  return <ReviewHub />;
}
