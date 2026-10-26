import "server-only";
import { CASES } from "@/lib/explore/story/cases";
import { countSolvedCases } from "@/lib/explore/story/solved-cases";
import { createSupabaseServiceClient } from "@/lib/supabase/service-client";
import type { RawActivity } from "./aggregate-activity";
import type { QuestClaimRow } from "./build-game-summary";
import type { BadgeTier, EarnedBadge } from "./game-types";

const DEFAULT_TIMEZONE = "Asia/Ho_Chi_Minh";
/** Tối đa dòng đọc mỗi bảng (mới nhất trước). Tổng XP chỉ đúng trong phạm vi này; đủ nhiều tháng học đều đặn. */
const MAX_ROWS = 20_000;

type Sb = ReturnType<typeof createSupabaseServiceClient>;
/** Lỗi đọc (kể cả bảng chưa có vì migration chưa chạy) coi như không có dữ liệu: game vẫn trả kết quả, không 500. */
const rows = <T>(res: { data: T[] | null; error: unknown }): T[] => (res.error ? [] : (res.data ?? []));

export interface GameData {
  timeZone: string;
  raw: RawActivity;
  learnedWords: number;
  /** Số bài kiểm tra cuối cấp HSK đã hoàn thành. */
  levelsCompleted: number;
  casesSolved?: number;
  hardCasesSolved?: number;
  claims: QuestClaimRow[];
  storedBadges: EarnedBadge[];
  frozenDays: string[];
}

async function loadRoomRows(sb: Sb, userId: string): Promise<RawActivity["rooms"]> {
  const players = rows(await sb.from("room_players").select("room_id,correct").eq("user_id", userId).gte("correct", 1).limit(MAX_ROWS));
  if (!players.length) return [];
  const ids = players.map((p) => p.room_id as string);
  const out: RawActivity["rooms"] = [];
  // Chia lô: danh sách id dài làm URL quá dài.
  for (let i = 0; i < ids.length; i += 200) {
    const rs = rows(await sb.from("rooms").select("id,winner_id,finished_at,forfeit").in("id", ids.slice(i, i + 200)).eq("status", "finished").not("finished_at", "is", null));
    for (const r of rs) out.push({ at: r.finished_at as string, won: r.winner_id === userId });
  }
  return out;
}

/** Đọc mọi dữ liệu game của một người dùng. Mỗi bảng đọc độc lập và chịu được thiếu bảng. */
export async function loadGameData(userId: string): Promise<GameData> {
  const sb = createSupabaseServiceClient();
  const [profile, logs, scores, songs, units, learned, claims, badges, freezes, rooms, finals, story] = await Promise.all([
    sb.from("user_profiles").select("timezone").eq("user_id", userId).maybeSingle(),
    sb.from("review_logs").select("reviewed_at").eq("user_id", userId).order("reviewed_at", { ascending: false }).limit(MAX_ROWS),
    sb.from("practice_scores").select("played_at,mode,correct,total").eq("user_id", userId).order("played_at", { ascending: false }).limit(MAX_ROWS),
    sb.from("user_song_progress").select("updated_at,completed").eq("user_id", userId).order("updated_at", { ascending: false }).limit(MAX_ROWS),
    sb.from("user_unit_progress").select("completed_at,best_score").eq("user_id", userId).eq("status", "completed").not("completed_at", "is", null).limit(MAX_ROWS),
    sb.from("user_cards").select("item_key", { count: "exact", head: true }).eq("user_id", userId).gt("reps", 0),
    sb.from("user_quest_claims").select("quest_id,reward_xp,freeze_granted,claimed_at").eq("user_id", userId).limit(MAX_ROWS),
    sb.from("user_badges").select("badge_id,tier,earned_at").eq("user_id", userId).limit(1000),
    sb.from("user_streak_freezes").select("day").eq("user_id", userId).limit(1000),
    loadRoomRows(sb, userId),
    // Bài kiểm tra cuối cấp = chặng loại ôn tập `final` đã hoàn thành (nối sang course_units để đọc loại chặng).
    sb.from("user_unit_progress").select("unit_id,course_units!inner(content)", { count: "exact", head: true }).eq("user_id", userId).eq("status", "completed").eq("course_units.content->>variant", "final"),
    // Vụ án đã giải nằm trong khối `story` đồng bộ tài khoản (chưa có bảng hoặc chưa đồng bộ thì là 0).
    sb.from("user_explore_state").select("data").eq("user_id", userId).eq("kind", "story").maybeSingle(),
  ]);
  const solved = countSolvedCases(story.data?.data, CASES);
  return {
    timeZone: profile.data?.timezone ?? DEFAULT_TIMEZONE,
    raw: {
      reviews: rows(logs).map((r) => ({ at: r.reviewed_at as string })),
      rounds: rows(scores).map((r) => ({ at: r.played_at as string, mode: r.mode as string, correct: r.correct as number, total: r.total as number })),
      songs: rows(songs).map((r) => ({ at: r.updated_at as string, completed: r.completed === true })),
      units: rows(units).map((r) => ({ at: r.completed_at as string, bestScore: r.best_score as number })),
      rooms,
    },
    learnedWords: learned.count ?? 0,
    levelsCompleted: finals.count ?? 0,
    casesSolved: solved.solved,
    hardCasesSolved: solved.hardSolved,
    claims: rows(claims).map((r) => ({ questId: r.quest_id as string, rewardXp: r.reward_xp as number, freezeGranted: r.freeze_granted === true, claimedAt: r.claimed_at as string })),
    storedBadges: rows(badges).map((r) => ({ id: r.badge_id as string, tier: r.tier as BadgeTier, earnedAt: r.earned_at as string })),
    frozenDays: rows(freezes).map((r) => r.day as string),
  };
}

/** Ghi huy hiệu mới; trùng khóa thì bỏ qua (idempotent). Trả false nếu lỗi (vd. bảng chưa có). */
export async function saveBadges(userId: string, fresh: { id: string; tier: BadgeTier }[], now: Date): Promise<boolean> {
  if (!fresh.length) return true;
  const { error } = await createSupabaseServiceClient().from("user_badges")
    .upsert(fresh.map((b) => ({ user_id: userId, badge_id: b.id, tier: b.tier, earned_at: now.toISOString() })), { onConflict: "user_id,badge_id,tier", ignoreDuplicates: true });
  return !error;
}

/** Ghi ngày đóng băng; trùng thì bỏ qua. */
export async function saveFrozenDays(userId: string, days: string[]): Promise<boolean> {
  if (!days.length) return true;
  const { error } = await createSupabaseServiceClient().from("user_streak_freezes")
    .upsert(days.map((day) => ({ user_id: userId, day })), { onConflict: "user_id,day", ignoreDuplicates: true });
  return !error;
}

/** Ghi lần nhận thưởng. Trả "claimed" lần đầu, "duplicate" nếu đã nhận trước đó, "error" nếu không ghi được (vd. bảng chưa có). */
export async function insertQuestClaim(userId: string, row: { questId: string; kind: string; rewardXp: number; freezeGranted: boolean }): Promise<"claimed" | "duplicate" | "error"> {
  const { error } = await createSupabaseServiceClient().from("user_quest_claims")
    .insert({ user_id: userId, quest_id: row.questId, kind: row.kind, reward_xp: row.rewardXp, freeze_granted: row.freezeGranted });
  if (!error) return "claimed";
  return error.code === "23505" ? "duplicate" : "error";
}
