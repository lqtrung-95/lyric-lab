import { describe, expect, it } from "vitest";
import { parseAnswerBlocks } from "./formatted-answer";

describe("parseAnswerBlocks", () => {
  it("tách đoạn văn, gạch đầu dòng và danh sách đánh số", () => {
    const blocks = parseAnswerBlocks("Câu này gồm:\n- **自己**: bản thân\n- **唯一**: duy nhất\n\n1. Bước một\n2) Bước hai\nÝ nghĩa: xong");
    expect(blocks).toEqual([
      { kind: "p", lines: ["Câu này gồm:"] },
      { kind: "ul", items: ["**自己**: bản thân", "**唯一**: duy nhất"] },
      { kind: "ol", items: ["Bước một", "Bước hai"] },
      { kind: "p", lines: ["Ý nghĩa: xong"] },
    ]);
  });
  it("các dòng thường liền nhau cùng một đoạn, dòng trống tách đoạn mới", () => {
    expect(parseAnswerBlocks("a\nb\n\nc")).toEqual([{ kind: "p", lines: ["a", "b"] }, { kind: "p", lines: ["c"] }]);
  });
  it("văn bản rỗng thì không có khối nào", () => expect(parseAnswerBlocks("  \n\n")).toEqual([]));
});
