import { describe, expect, it } from "vitest";
import type { PreparedLine } from "./build-lesson-lines";
import { translatePreparedLines } from "./translate-lines";

const line = (text: string, translation: string | null = null): PreparedLine => ({ text, start: 0, end: 1, tokens: [], translation } as unknown as PreparedLine);

describe("translatePreparedLines", () => {
  it("điền bản dịch theo thứ tự dòng và giữ dòng đã có bản dịch", async () => {
    const chat = async () => JSON.stringify({ translations: [{ lineIndex: 0, vi: "Xin chào" }, { lineIndex: 2, vi: "Tạm biệt" }] });
    const out = await translatePreparedLines([line("你好"), line("谢谢", "Cảm ơn"), line("再见")], chat, ["m"]);
    expect(out.map((l) => l.translation)).toEqual(["Xin chào", "Cảm ơn", "Tạm biệt"]);
  });

  it("model lỗi thì giữ translation null, không ném lỗi", async () => {
    const chat = async () => { throw new Error("hết hạn mức"); };
    const out = await translatePreparedLines([line("你好")], chat, ["m"]);
    expect(out.map((l) => l.translation)).toEqual([null]);
  });
});
