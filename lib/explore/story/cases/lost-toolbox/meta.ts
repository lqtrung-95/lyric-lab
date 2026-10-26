import type { ClueDef, Objective, Speaker, Suspect } from "../../story-types";

/** Nhân vật trong vụ án (id → tên hiển thị và sprite). Id người nói trùng id NPC của cảnh. */
export const SPEAKERS: Record<string, Speaker> = {
  player: { name: "Bạn (thám tử Gấu Trúc)", sprite: "guide" },
  tiger: { name: "Chú Hổ thợ máy", sprite: "tiger" },
  cat: { name: "Cô Mèo chủ tiệm hoa", sprite: "cat" },
  fox: { name: "Cô Cáo nhân viên sở thú", sprite: "fox" },
  rabbit: { name: "Bé Thỏ pha chế", sprite: "rabbit" },
  turtle: { name: "Ông Rùa chủ quán", sprite: "turtle" },
};

/** Manh mối: giọt trà sữa hồng trên sàn tiệm sửa xe; tiệm trà sữa đóng cửa từ 3 rưỡi, nhưng Thỏ khai đang pha chế; hộp dụng cụ đỏ nằm sau quầy ở đó. */
export const CLUES: ClueDef[] = [
  { id: "letter", title: "Tờ giấy của Chú Hổ", zh: "我的工具箱昨天下午四点不见了。里面有一把新扳手。", vi: "Hộp dụng cụ của tôi biến mất lúc bốn giờ chiều hôm qua. Bên trong có một cái cờ lê mới.", sceneId: "garage", kind: "document" },
  { id: "milk_drop", title: "Giọt trà sữa trên sàn", zh: "地上有一滴粉红色的奶茶。", vi: "Trên sàn có một giọt trà sữa màu hồng.", sceneId: "garage", kind: "object" },
  { id: "cat_alibi", title: "Lời khai của Cô Mèo", zh: "昨天下午四点,我在店里包花。", vi: "Bốn giờ chiều hôm qua, tôi đang gói hoa trong tiệm.", sceneId: "flowershop", kind: "testimony" },
  { id: "flower_order", title: "Đơn đặt hoa", zh: "昨天下午四点,有一位客人买了一束花。小猫一直在店里包花。", vi: "Bốn giờ chiều hôm qua, có một khách mua một bó hoa. Mèo nhỏ ở trong tiệm gói hoa suốt.", sceneId: "flowershop", kind: "document" },
  { id: "fox_alibi", title: "Lời khai của Cô Cáo", zh: "昨天下午四点,我在动物园喂动物。", vi: "Bốn giờ chiều hôm qua, tôi đang cho động vật ăn ở sở thú.", sceneId: "zoo", kind: "testimony" },
  { id: "feed_log", title: "Sổ cho ăn", zh: "昨天下午四点,狐狸一直在喂动物。", vi: "Bốn giờ chiều hôm qua, Cáo cho động vật ăn suốt.", sceneId: "zoo", kind: "document" },
  { id: "rabbit_alibi", title: "Lời khai của Bé Thỏ", zh: "昨天下午四点,我在店里做奶茶。", vi: "Bốn giờ chiều hôm qua, tôi đang pha trà sữa ở quán.", sceneId: "bubbletea", kind: "testimony" },
  { id: "closed_sign", title: "Bảng giờ của quán", zh: "这家奶茶店昨天下午三点半就关门了。", vi: "Quán trà sữa này hôm qua đã đóng cửa từ 3 giờ rưỡi chiều.", sceneId: "bubbletea", kind: "document" },
  { id: "red_box", title: "Hộp đỏ sau quầy", zh: "柜台后面有一个红色的工具箱。", vi: "Phía sau quầy có một cái hộp dụng cụ màu đỏ.", sceneId: "bubbletea", kind: "object" },
  { id: "witness", title: "Lời khai của Ông Rùa", zh: "昨天下午四点,我在火锅店看见一只兔子。他手里有一个工具箱。", vi: "Bốn giờ chiều hôm qua, tôi thấy một con thỏ trong quán lẩu. Trong tay nó có một cái hộp dụng cụ.", sceneId: "hotpot", kind: "testimony" },
];

export const SUSPECTS: Suspect[] = [
  { id: "cat", name: "Cô Mèo chủ tiệm hoa", sprite: "cat", sceneId: "flowershop", metFlag: "met:cat", note: "Nói bốn giờ chiều đang gói hoa. Đơn đặt hoa cho thấy tiệm đông khách." },
  { id: "fox", name: "Cô Cáo nhân viên sở thú", sprite: "fox", sceneId: "zoo", metFlag: "met:fox", note: "Nói bốn giờ chiều đang cho động vật ăn. Sổ cho ăn xác nhận cô ở đó suốt." },
  { id: "rabbit", name: "Bé Thỏ pha chế", sprite: "rabbit", sceneId: "bubbletea", metFlag: "met:rabbit", note: "Nói bốn giờ chiều đang pha trà sữa. Nhưng giọt trà sữa hồng trên sàn tiệm sửa xe…" },
];

/** Các mục tiêu nối tiếp nhau; mục tiêu hiện tại hiện trên đầu cảnh để người chơi không bị lạc. */
export const OBJECTIVES: Objective[] = [
  { id: "talk-tiger", sceneId: "garage", text: "Nói chuyện với Chú Hổ ở Tiệm sửa xe để nhận vụ án.", done: { all: ["met:tiger"] } },
  { id: "inspect-garage", sceneId: "garage", text: "Xem xét tiệm: đọc tờ giấy và xem giọt nước trên sàn.", when: { all: ["met:tiger"] }, done: { all: ["clue:letter", "clue:milk_drop"] } },
  { id: "cat", sceneId: "flowershop", text: "Đến Tiệm hoa: hỏi Cô Mèo bốn giờ chiều hôm qua cô ở đâu, rồi xem đơn đặt hoa.", when: { all: ["clue:letter", "clue:milk_drop"] }, done: { all: ["met:cat", "clue:flower_order"] } },
  { id: "fox", sceneId: "zoo", text: "Đến Sở thú: hỏi Cô Cáo và xem sổ cho ăn.", when: { all: ["met:cat", "clue:flower_order"] }, done: { all: ["met:fox", "clue:feed_log"] } },
  { id: "rabbit", sceneId: "bubbletea", text: "Đến Quán trà sữa: hỏi Bé Thỏ, xem bảng giờ và tìm quanh quầy.", when: { all: ["met:fox", "clue:feed_log"] }, done: { all: ["met:rabbit", "clue:closed_sign", "clue:red_box"] } },
  { id: "witness", sceneId: "hotpot", text: "Đến Quán lẩu: nghe Ông Rùa kể chuyện hôm qua.", when: { all: ["met:rabbit", "clue:closed_sign", "clue:red_box"] }, done: { all: ["clue:witness"] } },
  { id: "accuse", sceneId: "garage", text: "Về Tiệm sửa xe, nói với Chú Hổ bạn biết ai đã lấy hộp dụng cụ.", when: { all: ["clue:witness"] }, done: { all: ["case:solved"] } },
];
