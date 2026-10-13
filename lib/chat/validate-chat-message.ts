import { containsChatProfanity } from "./chat-profanity";

export const CHAT_MAX_CHARS = 500;
export type ChatBodyError = "empty" | "too_long" | "has_link" | "inappropriate" | "spam";

// Link và địa chỉ web (kể cả không có http): chặn với người dùng thường để tránh quảng cáo và lừa đảo; quản trị viên được gửi link.
const LINK = /(https?:\/\/|www\.|[a-z0-9-]+\.(com|net|org|vn|io|me|xyz|cc|ly|gg|tv|info|biz|top|site|online|app|co)(\/|\b))/i;
// Lặp một ký tự liên tiếp quá nhiều ("aaaaaaaaaa", "!!!!!!!!!!") hay cùng một từ lặp nhiều lần là dấu hiệu spam.
const REPEATED_CHAR = /(.)\1{9,}/u;
const REPEATED_WORD = /\b(\S+)(\s+\1){5,}/iu;

/** Gọn khoảng trắng: giữ tối đa một dòng trống, bỏ khoảng trắng thừa ở đầu/cuối và trước ngắt dòng. */
export function normalizeChatBody(input: string): string {
  return input.normalize("NFC").replace(/\r\n?/g, "\n").replace(/[ \t]+/g, " ").replace(/ ?\n ?/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}

/** Kiểm tra nội dung tin (đã chuẩn hóa); trả lỗi đầu tiên hoặc null. `isAdmin` được gửi link. */
export function validateChatBody(body: string, isAdmin = false): ChatBodyError | null {
  if (!body) return "empty";
  if ([...body].length > CHAT_MAX_CHARS) return "too_long";
  if (!isAdmin && LINK.test(body)) return "has_link";
  if (containsChatProfanity(body)) return "inappropriate";
  if (REPEATED_CHAR.test(body) || REPEATED_WORD.test(body)) return "spam";
  return null;
}

export const CHAT_ERROR_MESSAGES: Record<ChatBodyError | "nickname_required" | "rate_limited" | "blocked" | "duplicate" | "auth_required" | "server_error" | "network", string> = {
  empty: "Hãy nhập nội dung tin nhắn.",
  too_long: `Tin nhắn tối đa ${CHAT_MAX_CHARS} ký tự.`,
  has_link: "Chưa gửi được link hay địa chỉ web trong cộng đồng. Hãy mô tả bằng lời nhé.",
  inappropriate: "Tin nhắn có từ chưa phù hợp. Hãy nói nhẹ nhàng hơn nhé.",
  spam: "Tin nhắn có vẻ lặp lại quá nhiều. Hãy viết gọn lại nhé.",
  nickname_required: "Hãy đặt biệt danh trước khi nhắn tin.",
  rate_limited: "Bạn gửi hơi nhanh rồi, đợi một chút rồi gửi tiếp nhé.",
  blocked: "Bạn hiện không thể gửi tin trong cộng đồng.",
  duplicate: "Bạn vừa gửi đúng tin này rồi.",
  auth_required: "Chưa tạo được phiên. Tải lại trang rồi thử lại nhé.",
  server_error: "Chưa gửi được, thử lại sau nhé.",
  network: "Chưa gửi được, kiểm tra kết nối rồi thử lại nhé.",
};
