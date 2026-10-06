import type { LessonStatus } from "@/lib/video/video-lesson-types";

export const STATUS_LABEL: Record<LessonStatus, string> = { draft: "Nháp", listed: "Đang hiện", hidden: "Đã ẩn" };

/** PATCH một hành động quản trị lên video; trả true nếu thành công. */
export async function patchVideo(videoId: string, body: Record<string, unknown>): Promise<boolean> {
  try {
    const res = await fetch(`/api/admin/videos/${videoId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    return res.ok;
  } catch {
    return false;
  }
}
