import { describe, expect, it } from "vitest";
import type { GameWord } from "./game-word";
import { fallSpeed, initSquadron, levelOf, stepSquadron } from "./squadron-engine";
import { SHIP_Y, type Enemy, type SquadronState } from "./squadron-types";
import { makeWave } from "./squadron-wave";

const POOL: GameWord[] = ["猫:māo:con mèo", "狗:gǒu:con chó", "鱼:yú:con cá", "鸟:niǎo:con chim", "水:shuǐ:nước", "火:huǒ:lửa", "山:shān:núi", "人:rén:người"].map((l) => { const [han, pinyin, meaning] = l.split(":"); return { han, pinyin, meaning }; });
const still = { dir: 0 as const, targetX: null };
const seq = (vals: number[]) => { let i = 0; return () => vals[i++ % vals.length]; };

function withWave(extra: Partial<SquadronState> = {}): SquadronState {
  const w = makeWave(POOL, seq([0.9, 0.1, 0.3, 0.6]), 0, "", 1)!;
  return { ...initSquadron(), question: w.question, enemies: w.enemies.map((e) => ({ ...e, y: 0.3 })), nextId: w.nextId, asked: 1, fire: 99, waveGap: 9, ...extra };
}
const correct = (s: SquadronState): Enemy => s.enemies.find((e) => e.correct)!;
/** Đặt đạn ngay trên máy bay để lượt tiếp theo chắc chắn trúng. */
const aim = (s: SquadronState, e: Enemy): SquadronState => ({ ...s, bullets: [{ id: 999, x: e.x, y: e.y + 0.05, vx: 0 }] });

describe("đợt máy bay", () => {
  it("có đúng một đáp án đúng, chữ nhiễu không trùng thứ được hỏi", () => {
    for (const r of [0.1, 0.4, 0.8]) {
      const w = makeWave(POOL, seq([r, 0.2, 0.7, 0.5, 0.9]), 0, "", 1)!;
      expect(w.enemies.filter((e) => e.correct)).toHaveLength(1);
      expect(new Set(w.enemies.map((e) => e.word.han)).size).toBe(w.enemies.length);
      const key = (x: GameWord) => (w.question.kind === "meaning" ? x.meaning : x.pinyin);
      expect(w.enemies.filter((e) => key(e.word) === key(w.question.answer))).toHaveLength(1);
    }
  });
  it("đợt thứ năm là trùm nhiều máu", () => {
    const w = makeWave(POOL, seq([0.3, 0.5]), 4, "", 1)!;
    expect(correct({ ...initSquadron(), enemies: w.enemies }).boss).toBe(true);
    expect(correct({ ...initSquadron(), enemies: w.enemies }).hp).toBeGreaterThan(1);
  });
  it("kho quá nhỏ thì không ghép được", () => { expect(makeWave(POOL.slice(0, 2), () => 0.5, 0, "", 1)).toBeNull(); });
});

describe("chơi", () => {
  it("bắn đúng: nổ, tính điểm, combo, đợt kết thúc", () => {
    const s0 = withWave();
    const s = stepSquadron(aim(s0, correct(s0)), 0.01, still, POOL, Math.random);
    expect(s.kills).toBe(1); expect(s.combo).toBe(1); expect(s.score).toBe(100);
    expect(s.enemies).toHaveLength(0); expect(s.question).toBeNull();
  });
  it("bắn nhầm: mất combo, đếm lỗi, không mất mạng", () => {
    const s0 = withWave({ combo: 4 });
    const wrong = s0.enemies.find((e) => !e.correct)!;
    const s = stepSquadron(aim(s0, wrong), 0.01, still, POOL, Math.random);
    expect(s.combo).toBe(0); expect(s.wrong).toBe(1); expect(s.lives).toBe(3);
    expect(s.missed.map((m) => m.han)).toContain(s.question!.answer.han);
  });
  it("chữ đúng lọt xuống đáy: mất mạng, ghi từ sai; khiên đỡ thay", () => {
    const base = withWave();
    const low = { ...base, enemies: base.enemies.map((e) => (e.correct ? { ...e, y: SHIP_Y } : e)) };
    const lost = stepSquadron(low, 0.01, still, POOL, Math.random);
    expect(lost.lives).toBe(2); expect(lost.missed).toHaveLength(1); expect(lost.question).toBeNull();
    const shielded = stepSquadron({ ...low, shield: true }, 0.01, still, POOL, Math.random);
    expect(shielded.lives).toBe(3); expect(shielded.shield).toBe(false);
  });
  it("chữ sai đâm vào tàu mất mạng nhưng đợt vẫn tiếp tục", () => {
    const base = withWave({ shipX: 0.5 });
    const wrong = base.enemies.find((e) => !e.correct)!;
    const s = stepSquadron({ ...base, enemies: base.enemies.map((e) => (e.id === wrong.id ? { ...e, x: 0.5, y: SHIP_Y - 0.05 } : e)) }, 0.01, still, POOL, Math.random);
    expect(s.lives).toBe(2); expect(s.question).not.toBeNull();
  });
  it("trùm cần nhiều phát mới hạ", () => {
    const w = makeWave(POOL, seq([0.3, 0.5]), 4, "", 1)!;
    let s: SquadronState = { ...initSquadron(), question: w.question, enemies: w.enemies.map((e) => ({ ...e, y: 0.3 })), nextId: w.nextId, fire: 99, waveGap: 9 };
    const hp = correct(s).hp;
    for (let i = 0; i < hp - 1; i++) s = stepSquadron(aim(s, correct(s)), 0.001, still, POOL, Math.random);
    expect(s.kills).toBe(0);
    s = stepSquadron(aim(s, correct(s)), 0.001, still, POOL, Math.random);
    expect(s.kills).toBe(1); expect(s.score).toBe(300);
  });
  it("combo chia hết cho ba thả vật phẩm; nhặt vật phẩm có tác dụng", () => {
    const s0 = withWave({ combo: 2 });
    const s1 = stepSquadron(aim(s0, correct(s0)), 0.01, still, POOL, () => 0);
    expect(s1.pickups).toHaveLength(1);
    const s2 = stepSquadron({ ...s1, pickups: [{ id: 5, kind: "spread", x: s1.shipX, y: SHIP_Y }] }, 0.01, still, POOL, Math.random);
    expect(s2.spread).toBeGreaterThan(0); expect(s2.got).toBe(1);
  });
  it("tàu bị chặn trong sân và phím ưu tiên hơn chuột", () => {
    let s = initSquadron();
    for (let i = 0; i < 100; i++) s = stepSquadron(s, 0.05, { dir: 1, targetX: 0 }, POOL, Math.random);
    expect(s.shipX).toBeCloseTo(0.94);
  });
  it("hết mạng thì kết thúc, đủ cấp thì lên cấp", () => {
    expect(stepSquadron({ ...withWave(), lives: 0, enemies: [], question: null, waveGap: 9 }, 0.01, still, POOL, Math.random).over).toBe(true);
    expect(levelOf(0)).toBe(1); expect(levelOf(4)).toBe(2);
    expect(fallSpeed(30)).toBeLessThanOrEqual(0.17);
  });
  it("tự mở đợt đầu sau khoảng nghỉ", () => {
    const s = stepSquadron({ ...initSquadron(), waveGap: 0 }, 0.01, still, POOL, Math.random);
    expect(s.question).not.toBeNull(); expect(s.enemies.length).toBeGreaterThanOrEqual(3);
  });
});
