import { describe, expect, it } from "vitest";
import { challengeVerdict, buildChallengeUrl, parseChallenge } from "@/lib/challenge/challenge-link";
import { hanVietTitle, makeHanVietQuiz } from "./han-viet-quiz";
import { hanVietWordsFrom, plain, type HanVietWord } from "./han-viet-words";
import { newSeed, seededRng } from "./seeded-rng";
import type { HskRow } from "@/lib/tools/build-hsk-rows";

const W = (han: string, sinoViet: string, cognate = true): HanVietWord => ({ han, pinyin: "p", sinoViet, meaning: sinoViet, level: 2, cognate });
const POOL = ["学生", "老师", "大学", "学校", "医院", "朋友", "机场", "银行", "电话", "手机", "天气", "时间"].map((h, i) => W(h, `am ${i} ${h}`));

describe("kho từ", () => {
  it("bỏ từ thiếu Hán Việt/nghĩa Việt hoặc không phải hai chữ; đánh dấu cognate", () => {
    const row = (word: string, sinoViet: string | null, meaningVi: string | null): HskRow => ({ word, pinyin: "p", sinoViet, meanings: [], meaningVi });
    const out = hanVietWordsFrom([row("学生", "học sinh", "học sinh"), row("机场", "cơ trường", "sân bay"), row("你", "nễ", "bạn"), row("朋友", null, "bạn bè"), row("电话", "điện thoại", null)], 2);
    expect(out.map((w) => [w.han, w.cognate])).toEqual([["学生", true], ["机场", false]]);
    expect(plain("Đại Học")).toBe("dai hoc");
  });
});

describe("makeHanVietQuiz", () => {
  it("cùng hạt giống thì cùng bộ câu, khác hạt giống thì khác", () => {
    expect(makeHanVietQuiz(POOL, "abc123", 5)).toEqual(makeHanVietQuiz(POOL, "abc123", 5));
    expect(makeHanVietQuiz(POOL, "abc123", 5).map((q) => q.word.han)).not.toEqual(makeHanVietQuiz(POOL, "zzz999", 5).map((q) => q.word.han));
  });
  it("mỗi câu 4 đáp án khác nhau, chứa đáp án đúng, không trùng từ giữa các câu", () => {
    const qs = makeHanVietQuiz(POOL, "seed01", 10);
    expect(qs).toHaveLength(10);
    expect(new Set(qs.map((q) => q.word.han)).size).toBe(10);
    for (const q of qs) { expect(new Set(q.options).size).toBe(4); expect(q.options[q.answer]).toBe(q.word.han); }
  });
  it("đáp án nhiễu ưu tiên từ chung chữ với đáp án", () => {
    const q = makeHanVietQuiz(POOL, "seed02", 12).find((x) => x.word.han === "大学")!;
    expect(q.options).toContain("学生");
  });
  it("kho quá nhỏ thì không dựng", () => {
    expect(makeHanVietQuiz(POOL.slice(0, 3), "x1x1x1")).toEqual([]);
  });
  it("danh hiệu theo tỉ lệ", () => {
    expect(hanVietTitle(10, 10)).toBe("Cao thủ Hán Việt");
    expect(hanVietTitle(2, 10)).toBe("Mới nhập môn");
  });
});

describe("hạt giống và link thách", () => {
  it("rng theo hạt giống ổn định; hạt giống mới hợp lệ", () => {
    expect(seededRng("a")()).toBe(seededRng("a")());
    expect(newSeed()).toMatch(/^[a-z0-9]{6}$/);
  });
  it("tạo rồi đọc lại link, từ chối dữ liệu sai", () => {
    const url = buildChallengeUrl("https://songhanzi.com/review/han-viet", { seed: "abc123", score: 8, total: 10, from: "Tiểu Hồ" });
    expect(parseChallenge(new URL(url).searchParams)).toEqual({ seed: "abc123", score: 8, total: 10, from: "Tiểu Hồ" });
    const bad = (q: string) => parseChallenge(new URLSearchParams(q));
    expect(bad("seed=ABC&n=10&score=3")).toBeNull();
    expect(bad("seed=abc123&n=10&score=11")).toBeNull();
    expect(bad("seed=abc123&n=10&score=-1")).toBeNull();
    expect(bad("seed=abc123&n=10&score=3&from=%3Cb%3E")?.from).toBe("b");
    expect(bad("seed=abc123&n=10&score=3")?.from).toBe("Một người bạn");
  });
  it("so điểm với người thách", () => {
    expect([challengeVerdict(8, 7), challengeVerdict(7, 7), challengeVerdict(6, 7)]).toEqual(["beat", "tie", "behind"]);
  });
});
