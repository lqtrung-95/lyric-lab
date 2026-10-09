import type { SupabaseClient } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";
import { FixedCaptionProvider } from "./fixed-caption-provider";
import { ingestVideo } from "./ingest-video";
import type { PreparedLine } from "./build-lesson-lines";
import type { VideoMeta } from "./youtube-data-api";

const meta: VideoMeta = { videoId: "abcdefghijk", title: "Tập 1", channelTitle: "Kênh", channelId: "UC1", durationSec: 600, embeddable: true };
const lines = [
  { text: "大家好，欢迎收听我们的节目", start: 0, end: 4 },
  { text: "今天我们来聊一聊学习汉语", start: 4, end: 9 },
];

// Supabase giả vừa đủ cho `ingestVideo`: tra video đã có và ghi bản ghi mới.
function fakeDb(existing: string[] = []) {
  const written: Record<string, unknown>[] = [];
  const sb = {
    from: () => ({
      select: () => ({ in: async () => ({ data: existing.map((video_id) => ({ video_id })), error: null }) }),
      insert: async (row: Record<string, unknown>) => { written.push(row); return { error: null }; },
      update: () => ({ eq: async () => ({ error: null }) }),
    }),
  } as unknown as SupabaseClient;
  return { sb, written };
}
const lookup = async () => new Map();

describe("ingestVideo với phụ đề người dùng", () => {
  it("ghi bài với trạng thái, người thêm và bản dịch AI do nơi gọi truyền vào", async () => {
    const { sb, written } = fakeDb();
    const translateMissing = async (prepared: PreparedLine[]) => prepared.map((l, i) => ({ ...l, translation: `dịch ${i}` }));
    const out = await ingestVideo({ sb, provider: new FixedCaptionProvider(lines), lookup }, { meta, sourceId: null, status: "listed", addedBy: "user-1", translateMissing });
    expect(out).toMatchObject({ kind: "ingested", translatedLineCount: written[0] ? (written[0].lines as unknown[]).length : -1 });
    expect(written[0]).toMatchObject({ video_id: "abcdefghijk", status: "listed", added_by: "user-1", translation_source: "ai", source_id: null });
    expect((written[0].lines as { translation: string }[]).map((l) => l.translation)).toEqual(["dịch 0", "dịch 1"]);
  });

  it("dịch không được dòng nào thì translation_source là none, bài vẫn được ghi", async () => {
    const { sb, written } = fakeDb();
    const translateMissing = async (prepared: PreparedLine[]) => prepared.map((l) => ({ ...l, translation: null }));
    const out = await ingestVideo({ sb, provider: new FixedCaptionProvider(lines), lookup }, { meta, sourceId: null, status: "listed", addedBy: "user-1", translateMissing });
    expect(out.kind).toBe("ingested");
    expect(written[0]).toMatchObject({ translation_source: "none", translated_line_count: 0 });
  });

  it("mặc định video vào trạng thái nháp (đường nạp của admin không đổi)", async () => {
    const { sb, written } = fakeDb();
    await ingestVideo({ sb, provider: new FixedCaptionProvider(lines), lookup }, { meta, sourceId: "src-1" });
    expect(written[0]).toMatchObject({ status: "draft", source_id: "src-1" });
    expect(written[0]).not.toHaveProperty("added_by"); // video admin nạp không ghi cột added_by, nên chạy được cả khi migration chưa có
  });

  it("có phụ đề tiếng Việt sẵn thì ghép làm bản dịch (nguồn youtube); AI chỉ được gọi cho dòng còn thiếu", async () => {
    const vi = [{ text: "Xin chào các bạn", start: 0, end: 4 }]; // dòng 2 không có bản dịch tương ứng
    const asked: string[][] = [];
    const translateMissing = async (prepared: PreparedLine[]) => { asked.push(prepared.filter((l) => !l.translation).map((l) => l.text)); return prepared.map((l) => (l.translation ? l : { ...l, translation: "AI dịch" })); };
    const { sb, written } = fakeDb();
    await ingestVideo({ sb, provider: new FixedCaptionProvider(lines, "zh-Hans", vi), lookup }, { meta, sourceId: null, status: "listed", addedBy: "user-1", translateMissing });
    expect(asked).toEqual([["今天我们来聊一聊学习汉语"]]);
    expect((written[0].lines as { translation: string }[]).map((l) => l.translation)).toEqual(["Xin chào các bạn", "AI dịch"]);
    expect(written[0]).toMatchObject({ translation_source: "youtube" });
  });

  it("phụ đề tiếng Việt phủ hết các dòng thì không gọi AI", async () => {
    const vi = [{ text: "Xin chào các bạn", start: 0, end: 4 }, { text: "Hôm nay nói về học tiếng Trung", start: 4, end: 9 }];
    let called = false;
    const translateMissing = async (prepared: PreparedLine[]) => { called = true; return prepared; };
    const { sb, written } = fakeDb();
    await ingestVideo({ sb, provider: new FixedCaptionProvider(lines, "zh-Hans", vi), lookup }, { meta, sourceId: null, status: "listed", addedBy: "user-1", translateMissing });
    expect(called).toBe(false);
    expect(written[0]).toMatchObject({ translation_source: "youtube", translated_line_count: 2 });
  });

  it("bỏ qua video đã có và video không nhúng được", async () => {
    expect(await ingestVideo({ sb: fakeDb(["abcdefghijk"]).sb, provider: new FixedCaptionProvider(lines), lookup }, { meta, sourceId: null })).toEqual({ kind: "skipped", reason: "exists" });
    expect(await ingestVideo({ sb: fakeDb().sb, provider: new FixedCaptionProvider(lines), lookup }, { meta: { ...meta, embeddable: false }, sourceId: null })).toEqual({ kind: "skipped", reason: "not_embeddable" });
  });

  it("phụ đề không còn dòng nào sau khi làm sạch thì bỏ qua", async () => {
    const out = await ingestVideo({ sb: fakeDb().sb, provider: new FixedCaptionProvider([{ text: "♪", start: 0, end: 1 }]), lookup }, { meta, sourceId: null });
    expect(out).toEqual({ kind: "skipped", reason: "no_lines" });
  });
});
