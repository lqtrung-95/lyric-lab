import { describe, expect, it } from "vitest";
import { scoreWriting } from "./score-writing";

describe("scoreWriting", () => {
  it("không sai nét nào = 100% và 3 sao", () => {
    expect(scoreWriting(10, 0)).toMatchObject({ percent: 100, stars: 3 });
  });
  it("mỗi nét sai một lần vẫn còn 50%", () => {
    expect(scoreWriting(10, 10).percent).toBe(50);
  });
  it("sai không quá nửa số nét thì 2 sao, nhiều hơn thì 1 sao", () => {
    expect(scoreWriting(10, 5).stars).toBe(2);
    expect(scoreWriting(10, 6).stars).toBe(1);
  });
  it("không vượt giới hạn: không âm, nhận số nét 0", () => {
    expect(scoreWriting(2, 100).percent).toBe(0);
    expect(scoreWriting(0, 0).percent).toBe(100);
  });
});
