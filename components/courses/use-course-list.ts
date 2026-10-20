"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";

export interface CourseChip { slug: string; title: string }

/** Các khóa học đang mở (đọc công khai qua RLS), theo thứ tự cấp. Lỗi hoặc chưa có thì trả mảng rỗng: trang Học vẫn mở khóa mặc định. */
export function useCourseList(): CourseChip[] {
  const [courses, setCourses] = useState<CourseChip[]>([]);
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const { data } = await createSupabaseBrowserClient().from("courses").select("slug,title").eq("kind", "hsk").order("sort_order");
        if (!cancelled && data) setCourses(data.map((c) => ({ slug: c.slug as string, title: c.title as string })));
      } catch { /* giữ rỗng */ }
    })();
    return () => { cancelled = true; };
  }, []);
  return courses;
}
