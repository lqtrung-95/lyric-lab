import { describe, expect, it } from "vitest";
import { DIFFICULTY, activeRow, initRain, rainSpeed, stepRain, tapLane } from "./rain-engine";

const pool = ["朋友", "学习", "你好", "老师", "学生", "中国"].map((han, i) => ({ han, pinyin: `a${i} b` }));
const rng = () => 0.3;

describe("rain", () => {
  it("hàng đầu tiên xuất hiện, bốn từ khác nhau", () => {
    const s = stepRain(initRain(), 0.1, pool, rng);
    expect(s.rows).toHaveLength(1);
    expect(new Set(s.rows[0].words.map((w) => w.han)).size).toBe(4);
  });
  it("chạm đúng cột: xóa hàng, cộng điểm, tăng combo", () => {
    const s = stepRain(initRain(), 0.1, pool, rng);
    const lane = s.rows[0].answer;
    const t = tapLane(s, lane);
    expect(t.cleared).toBe(1);
    expect(t.combo).toBe(1);
    expect(t.score).toBe(100);
    expect(activeRow(t)).toBeUndefined();
  });
  it("chạm sai cột: mất mạng và combo", () => {
    const s = { ...stepRain(initRain(), 0.1, pool, rng), combo: 3 };
    const t = tapLane(s, (s.rows[0].answer + 1) % 4);
    expect(t.lives).toBe(2);
    expect(t.combo).toBe(0);
    expect(t.missed).toHaveLength(1);
  });
  it("hàng chạm đáy mà chưa trả lời mất mạng, hết mạng thì kết thúc", () => {
    let s = stepRain(initRain(), 0.1, pool, rng);
    for (let i = 0; i < 200 && !s.over; i++) s = stepRain(s, 0.25, pool, rng);
    expect(s.over).toBe(true);
    expect(s.lives).toBeLessThanOrEqual(0);
  });
  it("độ khó dễ rơi chậm hơn khó, tốc độ có trần", () => {
    expect(rainSpeed(1, DIFFICULTY.easy)).toBeLessThan(rainSpeed(1, DIFFICULTY.hard));
    expect(rainSpeed(99, DIFFICULTY.easy)).toBe(DIFFICULTY.easy * 2);
  });
  it("không chạy khi thiếu từ", () => { expect(stepRain(initRain(), 1, pool.slice(0, 3), rng).rows).toHaveLength(0); });
});
