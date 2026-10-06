import type { HistoryResult, HistoryStats } from "./room-history-types";

/** Kết quả của người xem: `winnerId` null là hòa. */
export function historyResult(winnerId: string | null, me: string): HistoryResult {
  return winnerId === null ? "draw" : winnerId === me ? "win" : "loss";
}

export function summarizeHistory(results: HistoryResult[]): HistoryStats {
  const wins = results.filter((r) => r === "win").length;
  const losses = results.filter((r) => r === "loss").length;
  const draws = results.length - wins - losses;
  return { played: results.length, wins, losses, draws, winRate: results.length === 0 ? 0 : Math.round((wins / results.length) * 100) };
}
