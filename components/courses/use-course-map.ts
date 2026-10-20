"use client";

import { useEffect, useState } from "react";
import { unitContentSchema, type UnitProgress } from "@/lib/courses/course-types";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import type { UnitKind } from "@/lib/courses/unit-types";
import { listUnitProgress } from "@/lib/user-data/unit-progress-repo";

export interface MapUnit { id: string; idx: number; title: string; summary: string; termCount: number; /** `hsk` = chặng học; `checkpoint`/`final` = chặng ôn tổng hợp. */ kind: UnitKind; /** Tên chủ đề (nhóm chặng cùng chủ đề), null nếu không có. */ topic: string | null; progress?: UnitProgress }
export type CourseMapState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; title: string; units: MapUnit[] };

/** Tải khóa học và các chặng (đọc công khai qua RLS) rồi ghép tiến độ của người dùng hiện tại. Tiến độ không đọc được thì bản đồ vẫn hiện, coi như chưa học chặng nào. */
export function useCourseMap(slug: string): CourseMapState {
  const [state, setState] = useState<CourseMapState>({ status: "loading" });
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const sb = createSupabaseBrowserClient();
        const course = await sb.from("courses").select("id,title").eq("slug", slug).maybeSingle();
        if (!course.data) throw new Error("no course");
        const [units, progress] = await Promise.all([
          sb.from("course_units").select("id,idx,title,summary,content").eq("course_id", course.data.id).order("idx"),
          listUnitProgress(),
        ]);
        if (units.error) throw units.error;
        const byUnit = new Map(progress.map((p) => [p.unitId, p]));
        const mapped: MapUnit[] = (units.data ?? []).map((u) => {
          const content = unitContentSchema.safeParse(u.content);
          return { id: u.id as string, idx: u.idx as number, title: u.title as string, summary: u.summary as string, termCount: content.success && content.data.kind === "hsk" ? content.data.terms.length : 0, kind: !content.success || content.data.kind === "hsk" ? "hsk" : content.data.variant, topic: content.success ? content.data.topic ?? null : null, progress: byUnit.get(u.id as string) };
        });
        if (!cancelled) setState({ status: "ready", title: course.data.title as string, units: mapped });
      } catch {
        if (!cancelled) setState({ status: "error" });
      }
    })();
    return () => { cancelled = true; };
  }, [slug]);
  return state;
}
