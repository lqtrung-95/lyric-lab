import { describe, expect, it } from "vitest";
import { buildExplainPrompt } from "./build-explain-prompt";

describe("buildExplainPrompt", () => {
  it("chứa câu, từ và nghĩa từ điển", () => {
    const p = buildExplainPrompt({ term: "慢慢", line: "窗外的城市慢慢睡了", lineTranslation: "Thành phố dần chìm vào giấc ngủ", dictionaryMeanings: ["slowly", "gradually"] });
    expect(p).toContain("Câu hát: 窗外的城市慢慢睡了");
    expect(p).toContain("Từ cần giải nghĩa: 慢慢");
    expect(p).toContain("slowly; gradually");
    expect(p).toContain("Bản dịch câu:");
  });
  it("không có bản dịch hoặc từ điển vẫn hợp lệ", () => {
    const p = buildExplainPrompt({ term: "x", line: "y", dictionaryMeanings: [] });
    expect(p).not.toContain("Bản dịch câu:");
    expect(p).toContain("(không có trong từ điển)");
  });
});
