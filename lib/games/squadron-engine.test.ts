import { describe, expect, it } from "vitest";
import type { GameWord } from "./game-word";
import { fallSpeed, initSquadron, levelOf, stepSquadron } from "./squadron-engine";
import { SHIP_Y, type Enemy, type SquadronState } from "./squadron-types";
import { confusability, makeWave } from "./squadron-wave";

const POOL: GameWord[] = ["猫:māo:con mèo", "狗:gǒu:con chó", "鱼:yú:con cá", "鸟:niǎo:con chim", "水:shuǐ:nước", "火:huǒ:lửa", "山:shān:núi", "人:rén:người"].map((l) => { const [han, pinyin, meaning] = l.split(":"); return { han, pinyin, meaning }; });
const still = { dir: 0 as const, targetX: null, fire: false };
const seq = (vals: number[]) => { let i = 0; return () => vals[i++ % vals.length]; };

function withWave(extra: Partial<SquadronState> = {}): SquadronState {
  const w = makeWave(POOL, seq([0.9, 0.1, 0.3, 0.6]), 0, "", 1)!;
  return { ...initSquadron(), question: w.question, enemies: w.enemies.map((e) => ({ ...e, y: 0.3 })), nextId: w.nextId, asked: 1, fire: 99, waveGap: 9, ...extra };
}
const withMistakeSetup = () => withWave({ combo: 4, score: 500 });
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
  it("bắn nhầm: trừ điểm, mất combo, chỉ đáp án đúng, chưa mất mạng", () => {
    const s0 = withMistakeSetup();
    const wrong = s0.enemies.find((e) => !e.correct)!;
    const s = stepSquadron(aim(s0, wrong), 0.01, still, POOL, Math.random);
    expect(s.combo).toBe(0); expect(s.wrong).toBe(1); expect(s.lives).toBe(3); expect(s.strikes).toBe(1);
    expect(s.score).toBe(450); expect(s.revealLeft).toBeGreaterThan(2);
    expect(s.missed.map((m) => m.han)).toContain(s.question!.answer.han);
  });
  it("điểm không âm khi bị trừ", () => {
    const s0 = withWave({ score: 20 });
    expect(stepSquadron(aim(s0, s0.enemies.find((e) => !e.correct)!), 0.01, still, POOL, Math.random).score).toBe(0);
  });
  it("nhầm ba lần trong một đợt thì mất một mạng; khiên đỡ; sang đợt mới thì đếm lại", () => {
    const run = (extra: Partial<SquadronState>) => {
      let s = withWave(extra);
      for (const w of s.enemies.filter((e) => !e.correct)) s = stepSquadron(aim(s, s.enemies.find((e) => e.id === w.id)!), 0.001, still, POOL, Math.random);
      return s;
    };
    const lost = run({});
    expect(lost.wrong).toBe(3); expect(lost.lives).toBe(2); expect(lost.strikes).toBe(0);
    const shielded = run({ shield: true });
    expect(shielded.lives).toBe(3); expect(shielded.shield).toBe(false);
    const after = withWave({ strikes: 2 });
    expect(stepSquadron(aim(after, correct(after)), 0.01, still, POOL, Math.random).strikes).toBe(0);
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
  it("combo chia hết cho năm thả vật phẩm; nhặt vật phẩm có tác dụng", () => {
    const s0 = withWave({ combo: 4 });
    const s1 = stepSquadron(aim(s0, correct(s0)), 0.01, still, POOL, () => 0);
    expect(s1.pickups).toHaveLength(1);
    const s2 = stepSquadron({ ...s1, pickups: [{ id: 5, kind: "spread", x: s1.shipX, y: SHIP_Y }] }, 0.01, still, POOL, Math.random);
    expect(s2.spread).toBeGreaterThan(0); expect(s2.got).toBe(1);
  });
  it("tàu bị chặn trong sân và phím ưu tiên hơn chuột", () => {
    let s = initSquadron();
    for (let i = 0; i < 100; i++) s = stepSquadron(s, 0.05, { dir: 1, targetX: 0, fire: false }, POOL, Math.random);
    expect(s.shipX).toBeCloseTo(0.94);
  });
  it("hết mạng thì kết thúc, đủ cấp thì lên cấp", () => {
    expect(stepSquadron({ ...withWave(), lives: 0, enemies: [], question: null, waveGap: 9 }, 0.01, still, POOL, Math.random).over).toBe(true);
    expect(levelOf(0)).toBe(1); expect(levelOf(3)).toBe(2);
    expect(fallSpeed(30)).toBeLessThanOrEqual(0.3);
  });
  it("chỉ bắn khi bấm nút, và cách nhau một nhịp", () => {
    const idle = stepSquadron({ ...initSquadron(), waveGap: 9 }, 0.1, still, POOL, Math.random);
    expect(idle.bullets).toHaveLength(0); expect(idle.fired).toBe(0);
    const shot = stepSquadron({ ...initSquadron(), waveGap: 9 }, 0.01, { ...still, fire: true }, POOL, Math.random);
    expect(shot.bullets).toHaveLength(1); expect(shot.fired).toBe(1);
    const held = stepSquadron(shot, 0.01, { ...still, fire: true }, POOL, Math.random);
    expect(held.fired).toBe(1);
    expect(stepSquadron(held, 0.3, { ...still, fire: true }, POOL, Math.random).fired).toBe(2);
  });
  it("tự mở đợt đầu sau khoảng nghỉ", () => {
    const s = stepSquadron({ ...initSquadron(), waveGap: 0 }, 0.01, still, POOL, Math.random);
    expect(s.question).not.toBeNull(); expect(s.enemies.length).toBeGreaterThanOrEqual(3);
  });
});

describe("độ khó", () => {
  it("tốc độ rơi tăng theo cấp và có trần", () => {
    expect(fallSpeed(5)).toBeGreaterThan(fallSpeed(1));
    expect(fallSpeed(99)).toBeLessThanOrEqual(0.3);
    expect(fallSpeed(1)).toBeGreaterThanOrEqual(0.1);
  });
  it("từ cấp 4 mỗi đợt có 5 máy bay, cấp đầu 4", () => {
    expect(makeWave(POOL, seq([0.3, 0.5, 0.7]), 0, "", 1, 1)!.enemies).toHaveLength(4);
    expect(makeWave(POOL, seq([0.3, 0.5, 0.7]), 0, "", 1, 4)!.enemies.length).toBeGreaterThanOrEqual(4);
  });
  it("độ dễ nhầm: cùng pinyin không dấu và chung chữ Hán cao hơn chữ không liên quan", () => {
    const mk = (han: string, pinyin: string): GameWord => ({ han, pinyin, meaning: han });
    const ans = mk("图书", "tú shū");
    expect(confusability(ans, mk("土书", "tǔ shū"))).toBeGreaterThan(confusability(ans, mk("大", "dà")));
    expect(confusability(ans, mk("图书馆", "tú shū guǎn"))).toBeGreaterThan(confusability(ans, mk("水果", "shuǐ guǒ")));
  });
});

