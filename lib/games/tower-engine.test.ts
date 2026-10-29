import { describe, expect, it } from "vitest";
import type { GameWord } from "./game-word";
import { answerTower, frontMonster, initTower, stepTower, waveOf, type Monster, type TowerState } from "./tower-engine";
import { toneOptions } from "./tone-options";

const POOL: GameWord[] = [["朋友", "péng yǒu"], ["你好", "nǐ hǎo"], ["学习", "xué xí"], ["老师", "lǎo shī"], ["谢谢", "xiè xie"], ["中国", "zhōng guó"]].map(([han, pinyin]) => ({ han, pinyin, meaning: "x" }));
const mon = (id: number, x: number, over: Partial<Monster> = {}): Monster => ({ id, word: POOL[id % POOL.length], lane: id % 3, x, options: ["a", "b", "c"], answer: 1, rush: false, skin: 0, ...over });
const withMonsters = (ms: Monster[], extra: Partial<TowerState> = {}): TowerState => ({ ...initTower(), monsters: ms, nextSpawn: 9, nextId: 100, ...extra });
const rng = () => 0.37;

describe("lựa chọn âm đọc", () => {
  it("các cách đọc sai chỉ khác thanh, không trùng nhau", () => {
    for (const w of POOL) {
      const o = toneOptions(w.han, w.pinyin, Math.random)!;
      expect(o).not.toBeNull();
      expect(new Set(o.options).size).toBe(3);
      const bare = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/ü/g, "u").replace(/\s/g, "");
      expect(new Set(o.options.map(bare)).size).toBe(1);
      expect(o.options[o.answer].replace(/\s/g, "")).toBe(w.pinyin.replace(/\s/g, ""));
    }
  });
  it("không đổi 不 / 一 và không biến 3-3 thành 2-3", () => {
    expect(toneOptions("不", "bù", Math.random)).toBeNull();
    for (let i = 0; i < 50; i++) expect(toneOptions("你好", "nǐ hǎo", Math.random)!.options).not.toContain("ní hǎo");
  });
  it("âm tiết lạ thì bỏ qua", () => { expect(toneOptions("x", "???", Math.random)).toBeNull(); });
});

describe("thủ thành", () => {
  it("đợt tăng theo số quái đã ra", () => { expect(waveOf(1)).toBe(1); expect(waveOf(6)).toBe(1); expect(waveOf(7)).toBe(2); });
  it("con đi xa nhất chưa lao vào nhà là con cần trả lời", () => {
    const s = withMonsters([mon(1, 0.2), mon(2, 0.6), mon(3, 0.9, { rush: true })]);
    expect(frontMonster(s)?.id).toBe(2);
  });
  it("chọn đúng: hạ quái, tính điểm, combo", () => {
    const s = answerTower(withMonsters([mon(1, 0.5)]), 1);
    expect(s.monsters).toHaveLength(0); expect(s.kills).toBe(1); expect(s.combo).toBe(1); expect(s.score).toBe(100); expect(s.reveal?.ok).toBe(true);
  });
  it("chọn sai: quái lọt qua, lao vào nhà và làm mất tim", () => {
    let s = answerTower(withMonsters([mon(1, 0.5)], { combo: 3 }), 0);
    expect(s.combo).toBe(0); expect(s.wrong).toBe(1); expect(s.monsters[0].rush).toBe(true); expect(s.missed).toHaveLength(1);
    expect(frontMonster(s)).toBeUndefined();
    for (let i = 0; i < 20 && s.lives === 5; i++) s = stepTower(s, 0.1, POOL, rng);
    expect(s.lives).toBe(4);
  });
  it("đủ 5 combo thì pet bắn cả đàn", () => {
    const s = answerTower(withMonsters([mon(1, 0.8), mon(2, 0.3), mon(3, 0.2)], { combo: 4 }), 1);
    expect(s.monsters).toHaveLength(0); expect(s.supers).toBe(1); expect(s.kills).toBe(3);
  });
  it("quái không ai trả lời đi tới nhà thì mất tim và ghi từ sai; hết tim thì thua", () => {
    const s = stepTower(withMonsters([mon(1, 0.999)]), 0.5, POOL, rng);
    expect(s.lives).toBe(4); expect(s.missed).toHaveLength(1);
    expect(stepTower(withMonsters([mon(1, 0.999)], { lives: 1 }), 0.5, POOL, rng).over).toBe(true);
  });
  it("tự ra quái khi sân trống", () => {
    const s = stepTower(initTower(), 0.1, POOL, Math.random);
    expect(s.monsters).toHaveLength(1);
    expect(s.monsters[0].options).toHaveLength(3);
  });
});
