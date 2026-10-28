import { describe, expect, it } from "vitest";
import { initBlaster, spawnGap, stepBlaster, typeLetter, type BlasterState } from "./blaster-engine";

const pool = [{ han: "朋友", pinyin: "péng yǒu" }, { han: "学习", pinyin: "xué xí" }, { han: "你好", pinyin: "nǐ hǎo" }];
const first = () => 0;
const typeAll = (s: BlasterState, text: string) => [...text].reduce(typeLetter, s);
const withTargets = (): BlasterState => {
  let s = stepBlaster(initBlaster(), 0.5, pool, first); // spawn đầu tiên
  s = { ...s, nextSpawn: 0 };
  return stepBlaster(s, 0.01, pool, () => 0.5);
};

describe("blaster", () => {
  it("từ xuất hiện rồi rơi", () => {
    const s = stepBlaster(initBlaster(), 0.5, pool, first);
    expect(s.targets).toHaveLength(1);
    expect(stepBlaster(s, 1, pool, first).targets[0].y).toBeGreaterThan(s.targets[0].y);
  });
  it("gõ đủ pinyin không thanh thì nổ từ, cộng điểm và combo", () => {
    const s = stepBlaster(initBlaster(), 0.5, pool, first);
    const letters = s.targets[0].letters;
    const done = typeAll(s, letters);
    expect(done.targets).toHaveLength(0);
    expect(done.kills).toBe(1);
    expect(done.combo).toBe(1);
    expect(done.score).toBe(letters.length * 10);
    expect(done.blasts).toHaveLength(1);
  });
  it("gõ sai thì mất combo và bỏ chuỗi đang gõ", () => {
    const s = { ...stepBlaster(initBlaster(), 0.5, pool, first), combo: 4 };
    const bad = typeLetter(s, s.targets[0].letters[0] === "z" ? "q" : "z");
    expect(bad.combo).toBe(0);
    expect(bad.typed).toBe("");
  });
  it("gõ dở thì khóa từ đó", () => {
    const s = stepBlaster(initBlaster(), 0.5, pool, first);
    const part = typeLetter(s, s.targets[0].letters[0]);
    expect(part.lockedId).toBe(s.targets[0].id);
    expect(part.typed).toBe(s.targets[0].letters[0]);
  });
  it("từ chạm đáy thì mất mạng, hết mạng thì kết thúc", () => {
    let s = stepBlaster(initBlaster(), 0.5, pool, first);
    s = stepBlaster({ ...s, nextSpawn: 99 }, 100, pool, first);
    expect(s.lives).toBe(2);
    expect(s.missed).toHaveLength(1);
    s = { ...s, lives: 1, targets: [{ ...withTargets().targets[0], y: 0.99 }], nextSpawn: 99 };
    expect(stepBlaster(s, 5, pool, first).over).toBe(true);
  });
  it("cấp cao thì từ xuất hiện dày hơn", () => { expect(spawnGap(5)).toBeLessThan(spawnGap(1)); });
});
