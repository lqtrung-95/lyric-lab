export type RoomStatus = "waiting" | "playing" | "finished" | "expired";

/** Một người trong phòng, đúng những gì client được biết về họ (không có id tài khoản). */
export interface RoomPlayerView {
  displayName: string;
  ready: boolean;
  isHost: boolean;
  isMe: boolean;
  /** Đã rời phòng (chỉ có ý nghĩa khi phòng đang chơi hoặc đã kết thúc). */
  left: boolean;
}

export interface RoomSongView {
  videoId: string;
  title: string;
  channelTitle: string;
}

/** Trạng thái phòng gửi cho client của một thành viên. */
export interface RoomView {
  code: string;
  status: RoomStatus;
  /** Null khi chủ phòng chọn "Ngẫu nhiên" và ván chưa bắt đầu. */
  song: RoomSongView | null;
  questionCount: number;
  expiresAt: string;
  players: RoomPlayerView[];
}

/** Kết quả hàm SQL `join_room`. */
export type JoinRoomResult = "ok" | "not_found" | "expired" | "full" | "not_waiting";
/** Kết quả hàm SQL `start_room`. */
export type StartRoomResult = "ok" | "no_song" | "song_unusable" | "not_found" | "not_host" | "not_waiting" | "expired" | "need_two" | "not_ready";

/** Kết quả hàm SQL `submit_room_answer` (trường `result`). */
export type AnswerFailure = "not_playing" | "not_in_room" | "no_question" | "not_open" | "closed" | "already_answered";

export interface AnswerFeedback {
  correct: boolean;
  points: number;
  elapsedMs: number;
  /** Chỉ số đáp án đúng trong `choices` của câu, để hiện ngay sau khi người này đã trả lời. */
  correctIndex: number;
}
