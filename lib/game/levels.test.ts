import { describe, expect, it } from "vitest";
import { levelFromXp, levelName, MAX_LEVEL, xpToReachLevel } from "./levels";

describe("levelFromXp", () => {
  it("0 XP là cấp 1; ngưỡng đúng từng cấp và tăng dần", () => {
    expect(levelFromXp(0)).toMatchObject({ n: 1, progressXp: 0, nextXp: 50, maxed: false });
    expect(levelFromXp(49).n).toBe(1);
    expect(levelFromXp(50).n).toBe(2);
    const steps = Array.from({ length: 10 }, (_, i) => xpToReachLevel(i + 2) - xpToReachLevel(i + 1));
    expect(steps.every((s, i) => i === 0 || s > steps[i - 1])).toBe(true);
  });
  it("tiến độ trong cấp tính từ ngưỡng cấp", () => {
    expect(levelFromXp(xpToReachLevel(5) + 30)).toMatchObject({ n: 5, progressXp: 30 });
  });
  it("XP âm hoặc lẻ được chuẩn hóa; chạm trần cấp thì maxed", () => {
    expect(levelFromXp(-5).n).toBe(1);
    expect(levelFromXp(10.9).progressXp).toBe(10);
    expect(levelFromXp(1e9)).toMatchObject({ n: MAX_LEVEL, maxed: true, nextXp: 0 });
  });
  it("tên cấp theo khoảng", () => {
    expect(levelName(1)).toBe("Mầm chữ");
    expect(levelName(7)).toBe("Thư sinh");
    expect(levelName(50)).toBe("Thánh thư");
  });
});
