"use client";

import Link from "next/link";
import { useEffect } from "react";
import { writeLastCourse } from "@/lib/courses/last-course";
import { CourseMap } from "./course-map";
import { useCourseList } from "./use-course-list";
import { useLastCourse } from "./use-last-course";

/**
 * Trang Học: thanh chọn cấp (HSK 1–5, chỉ hiện khi có từ hai khóa trở lên) và bản đồ của khóa đang chọn.
 * Khóa lấy từ `?khoa=` (liên kết chia sẻ được), không có thì khóa xem gần nhất, rồi HSK 1.
 */
export function CourseHub({ slugParam }: { slugParam: string | null }) {
  const courses = useCourseList();
  const last = useLastCourse();
  const slug = slugParam ?? last;
  useEffect(() => writeLastCourse(slug), [slug]);

  return (
    <div className="mx-auto max-w-5xl space-y-space-sm">
      {courses.length > 1 && (
        <nav aria-label="Chọn cấp HSK" className="flex gap-2 overflow-x-auto pb-1">
          {courses.map((c) => (
            <Link key={c.slug} href={`/hoc?khoa=${c.slug}`} replace aria-current={c.slug === slug ? "page" : undefined}
              className={`inline-flex min-h-11 shrink-0 items-center rounded-full border-2 border-ink px-4 text-label-md font-extrabold ${c.slug === slug ? "bg-primary-container text-on-primary-container shadow-[0_3px_0_var(--shadow-ink)]" : "bg-surface-container-lowest text-on-surface"}`}>
              {c.title}
            </Link>
          ))}
        </nav>
      )}
      <CourseMap key={slug} slug={slug} />
    </div>
  );
}
