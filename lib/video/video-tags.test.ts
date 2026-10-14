import { describe, expect, it } from "vitest";
import { countByTag, filterByTag, heuristicTags, isVideoTag, normalizeTags, refineTags, VIDEO_TAGS } from "./video-tags";
import type { LessonSummary } from "./video-repo";

const v = (videoId: string, tags?: LessonSummary["tags"]): LessonSummary => ({ videoId, title: videoId, channelTitle: "K", durationSec: 100, levelAvg: 3, lineCount: 10, tags });

describe("normalizeTags", () => {
  it("chỉ giữ thẻ hợp lệ, bỏ trùng, tối đa 3 theo thứ tự gặp", () => {
    expect(normalizeTags(["vlog", "xyz", "vlog", "du-lich", "hai", "podcast"])).toEqual(["vlog", "du-lich", "hai"]);
  });
  it("đầu vào lạ cho mảng rỗng", () => {
    for (const bad of [null, undefined, "vlog", 5, {}]) expect(normalizeTags(bad)).toEqual([]);
    expect(isVideoTag("vlog")).toBe(true);
    expect(isVideoTag("vlogs")).toBe(false);
  });
  it("danh sách thẻ cố định gồm tám thẻ đã chốt", () => {
    expect(VIDEO_TAGS.map((t) => t.label)).toEqual(["Hoạt hình", "Vlog", "Đời sống", "Du lịch", "Hài", "Thiếu nhi", "Phim ngắn", "Podcast", "Bài học tiếng Trung"]);
  });
});

describe("heuristicTags", () => {
  it("nhận ra dấu hiệu rõ trong tên video/kênh", () => {
    expect(heuristicTags("Daily Vlog日常居家生活", "Rona")).toEqual(expect.arrayContaining(["vlog", "doi-song"]));
    expect(heuristicTags("云南旅行 Vlog", "")).toEqual(expect.arrayContaining(["du-lich", "vlog"]));
    expect(heuristicTags("【HSK 1-3】简单的生活 | Chinese Podcast", "")).toContain("podcast");
    expect(heuristicTags("【我的爸爸是條龍】動畫", "")).toContain("hoat-hinh");
    expect(heuristicTags("搞笑沙雕动画", "")).toEqual(expect.arrayContaining(["hoat-hinh", "hai"]));
  });
  it("nhận ra video dạy tiếng Trung", () => {
    expect(heuristicTags("Learn Chinese While Doing Chores 🧹 (Mandarin)", "")).toContain("bai-hoc");
    expect(heuristicTags("通过郊游自然的学习中文（可理解性输入）", "")).toContain("bai-hoc");
    expect(heuristicTags("[HSK 1-3] 简单的生活 | Chinese Podcast", "")).toEqual(expect.arrayContaining(["bai-hoc", "podcast"]));
    expect(heuristicTags("熊出没 大战", "")).not.toContain("bai-hoc");
  });
  it("không có dấu hiệu thì rỗng; kết quả tối đa 3 thẻ", () => {
    expect(heuristicTags("Xin chào", "Kênh")).toEqual([]);
    expect(heuristicTags("动画 vlog 旅行 podcast 搞笑 短剧 日常", "").length).toBeLessThanOrEqual(3);
  });
});

describe("filterByTag / countByTag", () => {
  const list = [v("a", ["vlog", "du-lich"]), v("b", ["hoat-hinh"]), v("c"), v("d", ["vlog"])];
  it("lọc theo thẻ; null là tất cả (kể cả video chưa có thẻ)", () => {
    expect(filterByTag(list, "vlog").map((x) => x.videoId)).toEqual(["a", "d"]);
    expect(filterByTag(list, null)).toBe(list);
    expect(filterByTag(list, "podcast")).toEqual([]);
  });
  it("đếm theo thẻ, bỏ qua video chưa có thẻ", () => {
    const counts = countByTag(list);
    expect(counts.vlog).toBe(2);
    expect(counts["du-lich"]).toBe(1);
    expect(counts.podcast).toBe(0);
  });
});

describe("refineTags", () => {
  it("hoạt hình/thiếu nhi mà tên không có dấu hiệu bài giảng thì bỏ thẻ Bài học (AI nhầm do pinyin/Vietsub trong tên)", () => {
    expect(refineTags(["hoat-hinh", "bai-hoc"], "[Vietsub/Pinyin] KẾT BÁI HUYNH ĐỆ || 结拜兄弟 || Jié bài", "DaihuaXiyou")).toEqual(["hoat-hinh"]);
    expect(refineTags(["thieu-nhi", "bai-hoc", "hai"], "Chuyện vui", "K")).toEqual(["thieu-nhi", "hai"]);
  });
  it("giữ Bài học khi tên thật sự là bài giảng, hoặc video không phải giải trí", () => {
    expect(refineTags(["hoat-hinh", "bai-hoc"], "Learn Chinese with a cartoon (HSK 2)", "K")).toEqual(["hoat-hinh", "bai-hoc"]);
    expect(refineTags(["vlog", "bai-hoc"], "Real-Life Mandarin Vlog", "K")).toEqual(["vlog", "bai-hoc"]);
    expect(refineTags(["vlog"], "x", "y")).toEqual(["vlog"]);
  });
});
