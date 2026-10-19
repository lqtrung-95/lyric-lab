import type { Metadata } from "next";
import { CourseMap } from "@/components/courses/course-map";

export const metadata: Metadata = { title: "Lộ trình học HSK", robots: { index: false } };

// Hiện mới có khóa HSK 1; khi thêm các cấp khác thì trang này thành danh sách khóa.
export default function LearnPage() {
  return <CourseMap slug="hsk-1" />;
}
