import { describe, expect, it } from "vitest";
import { detectGrammar } from "./detect-grammar";
import { buildDrills, chooseDrill, fillDrill, isCorrect, orderDrill } from "./drills";
import { GRAMMAR_PATTERNS, grammarById } from "./grammar-patterns";
import { EMPTY_STATS, isMastered, parseGrammarStats, recordAnswer, weakPatternIds } from "./grammar-stats";
import { plain, segments } from "./grammar-types";

const rng = () => 0.37;

describe("dữ liệu mẫu ngữ pháp", () => {
  it("id không trùng, đủ nội dung, mỗi cấp có mẫu", () => {
    expect(new Set(GRAMMAR_PATTERNS.map((p) => p.id)).size).toBe(GRAMMAR_PATTERNS.length);
    for (const l of [1, 2, 3, 4, 5, 6]) expect(GRAMMAR_PATTERNS.filter((p) => p.level === l).length, `HSK ${l}`).toBeGreaterThanOrEqual(l >= 6 ? 5 : 8);
    for (const p of GRAMMAR_PATTERNS) {
      expect(/^[a-z0-9-]+$/.test(p.id), p.id).toBe(true);
      expect(p.examples.length, p.id).toBeGreaterThanOrEqual(3);
      expect(p.mistakes.length, p.id).toBeGreaterThanOrEqual(1);
      expect(p.explain.length, p.id).toBeGreaterThan(20);
    }
  });
  it("mọi từ khoá xuất hiện ít nhất trong một ví dụ, ví dụ ghi đủ từ khoá chính", () => {
    for (const p of GRAMMAR_PATTERNS) {
      const all = p.examples.map((e) => plain(e.zh)).join("");
      for (const k of p.key) expect(all.includes(k), `${p.id}:${k}`).toBe(true);
    }
  });
  it("mỗi mẫu tạo được bài xếp từ, điền chỗ trống và chọn câu đúng", () => {
    for (const p of GRAMMAR_PATTERNS) {
      expect(orderDrill(p, rng), `order ${p.id}`).not.toBeNull();
      expect(fillDrill(p, rng), `fill ${p.id}`).not.toBeNull();
      expect(chooseDrill(p, rng), `choose ${p.id}`).not.toBeNull();
    }
  });
  it("câu sai và câu đúng trong lỗi thường gặp khác nhau", () => {
    for (const p of GRAMMAR_PATTERNS) for (const m of p.mistakes) expect(m.wrong).not.toBe(m.right);
  });
  it("regex detect hợp lệ và nhận ra câu ví dụ của chính mẫu", () => {
    for (const p of GRAMMAR_PATTERNS.filter((x) => x.detect)) {
      const re = new RegExp(p.detect!, "u");
      expect(p.examples.some((e) => re.test(plain(e.zh))), p.id).toBe(true);
    }
  });
});

describe("bài tập", () => {
  it("xếp từ: đáp án đúng là câu gốc, thứ tự đã bị xáo", () => {
    const d = orderDrill(grammarById("bi")!, rng)!;
    expect(d.kind).toBe("order");
    if (d.kind !== "order") return;
    expect(d.tokens.join("")).not.toBe(d.answer.join(""));
    expect([...d.tokens].sort()).toEqual([...d.answer].sort());
    expect(isCorrect(d, d.answer)).toBe(true);
    expect(isCorrect(d, d.tokens)).toBe(false);
  });
  it("điền chỗ trống: đáp án nằm trong lựa chọn, ghép lại ra câu gốc", () => {
    for (const p of GRAMMAR_PATTERNS) {
      const d = fillDrill(p, () => 0.5)!;
      if (d.kind !== "fill") throw new Error("kind");
      expect(d.options).toContain(d.answer);
      expect(new Set(d.options).size).toBe(d.options.length);
      const whole = d.before + d.answer + d.after;
      expect(p.examples.some((e) => plain(e.zh) === whole), p.id).toBe(true);
    }
  });
  it("buildDrills giới hạn số bài và xen kẽ các mẫu", () => {
    const ds = buildDrills(GRAMMAR_PATTERNS.slice(0, 6), 6, rng);
    expect(ds).toHaveLength(6);
    expect(new Set(ds.map((d) => d.patternId)).size).toBe(6);
  });
  it("segments bỏ chuỗi rỗng", () => { expect(segments("我|是|学生。")).toEqual(["我", "是", "学生。"]); });
});

