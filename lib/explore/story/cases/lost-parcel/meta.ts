import type { ClueDef, Objective, Speaker, Suspect } from "../../story-types";

/** Nhân vật trong vụ án (id → tên hiển thị và sprite). Id người nói trùng id NPC của cảnh. */
export const SPEAKERS: Record<string, Speaker> = {
  player: { name: "Bạn (thám tử Gấu Trúc)", sprite: "guide" },
  rabbit: { name: "Bác Thỏ bưu tá", sprite: "rabbit" },
  cat: { name: "Cô Mèo thợ tóc", sprite: "cat" },
  fox: { name: "Cô Cáo dược sĩ", sprite: "fox" },
  pig: { name: "Anh Heo bán máy", sprite: "pig" },
  turtle: { name: "Ông Rùa chủ quán", sprite: "turtle" },
};

/** Manh mối: mảnh giấy của kẻ trộm nhắc “hộp đỏ”, nhưng hộp được bọc giấy nâu, chỉ Heo, Cáo và Rùa từng thấy. Cáo và Rùa có chứng cứ ngoại phạm thật; Mèo nói dối nhưng không biết hộp đỏ (đi mua quà sinh nhật). */
export const CLUES: ClueDef[] = [
  { id: "letter", title: "Tờ giấy của Bác Thỏ", zh: "我的包裹昨天下午六点不见了。里面有一块新手表。", vi: "Bưu kiện của tôi biến mất lúc 6 giờ chiều hôm qua. Bên trong có một chiếc đồng hồ mới.", sceneId: "postoffice", kind: "document" },
  { id: "thief_note", title: "Mảnh giấy trên quầy", zh: "柜台上留着一张纸条:“红盒子里的表,我拿走了。”", vi: "Trên quầy có một mảnh giấy: “Chiếc đồng hồ trong hộp đỏ, tôi lấy rồi.”", sceneId: "postoffice", kind: "document" },
  { id: "rabbit_list", title: "Sổ gửi hàng", zh: "盒子是红色的,外面包着棕色的纸。只有猪、狐狸和乌龟看过红盒子。", vi: "Hộp màu đỏ, bên ngoài bọc giấy nâu. Chỉ có Heo, Cáo và Rùa từng thấy chiếc hộp đỏ.", sceneId: "postoffice", kind: "document" },
  { id: "cat_alibi", title: "Lời khai của Cô Mèo", zh: "昨天下午六点,我在店里给客人剪头发。", vi: "Sáu giờ chiều hôm qua, tôi đang cắt tóc cho khách ở tiệm.", sceneId: "salon", kind: "testimony" },
  { id: "salon_book", title: "Sổ hẹn của tiệm tóc", zh: "理发店的预约本:最后一位客人五点四十分就走了,后来小猫关了门。", vi: "Sổ hẹn tiệm tóc: khách cuối cùng đã rời đi lúc 5 giờ 40, sau đó Mèo đóng cửa.", sceneId: "salon", kind: "document" },
  { id: "cat_gift", title: "Món quà trên bàn", zh: "桌上有一个包好的小礼物,卡片上写着:“祝兔子伯伯生日快乐。”", vi: "Trên bàn có một món quà nhỏ đã gói sẵn, thiệp ghi: “Chúc Bác Thỏ sinh nhật vui vẻ.”", sceneId: "salon", kind: "object" },
  { id: "fox_alibi", title: "Lời khai của Cô Cáo", zh: "昨天下午六点,我在药店卖药。", vi: "Sáu giờ chiều hôm qua, tôi đang bán thuốc ở hiệu thuốc.", sceneId: "pharmacy", kind: "testimony" },
  { id: "pharmacy_receipt", title: "Hóa đơn hiệu thuốc", zh: "昨天下午六点,很多人来药店买药。狐狸一直在这里。", vi: "Sáu giờ chiều hôm qua, nhiều người đến hiệu thuốc mua thuốc. Cáo ở đây suốt.", sceneId: "pharmacy", kind: "document" },
  { id: "turtle_alibi", title: "Lời khai của Ông Rùa", zh: "昨天下午六点,我在火锅店里招待客人。", vi: "Sáu giờ chiều hôm qua, tôi đang tiếp khách ở quán lẩu.", sceneId: "hotpot", kind: "testimony" },
  { id: "kitchen_log", title: "Sổ đơn của quán lẩu", zh: "火锅店的订单本:昨天下午五点到七点,客人坐满了二十桌,乌龟一直很忙。", vi: "Sổ đơn quán lẩu: từ 5 đến 7 giờ chiều hôm qua, khách ngồi kín hai mươi bàn, Rùa bận rộn suốt.", sceneId: "hotpot", kind: "document" },
  { id: "pig_alibi", title: "Lời khai của Anh Heo", zh: "昨天下午六点,我在手机店工作。", vi: "Sáu giờ chiều hôm qua, tôi đang làm việc ở cửa hàng điện thoại.", sceneId: "phoneshop", kind: "testimony" },
  { id: "closing_sign", title: "Bảng giờ đóng cửa", zh: "这家手机店昨天下午五点半就关门了。", vi: "Cửa hàng điện thoại này hôm qua đã đóng cửa từ 5 giờ rưỡi chiều.", sceneId: "phoneshop", kind: "document" },
  { id: "pig_slip", title: "Heo đổi lời", zh: "我……我只是想再看一眼那块表,明天就还。", vi: "Tôi... tôi chỉ muốn ngắm lại chiếc đồng hồ đó, mai tôi trả thôi.", sceneId: "phoneshop", kind: "testimony" },
];

