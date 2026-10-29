/** Tình huống trò chuyện tự do. Câu mở đầu do ta viết sẵn (AI đọc ngay, không tốn lượt LLM); lời thoại tiếp theo do AI đóng vai. Mọi chữ Hán tự viết. */
export interface Scenario {
  id: string;
  emoji: string;
  title: string;
  /** Vai AI đóng, gửi cho LLM (tiếng Việt). */
  aiRole: string;
  /** Mục tiêu của người học, hiện trên màn chọn. */
  goal: string;
  opening: { zh: string; vi: string };
  /** Không hiện ở màn chọn tình huống chung (dùng riêng, ví dụ trò chuyện với linh vật). */
  hidden?: boolean;
}

export const SCENARIOS: Scenario[] = [
  { id: "cafe", emoji: "☕", title: "Gọi đồ ở quán cà phê", aiRole: "nhân viên quán cà phê đang nhận order", goal: "Gọi một đồ uống, chọn size và hỏi giá", opening: { zh: "你好，欢迎光临！你想喝点什么？", vi: "Xin chào, chào mừng! Bạn muốn uống gì?" } },
  { id: "intro", emoji: "🤝", title: "Làm quen bạn mới", aiRole: "một người bạn mới quen ở buổi gặp mặt, thân thiện", goal: "Giới thiệu tên, nghề nghiệp, sở thích; hỏi lại bạn", opening: { zh: "你好，我叫小林。你叫什么名字？", vi: "Chào bạn, mình tên Tiểu Lâm. Bạn tên gì?" } },
  { id: "directions", emoji: "🧭", title: "Hỏi đường", aiRole: "người qua đường tốt bụng biết rõ khu phố", goal: "Hỏi đường đến ga tàu điện hoặc tiệm thuốc và hiểu cách đi", opening: { zh: "你好，你是不是迷路了？需要帮忙吗？", vi: "Chào bạn, bạn bị lạc à? Cần giúp không?" } },
  { id: "shopping", emoji: "🛍️", title: "Mua sắm, trả giá", aiRole: "chủ tiệm quần áo ở chợ", goal: "Hỏi giá, hỏi size, trả giá và quyết định mua", opening: { zh: "欢迎！这件衣服今天特别便宜，你要看看吗？", vi: "Chào mừng! Cái áo này hôm nay đặc biệt rẻ, bạn xem thử không?" } },
  { id: "restaurant", emoji: "🍜", title: "Ăn ở nhà hàng", aiRole: "phục vụ nhà hàng", goal: "Gọi món, hỏi món gì ngon, xin tính tiền", opening: { zh: "你们几位？这是菜单，请先看看。", vi: "Các bạn mấy người? Đây là thực đơn, mời xem trước." } },
  { id: "hotel", emoji: "🏨", title: "Nhận phòng khách sạn", aiRole: "lễ tân khách sạn", goal: "Nhận phòng đã đặt, hỏi giờ ăn sáng, xin hỗ trợ", opening: { zh: "晚上好，请问你有预订吗？", vi: "Chào buổi tối, bạn có đặt phòng trước không?" } },
  { id: "doctor", emoji: "💊", title: "Đi khám bệnh", aiRole: "bác sĩ hỏi thăm triệu chứng", goal: "Nói mình đau/khó chịu ở đâu và từ bao lâu", opening: { zh: "你好，请坐。你哪里不舒服？", vi: "Chào bạn, mời ngồi. Bạn khó chịu ở đâu?" } },
  { id: "taxi", emoji: "🚕", title: "Đi taxi", aiRole: "tài xế taxi hay trò chuyện", goal: "Nói điểm đến, hỏi mất bao lâu, trả tiền", opening: { zh: "你好，去哪儿？", vi: "Chào bạn, đi đâu?" } },
  { id: "weekend", emoji: "🎬", title: "Hẹn bạn cuối tuần", aiRole: "một người bạn đang rủ đi chơi cuối tuần", goal: "Rủ/nhận lời, chọn việc làm, hẹn giờ và địa điểm", opening: { zh: "喂，这个周末你有空吗？我们一起出去玩吧！", vi: "Alo, cuối tuần này bạn rảnh không? Mình đi chơi nhé!" } },
  { id: "work", emoji: "💼", title: "Nói chuyện với đồng nghiệp", aiRole: "đồng nghiệp thân thiện giờ nghỉ trưa", goal: "Kể về công việc hôm nay, hỏi thăm, rủ đi ăn trưa", opening: { zh: "中午了，你今天忙不忙？", vi: "Trưa rồi, hôm nay bạn có bận không?" } },
  // Dùng riêng cho khung "Nói chuyện với pet" ở trang chủ. Tên pet do giao diện thêm, server không biết. An toàn: chỉ chuyện học tập/đời thường nhẹ nhàng.
  { id: "pet", emoji: "🐾", title: "Trò chuyện với linh vật", hidden: true, aiRole: "một linh vật nhỏ đáng yêu đang học tiếng Trung cùng người học, nói rất ngắn và đơn giản, giọng dễ thương, khích lệ, hay hỏi về việc học và sở thích nhẹ nhàng; nếu người học nói chuyện nhạy cảm hoặc không phù hợp thì nhẹ nhàng đổi chủ đề về việc học", goal: "Kể hôm nay học gì, nói về sở thích, hỏi lại bạn nhỏ", opening: { zh: "你好！今天你学了什么？", vi: "Chào bạn! Hôm nay bạn học gì thế?" } },
];

export const SCENARIO_IDS = SCENARIOS.map((s) => s.id);
export const findScenario = (id: string): Scenario | undefined => SCENARIOS.find((s) => s.id === id);
