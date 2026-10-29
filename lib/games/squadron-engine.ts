import type { GameWord } from "./game-word";
import { makeWave } from "./squadron-wave";
import { BOOM_SECONDS, ENEMY_H, LIVES, SHIP_Y, halfWidth, type Enemy, type PowerKind, type SquadronInput, type SquadronState } from "./squadron-types";

const KILLS_PER_LEVEL = 4;
const FIRE_GAP = 0.25;
const BULLET_SPEED = 1.15;
const KEY_SPEED = 0.9;
const FOLLOW_SPEED = 2.4;
const WAVE_GAP = 0.9;
const PICKUPS: PowerKind[] = ["spread", "shield", "slow"];

export const levelOf = (kills: number): number => 1 + Math.floor(kills / KILLS_PER_LEVEL);
/** Tốc độ rơi của máy bay (phần chiều cao sân mỗi giây), nhanh dần theo cấp. */
export const fallSpeed = (level: number): number => Math.min(0.17, 0.07 + 0.009 * (level - 1));

export const initSquadron = (): SquadronState => ({
  shipX: 0.5, enemies: [], bullets: [], pickups: [], booms: [], question: null, asked: 0, lastHan: "", fire: 0, waveGap: 0.6, spread: 0, slow: 0, shield: false,
  score: 0, combo: 0, bestCombo: 0, kills: 0, wrong: 0, lives: LIVES, level: 1, shake: 0, levelUp: 0, fired: 0, got: 0, missed: [], nextId: 1, over: false,
});

const boom = (s: SquadronState, x: number, y: number, points: number, good: boolean): void => { s.booms.push({ id: s.nextId++, x, y, age: 0, points, good }); };
const noteMissed = (s: SquadronState, w: GameWord): void => { if (!s.missed.some((m) => m.han === w.han)) s.missed.push(w); };
const removeEnemy = (s: SquadronState, e: Enemy): void => { s.enemies = s.enemies.filter((x) => x.id !== e.id); };

/** Mất một mạng; khiên (nếu có) đỡ thay một lần. */
function hurt(s: SquadronState): void {
  if (s.shield) { s.shield = false; s.shake = 0.3; return; }
  s.lives -= 1; s.shake = 0.5;
}

function endWave(s: SquadronState): void { s.question = null; s.waveGap = WAVE_GAP; }

function wrongHit(s: SquadronState, e: Enemy): void {
  boom(s, e.x, e.y, 0, false); removeEnemy(s, e);
  s.combo = 0; s.wrong += 1; s.shake = 0.25;
  if (s.question) noteMissed(s, s.question.answer);
}

function rightKill(s: SquadronState, e: Enemy, rng: () => number): void {
  s.combo += 1; s.kills += 1; s.bestCombo = Math.max(s.bestCombo, s.combo);
  const gain = Math.round(100 * (e.boss ? 3 : 1) * (1 + Math.min(s.combo - 1, 10) * 0.1));
  s.score += gain;
  boom(s, e.x, e.y, gain, true);
  for (const o of s.enemies) if (o.id !== e.id) boom(s, o.x, o.y, 0, true);
  s.enemies = [];
  endWave(s);
  const level = levelOf(s.kills);
  if (level > s.level) s.levelUp = 1.6;
  s.level = level;
  if (s.combo % 3 === 0) s.pickups.push({ id: s.nextId++, kind: PICKUPS[Math.floor(rng() * PICKUPS.length)], x: 0.12 + rng() * 0.76, y: 0 });
}

function moveShip(s: SquadronState, dt: number, input: SquadronInput): void {
  if (input.dir !== 0) s.shipX += input.dir * KEY_SPEED * dt;
  else if (input.targetX !== null) {
    const d = input.targetX - s.shipX;
    s.shipX += Math.sign(d) * Math.min(Math.abs(d), FOLLOW_SPEED * dt);
  }
  s.shipX = Math.min(0.94, Math.max(0.06, s.shipX));
}

function shoot(s: SquadronState): void {
  s.fire = FIRE_GAP; s.fired += 1;
  for (const vx of s.spread > 0 ? [-0.14, 0, 0.14] : [0]) s.bullets.push({ id: s.nextId++, x: s.shipX, y: SHIP_Y - 0.05, vx });
}

