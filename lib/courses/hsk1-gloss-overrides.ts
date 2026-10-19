// Sửa tay nghĩa tiếng Việt của một số từ HSK 1 mà AI hay lấy nhầm nghĩa hiếm/cổ (xem lần rà ngày 2026-10-19). Áp dụng SAU khi sinh bằng `scripts/gloss-hsk-course.mts`
// (luôn áp, kể cả khi sinh lại với --force) nên sửa ở đây là bền. Thêm từ nào khi người học báo nghĩa sai.
export const HSK1_GLOSS_OVERRIDES: Record<string, string> = {
  中: "giữa, trong",
  看: "nhìn, xem, đọc",
  正: "đang, đúng, chính",
  行: "được, ổn",
  几: "mấy, vài (hỏi số lượng nhỏ)",
  吧: "(trợ từ) nhé, đi",
  差: "kém, thiếu",
  说: "nói",
  哪里: "đâu, ở đâu",
  月: "tháng, mặt trăng",
  年: "năm",
  今年: "năm nay",
  去年: "năm ngoái",
  明年: "sang năm, năm sau",
  新年: "năm mới",
  生日: "sinh nhật",
  半年: "nửa năm",
  半天: "nửa ngày, rất lâu",
  星期日: "chủ nhật",
  钱包: "ví tiền",
};
