import { describe, expect, it } from "vitest";
import { historyResult, summarizeHistory } from "./room-history-logic";

describe("historyResult", () => {
  it("thắng, thua, hòa theo góc nhìn của người xem", () => {
    expect(historyResult("u1", "u1")).toBe("win");
    expect(historyResult("u2", "u1")).toBe("loss");
    expect(historyResult(null, "u1")).toBe("draw");
  });
});

describe("summarizeHistory", () => {
  it("đếm thắng/thua/hòa và tỉ lệ thắng", () => {
    expect(summarizeHistory(["win", "win", "loss", "draw"])).toEqual({ played: 4, wins: 2, losses: 1, draws: 1, winRate: 50 });
  });
  it("chưa có ván nào thì tỉ lệ 0", () => {
    expect(summarizeHistory([])).toEqual({ played: 0, wins: 0, losses: 0, draws: 0, winRate: 0 });
  });
});
