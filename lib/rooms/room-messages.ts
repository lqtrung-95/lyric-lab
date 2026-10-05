/** Thông báo tiếng Việt cho các mã lỗi của API phòng thi đấu. */
const MESSAGES: Record<string, string> = {
  nickname_required: "Hãy đặt biệt danh trước khi chơi.",
  invalid_code: "Mã phòng gồm 6 chữ số.",
  invalid_video: "Bài hát không hợp lệ.",
  song_unavailable: "Bài này chưa đủ dữ liệu cho phòng thi đấu. Hãy chọn bài khác.",
  song_unusable: "Bài đã chọn chưa đủ dữ liệu để ra câu hỏi. Hãy rời phòng và tạo phòng với bài khác.",
  no_song: "Chưa tìm được bài phù hợp để chơi. Thử lại sau.",
  room_not_found: "Không tìm thấy phòng với mã này.",
  room_expired: "Phòng đã hết hạn. Hãy tạo phòng mới.",
  room_full: "Phòng đã đủ 2 người.",
  room_started: "Phòng đã bắt đầu chơi.",
  need_two_players: "Cần đủ 2 người để bắt đầu.",
  not_ready: "Chờ bạn của bạn bấm \"Sẵn sàng\" nhé.",
  not_host: "Chỉ chủ phòng mới bắt đầu được.",
  rate_limited: "Bạn thao tác hơi nhiều. Thử lại sau ít phút.",
  code_unavailable: "Chưa tạo được mã phòng. Thử lại nhé.",
  auth_required: "Chưa mở được phiên. Kiểm tra kết nối rồi thử lại.",
  server_error: "Có lỗi ở máy chủ. Thử lại nhé.",
};

export const roomErrorMessage = (code: unknown): string => (typeof code === "string" && MESSAGES[code]) || MESSAGES.server_error;
