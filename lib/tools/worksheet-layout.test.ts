import { describe, expect, it } from "vitest";
import { cellsPerRow, rowsPerPage, uniqueHanChars, worksheetPages, type WorksheetChar } from "./worksheet-layout";

const chars = (n: number): WorksheetChar[] => Array.from({ length: n }, (_, i) => ({ ch: String.fromCodePoint(0x4e00 + i), pinyin: "yī", sinoViet: "nhất" }));
const opts = { grid: "tianzige", traceCells: 3, showPinyin: true, showSinoViet: true } as const;

describe("uniqueHanChars", () => {
  it("chỉ lấy chữ Hán, bỏ trùng và giữ thứ tự", () => {
    expect(uniqueHanChars("你好,你好 abc 123 我!")).toEqual(["你", "好", "我"]);
  });
  it("tối đa 60 chữ", () => {
    expect(uniqueHanChars(chars(80).map((c) => c.ch).join("")).length).toBe(60);
  });
});

describe("worksheetPages", () => {
  it("bố cục vừa khổ A4: cột ô và số hàng mỗi trang", () => {
    expect(cellsPerRow()).toBe(11);
    expect(rowsPerPage()).toBe(18);
  });

  it("chia trang theo số hàng mỗi trang, thứ tự chữ được giữ", () => {
    const pages = worksheetPages(chars(40), opts);
    expect(pages.map((p) => p.rows.length)).toEqual([18, 18, 4]);
    expect(pages[1].rows[0].char.ch).toBe(chars(40)[18].ch);
  });

  it("mỗi hàng có chữ thập đứt cho từng ô với 田字格, thêm đường chéo với 米字格, không có với ô vuông", () => {
    const dashed = (grid: "tianzige" | "mizige" | "square") => worksheetPages(chars(1), { ...opts, grid })[0].segments.filter((s) => s.dashed).length;
    expect(dashed("tianzige")).toBe(11 * 2);
    expect(dashed("mizige")).toBe(11 * 4);
    expect(dashed("square")).toBe(0);
  });

  it("không có chữ thì không có trang", () => {
    expect(worksheetPages([], opts)).toEqual([]);
  });
});
