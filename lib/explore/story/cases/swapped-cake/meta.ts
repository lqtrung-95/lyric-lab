import type { ClueDef, Objective, Speaker, Suspect } from "../../story-types";

export const SPEAKERS: Record<string, Speaker> = {
  player: { name: "Bạn (thám tử Gấu Trúc)", sprite: "guide" },
  chef: { name: "Bếp trưởng Gấu", sprite: "chef" },
  cat: { name: "Cô Mèo bán hàng", sprite: "cat" },
  fox: { name: "Bác sĩ Cáo", sprite: "fox" },
  bird: { name: "Cô Chim giáo viên", sprite: "bird" },
  rabbit: { name: "Trưởng ga Thỏ", sprite: "rabbit" },
  turtle: { name: "Ông Rùa", sprite: "turtle" },
};

/**
 * Manh mối của vụ khó. Mồi nhử: túi muối có dấu chợ (chỉ về Mèo), bột mì dính áo Cô Chim. Người làm chứng nói dối: Thỏ đổ lỗi cho Cáo.
 * Phải ghép: phiếu giảm giá vé tàu (người mua muối), sổ phẫu thuật (Cáo không thể ở quán ăn), cửa sổ bán vé đóng (Thỏ nói dối), và lời của Ông Rùa (chỉ kể khi đã biết người mua muối).
 */
export const CLUES: ClueDef[] = [
  { id: "cake_time", title: "Giờ chiếc bánh bị đánh tráo", zh: "蛋糕是昨天下午两点到两点半被换的。", vi: "Chiếc bánh bị đánh tráo từ 2 giờ đến 2 giờ 30 chiều qua.", sceneId: "restaurant", kind: "document" },
  { id: "salt_bag", title: "Túi muối trong bếp", zh: "垃圾桶里有一个空盐袋,袋子上有“市场”两个字。", vi: "Trong thùng rác có một túi muối rỗng, trên túi có hai chữ “市场” (chợ).", sceneId: "restaurant", kind: "object" },
  { id: "cat_alibi", title: "Lời khai của Cô Mèo", zh: "昨天下午两点到两点半,我在市场卖水果。", vi: "Từ 2 giờ đến 2 giờ 30 chiều qua, tôi bán trái cây ở chợ.", sceneId: "market", kind: "testimony" },
  { id: "price_note", title: "Sổ bán hàng của Cô Mèo", zh: "下午两点到两点半,很多人在这里买水果。小猫一直在这里。", vi: "Từ 2 giờ đến 2 giờ 30 chiều, nhiều người mua trái cây ở đây. Mèo nhỏ ở đây suốt.", sceneId: "market", kind: "document" },
  { id: "salt_buyer", title: "Người mua túi muối", zh: "昨天下午一点半,有人用车票优惠券买了一袋盐。", vi: "Chiều qua 1 giờ 30, có người dùng phiếu giảm giá vé tàu để mua một túi muối.", sceneId: "market", kind: "document" },
  { id: "fox_alibi", title: "Lời khai của Bác sĩ Cáo", zh: "昨天下午两点到两点半,我在医院做手术。", vi: "Từ 2 giờ đến 2 giờ 30 chiều qua, tôi đang phẫu thuật ở bệnh viện.", sceneId: "hospital", kind: "testimony" },
  { id: "sign_sheet", title: "Sổ phẫu thuật", zh: "医生昨天下午一点五十到三点十分都在做手术。", vi: "Bác sĩ phẫu thuật từ 1 giờ 50 đến 3 giờ 10 chiều qua.", sceneId: "hospital", kind: "document" },
  { id: "bird_alibi", title: "Lời khai của Cô Chim", zh: "昨天下午两点到两点半,我在学校上课。", vi: "Từ 2 giờ đến 2 giờ 30 chiều qua, tôi đang dạy ở trường.", sceneId: "school", kind: "testimony" },
  { id: "class_schedule", title: "Thời khóa biểu của trường", zh: "下午两点,学生们在学校上做蛋糕课。老师在教室里。", vi: "2 giờ chiều, học sinh học làm bánh ở trường. Cô giáo ở trong lớp.", sceneId: "school", kind: "document" },
  { id: "rabbit_alibi", title: "Lời khai của Trưởng ga Thỏ", zh: "我在火车站卖票。两点一刻,我看见医生走进饭馆。", vi: "Tôi bán vé ở ga tàu. Hai giờ mười lăm, tôi thấy bác sĩ đi vào quán ăn.", sceneId: "station", kind: "testimony" },
  { id: "ticket_closed", title: "Bảng báo ở cửa sổ bán vé", zh: "火车站售票窗口昨天下午两点到两点四十关门了。", vi: "Cửa sổ bán vé ở ga tàu hôm qua đóng từ 2 giờ đến 2 giờ 40.", sceneId: "station", kind: "document" },
  { id: "rabbit_slip", title: "Thỏ đổi lời", zh: "我……我只是记错了时间。", vi: "Tôi... tôi chỉ nhớ nhầm giờ thôi.", sceneId: "station", kind: "testimony" },
  { id: "turtle_alibi", title: "Lời khai của Ông Rùa", zh: "昨天下午两点到两点半,我在公园的长椅上休息。", vi: "Từ 2 giờ đến 2 giờ 30 chiều qua, tôi nghỉ trên ghế dài ở công viên.", sceneId: "park", kind: "testimony" },
  { id: "turtle_sighting", title: "Ông Rùa thấy người chạy", zh: "两点二十,我看见一只兔子拿着一个大盒子,跑向火车站。", vi: "Lúc 2 giờ 20, tôi thấy một con thỏ cầm một cái hộp lớn chạy về phía ga tàu.", sceneId: "park", kind: "testimony" },
];

