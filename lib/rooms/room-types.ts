import type { RoomQuestionPublic } from "./room-question-types";

export type RoomStatus = "waiting" | "playing" | "finished" | "expired";

/** Một người trong phòng, đúng những gì client được biết về họ (không có id tài khoản). */
export interface RoomPlayerView {
  displayName: string;
  /** Ảnh đại diện của tài khoản (cùng ảnh ở Cài đặt và bảng xếp hạng); null = dùng chữ cái đầu. */
  avatarUrl: string | null;
  ready: boolean;
  isHost: boolean;
  isMe: boolean;
  /** Đã rời phòng (bỏ cuộc, rớt mạng quá lâu hoặc rời ván). */
  left: boolean;
  /** Điểm và số câu đúng đã công bố: chỉ cập nhật khi một câu đóng, để không lộ đúng/sai của người kia trước khi mình trả lời. */
  score: number;
  correct: number;
  /** Đã trả lời câu hiện tại chưa (không lộ lựa chọn hay đúng/sai). */
  answered: boolean;
  /** Thời gian người này trả lời câu gần nhất (ms), hiện kiểu "Minh vừa chọn đáp án sau 2,4s". */
  lastAnswerMs: number | null;
}

export interface RoomSongView {
  videoId: string;
  title: string;
  channelTitle: string;
}

/** Câu trả lời của chính người xem cho câu hiện tại. */
export interface MyAnswerView {
  choice: number;
  correct: boolean;
  points: number;
  elapsedMs: number;
}

/** Câu hỏi đang diễn ra (hoặc vừa đóng, chờ sang câu kế). */
export interface CurrentQuestionView {
  index: number;
  payload: RoomQuestionPublic;
  /** Mốc giờ server mở câu và hạn trả lời (ISO). Client so với `serverNow` để không phụ thuộc đồng hồ máy. */
  opensAt: string;
  deadlineAt: string;
  myAnswer: MyAnswerView | null;
  /** Chỉ số đáp án đúng: chỉ có sau khi người xem đã trả lời hoặc câu đã đóng. */
  correctIndex: number | null;
}

/** Thông tin để lưu từ của câu thành thẻ ôn (lấy từ đáp án đúng của câu, chỉ có khi ván đã kết thúc). */
export interface RoundCard {
  term: string;
  reading: string | null;
  sinoViet: string | null;
  meaning: string;
  videoId: string;
  /** Dòng lời chứa từ và thời điểm bắt đầu dòng (giây), để thẻ nghe lại đúng đoạn. */
  lineIndex: number;
  start: number;
}

/** Tổng kết một câu, chỉ có khi ván đã kết thúc. */
export interface RoundSummary {
  index: number;
  correctTerm: string;
  translation: string | null;
  card: RoundCard | null;
  mine: MyAnswerView | null;
  theirs: { correct: boolean; points: number; elapsedMs: number } | null;
}

/** Trạng thái phòng gửi cho client của một thành viên. */
export interface RoomView {
  /** Id phòng (UUID): client dùng làm bộ lọc Realtime; vô hại vì chỉ thành viên đọc được phòng. */
  id: string;
  code: string;
  status: RoomStatus;
  /** Null khi chủ phòng chọn "Ngẫu nhiên" và ván chưa bắt đầu. */
  song: RoomSongView | null;
  questionCount: number;
  expiresAt: string;
  /** Giờ server lúc trả lời (ISO), để client tính độ lệch đồng hồ. */
  serverNow: string;
  /** Phòng cho hiện nghĩa dòng lời ngay khi câu đang mở (mặc định ẩn cho tới khi trả lời). */
  showTranslation: boolean;
  players: RoomPlayerView[];
  currentQuestion: CurrentQuestionView | null;
  /** Chỉ có khi ván đã kết thúc. */
  winner: "me" | "opponent" | "draw" | null;
  /** Ván kết thúc vì có người rời/bỏ đi. */
  forfeit: boolean;
  rounds: RoundSummary[] | null;
}

/** Kết quả hàm SQL `join_room`. */
export type JoinRoomResult = "ok" | "not_found" | "expired" | "full" | "not_waiting";
/** Kết quả hàm SQL `start_room`. */
export type StartRoomResult = "ok" | "no_song" | "song_unusable" | "no_questions" | "not_found" | "not_host" | "not_waiting" | "expired" | "need_two" | "not_ready";

/** Kết quả hàm SQL `submit_room_answer` (trường `result`). */
export type AnswerFailure = "not_playing" | "not_in_room" | "no_question" | "not_open" | "closed" | "already_answered";

export interface AnswerFeedback {
  correct: boolean;
  points: number;
  elapsedMs: number;
  /** Chỉ số đáp án đúng trong `choices` của câu, để hiện ngay sau khi người này đã trả lời. */
  correctIndex: number;
}

/** Kết quả hàm SQL `advance_room` (trường `result`). */
export type AdvanceResult = "advanced" | "finished" | "not_ready" | "not_playing";