export const SUSPECTS: Suspect[] = [
  { id: "cat", name: "Cô Mèo thợ tóc", sprite: "cat", sceneId: "salon", metFlag: "met:cat", note: "Nói sáu giờ chiều đang cắt tóc, nhưng sổ hẹn cho thấy tiệm đóng cửa từ 5 giờ 40. Cô có biết hộp màu đỏ không?" },
  { id: "fox", name: "Cô Cáo dược sĩ", sprite: "fox", sceneId: "pharmacy", metFlag: "met:fox", note: "Nói sáu giờ chiều đang bán thuốc. Hóa đơn cho thấy cô ở hiệu thuốc suốt." },
  { id: "turtle", name: "Ông Rùa chủ quán", sprite: "turtle", sceneId: "hotpot", metFlag: "met:turtle", note: "Nói sáu giờ chiều đang tiếp khách. Sổ đơn cho thấy quán đông kín hai tiếng liền." },
  { id: "pig", name: "Anh Heo bán máy", sprite: "pig", sceneId: "phoneshop", metFlag: "met:pig", note: "Nói sáu giờ chiều đang làm ở cửa hàng điện thoại. Nhưng bảng giờ nói tiệm đã đóng cửa." },
];

/** Các mục tiêu nối tiếp nhau; mục tiêu hiện tại hiện trên đầu cảnh để người chơi không bị lạc. */
export const OBJECTIVES: Objective[] = [
  { id: "talk-rabbit", sceneId: "postoffice", text: "Nói chuyện với Bác Thỏ ở Bưu điện để nhận vụ án.", done: { all: ["met:rabbit"] } },
  { id: "inspect-post", sceneId: "postoffice", text: "Xem xét bưu điện: đọc tờ giấy trên sàn, mảnh giấy để lại trên quầy và sổ gửi hàng.", when: { all: ["met:rabbit"] }, done: { all: ["clue:letter", "clue:thief_note", "clue:rabbit_list"] } },
  { id: "cat", sceneId: "salon", text: "Đến Hiệu cắt tóc: hỏi Cô Mèo sáu giờ chiều hôm qua cô ở đâu, rồi xem sổ hẹn và đồ trên bàn.", when: { all: ["clue:letter", "clue:thief_note", "clue:rabbit_list"] }, done: { all: ["met:cat", "clue:salon_book", "clue:cat_gift"] } },
  { id: "fox", sceneId: "pharmacy", text: "Đến Hiệu thuốc: hỏi Cô Cáo và xem hóa đơn.", when: { all: ["met:cat", "clue:salon_book"] }, done: { all: ["met:fox", "clue:pharmacy_receipt"] } },
  { id: "turtle", sceneId: "hotpot", text: "Đến Quán lẩu: hỏi Ông Rùa và xem sổ đơn.", when: { all: ["met:fox", "clue:pharmacy_receipt"] }, done: { all: ["met:turtle", "clue:kitchen_log"] } },
  { id: "pig", sceneId: "phoneshop", text: "Đến Cửa hàng điện thoại: hỏi Anh Heo và xem bảng giờ đóng cửa.", when: { all: ["met:turtle", "clue:kitchen_log"] }, done: { all: ["met:pig", "clue:closing_sign"] } },
  { id: "confront", sceneId: "phoneshop", text: "Hỏi lại Anh Heo khi đã đối chiếu mảnh giấy, danh sách người từng thấy hộp đỏ và lời khai của từng người.", when: { all: ["met:pig", "clue:closing_sign"] }, done: { all: ["clue:pig_slip"] } },
  { id: "accuse", sceneId: "postoffice", text: "Về Bưu điện, nói với Bác Thỏ bạn biết ai đã lấy bưu kiện.", when: { all: ["clue:pig_slip"] }, done: { all: ["case:solved"] } },
];