export const SUSPECTS: Suspect[] = [
  { id: "cat", name: "Cô Mèo bán hàng", sprite: "cat", sceneId: "market", metFlag: "met:cat", note: "Nói 2 giờ rưỡi ở chợ. Sổ bán hàng xác nhận, nhưng túi muối trong bếp mang dấu chợ." },
  { id: "fox", name: "Bác sĩ Cáo", sprite: "fox", sceneId: "hospital", metFlag: "met:fox", note: "Nói đang phẫu thuật. Sổ phẫu thuật xác nhận. Thỏ lại nói thấy ông đi vào quán ăn." },
  { id: "bird", name: "Cô Chim giáo viên", sprite: "bird", sceneId: "school", metFlag: "met:bird", note: "Nói đang dạy học. Áo cô dính bột, nhưng hôm đó lớp học làm bánh." },
  { id: "rabbit", name: "Trưởng ga Thỏ", sprite: "rabbit", sceneId: "station", metFlag: "met:rabbit", note: "Nói đang bán vé và thấy Cáo vào quán ăn. Có điều gì đó không khớp…" },
  { id: "turtle", name: "Ông Rùa", sprite: "turtle", sceneId: "park", metFlag: "met:turtle", note: "Nói nghỉ trên ghế dài ở công viên. Mắt ông vẫn rất tốt." },
];

export const OBJECTIVES: Objective[] = [
  { id: "talk-chef", sceneId: "restaurant", text: "Nói chuyện với Bếp trưởng Gấu ở Quán ăn để nhận vụ án.", done: { all: ["met:chef"] } },
  { id: "inspect-kitchen", sceneId: "restaurant", text: "Xem xét quán: tìm giờ chiếc bánh bị đánh tráo và thứ bỏ lại trong bếp.", when: { all: ["met:chef"] }, done: { all: ["clue:cake_time", "clue:salt_bag"] } },
  { id: "cat", sceneId: "market", text: "Đến Chợ: hỏi Cô Mèo, xem sổ bán hàng và sổ bán muối.", when: { all: ["clue:cake_time", "clue:salt_bag"] }, done: { all: ["met:cat", "clue:price_note", "clue:salt_buyer"] } },
  { id: "fox", sceneId: "hospital", text: "Đến Bệnh viện: hỏi Bác sĩ Cáo và xem sổ phẫu thuật.", when: { all: ["met:cat", "clue:salt_buyer"] }, done: { all: ["met:fox", "clue:sign_sheet"] } },
  { id: "bird", sceneId: "school", text: "Đến Trường học: hỏi Cô Chim và xem thời khóa biểu.", when: { all: ["met:fox", "clue:sign_sheet"] }, done: { all: ["met:bird", "clue:class_schedule"] } },
  { id: "rabbit", sceneId: "station", text: "Đến Nhà ga: hỏi Trưởng ga Thỏ, xem bảng ở cửa sổ bán vé, rồi hỏi lại anh khi đã có chứng cứ.", when: { all: ["met:bird", "clue:class_schedule"] }, done: { all: ["met:rabbit", "clue:ticket_closed", "clue:rabbit_slip"] } },
  { id: "turtle", sceneId: "park", text: "Ra Công viên: hỏi Ông Rùa, rồi hỏi xem hôm qua ông có thấy ai chạy ra từ quán ăn.", when: { all: ["clue:rabbit_slip"] }, done: { all: ["met:turtle", "clue:turtle_sighting"] } },
  { id: "accuse", sceneId: "restaurant", text: "Về Quán ăn, nói với Bếp trưởng Gấu bạn biết ai đã đánh tráo chiếc bánh.", when: { all: ["clue:turtle_sighting"] }, done: { all: ["case:solved"] } },
];
