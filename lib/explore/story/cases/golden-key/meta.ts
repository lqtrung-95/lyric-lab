import type { ClueDef, Objective, Speaker, Suspect } from "../../story-types";

/** Nhân vật trong vụ án (id → tên hiển thị và sprite). Id người nói trùng id NPC của cảnh. */
export const SPEAKERS: Record<string, Speaker> = {
  player: { name: "Bạn (thám tử Gấu Trúc)", sprite: "guide" },
  duck: { name: "Chú Vịt lễ tân", sprite: "duck" },
  dog: { name: "Chú Chó bán hàng", sprite: "dog" },
  bird: { name: "Cô Chim giáo viên", sprite: "bird" },
  rabbit: { name: "Trưởng ga Thỏ", sprite: "rabbit" },
  pig: { name: "Cô Heo sân bay", sprite: "pig" },
  turtle: { name: "Ông Rùa", sprite: "turtle" },
};

/**
 * Manh mối. Có mồi nhử (hộp quà của Chó, ô ở cửa hàng nhìn giống ô ở sảnh) và chứng cứ gián tiếp phải ghép:
 * ô đỏ ở sảnh có chữ "校", ô bán ở cửa hàng thì không; sổ trường cho thấy cô giáo rời trường sớm hơn lời khai; hai nhân chứng thấy người cầm ô đỏ đi về khách sạn.
 */
export const CLUES: ClueDef[] = [
  { id: "guest_book", title: "Sổ khách ở sảnh", zh: "昨天晚上八点一刻,有一个人来过大厅。", vi: "Tối qua 8 giờ 15, có một người đã đến sảnh.", sceneId: "hotel", kind: "document" },
  { id: "umbrella", title: "Chiếc ô đỏ trong sảnh", zh: "大厅里有一把红伞,伞柄上有一个“校”字。", vi: "Trong sảnh có một cái ô đỏ, trên cán ô có chữ “校” (trường).", sceneId: "hotel", kind: "object" },
  { id: "dog_alibi", title: "Lời khai của Chú Chó", zh: "昨天晚上八点,我在店里卖东西。", vi: "Tối qua 8 giờ, tôi đang bán hàng ở cửa hàng.", sceneId: "clothing-store", kind: "testimony" },
  { id: "dog_receipt", title: "Hóa đơn cửa hàng", zh: "昨天晚上八点十分,小狗在店里卖东西。", vi: "Tối qua 8 giờ 10, Chó đang bán hàng ở cửa hàng.", sceneId: "clothing-store", kind: "document" },
  { id: "dog_gift", title: "Hộp quà bí mật", zh: "小狗买了一个礼物,要送给酒店的鸭子。", vi: "Chó mua một món quà để tặng Vịt ở khách sạn.", sceneId: "clothing-store", kind: "object" },
  { id: "shop_umbrellas", title: "Ô ở cửa hàng", zh: "这家店的红伞都没有字。", vi: "Những cái ô đỏ ở cửa hàng đều không có chữ.", sceneId: "clothing-store", kind: "object" },
  { id: "bird_alibi", title: "Lời khai của Cô Chim", zh: "昨天晚上八点,我在学校看作业。", vi: "Tối qua 8 giờ, tôi ở trường xem bài tập.", sceneId: "school", kind: "testimony" },
  { id: "sign_sheet", title: "Sổ ra vào của trường", zh: "老师昨天晚上七点半就离开学校了。", vi: "Tối qua cô giáo đã rời trường từ 7 giờ 30.", sceneId: "school", kind: "document" },
  { id: "bird_slip", title: "Cô Chim đổi lời", zh: "我……我回家拿东西了。", vi: "Tôi... tôi về nhà lấy đồ.", sceneId: "school", kind: "testimony" },
  { id: "rabbit_alibi", title: "Lời khai của Trưởng ga Thỏ", zh: "昨天晚上八点,我在火车站工作。", vi: "Tối qua 8 giờ, tôi đang làm việc ở ga tàu.", sceneId: "station", kind: "testimony" },
  { id: "rabbit_log", title: "Sổ ca trực ở ga", zh: "兔子昨天晚上从六点到十点都在火车站。", vi: "Thỏ ở ga tàu từ 6 giờ đến 10 giờ tối qua.", sceneId: "station", kind: "document" },
  { id: "witness_pig", title: "Lời khai của Cô Heo", zh: "八点下班,八点一刻我经过酒店,看见一个人拿着红伞走进去。", vi: "Hết ca lúc 8 giờ, 8 giờ 15 đi ngang khách sạn thì tôi thấy một người cầm ô đỏ đi vào.", sceneId: "airport", kind: "testimony" },
  { id: "pig_shift", title: "Bảng ca của sân bay", zh: "小猪昨天晚上八点下班。", vi: "Heo hết ca lúc 8 giờ tối qua.", sceneId: "airport", kind: "document" },
  { id: "witness_turtle", title: "Lời khai của Ông Rùa", zh: "昨天晚上七点四十五,我看见一位老师拿着红伞,往酒店走。", vi: "Tối qua 7 giờ 45, tôi thấy một cô giáo cầm ô đỏ đi về hướng khách sạn.", sceneId: "park", kind: "testimony" },
];

