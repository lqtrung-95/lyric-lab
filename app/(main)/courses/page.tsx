import type { Metadata } from "next";
import { CourseHub } from "@/components/courses/course-hub";

export const metadata: Metadata = { title: "Lộ trình học HSK", robots: { index: false } };

/** `?course=hsk-3` chọn cấp (link cũ `?khoa=` được `next.config.ts` chuyển sang); không hợp lệ hoặc vắng thì để trang tự chọn (khóa xem gần nhất, rồi HSK 1). */
export default async function LearnPage({ searchParams }: { searchParams: Promise<{ course?: string | string[] }> }) {
  const { course } = await searchParams;
  const slug = typeof course === "string" && /^[a-z0-9-]{1,40}$/.test(course) ? course : null;
  return <CourseHub slugParam={slug} />;
}
