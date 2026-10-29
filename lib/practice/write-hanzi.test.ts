import { describe, expect, it } from "vitest";
import { outcomeFromStars, parseWriteStats, pointsFromStars, pickWriteTargets, recordWrite } from "./write-hanzi";

const card = (term: string, kind = "vocab") => ({ item_key: `k:${term}`, kind, term, pinyin: "x", meaning: "m" });
const noRand = () => 0;

describe("pickWriteTargets", () => {
  it("chỉ lấy từ vựng toàn chữ Hán, 1–3 chữ, không trùng", () => {
    const r = pickWriteTargets([card("你好"), card("你好"), card("ab"), card("你a"), card("四个字啊"), card("语法", "grammar"), card("爱")], {}, 10, noRand);
    expect(r.map((t) => t.term).sort()).toEqual(["你好", "爱"].sort());
  });
  it("ưu tiên từ chưa viết, rồi sao thấp, rồi viết lâu nhất", () => {
    let s = recordWrite({}, "k:甲", 3, 1000);
    s = recordWrite(s, "k:乙", 1, 2000);
    s = recordWrite(s, "k:丙", 1, 1000);
    const r = pickWriteTargets([card("甲"), card("乙"), card("丙"), card("丁")], s, 4, noRand);
    expect(r.map((t) => t.term)).toEqual(["丁", "丙", "乙", "甲"]);
  });
  it("giới hạn số từ mỗi lượt", () => {
    expect(pickWriteTargets("天地人和金木水火".split("").map((c) => card(c)), {}, 3, noRand)).toHaveLength(3);
  });
});

describe("write stats", () => {
  it("recordWrite giữ sao tốt nhất và đếm số lần", () => {
    const a = recordWrite({}, "k", 3, 1);
    const b = recordWrite(a, "k", 1, 2);
    expect(b.k).toEqual({ n: 2, best: 3, last: 2 });
  });
  it("parse bỏ dữ liệu sai dạng", () => {
    expect(parseWriteStats({ a: { n: 1, best: 2, last: 5 }, b: { n: "x" }, c: null })).toEqual({ a: { n: 1, best: 2, last: 5 } });
    expect(parseWriteStats("x")).toEqual({});
  });
});

describe("chấm theo sao", () => {
  it("sao → kết quả và điểm", () => {
    expect([1, 2, 3].map((n) => outcomeFromStars(n as 1 | 2 | 3))).toEqual(["wrong", "partial", "correct"]);
    expect([1, 2, 3].map((n) => pointsFromStars(n as 1 | 2 | 3))).toEqual([40, 70, 100]);
  });
});