function hitEnemies(s: SquadronState, rng: () => number): void {
  const keep = [];
  for (const b of s.bullets) {
    const e = s.enemies.find((o) => Math.abs(b.x - o.x) < halfWidth(o) && b.y > o.y && b.y < o.y + ENEMY_H);
    if (!e) { keep.push(b); continue; }
    if (!e.correct) { wrongHit(s, e); continue; }
    e.hp -= 1; e.flash = 0.12;
    if (e.hp <= 0) rightKill(s, e, rng);
  }
  s.bullets = keep;
}

/** Máy bay chạm đáy hoặc đâm vào tàu: chữ đúng lọt xuống đáy là mất mạng và đợt kết thúc; chữ sai đâm trúng tàu cũng mất mạng; chữ sai lọt xuống đáy thì biến mất. */
function resolveBottom(s: SquadronState): void {
  for (const e of [...s.enemies]) {
    if (!e.correct && e.y + ENEMY_H > SHIP_Y && Math.abs(e.x - s.shipX) < halfWidth(e) + 0.05) { boom(s, e.x, e.y, 0, false); removeEnemy(s, e); hurt(s); continue; }
    if (e.y < SHIP_Y - 0.02) continue;
    removeEnemy(s, e);
    if (!e.correct) continue;
    noteMissed(s, e.word); s.combo = 0; hurt(s);
    for (const o of s.enemies) boom(s, o.x, o.y, 0, false);
    s.enemies = []; endWave(s);
  }
}

function collectPickups(s: SquadronState): void {
  s.pickups = s.pickups.filter((p) => {
    if (Math.abs(p.x - s.shipX) < 0.1 && p.y > SHIP_Y - 0.08 && p.y < 1) {
      if (p.kind === "spread") s.spread = 8; else if (p.kind === "slow") s.slow = 7; else s.shield = true;
      s.got += 1;
      return false;
    }
    return p.y < 1;
  });
}

/** Tiến `dt` giây: tàu bám theo tay điều khiển và chỉ bắn khi người chơi bấm/giữ nút bắn (cách nhau FIRE_GAP giây), đạn bay, máy bay rơi, xử lý trúng đạn / lọt đáy / nhặt vật phẩm, rồi mở đợt mới khi đợt cũ xong. */
export function stepSquadron(state: SquadronState, dt: number, input: SquadronInput, pool: readonly GameWord[], rng: () => number): SquadronState {
  if (state.over) return state;
  const s: SquadronState = {
    ...state,
    enemies: state.enemies.map((e) => ({ ...e, flash: Math.max(0, e.flash - dt) })),
    bullets: state.bullets.map((b) => ({ ...b, x: b.x + b.vx * dt, y: b.y - BULLET_SPEED * dt })).filter((b) => b.y > -0.05 && b.x > -0.05 && b.x < 1.05),
    pickups: state.pickups.map((p) => ({ ...p, y: p.y + 0.2 * dt })),
    booms: state.booms.map((b) => ({ ...b, age: b.age + dt })).filter((b) => b.age < BOOM_SECONDS),
    missed: [...state.missed], fire: state.fire - dt, waveGap: state.waveGap - dt,
    spread: Math.max(0, state.spread - dt), slow: Math.max(0, state.slow - dt), shake: Math.max(0, state.shake - dt), levelUp: Math.max(0, state.levelUp - dt),
  };
  moveShip(s, dt, input);
  if (input.fire && s.fire <= 0) shoot(s);
  const speed = fallSpeed(s.level) * (s.slow > 0 ? 0.5 : 1) * dt;
  for (const e of s.enemies) e.y += e.boss ? speed * 0.7 : speed;
  hitEnemies(s, rng);
  resolveBottom(s);
  collectPickups(s);
  if (s.lives <= 0) { s.over = true; return s; }
  if (!s.question && s.waveGap <= 0) {
    const wave = makeWave(pool, rng, s.asked, s.lastHan, s.nextId);
    if (wave) { s.question = wave.question; s.enemies = wave.enemies; s.nextId = wave.nextId; s.asked += 1; s.lastHan = wave.question.answer.han; }
  }
  return s;
}
