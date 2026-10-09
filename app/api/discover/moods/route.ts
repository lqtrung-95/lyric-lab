import { MOOD_GROUPS, type MoodGroupId } from "@/lib/library/mood-groups";
import { createSupabaseServiceClient } from "@/lib/supabase/service-client";

export const runtime = "nodejs";

/**
 * GET /api/discover/moods → { counts: { <nhóm cảm xúc>: số bài } } trong danh sách Khám phá, để hiện số bài trên từng chip lọc. Chưa chạy migration
 * (cột `mood_groups` chưa có) hoặc lỗi thì trả counts rỗng để giao diện ẩn hàng chip thay vì báo lỗi.
 */
export async function GET() {
  const { data, error } = await createSupabaseServiceClient().from("discover_songs").select("mood_groups").limit(5000);
  const counts: Partial<Record<MoodGroupId, number>> = {};
  if (!error) {
    for (const row of data ?? []) {
      for (const id of (row.mood_groups as string[] | null) ?? []) {
        if (MOOD_GROUPS.some((g) => g.id === id)) counts[id as MoodGroupId] = (counts[id as MoodGroupId] ?? 0) + 1;
      }
    }
  }
  return Response.json({ counts }, { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } });
}