export const SUSPECTS: Suspect[] = [
  { id: "dog", name: "Chú Chó bán hàng", sprite: "dog", sceneId: "clothing-store", metFlag: "met:dog", note: "Nói tối qua 8 giờ ở cửa hàng, hơi cuống. Hóa đơn xác nhận ông đang bán hàng, và ông giấu một món quà." },
  { id: "bird", name: "Cô Chim giáo viên", sprite: "bird", sceneId: "school", metFlag: "met:bird", note: "Nói tối qua 8 giờ ở trường xem bài tập. Sổ ra vào của trường nói khác." },
  { id: "rabbit", name: "Trưởng ga Thỏ", sprite: "rabbit", sceneId: "station", metFlag: "met:rabbit", note: "Nói tối qua 8 giờ ở ga. Sổ ca trực xác nhận anh ở ga cả buổi tối." },
  { id: "pig", name: "Cô Heo sân bay", sprite: "pig", sceneId: "airport", metFlag: "met:pig", note: "Hết ca lúc 8 giờ, đi ngang khách sạn lúc 8 giờ 15 và thấy một người cầm ô đỏ." },
];

/** Các mục tiêu nối tiếp nhau; cảnh nào mở khi mục tiêu đầu tiên ở cảnh đó hiện ra. */
export const OBJECTIVES: Objective[] = [
  { id: "talk-duck", sceneId: "hotel", text: "Nói chuyện với Chú Vịt ở Khách sạn để nhận vụ án.", done: { all: ["met:duck"] } },
  { id: "inspect-hotel", sceneId: "hotel", text: "Xem xét sảnh khách sạn: đọc sổ khách và xem chiếc ô đỏ.", when: { all: ["met:duck"] }, done: { all: ["clue:guest_book", "clue:umbrella"] } },
  { id: "dog", sceneId: "clothing-store", text: "Đến Cửa hàng quần áo: hỏi Chú Chó, xem hóa đơn và các cái ô trong cửa hàng.", when: { all: ["clue:guest_book", "clue:umbrella"] }, done: { all: ["met:dog", "clue:shop_umbrellas"] } },
  { id: "bird", sceneId: "school", text: "Đến Trường học: hỏi Cô Chim, tìm sổ ra vào, rồi hỏi lại cô khi đã có chứng cứ.", when: { all: ["met:dog", "clue:shop_umbrellas"] }, done: { all: ["met:bird", "clue:sign_sheet", "clue:bird_slip"] } },
  { id: "rabbit", sceneId: "station", text: "Đến Nhà ga: hỏi Trưởng ga Thỏ và xem sổ ca trực.", when: { all: ["clue:bird_slip"] }, done: { all: ["met:rabbit", "clue:rabbit_log"] } },
  { id: "pig", sceneId: "airport", text: "Đến Sân bay: hỏi Cô Heo và xem bảng ca.", when: { all: ["met:rabbit", "clue:rabbit_log"] }, done: { all: ["met:pig", "clue:pig_shift"] } },
  { id: "turtle", sceneId: "park", text: "Ra Công viên: hỏi Ông Rùa về chiếc ô đỏ.", when: { all: ["met:pig", "clue:pig_shift"] }, done: { all: ["clue:witness_turtle"] } },
  { id: "accuse", sceneId: "hotel", text: "Về Khách sạn, nói với Chú Vịt bạn biết ai đã lấy chìa khóa vàng.", when: { all: ["clue:witness_turtle"] }, done: { all: ["case:solved"] } },
];
