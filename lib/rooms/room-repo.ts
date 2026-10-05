import "server-only";
import { EXPLAIN_LANG, LEARN_LANG } from "@/lib/analysis/analyze-video";
import { PROMPT_VERSION } from "@/lib/analysis/build-analysis-prompt";
import { simplifyDeep } from "@/lib/analysis/simplify-analysis";
import { createSupabaseServiceClient } from "@/lib/supabase/service-client";
import { generateRoomCode } from "./room-code";
import type { JoinRoomResult, RoomStatus, RoomView, StartRoomResult } from "./room-types";

export type RoomErrorCode = "invalid_song" | "code_unavailable";

export class RoomError extends Error {
  constructor(public readonly code: RoomErrorCode) {
    super(code);
    this.name = "RoomError";
  }
}

interface RoomRow {
  id: string;
  code: string;
  status: RoomStatus;
  host_id: string | null;
  video_id: string | null;
  question_count: number;
  expires_at: string;
}

const ROOM_COLUMNS = "id, code, status, host_id, video_id, question_count, expires_at";
const CODE_ATTEMPTS = 5;
const UNIQUE_VIOLATION = "23505";

/** Bài đã có phân tích ở phiên bản hiện hành (mới chọn được cho phòng; bài chưa phân tích không có dữ liệu để ra câu hỏi). */
export async function isAnalyzedSong(videoId: string): Promise<boolean> {
  const { count } = await createSupabaseServiceClient().from("song_analyses")
    .select("video_id", { count: "exact", head: true })
    .eq("video_id", videoId).eq("learn_lang", LEARN_LANG).eq("explain_lang", EXPLAIN_LANG).eq("prompt_version", PROMPT_VERSION);
  return (count ?? 0) > 0;
}

/** Chọn ngẫu nhiên một bài đang hiện ở Khám phá (đã phân tích, chưa bị báo sai nhiều). Null khi chưa có bài nào. */
export async function pickRandomSong(): Promise<string | null> {
  const { data } = await createSupabaseServiceClient().from("discover_songs").select("video_id").limit(100);
  const ids = (data ?? []).map((r) => r.video_id as string);
  return ids.length ? ids[Math.floor(Math.random() * ids.length)] : null;
}

/** Tạo phòng và đưa chủ phòng vào. Trả mã phòng. Thử lại với mã khác khi trùng một phòng còn hiệu lực. */
export async function createRoom(userId: string, displayName: string, videoId: string | null): Promise<string> {
  if (videoId && !(await isAnalyzedSong(videoId))) throw new RoomError("invalid_song");
  const sb = createSupabaseServiceClient();
  for (let attempt = 0; attempt < CODE_ATTEMPTS; attempt++) {
    const code = generateRoomCode();
    const { error } = await sb.rpc("create_room", { p_host: userId, p_code: code, p_video: videoId, p_name: displayName });
    if (!error) return code;
    if (error.code !== UNIQUE_VIOLATION) throw new Error(`create_room: ${error.message}`);
  }
  throw new RoomError("code_unavailable");
}

export async function joinRoom(userId: string, code: string, displayName: string): Promise<JoinRoomResult> {
  const { data, error } = await createSupabaseServiceClient().rpc("join_room", { p_code: code, p_user: userId, p_name: displayName });
  if (error) throw new Error(`join_room: ${error.message}`);
  return data as JoinRoomResult;
}

/** Phòng mới nhất mang mã này mà người dùng từng ở trong (mã được dùng lại sau khi phòng cũ kết thúc). Null nếu không phải thành viên. */
async function findMemberRoom(userId: string, code: string): Promise<RoomRow | null> {
  const { data, error } = await createSupabaseServiceClient().from("room_players")
    .select(`joined_at, rooms!inner(${ROOM_COLUMNS})`)
    .eq("user_id", userId).eq("rooms.code", code)
    .order("joined_at", { ascending: false }).limit(1);
  if (error) throw new Error(`findMemberRoom: ${error.message}`);
  const row = (data as unknown as { rooms: RoomRow }[] | null)?.[0];
  return row?.rooms ?? null;
}

export async function leaveRoom(userId: string, code: string): Promise<void> {
  const room = await findMemberRoom(userId, code);
  if (!room) return;
  const { error } = await createSupabaseServiceClient().rpc("leave_room", { p_room: room.id, p_user: userId });
  if (error) throw new Error(`leave_room: ${error.message}`);
}

/** Đặt sẵn sàng. False nếu không ở trong phòng hoặc phòng không còn chờ. */
export async function setReady(userId: string, code: string, ready: boolean): Promise<boolean> {
  const room = await findMemberRoom(userId, code);
  if (!room) return false;
  const { data, error } = await createSupabaseServiceClient().rpc("set_room_ready", { p_room: room.id, p_user: userId, p_ready: ready });
  if (error) throw new Error(`set_room_ready: ${error.message}`);
  return data === true;
}

export async function startRoom(userId: string, code: string): Promise<StartRoomResult> {
  const room = await findMemberRoom(userId, code);
  if (!room) return "not_found";
  let videoId: string | null = null;
  if (!room.video_id) {
    videoId = await pickRandomSong();
    if (!videoId) return "no_song";
  }
  const { data, error } = await createSupabaseServiceClient().rpc("start_room", { p_room: room.id, p_host: userId, p_video: videoId });
  if (error) throw new Error(`start_room: ${error.message}`);
  return data as StartRoomResult;
}

/** Trạng thái phòng cho một thành viên; null nếu phòng không tồn tại hoặc người này không ở trong phòng (không lộ phòng của người khác). */
export async function getRoomView(userId: string, code: string): Promise<RoomView | null> {
  const room = await findMemberRoom(userId, code);
  if (!room) return null;
  const sb = createSupabaseServiceClient();
  const [{ data: players }, { data: song }] = await Promise.all([
    sb.from("room_players").select("user_id, display_name, ready, left_at").eq("room_id", room.id).order("joined_at"),
    room.video_id
      ? sb.from("songs").select("video_id, title, channel_title").eq("video_id", room.video_id).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);
  // Phòng chờ quá hạn nhưng chưa ai chạm vào để đánh dấu: báo hết hạn cho người xem.
  const status: RoomStatus = room.status === "waiting" && Date.parse(room.expires_at) < Date.now() ? "expired" : room.status;
  return {
    code: room.code,
    status,
    song: song ? simplifyDeep({ videoId: song.video_id, title: song.title, channelTitle: song.channel_title }) : null,
    questionCount: room.question_count,
    expiresAt: room.expires_at,
    players: (players ?? []).map((p) => ({
      displayName: p.display_name,
      ready: p.ready,
      isHost: p.user_id === room.host_id,
      isMe: p.user_id === userId,
      left: p.left_at !== null,
    })),
  };
}
