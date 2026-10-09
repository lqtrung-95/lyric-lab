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

  it("có phụ đề tiếng Việt đủ tốt thì ghép làm bản dịch (nguồn youtube); AI chỉ được gọi cho dòng còn thiếu", async () => {
    const zhTen = Array.from({ length: 10 }, (_, i) => ({ text: `这是第${i + 1}个句子，我们继续学习`, start: i * 3, end: i * 3 + 3 }));
    const viNine = zhTen.slice(0, 9).map((l, i) => ({ text: `Câu số ${i + 1}`, start: l.start, end: l.end })); // dòng 10 không có bản dịch tương ứng
    const asked: string[][] = [];
    const translateMissing = async (prepared: PreparedLine[]) => { asked.push(prepared.filter((l) => !l.translation).map((l) => l.text)); return prepared.map((l) => (l.translation ? l : { ...l, translation: "AI dịch" })); };
    const { sb, written } = fakeDb();
    await ingestVideo({ sb, provider: new FixedCaptionProvider(zhTen, "zh-Hans", viNine), lookup }, { meta, sourceId: null, status: "listed", addedBy: "user-1", translateMissing });
    expect(asked).toEqual([["这是第10个句子，我们继续学习"]]);
    const translations = (written[0].lines as { translation: string }[]).map((l) => l.translation);
    expect(translations.slice(0, 9)).toEqual(Array.from({ length: 9 }, (_, i) => `Câu số ${i + 1}`));
    expect(translations[9]).toBe("AI dịch");
    expect(written[0]).toMatchObject({ translation_source: "youtube" });
  });

  it("phụ đề tiếng Việt ghép kém (lệch số dòng) thì bỏ, AI dịch cả bài", async () => {
    const zhMany = Array.from({ length: 10 }, (_, i) => ({ text: `这是第${i + 1}个句子，我们继续学习`, start: i * 3, end: i * 3 + 3 }));
    const viFew = [{ text: "Một câu duy nhất", start: 0, end: 30 }]; // 1 dòng cho 10 dòng tiếng Trung
    const translateMissing = async (prepared: PreparedLine[]) => prepared.map((l) => ({ ...l, translation: "AI dịch" }));
    const { sb, written } = fakeDb();
    await ingestVideo({ sb, provider: new FixedCaptionProvider(zhMany, "zh-Hans", viFew), lookup }, { meta, sourceId: null, status: "listed", addedBy: "user-1", translateMissing });
    expect((written[0].lines as { translation: string }[]).every((l) => l.translation === "AI dịch")).toBe(true);
    expect(written[0]).toMatchObject({ translation_source: "ai" });
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
