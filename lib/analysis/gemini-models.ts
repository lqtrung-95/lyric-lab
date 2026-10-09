// Model Gemini dùng cho các tác vụ ngắn (giải nghĩa từ/câu khi bấm, dịch lại một dòng bị báo sai). Gọi bằng khóa Google AI Studio (GEMINI_API_KEYS).
// Đổi model qua biến GEMINI_MODEL khi Google đổi/ngừng model (tên sai chỉ làm lần gọi lỗi và chuyển sang model kế tiếp, không hỏng cả tính năng).
// Mặc định dùng dòng flash-lite: rẻ, nhanh, hạn mức miễn phí theo ngày cao hơn dòng flash.
export const GEMINI_MODEL_ID = process.env.GEMINI_MODEL?.trim() || "gemini-2.5-flash-lite";
export const GEMINI_MODELS = [`gemini:${GEMINI_MODEL_ID}`];
