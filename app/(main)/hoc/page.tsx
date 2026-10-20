import type { Metadata } from "next";
import { CourseHub } from "@/components/courses/course-hub";

export const metadata: Metadata = { title: "Lộ trình học HSK", robots: { index: false } };

/** `?khoa=hsk-3` chọn cấp; không hợp lệ hoặc vắng thì để trang tự chọn (khóa xem gần nhất, rồi HSK 1). */
export default async function LearnPage({ searchParams }: { searchParams: Promise<{ khoa?: string | string[] }> }) {
  const { khoa } = await searchParams;
  const slug = typeof khoa === "string" && /^[a-z0-9-]{1,40}$/.test(khoa) ? khoa : null;
  return <CourseHub slugParam={slug} />;
}
