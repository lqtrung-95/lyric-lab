import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { existsSync } from "node:fs";
import ws from "ws";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

// Kho video luyện nghe trên Supabase thật: vòng đời trạng thái, quyền xem của người dùng, sửa bản dịch và xóa (kèm cache nghĩa từ).
// Dùng một video giả tự tạo và tự xóa sau khi chạy; tự bỏ qua khi thiếu biến môi trường hoặc chưa chạy migration video.
if (existsSync(".env.local")) process.loadEnvFile(".env.local");
vi.mock("server-only", () => ({}));
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const VIDEO_ID = "zTestVid_01";

const lines = [
  { idx: 0, start: 0, end: 3, text: "你好朋友", pinyin: "nǐ hǎo péng you", translation: "Xin chào bạn", tokens: [{ text: "你好" }, { text: "朋友" }] },
  { idx: 1, start: 3, end: 6, text: "今天很好", pinyin: "jīn tiān hěn hǎo", translation: null, tokens: [{ text: "今天" }, { text: "很" }, { text: "好" }] },
];

describe.skipIf(!(url && serviceKey))("video luyện nghe: vòng đời và quyền xem", () => {
  let sb: SupabaseClient;

  beforeAll(async () => {
    sb = createClient(url!, serviceKey!, { auth: { persistSession: false }, realtime: { transport: ws as never } });
    await sb.from("video_lessons").delete().eq("video_id", VIDEO_ID);
    const { error } = await sb.from("video_lessons").insert({
      video_id: VIDEO_ID, title: "Video thử", channel_title: "Kênh thử", duration_sec: 6, level_avg: 1.5, status: "draft",
      translation_source: "youtube", line_count: 2, translated_line_count: 1, lines,
    });
    if (error) throw new Error(`Cần chạy migration video_lessons: ${error.message}`);
  });
  afterAll(async () => {
    await sb.from("video_lessons").delete().eq("video_id", VIDEO_ID);
  });

  it("nháp: admin thấy, người dùng không thấy; giải nghĩa từ vẫn đọc được dòng; duyệt rồi thì người dùng thấy", async () => {
    const repo = await import("@/lib/video/video-repo");
    expect((await repo.listAllLessons()).find((v) => v.videoId === VIDEO_ID)).toMatchObject({ status: "draft", lineCount: 2, translatedLineCount: 1 });
    expect(await repo.getListedLesson(VIDEO_ID)).toBeNull();
    expect((await repo.listListedLessons()).some((v) => v.videoId === VIDEO_ID)).toBe(false);
    expect(await repo.getLessonLinesForExplain(VIDEO_ID)).toHaveLength(2);

    expect(await repo.setLessonStatus(VIDEO_ID, "listed")).toBe(true);
    expect(await repo.getListedLesson(VIDEO_ID)).toMatchObject({ videoId: VIDEO_ID, title: "Video thử", levelAvg: 1.5 });
    expect((await repo.listListedLessons()).some((v) => v.videoId === VIDEO_ID)).toBe(true);
    expect(await repo.setLessonStatus("zNoSuchVid1", "listed")).toBe(false);
  });

  it("ẩn: người dùng và giải nghĩa từ đều không thấy nữa", async () => {
    const repo = await import("@/lib/video/video-repo");
    await repo.setLessonStatus(VIDEO_ID, "hidden");
    expect(await repo.getListedLesson(VIDEO_ID)).toBeNull();
    expect(await repo.getLessonLinesForExplain(VIDEO_ID)).toBeNull();
    expect((await repo.getLessonForAdmin(VIDEO_ID))?.status).toBe("hidden");
  });

  it("sửa bản dịch: lưu, xóa bản dịch, cập nhật số dòng có dịch; dòng lạ hoặc quá dài bị từ chối", async () => {
    const repo = await import("@/lib/video/video-repo");
    expect(await repo.editLessonTranslation(VIDEO_ID, 1, "Hôm nay rất tốt")).toBe("ok");
    let detail = await repo.getLessonForAdmin(VIDEO_ID);
    expect(detail?.lines[1].translation).toBe("Hôm nay rất tốt");
    expect(detail?.translatedLineCount).toBe(2);
    expect(await repo.editLessonTranslation(VIDEO_ID, 0, "   ")).toBe("ok");
    detail = await repo.getLessonForAdmin(VIDEO_ID);
    expect(detail?.lines[0].translation).toBeNull();
    expect(detail?.translatedLineCount).toBe(1);
    expect(await repo.editLessonTranslation(VIDEO_ID, 9, "x")).toBe("not_found");
    expect(await repo.editLessonTranslation("zNoSuchVid1", 0, "x")).toBe("not_found");
    expect(await repo.editLessonTranslation(VIDEO_ID, 0, "x".repeat(501))).toBe("invalid");
  });

  it("xóa video xóa luôn cache nghĩa từ của nó (khóa ngoại cascade)", async () => {
    const repo = await import("@/lib/video/video-repo");
    const { error } = await sb.from("video_term_explanations").insert({
      video_id: VIDEO_ID, line_index: 0, term: "朋友", explain_lang: "vi", prompt_version: "test", meaning_in_context: "bạn", model: "test",
    });
    expect(error).toBeNull();
    await repo.deleteLesson(VIDEO_ID);
    expect(await repo.getLessonForAdmin(VIDEO_ID)).toBeNull();
    const { data } = await sb.from("video_term_explanations").select("id").eq("video_id", VIDEO_ID);
    expect(data).toEqual([]);
  });
});
