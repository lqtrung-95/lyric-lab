import { ensureAnonymousSession } from "@/lib/auth/ensure-anonymous-session";
import type { VideoStudyMode } from "./video-study";

/** Báo máy chủ một câu học theo video vừa xong (để tính chuỗi ngày, mục tiêu hằng ngày). Chạy nền, lỗi thì bỏ qua: không được làm gián đoạn việc học. */
export async function submitVideoStudy(mode: VideoStudyMode, good: boolean): Promise<void> {
  try {
    if (!(await ensureAnonymousSession())) return;
    await fetch("/api/practice/video", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mode, lines: 1, correct: good ? 1 : 0 }) });
  } catch {
    /* mạng lỗi hoặc chưa có phiên: bỏ qua */
  }
}
