export type HistoryResult = "win" | "loss" | "draw";

/** Một ván đã kết thúc trong lịch sử thi đấu của người xem. */
export interface HistoryEntry {
  roomId: string;
  finishedAt: string;
  song: { videoId: string; title: string } | null;
  opponent: { name: string; avatarUrl: string | null } | null;
  result: HistoryResult;
  /** Ván kết thúc vì có người rời/bỏ đi. */
  forfeit: boolean;
  myScore: number;
  theirScore: number;
  myCorrect: number;
  theirCorrect: number;
}

export interface HistoryStats {
  played: number;
  wins: number;
  losses: number;
  draws: number;
  /** Tỉ lệ thắng 0–100 (làm tròn); 0 khi chưa có ván nào. */
  winRate: number;
}
