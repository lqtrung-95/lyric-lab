import { describe, expect, it } from "vitest";
import { buildGlossPrompt, parseGlosses } from "./vietnamese-glosses";

describe("parseGlosses", () => {
  it("lấy nghĩa cho đúng các từ yêu cầu, bỏ từ thừa và nghĩa rỗng/quá dài", () => {
    const raw = JSON.stringify({ glosses: { 我: "tôi", 你: " bạn ", 他: "", 多余: "thừa", 她: "x".repeat(81) } });
    const out = parseGlosses(raw, ["我", "你", "他", "她", "们"]);
    expect(out.glosses).toEqual({ 我: "tôi", 你: "bạn" });
    expect(out.missing).toEqual(["他", "她", "们"]);
  });
  it("chịu được rào mã markdown; JSON hỏng thì coi như thiếu hết", () => {
    expect(parseGlosses('```json\n{"glosses":{"我":"tôi"}}\n```', ["我"]).glosses).toEqual({ 我: "tôi" });
    expect(parseGlosses("không phải json", ["我", "你"]).missing).toEqual(["我", "你"]);
    expect(parseGlosses('{"khac":1}', ["我"]).missing).toEqual(["我"]);
  });
});

describe("buildGlossPrompt", () => {
  it("liệt kê từng từ kèm pinyin và nghĩa tiếng Anh", () => {
    const p = buildGlossPrompt([{ term: "我", pinyin: "wǒ", meanings: ["I", "me"] }]);
    expect(p).toContain("我 | wǒ | I; me");
  });
});
