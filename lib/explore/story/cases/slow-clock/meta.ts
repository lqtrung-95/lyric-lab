import type { ClueDef, Objective, Speaker, Suspect } from "../../story-types";

/** Nhân vật trong vụ án (id → tên hiển thị và sprite). Id người nói trùng id NPC của cảnh. */
export const SPEAKERS: Record<string, Speaker> = {
  player: { name: "Bạn (thám tử Gấu Trúc)", sprite: "guide" },
  cat: { name: "Cô Mèo chủ tiệm hoa", sprite: "cat" },
  tiger: { name: "Chú Hổ thợ máy", sprite: "tiger" },
  rabbit: { name: "Bé Thỏ pha chế", sprite: "rabbit" },
  fox: { name: "Cô Cáo nhân viên sở thú", sprite: "fox" },
  turtle: { name: "Ông Rùa chủ quán", sprite: "turtle" },
};

/**
 * Manh mối. Bước ngoặt: Mèo báo mất lúc năm giờ, nhưng đồng hồ trong tiệm chạy chậm hai tiếng nên thời điểm thật là ba giờ; ai cũng có bằng chứng vắng mặt lúc năm giờ, phải hỏi lại về ba giờ.
 * Mồi nhử: đóa hồng trong hộp dụng cụ của Hổ (anh mua tối qua tặng vợ). Thủ phạm Cáo: sổ cho ăn ghi ba giờ không ai cho thú ăn, cánh hoa hồng cạnh lồng, Rùa thấy cáo cầm hoa.
 */
export const CLUES: ClueDef[] = [
  { id: "letter", title: "Lời báo án của Cô Mèo", zh: "我的大花束昨天下午五点不见了。", vi: "Bó hoa lớn của tôi biến mất lúc năm giờ chiều hôm qua.", sceneId: "flowershop", kind: "testimony" },
  { id: "slow_clock", title: "Đồng hồ chạy chậm", zh: "花店墙上的钟慢了两个小时。所以花束是昨天下午三点不见的。", vi: "Đồng hồ treo tường ở tiệm hoa chạy chậm hai tiếng. Vì vậy bó hoa biến mất lúc ba giờ chiều hôm qua.", sceneId: "flowershop", kind: "object" },
  { id: "tiger_alibi", title: "Lời khai của Chú Hổ", zh: "昨天下午三点,我在店里修车。", vi: "Ba giờ chiều hôm qua, tôi đang sửa xe trong tiệm.", sceneId: "garage", kind: "testimony" },
  { id: "repair_sheet", title: "Phiếu sửa xe", zh: "昨天下午三点,老虎一直在修一辆红车。", vi: "Ba giờ chiều hôm qua, Hổ sửa một chiếc xe đỏ suốt.", sceneId: "garage", kind: "document" },
  { id: "tiger_rose", title: "Đóa hồng trong hộp dụng cụ", zh: "老虎的工具箱里有一朵玫瑰。", vi: "Trong hộp dụng cụ của Hổ có một đóa hoa hồng.", sceneId: "garage", kind: "object" },
  { id: "rabbit_alibi", title: "Lời khai của Bé Thỏ", zh: "昨天下午三点,我在店里做奶茶。", vi: "Ba giờ chiều hôm qua, tôi đang pha trà sữa ở quán.", sceneId: "bubbletea", kind: "testimony" },
  { id: "order_sheet", title: "Phiếu gọi đồ uống", zh: "昨天下午三点,有二十位客人买奶茶。兔子一直在做。", vi: "Ba giờ chiều hôm qua, có hai mươi khách mua trà sữa. Thỏ pha suốt.", sceneId: "bubbletea", kind: "document" },
  { id: "fox_alibi", title: "Lời khai của Cô Cáo", zh: "昨天下午三点,我在动物园喂动物。", vi: "Ba giờ chiều hôm qua, tôi đang cho động vật ăn ở sở thú.", sceneId: "zoo", kind: "testimony" },
  { id: "feed_log", title: "Sổ cho ăn", zh: "昨天下午三点,没有人喂动物。", vi: "Ba giờ chiều hôm qua, không có ai cho động vật ăn.", sceneId: "zoo", kind: "document" },
  { id: "petals", title: "Cánh hoa hồng cạnh lồng", zh: "笼子旁边有很多玫瑰花瓣。", vi: "Cạnh cái lồng có rất nhiều cánh hoa hồng.", sceneId: "zoo", kind: "object" },
  { id: "witness", title: "Lời khai của Ông Rùa", zh: "昨天下午三点,我在火锅店看见一只狐狸。她手里有一束花。", vi: "Ba giờ chiều hôm qua, tôi thấy một con cáo trong quán lẩu. Trong tay cô ấy có một bó hoa.", sceneId: "hotpot", kind: "testimony" },
];

