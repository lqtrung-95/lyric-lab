"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Icon } from "@/components/ui/icon";
import { isCourseInDevelopment } from "@/lib/courses/course-maturity";
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
              {isCourseInDevelopment(c.slug) && <span className="ml-2 rounded-full border-2 border-ink/40 bg-surface-container-high px-2 text-label-sm font-bold text-on-surface-variant">Đang phát triển</span>}
            </Link>
          ))}
        </nav>
      )}
      <p className="text-body-md text-on-surface-variant">Chưa biết nên bắt đầu từ cấp nào? <Link href="/hoc/xep-lop" className="font-bold text-primary underline">Làm bài xếp lớp 3 phút</Link>.</p>
      {isCourseInDevelopment(slug) && (
        <p role="note" className="card-ink flex items-start gap-2 bg-tertiary-container p-space-sm text-body-md text-on-tertiary-container">
          <Icon name="build" size={20} className="mt-0.5 shrink-0" />
          <span>{courses.find((c) => c.slug === slug)?.title ?? "Khóa này"} vẫn đang được phát triển: nghĩa tiếng Việt do AI sinh và chưa được rà soát, nhiều từ chưa có câu thật làm ví dụ. Bạn gặp lỗi hay chỗ chưa ổn, <Link href="/feedback" className="font-bold underline">góp ý giúp SongHanzi</Link> nhé.</span>
        </p>
      )}
      <CourseMap key={slug} slug={slug} />
    </div>
  );
}
