import { describe, expect, it } from "vitest";
import { sinoVietForWord } from "./sino-viet";
import { orderSinoViet, OVERRIDE_PAIRS, overrideSinoViet, SINO_VIET_OVERRIDES } from "./sino-viet-overrides";

describe("bảng âm Hán Việt chuẩn", () => {
  it("định dạng đúng: chỉ chữ Hán, âm là một âm tiết tiếng Việt viết thường", () => {
    expect(OVERRIDE_PAIRS.length).toBeGreaterThan(200);
    for (const [chars, reading] of OVERRIDE_PAIRS) {
      expect(chars, reading).toMatch(/^\p{Script=Han}+$/u);
      expect(reading, chars).toMatch(/^[a-zà-ỹđ]+$/);
    }
  });
  it("một chữ không có hai âm khác nhau trong bảng", () => {
    const seen = new Map<string, string>();
    for (const [chars, reading] of OVERRIDE_PAIRS) for (const c of chars) {
      expect(seen.get(c) ?? reading, `${c}: ${seen.get(c)} và ${reading}`).toBe(reading);
      seen.set(c, reading);
    }
    expect(SINO_VIET_OVERRIDES.size).toBe(seen.size);
  });
  it("các ca được báo lỗi: 柜 quỹ, 子 tử, 饭 phạn, 羽 vũ (cả dạng giản và phồn)", () => {
    for (const [c, r] of [["柜", "quỹ"], ["櫃", "quỹ"], ["子", "tử"], ["饭", "phạn"], ["飯", "phạn"], ["羽", "vũ"]]) expect(overrideSinoViet(c), c).toBe(r);
  });
});

describe("sinoVietForWord dùng bảng chuẩn thay cho âm đầu của dữ liệu", () => {
  // Dữ liệu giả lập kiểu bị lỗi: âm Nôm/hiếm đứng đầu.
  const dirty = new Map<string, string[]>([["櫃", ["cũi", "quỹ"]], ["子", ["tý", "tử"]], ["飯", ["phằn", "phạn"]], ["羽", ["võ", "vũ"]]]);
  it("柜子 → quỹ tử, 饭 → phạn, 羽 → vũ", () => {
    expect(sinoVietForWord("櫃子", dirty)).toBe("quỹ tử");
    expect(sinoVietForWord("飯", dirty)).toBe("phạn");
    expect(sinoVietForWord("羽", dirty)).toBe("vũ");
  });
  it("chữ không có trong bảng vẫn lấy âm đầu của dữ liệu", () => {
    expect(sinoVietForWord("龘", new Map([["龘", ["đạp"]]]))).toBe("đạp");
  });
  it("tra theo chữ giản thể khi chữ phồn không có trong bảng", () => {
    expect(sinoVietForWord("柜", new Map(), "柜")).toBe("quỹ");
  });
});

describe("orderSinoViet", () => {
  it("đưa âm chuẩn lên đầu, giữ các âm khác, bỏ trùng", () => {
    expect(orderSinoViet("子", ["tý", "tử", "tí"])).toEqual(["tử", "tý", "tí"]);
    expect(orderSinoViet("龘", ["đạp"])).toEqual(["đạp"]);
  });
});

import { modernizeTone, WORD_SINO_VIET_OVERRIDES } from "./sino-viet-overrides";

describe("chuẩn hóa dấu thanh", () => {
  it("đổi kiểu cũ sang kiểu mới, giữ quý/quỹ", () => {
    expect(modernizeTone("hoà")).toBe("hòa");
    expect(modernizeTone("thuỷ")).toBe("thủy");
    expect(modernizeTone("hoạ")).toBe("họa");
    expect(modernizeTone("quý")).toBe("quý");
    expect(modernizeTone("quỹ")).toBe("quỹ");
    expect(modernizeTone("nhân")).toBe("nhân");
  });
  it("áp vào âm ghép của từ", () => {
    expect(sinoVietForWord("水", new Map([["水", ["thuỷ"]]]))).toBe("thủy");
    expect(sinoVietForWord("龘龘", new Map([["龘", ["hoà"]]]))).toBe("hòa hòa");
  });
});

describe("âm của từ khác âm chuẩn từng chữ", () => {
  it("校长 hiệu trưởng, 少年 thiếu niên, 会计 cối kế; từ thường vẫn ghép theo chữ", () => {
    const rd = new Map([["校", ["hiệu"]], ["長", ["trường"]], ["少", ["thiếu"]], ["年", ["niên"]]]);
    expect(sinoVietForWord("校長", rd)).toBe("hiệu trưởng");
    expect(sinoVietForWord("少年", rd)).toBe("thiếu niên");
    expect(sinoVietForWord("会计", rd)).toBe("cối kế");
    expect(sinoVietForWord("長年", rd)).toBe("trường niên");
    expect(WORD_SINO_VIET_OVERRIDES.size).toBeGreaterThan(40);
  });
  it("chữ 载 và 划 không còn bị đè (载 tải/tái, 划 hoa/hoạch tùy từ)", () => {
    expect(overrideSinoViet("载")).toBeUndefined();
    expect(overrideSinoViet("划")).toBeUndefined();
    expect(overrideSinoViet("劃")).toBe("hoạch");
  });
});
