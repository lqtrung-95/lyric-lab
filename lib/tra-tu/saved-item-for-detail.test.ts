import { describe, expect, it } from "vitest";
import type { ExampleSentence } from "@/lib/courses/course-types";
import { savedItemForDetail } from "./saved-item-for-detail";
import type { WordDetail } from "./word-detail-types";

const detail: WordDetail = {
  simplified: "爱", traditionalForms: ["愛"], sinoViet: "ái", hskLevel: 1, gloss: null,
  readings: [{ pinyin: "ài", meanings: ["to love"], hskLevel: 1, frequency: 130 }], chars: [],
};
const ex: ExampleSentence = { videoId: "vid", lineIdx: 7, start: 12.5, end: 15, text: "t", pinyin: "p", translation: "d", quality: 1 };

describe("savedItemForDetail", () => {
  it("không có câu thật thì không tạo được thẻ", () => {
    expect(savedItemForDetail(detail, undefined, null)).toBeNull();
  });
  it("lấy vị trí câu làm nguồn thẻ và ảnh chụp từ từ điển", () => {
    expect(savedItemForDetail(detail, ex, null, 1)).toMatchObject({ key: "vocab:爱", videoId: "vid", lineIndex: 7, start: 12.5, reading: "ài", sinoViet: "ái", level: 1, meaning: "to love", savedAt: 1 });
  });
  it("nghĩa: gloss đã duyệt > nghĩa AI > nghĩa Anh", () => {
    expect(savedItemForDetail({ ...detail, gloss: "yêu" }, ex, "thương")?.meaning).toBe("yêu");
    expect(savedItemForDetail(detail, ex, "thương")?.meaning).toBe("thương");
  });
});
