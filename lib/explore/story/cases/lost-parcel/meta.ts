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

/** Manh mối: chữ “机” trên cuộn băng keo ở bưu điện trùng với băng keo ở cửa hàng điện thoại; Heo khai ở cửa hàng nhưng cửa hàng đóng cửa từ 5 giờ rưỡi. */
export const CLUES: ClueDef[] = [
  { id: "letter", title: "Tờ giấy của Bác Thỏ", zh: "我的包裹昨天下午六点不见了。里面有一块新手表。", vi: "Bưu kiện của tôi biến mất lúc 6 giờ chiều hôm qua. Bên trong có một chiếc đồng hồ mới.", sceneId: "postoffice", kind: "document" },
  { id: "tape", title: "Cuộn băng keo vàng", zh: "柜台上有一卷黄胶带,胶带上写着一个“机”字。", vi: "Trên quầy có một cuộn băng keo vàng, trên băng keo viết một chữ “机” (máy).", sceneId: "postoffice", kind: "object" },
  { id: "cat_alibi", title: "Lời khai của Cô Mèo", zh: "昨天下午六点,我在店里给客人剪头发。", vi: "Sáu giờ chiều hôm qua, tôi đang cắt tóc cho khách ở tiệm.", sceneId: "salon", kind: "testimony" },
  { id: "diary", title: "Sổ hẹn của tiệm tóc", zh: "昨天下午六点,有三位客人在这里剪头发。小猫一直在店里。", vi: "Sáu giờ chiều hôm qua, có ba khách cắt tóc ở đây. Mèo nhỏ ở trong tiệm suốt.", sceneId: "salon", kind: "document" },
  { id: "fox_alibi", title: "Lời khai của Cô Cáo", zh: "昨天下午六点,我在药店卖药。", vi: "Sáu giờ chiều hôm qua, tôi đang bán thuốc ở hiệu thuốc.", sceneId: "pharmacy", kind: "testimony" },
  { id: "pharmacy_receipt", title: "Hóa đơn hiệu thuốc", zh: "昨天下午六点,很多人来药店买药。狐狸一直在这里。", vi: "Sáu giờ chiều hôm qua, nhiều người đến hiệu thuốc mua thuốc. Cáo ở đây suốt.", sceneId: "pharmacy", kind: "document" },
  { id: "pig_alibi", title: "Lời khai của Anh Heo", zh: "昨天下午六点,我在手机店工作。", vi: "Sáu giờ chiều hôm qua, tôi đang làm việc ở cửa hàng điện thoại.", sceneId: "phoneshop", kind: "testimony" },
  { id: "closing_sign", title: "Bảng giờ đóng cửa", zh: "这家手机店昨天下午五点半就关门了。", vi: "Cửa hàng điện thoại này hôm qua đã đóng cửa từ 5 giờ rưỡi chiều.", sceneId: "phoneshop", kind: "document" },
  { id: "shop_tapes", title: "Băng keo của cửa hàng", zh: "店里的胶带都是黄色的,每卷胶带上都写着“机”字。", vi: "Băng keo trong tiệm đều màu vàng, trên mỗi cuộn đều viết chữ “机” (máy), giống hệt cuộn ở bưu điện.", sceneId: "phoneshop", kind: "object" },
  { id: "witness", title: "Lời khai của Ông Rùa", zh: "昨天下午六点,我在火锅店看见一头猪。他手里有一个包裹。", vi: "Sáu giờ chiều hôm qua, tôi thấy một con heo trong quán lẩu. Trong tay nó có một bưu kiện.", sceneId: "hotpot", kind: "testimony" },
];

export const SUSPECTS: Suspect[] = [
  { id: "cat", name: "Cô Mèo thợ tóc", sprite: "cat", sceneId: "salon", metFlag: "met:cat", note: "Nói sáu giờ chiều đang cắt tóc cho khách. Sổ hẹn cho thấy tiệm rất đông." },
  { id: "fox", name: "Cô Cáo dược sĩ", sprite: "fox", sceneId: "pharmacy", metFlag: "met:fox", note: "Nói sáu giờ chiều đang bán thuốc. Hóa đơn cho thấy cô ở hiệu thuốc suốt." },
  { id: "pig", name: "Anh Heo bán máy", sprite: "pig", sceneId: "phoneshop", metFlag: "met:pig", note: "Nói sáu giờ chiều đang làm ở cửa hàng điện thoại. Nhưng có điều gì đó không khớp…" },
];

/** Các mục tiêu nối tiếp nhau; mục tiêu hiện tại hiện trên đầu cảnh để người chơi không bị lạc. */
export const OBJECTIVES: Objective[] = [
  { id: "talk-rabbit", sceneId: "postoffice", text: "Nói chuyện với Bác Thỏ ở Bưu điện để nhận vụ án.", done: { all: ["met:rabbit"] } },
  { id: "inspect-post", sceneId: "postoffice", text: "Xem xét bưu điện: đọc tờ giấy trên sàn và xem cuộn băng keo vàng.", when: { all: ["met:rabbit"] }, done: { all: ["clue:letter", "clue:tape"] } },
  { id: "cat", sceneId: "salon", text: "Đến Hiệu cắt tóc: hỏi Cô Mèo sáu giờ chiều hôm qua cô ở đâu, rồi xem sổ hẹn.", when: { all: ["clue:letter", "clue:tape"] }, done: { all: ["met:cat", "clue:diary"] } },
  { id: "fox", sceneId: "pharmacy", text: "Đến Hiệu thuốc: hỏi Cô Cáo và xem hóa đơn.", when: { all: ["met:cat", "clue:diary"] }, done: { all: ["met:fox", "clue:pharmacy_receipt"] } },
  { id: "pig", sceneId: "phoneshop", text: "Đến Cửa hàng điện thoại: hỏi Anh Heo, xem bảng giờ đóng cửa và băng keo trong tiệm.", when: { all: ["met:fox", "clue:pharmacy_receipt"] }, done: { all: ["met:pig", "clue:closing_sign", "clue:shop_tapes"] } },
  { id: "witness", sceneId: "hotpot", text: "Đến Quán lẩu: nghe Ông Rùa kể chuyện hôm qua.", when: { all: ["met:pig", "clue:closing_sign", "clue:shop_tapes"] }, done: { all: ["clue:witness"] } },
  { id: "accuse", sceneId: "postoffice", text: "Về Bưu điện, nói với Bác Thỏ bạn biết ai đã lấy bưu kiện.", when: { all: ["clue:witness"] }, done: { all: ["case:solved"] } },
];
