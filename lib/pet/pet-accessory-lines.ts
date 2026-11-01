// Câu pet nói về món đồ đang đeo. Chỉ là lời vui, không ảnh hưởng điểm.

const LINES: Record<string, readonly string[]> = {
  headphones: ["Đeo tai nghe vào là muốn nghe bài hát liền!", "Hôm nay mình nghe bài nào nhỉ?"],
  glasses: ["Đeo kính vào là thấy bạn thông minh hơn hẳn!", "Mình nhìn rõ từng chữ Hán luôn."],
  sunglasses: ["Ngầu chưa? Học xong mình đi biển nhé!", "Kính râm này hợp với bạn học giỏi."],
  heartglasses: ["Mình thấy chữ Hán nào cũng đáng yêu!", "Nhìn đời màu hồng, học tiếng Trung cũng vui."],
  bowtie: ["Hôm nay mình lịch sự lắm nha.", "Mặc đẹp để gặp từ mới nè."],
  bell: ["Kính coong! Có ai gọi mình không?", "Nghe tiếng chuông là nhớ đến giờ ôn bài."],
  bandana: ["Buộc khăn lên là sẵn sàng học hết mình!", "Phong cách thám hiểm chữ Hán."],
  cap: ["Đội mũ lên, mình học tiếp thôi!", "Mũ này đội học bài rất hợp."],
  partyhat: ["Hôm nay là sinh nhật của việc học!", "Mỗi từ mới là một món quà."],
  flower: ["Hoa trên tai mình đẹp không?", "Học đều đều, hoa nở thêm."],
  halo: ["Vòng hào quang của bạn học chăm đây.", "Mình là thiên thần chữ Hán."],
  beret: ["Mình thấy hơi nghệ sĩ, viết thư pháp thử không?", "Họa sĩ chữ Hán xin chào."],
  cape: ["Siêu pet xuất kích! Cứu từ sắp quên thôi.", "Áo choàng bay phấp phới, ôn bài nào."],
  wings: ["Có cánh rồi, bài nào cũng bay qua!", "Mình bay lên cùng điểm số của bạn."],
  tethat: ["Chúc mừng năm mới! Học thêm một câu chúc nhé.", "Khăn đóng này đúng chuẩn Tết."],
  tetcharm: ["Lì xì đây, nhưng phải học xong mới được mở!", "恭喜发财! Bạn biết câu này chưa?"],
  moonears: ["Tai thỏ ngọc nghe được tiếng Trung rõ lắm.", "Trung thu vui nhé, ăn bánh rồi ôn bài."],
  starlantern: ["Đèn ông sao sáng cả đường học.", "Rước đèn cùng mình nào."],
  santahat: ["Ho ho ho! Hôm nay học 圣诞节 nhé.", "Mũ Noel hợp với bạn chăm học."],
  noelscarf: ["Ấm áp ghê, học thêm tí rồi uống ca cao.", "Khăn Noel này mềm lắm."],
  scarf: ["Khăn đỏ của chuỗi ngày dài này, mình tự hào lắm."],
  hat: ["Mũ thư sinh đây, mình nghiêm túc lắm."],
  crown: ["Mình là vua của chuỗi ngày dài đó!"],
};

/** Câu về một món đang đeo; `seed` quay vòng qua các món và các câu. Không có món nào có lời thì null. */
export function accessoryLine(ids: readonly string[], seed: number): string | null {
  const known = ids.filter((id) => LINES[id]);
  if (known.length === 0) return null;
  const s = Number.isFinite(seed) ? Math.abs(Math.trunc(seed)) : 0;
  const lines = LINES[known[s % known.length]];
  return lines[Math.floor(s / known.length) % lines.length];
}

export const ACCESSORY_LINE_IDS: readonly string[] = Object.keys(LINES);
