import "server-only";
import { createSupabaseServiceClient } from "@/lib/supabase/service-client";
import { historyResult } from "./room-history-logic";
import type { HistoryEntry } from "./room-history-types";

/** Số ván gần nhất đọc cho lịch sử (đủ cho danh sách và thống kê hiện tại; chưa phân trang). */
export const HISTORY_LIMIT = 50;

interface MyRow {
  score: number;
  correct: number;
  joined_at: string;
  rooms: { id: string; video_id: string | null; finished_at: string | null; winner_id: string | null; forfeit: boolean; status: string };
}

/**
 * Lịch sử thi đấu của một người: các ván đã kết thúc gần nhất (mới trước), kèm đối thủ, bài hát, điểm hai bên và kết quả.
 * Chỉ đọc những ván người này tham gia; tên đối thủ lấy từ bản chụp lúc vào phòng, ảnh từ hồ sơ hiện tại.
 */
export async function listRoomHistory(userId: string): Promise<HistoryEntry[]> {
  const sb = createSupabaseServiceClient();
  const { data, error } = await sb.from("room_players")
    .select("score, correct, joined_at, rooms!inner(id, video_id, finished_at, winner_id, forfeit, status)")
    .eq("user_id", userId).eq("rooms.status", "finished")
    .order("joined_at", { ascending: false }).limit(HISTORY_LIMIT);
  if (error) throw new Error(`listRoomHistory: ${error.message}`);
  const mine = (data ?? []) as unknown as MyRow[];
  if (mine.length === 0) return [];

  const roomIds = mine.map((m) => m.rooms.id);
  const videoIds = [...new Set(mine.map((m) => m.rooms.video_id).filter((v): v is string => v !== null))];
  const [{ data: others }, { data: songs }] = await Promise.all([
    sb.from("room_players").select("room_id, user_id, display_name, score, correct").in("room_id", roomIds).neq("user_id", userId),
    videoIds.length ? sb.from("songs").select("video_id, title").in("video_id", videoIds) : Promise.resolve({ data: [] }),
  ]);
  const opponentIds = [...new Set((others ?? []).map((o) => o.user_id as string))];
  const { data: profiles } = opponentIds.length
    ? await sb.from("leaderboard_profiles").select("user_id, avatar_url").in("user_id", opponentIds)
    : { data: [] };
  const avatarByUser = new Map((profiles ?? []).map((p) => [p.user_id as string, p.avatar_url as string | null]));
  const opponentByRoom = new Map((others ?? []).map((o) => [o.room_id as string, o]));
  const titleByVideo = new Map((songs ?? []).map((s) => [s.video_id as string, s.title as string]));

  return mine
    .map((m): HistoryEntry => {
      const opp = opponentByRoom.get(m.rooms.id);
      const videoId = m.rooms.video_id;
      return {
        roomId: m.rooms.id,
        finishedAt: m.rooms.finished_at ?? m.joined_at,
        song: videoId ? { videoId, title: titleByVideo.get(videoId) ?? "" } : null,
        opponent: opp ? { name: opp.display_name as string, avatarUrl: avatarByUser.get(opp.user_id as string) ?? null } : null,
        result: historyResult(m.rooms.winner_id, userId),
        forfeit: m.rooms.forfeit,
        myScore: m.score, theirScore: (opp?.score as number | undefined) ?? 0,
        myCorrect: m.correct, theirCorrect: (opp?.correct as number | undefined) ?? 0,
      };
    })
    .sort((a, b) => Date.parse(b.finishedAt) - Date.parse(a.finishedAt));
}
