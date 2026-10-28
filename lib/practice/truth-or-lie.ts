import { TRUTH_ROUNDS, type Statement, type TruthRound } from "./truth-or-lie-data";

export interface Trial { topic: string; options: (Statement & { lie: boolean })[]; lieIndex: number; explain: string }

/** Xáo trộn Fisher–Yates (không sửa mảng gốc). */
function shuffle<T>(items: readonly T[], rng: () => number): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Chọn `n` vòng khác nhau ngẫu nhiên. */
export const pickRounds = (n: number, rng: () => number = Math.random, rounds: readonly TruthRound[] = TRUTH_ROUNDS): TruthRound[] => shuffle(rounds, rng).slice(0, Math.min(n, rounds.length));

/** Dựng một lượt chơi: ba câu xáo trộn, biết câu sai nằm ở vị trí nào. */
export function buildTrial(round: TruthRound, rng: () => number = Math.random): Trial {
  const options = shuffle([...round.truths.map((s) => ({ ...s, lie: false })), { ...round.lie, lie: true }], rng);
  return { topic: round.topic, options, lieIndex: options.findIndex((o) => o.lie), explain: round.explain };
}
