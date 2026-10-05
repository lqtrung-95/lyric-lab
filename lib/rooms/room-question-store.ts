import "server-only";
import { readCachedAnalysis } from "@/lib/analysis/server-deps";
import { createSupabaseServiceClient } from "@/lib/supabase/service-client";
import { toTraditionalChinese } from "@/lib/text/to-traditional-chinese";
import { buildRoomQuestions } from "./build-room-questions";
import type { RoomQuestionSet } from "./room-question-types";
import { hanCharsForHint, sinoVietLineHint } from "./room-sino-viet-hint";

/** Gắn gợi ý Hán-Việt của dòng (một lần tra bảng cho cả bộ câu). Thiếu âm thì để null, câu hỏi vẫn dùng được. */
async function withSinoVietHints(set: RoomQuestionSet): Promise<RoomQuestionSet> {
  const chars = hanCharsForHint(set.questions.flatMap((q) => [q.before, q.after]), toTraditionalChinese);
  if (chars.length === 0) return set;
  const { data } = await createSupabaseServiceClient().from("dict_hanzi_sino_viet").select("hanzi,readings").in("hanzi", chars);
  const readings = new Map((data ?? []).map((r) => [r.hanzi as string, r.readings as string[]]));
  return {
    ...set,
    questions: set.questions.map((q) => ({ ...q, sinoVietHint: sinoVietLineHint(q.before, q.after, readings, toTraditionalChinese) })),
  };
}

/** Dựng bộ câu hỏi cho một bài từ phân tích đang dùng. Null khi bài chưa phân tích hoặc không đủ dữ liệu cho `count` câu. */
export async function prepareRoomQuestions(videoId: string, seed: number, count: number): Promise<RoomQuestionSet | null> {
  const analysis = await readCachedAnalysis(videoId);
  const set = analysis ? buildRoomQuestions(analysis, seed, count) : null;
  return set ? withSinoVietHints(set) : null;
}

/** Bài có chọn được cho phòng không (đã phân tích và đủ dữ liệu để ra `count` câu). Không tra Hán-Việt vì chỉ cần kiểm tra. */
export async function canPlayRoomSong(videoId: string, count: number): Promise<boolean> {
  const analysis = await readCachedAnalysis(videoId);
  return analysis !== null && buildRoomQuestions(analysis, 1, count) !== null;
}

/** Lưu bộ câu hỏi của phòng (thay bộ cũ nếu có): câu công khai ở `room_questions`, đáp án đúng ở `room_question_keys`. */
export async function saveRoomQuestions(roomId: string, set: RoomQuestionSet): Promise<void> {
  const sb = createSupabaseServiceClient();
  await deleteRoomQuestions(roomId);
  const { error } = await sb.from("room_questions").insert(set.questions.map((payload, idx) => ({ room_id: roomId, idx, payload })));
  if (error) throw new Error(`room_questions: ${error.message}`);
  const { error: keyError } = await sb.from("room_question_keys").insert(
    set.correctIndexes.map((correct_index, idx) => ({ room_id: roomId, idx, correct_index, correct_term: set.correctTerms[idx] })),
  );
  if (keyError) throw new Error(`room_question_keys: ${keyError.message}`);
}

export async function deleteRoomQuestions(roomId: string): Promise<void> {
  await createSupabaseServiceClient().from("room_questions").delete().eq("room_id", roomId);
}
