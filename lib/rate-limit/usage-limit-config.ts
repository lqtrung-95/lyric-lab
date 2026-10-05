export type UsageKind = "analyze" | "explain" | "tts" | "score" | "room" | "room_join";

// Hạn mức trong 24 giờ theo tài khoản. Phân tích bài mới theo PRD §7; giải nghĩa từ bằng LLM tốn ít hơn nên cho nhiều hơn.
const LIMITS: Record<UsageKind, { anonymous: number; member: number }> = {
  analyze: { anonymous: 10, member: 30 },
  explain: { anonymous: 60, member: 200 },
  // Chỉ tính lần tổng hợp giọng MỚI (file đã lưu phát lại không tốn hạn mức); gói Azure miễn phí có trần ký tự hàng tháng.
  tts: { anonymous: 80, member: 250 },
  // Số lượt chơi gửi điểm cho bảng xếp hạng, đếm trong 1 GIỜ (xem usageWindowHours bên dưới).
  score: { anonymous: 40, member: 40 },
  // Tạo phòng thi đấu (mỗi phòng giữ một mã 6 số trong vài phút) và số lần thử vào phòng bằng mã trong 1 GIỜ (chống đoán mã).
  room: { anonymous: 10, member: 30 },
  room_join: { anonymous: 30, member: 60 },
};

const WINDOW_HOURS: Record<UsageKind, number> = { analyze: 24, explain: 24, tts: 24, score: 1, room: 24, room_join: 1 };

/** Cửa sổ đếm (giờ) của từng loại: điểm luyện tập tính theo giờ, còn lại theo 24 giờ. */
export const usageWindowHours = (kind: UsageKind): number => WINDOW_HOURS[kind];

export function usageLimit(kind: UsageKind, isAnonymous: boolean): number {
  return isAnonymous ? LIMITS[kind].anonymous : LIMITS[kind].member;
}
