import { describe, expect, it } from "vitest";
import { duelResult, duelWords, parseDuelState } from "./duel";

const bank = Array.from({ length: 40 }, (_, i) => ({ han: `字${i}`, pinyin: "a b" }));

describe("duel", () => {
  it("cùng mã phòng thì cùng bộ từ, không trùng", () => {
    const a = duelWords(bank, "ABC234");
    expect(a).toEqual(duelWords(bank, "ABC234"));
    expect(new Set(a.map((w) => w.han)).size).toBe(10);
    expect(a).not.toEqual(duelWords(bank, "XYZ789"));
  });
  it("đọc tin hợp lệ và loại tin sai dạng", () => {
    expect(parseDuelState({ from: "a", ready: true, done: 3, finishedMs: null })).toEqual({ from: "a", ready: true, done: 3, finishedMs: null });
    expect(parseDuelState({ from: "b", ready: true, done: 10, finishedMs: 25000 })?.finishedMs).toBe(25000);
    for (const bad of [null, {}, { from: "c", ready: true, done: 1, finishedMs: null }, { from: "a", ready: true, done: 11, finishedMs: null }, { from: "a", ready: 1, done: 1, finishedMs: null }, { from: "a", ready: true, done: 1, finishedMs: -5 }]) expect(parseDuelState(bad)).toBeNull();
  });
  it("nhanh hơn thì thắng", () => {
    expect(duelResult(20000, 30000)).toBe("win");
    expect(duelResult(30000, 20000)).toBe("lose");
    expect(duelResult(1, 1)).toBe("draw");
  });
});
