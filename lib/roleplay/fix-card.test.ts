import { describe, expect, it } from "vitest";
import { fixSavedItem, isSentenceTerm } from "./fix-card";

describe("thẻ câu đã sửa", () => {
  it("tạo thẻ grammar không có video, nghĩa ưu tiên bản dịch", () => {
    const it1 = fixSavedItem({ issue: "Thừa chữ 去.", better: "我最近开始喜欢去公园散步了。", betterVi: "Dạo này mình bắt đầu thích đi dạo công viên.", pinyin: "wǒ zuì jìn" }, 5);
    expect(it1).toMatchObject({ type: "grammar", videoId: "", term: "我最近开始喜欢去公园散步了。", meaning: "Dạo này mình bắt đầu thích đi dạo công viên.", reading: "wǒ zuì jìn", savedAt: 5 });
    expect(fixSavedItem({ issue: "Lỗi", better: "你好吗？" }).meaning).toBe("Lỗi");
  });
  it("phân biệt câu với khung mẫu ngữ pháp", () => {
    expect(isSentenceTerm("我最近开始喜欢去公园散步了。")).toBe(true);
    expect(isSentenceTerm("因为…所以")).toBe(false);
    expect(isSentenceTerm("把")).toBe(false);
  });
});