describe("thống kê", () => {
  it("ghi đúng/sai, nhận mẫu hay sai và mẫu đã nắm", () => {
    let s = EMPTY_STATS;
    for (const ok of [false, false, true]) s = recordAnswer(s, "ba", ok, 1);
    for (const ok of [true, true, true]) s = recordAnswer(s, "bi", ok, 1);
    expect(weakPatternIds(s)).toEqual(["ba"]);
    expect(isMastered(s.bi)).toBe(true);
    expect(isMastered(s.ba)).toBe(false);
  });
  it("parse bỏ rác", () => {
    expect(parseGrammarStats(null)).toEqual({});
    expect(parseGrammarStats({ ba: { right: 2, wrong: -1, last: "x" }, "BAD ID": { right: 1 } })).toEqual({ ba: { right: 2, wrong: 0, last: 0 } });
  });
});

describe("gắn nhãn ngữ pháp", () => {
  it("nhận 把 và 越来越, bỏ qua câu không có chữ Hán", () => {
    expect(detectGrammar("他把门关上了").map((p) => p.id)).toContain("ba");
    expect(detectGrammar("天气越来越冷").map((p) => p.id)).toContain("yuelaiyue");
    expect(detectGrammar("la la la")).toEqual([]);
  });
});

describe("thẻ ôn ngữ pháp", () => {
  it("khoá thẻ không trùng giữa các mẫu", async () => {
    const { grammarSavedItem } = await import("./grammar-saved");
    const keys = GRAMMAR_PATTERNS.map((p) => grammarSavedItem(p).key);
    expect(new Set(keys).size).toBe(keys.length);
    expect(grammarSavedItem(grammarById("ba")!)).toMatchObject({ type: "grammar", term: "把", videoId: "" });
  });
});

describe("nhận diện mẫu: không gắn nhầm", () => {
  const ids = (t: string) => detectGrammar(t, 10).map((p) => p.id);
  it("bỏ qua nghĩa khác của chữ cùng hình", () => {
    expect(ids("我们来比较一下")).not.toContain("bi");
    expect(ids("他拿起一把伞")).not.toContain("ba");
    expect(ids("盖上被子睡觉")).not.toContain("bei");
    expect(ids("连忙跑过去")).not.toContain("lian-dou");
    expect(ids("离开这里")).not.toContain("li");
    expect(ids("既然你来了")).not.toContain("ji-you");
    expect(ids("从来没有")).not.toContain("cong-dao");
    expect(ids("他还给我钱")).not.toContain("hai");
    expect(ids("一个人在家")).not.toContain("yi-jiu");
    expect(ids("他以前认为这样不对")).not.toContain("yi-wei");
    expect(ids("所以我认为很好")).not.toContain("yi-wei");
    expect(ids("非常好，不可以")).not.toContain("fei-buke");
  });
  it("vẫn nhận đúng khi dùng mẫu thật", () => {
    expect(ids("今天比昨天冷")).toContain("bi");
    expect(ids("请把门关上")).toContain("ba");
    expect(ids("他被老师表扬了")).toContain("bei");
    expect(ids("他连名字都忘了")).toContain("lian-dou");
    expect(ids("火车快要开了")).toContain("yao-le");
    expect(ids("他唱得很好")).toContain("de-complement");
    expect(ids("只有多练习才能说好")).toContain("zhiyou-cai");
    expect(ids("我一到家就打电话")).toContain("yi-jiu");
    expect(ids("他以老师为榜样")).toContain("yi-wei");
    expect(ids("这件事非你去不可")).toContain("fei-buke");
    expect(ids("孩子都会，何况你呢")).toContain("hekuang");
  });
});

describe("gộp thống kê giữa thiết bị", () => {
  it("lấy số lớn hơn từng trường, gộp lặp lại không đếm đôi", async () => {
    const { mergeStats } = await import("./grammar-stats");
    const a = { ba: { right: 3, wrong: 1, last: 10 } };
    const b = { ba: { right: 2, wrong: 4, last: 20 }, bi: { right: 1, wrong: 0, last: 5 } };
    const m = mergeStats(a, b);
    expect(m).toEqual({ ba: { right: 3, wrong: 4, last: 20 }, bi: { right: 1, wrong: 0, last: 5 } });
    expect(mergeStats(m, b)).toEqual(m);
  });
});
