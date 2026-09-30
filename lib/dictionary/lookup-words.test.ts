import { describe, expect, it } from "vitest";
import type { DictWordRow } from "./build-dictionary-rows";
import { lookupWords, pickPrimaryEntry, type DictQueryClient } from "./lookup-words";

const row = (simplified: string, pinyin: string, hsk_level: number | null = null): DictWordRow => ({
  simplified, traditional: simplified, pinyin, meanings: ["m"], hsk_level, frequency: null,
});

function fakeClient(rows: DictWordRow[], calls: string[][] = []): DictQueryClient {
  return {
    from: () => ({
      select: () => ({
        in: async (_c, values) => {
          calls.push(values);
          return { data: rows.filter((r) => values.includes(r.simplified)), error: null };
        },
      }),
    }),
  };
}

describe("lookupWords", () => {
  it("nhóm các mục theo từ, bỏ từ trùng, chia lô", async () => {
    const calls: string[][] = [];
    const words = Array.from({ length: 450 }, (_, i) => `w${i}`);
    const out = await lookupWords(fakeClient([row("w1", "a"), row("w1", "b"), row("w449", "c")], calls), [...words, "w1"]);
    expect(calls.map((c) => c.length)).toEqual([200, 200, 50]);
    expect(out.get("w1")).toHaveLength(2);
    expect(out.has("w2")).toBe(false);
  });

  it("ném lỗi khi truy vấn thất bại", async () => {
    const bad: DictQueryClient = { from: () => ({ select: () => ({ in: async () => ({ data: null, error: { message: "boom" } }) }) }) };
    await expect(lookupWords(bad, ["x"])).rejects.toThrow("boom");
  });
});

describe("pickPrimaryEntry", () => {
  it("ưu tiên mục có cấp HSK thấp nhất", () => {
    expect(pickPrimaryEntry([row("行", "háng"), row("行", "xíng", 2), row("行", "x", 5)])?.pinyin).toBe("xíng");
  });
  it("bỏ mục biến thể khi còn mục khác", () => {
    const variant = { ...row("笑", "xiào"), traditional: "咲", meanings: ["variant of 笑[xiao4]"] };
    expect(pickPrimaryEntry([variant, row("笑", "xiào")])?.traditional).toBe("笑");
    expect(pickPrimaryEntry([variant])?.traditional).toBe("咲");
  });
  it("không có cấp HSK → mục đầu; rỗng → null", () => {
    expect(pickPrimaryEntry([row("a", "1"), row("a", "2")])?.pinyin).toBe("1");
    expect(pickPrimaryEntry([])).toBeNull();
  });
  it("hạ ưu tiên mục họ người (pinyin viết hoa) dù cùng cấp HSK", () => {
    expect(pickPrimaryEntry([row("都", "Dū", 1), row("都", "dōu", 1), row("都", "dū", 1)])?.pinyin).toBe("dōu");
    // Toàn mục là họ người thì vẫn phải trả về một mục, không rỗng.
    expect(pickPrimaryEntry([row("某", "Mǒu", 1)])?.pinyin).toBe("Mǒu");
  });
  it("ghi đè cách đọc thông dụng cho chữ đã xác nhận báo lỗi (说 → shuō, không phải shuì)", () => {
    expect(pickPrimaryEntry([row("说", "shuì", 1), row("说", "shuō", 1)])?.pinyin).toBe("shuō");
  });
});