export const SUSPECTS: Suspect[] = [
  { id: "tiger", name: "Chú Hổ thợ máy", sprite: "tiger", sceneId: "garage", metFlag: "met:tiger", note: "Nói ba giờ chiều đang sửa xe. Phiếu sửa xe xác nhận, còn đóa hồng trong hộp dụng cụ thì sao?" },
  { id: "rabbit", name: "Bé Thỏ pha chế", sprite: "rabbit", sceneId: "bubbletea", metFlag: "met:rabbit", note: "Nói ba giờ chiều đang pha trà sữa. Phiếu gọi đồ uống xác nhận bé pha suốt." },
  { id: "fox", name: "Cô Cáo nhân viên sở thú", sprite: "fox", sceneId: "zoo", metFlag: "met:fox", note: "Nói ba giờ chiều đang cho động vật ăn. Nhưng có điều gì đó không khớp…" },
];

/** Các mục tiêu nối tiếp nhau. Đồng hồ chậm đổi cả khung giờ điều tra: các nghi phạm phải được hỏi về ba giờ chiều, không phải năm giờ. */
export const OBJECTIVES: Objective[] = [
  { id: "talk-cat", sceneId: "flowershop", text: "Nói chuyện với Cô Mèo ở Tiệm hoa để nhận vụ án.", done: { all: ["met:cat"] } },
  { id: "inspect-shop", sceneId: "flowershop", text: "Xem xét tiệm hoa: đọc lời báo án và nhìn kỹ cái đồng hồ trên tường (nó chạy đúng không?).", when: { all: ["met:cat"] }, done: { all: ["clue:letter", "clue:slow_clock"] } },
  { id: "tiger", sceneId: "garage", text: "Đến Tiệm sửa xe: hỏi Chú Hổ chuyện lúc ba giờ chiều (giờ thật), xem phiếu sửa xe và hộp dụng cụ.", when: { all: ["clue:letter", "clue:slow_clock"] }, done: { all: ["met:tiger", "clue:repair_sheet", "clue:tiger_rose"] } },
  { id: "rabbit", sceneId: "bubbletea", text: "Đến Quán trà sữa: hỏi Bé Thỏ và xem phiếu gọi đồ uống.", when: { all: ["met:tiger", "clue:repair_sheet", "clue:tiger_rose"] }, done: { all: ["met:rabbit", "clue:order_sheet"] } },
  { id: "fox", sceneId: "zoo", text: "Đến Sở thú: hỏi Cô Cáo, xem sổ cho ăn và tìm quanh các lồng.", when: { all: ["met:rabbit", "clue:order_sheet"] }, done: { all: ["met:fox", "clue:feed_log", "clue:petals"] } },
  { id: "witness", sceneId: "hotpot", text: "Đến Quán lẩu: nghe Ông Rùa kể chuyện lúc ba giờ chiều hôm qua.", when: { all: ["met:fox", "clue:feed_log", "clue:petals"] }, done: { all: ["clue:witness"] } },
  { id: "accuse", sceneId: "flowershop", text: "Về Tiệm hoa, nói với Cô Mèo bạn biết ai đã lấy bó hoa.", when: { all: ["clue:witness"] }, done: { all: ["case:solved"] } },
];
