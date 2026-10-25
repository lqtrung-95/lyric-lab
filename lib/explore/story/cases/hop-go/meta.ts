import type { ClueDef, Objective, Speaker, Suspect } from "../../story-types";

/** Nhân vật trong vụ án (id → tên hiển thị và sprite). */
export const SPEAKERS: Record<string, Speaker> = {
  player: { name: "Bạn (thám tử Gấu Trúc)", sprite: "guide" },
  owl: { name: "Cú Thầy", sprite: "owl" },
  chef: { name: "Bếp trưởng Gấu", sprite: "chef" },
  cat: { name: "Cô Mèo bán hàng", sprite: "cat" },
  rabbit: { name: "Trưởng ga Thỏ", sprite: "rabbit" },
  fox: { name: "Bác sĩ Cáo", sprite: "fox" },
  turtle: { name: "Ông Rùa", sprite: "turtle" },
};

/** Manh mối. `testimony` là lời khai (ghi khi hiểu đúng câu kiểm tra), `document`/`object` là thứ tìm được trong cảnh. */
export const CLUES: ClueDef[] = [
  { id: "letter", title: "Lá thư của Cú Thầy", zh: "我的木盒子昨天下午三点不见了。请你帮帮我。", vi: "Hộp gỗ của tôi biến mất lúc ba giờ chiều hôm qua. Xin bạn giúp tôi.", sceneId: "phong", kind: "document" },
  { id: "pen", title: "Cây bút xanh", zh: "窗户旁边有一支蓝色的笔,笔上写着一个“医”字。", vi: "Cạnh cửa sổ có một cây bút màu xanh dương, trên bút viết một chữ “医” (y).", sceneId: "phong", kind: "object" },
  { id: "chef_alibi", title: "Lời khai của Bếp trưởng Gấu", zh: "昨天下午三点,我在厨房做饭。", vi: "Ba giờ chiều hôm qua, tôi đang nấu cơm trong bếp.", sceneId: "quan-an", kind: "testimony" },
  { id: "receipt", title: "Tờ hóa đơn quán ăn", zh: "昨天下午三点,这里有二十个客人。厨师一直在做饭。", vi: "Ba giờ chiều hôm qua, ở đây có hai mươi khách. Đầu bếp nấu ăn suốt.", sceneId: "quan-an", kind: "document" },
  { id: "cat_alibi", title: "Lời khai của Cô Mèo", zh: "昨天下午三点,我在市场卖水果。", vi: "Ba giờ chiều hôm qua, tôi đang bán trái cây ở chợ.", sceneId: "cho", kind: "testimony" },
  { id: "price_note", title: "Tờ giấy ghi giá", zh: "下午三点,很多人在这里买水果。小猫一直在这里。", vi: "Ba giờ chiều, nhiều người mua trái cây ở đây. Mèo nhỏ ở đây suốt.", sceneId: "cho", kind: "document" },
  { id: "rabbit_alibi", title: "Lời khai của Trưởng ga Thỏ", zh: "昨天下午三点,我在火车站工作。", vi: "Ba giờ chiều hôm qua, tôi đang làm việc ở ga tàu.", sceneId: "nha-ga", kind: "testimony" },
  { id: "ticket_log", title: "Sổ ghi vé tàu", zh: "昨天下午三点,兔子在火车站卖票。", vi: "Ba giờ chiều hôm qua, Thỏ đang bán vé ở ga tàu.", sceneId: "nha-ga", kind: "document" },
  { id: "fox_alibi", title: "Lời khai của Bác sĩ Cáo", zh: "昨天我生病了,一天都在医院睡觉。", vi: "Hôm qua tôi bị ốm, cả ngày ngủ ở bệnh viện.", sceneId: "benh-vien", kind: "testimony" },
  { id: "sign_sheet", title: "Bảng ký tên ra vào", zh: "医生昨天下午两点就离开医院了。", vi: "Hôm qua bác sĩ đã rời bệnh viện từ hai giờ chiều.", sceneId: "benh-vien", kind: "document" },
  { id: "pens_jar", title: "Ống bút của bác sĩ", zh: "医生桌子上的笔都是蓝色的,每支笔上都写着“医”字。", vi: "Bút trên bàn bác sĩ đều màu xanh dương, trên mỗi cây đều viết chữ “医” (y), giống hệt cây bút ở phòng Cú Thầy.", sceneId: "benh-vien", kind: "object" },
  { id: "witness", title: "Lời khai của Ông Rùa", zh: "昨天下午三点,我在公园看见一只狐狸。他手里有一个木盒子。", vi: "Ba giờ chiều hôm qua, tôi nhìn thấy một con cáo trong công viên. Trong tay nó có một cái hộp gỗ.", sceneId: "cong-vien", kind: "testimony" },
];

export const SUSPECTS: Suspect[] = [
  { id: "chef", name: "Bếp trưởng Gấu", sprite: "chef", sceneId: "quan-an", metFlag: "met:chef", note: "Nói ba giờ chiều ở trong bếp. Tờ hóa đơn cho thấy quán rất đông khách." },
  { id: "cat", name: "Cô Mèo bán hàng", sprite: "cat", sceneId: "cho", metFlag: "met:cat", note: "Nói ba giờ chiều đang bán trái cây ở chợ. Tờ giấy ghi giá có nhiều người nhìn thấy cô." },
  { id: "rabbit", name: "Trưởng ga Thỏ", sprite: "rabbit", sceneId: "nha-ga", metFlag: "met:rabbit", note: "Nói ba giờ chiều làm việc ở ga. Sổ ghi vé cho thấy anh đang bán vé." },
  { id: "fox", name: "Bác sĩ Cáo", sprite: "fox", sceneId: "benh-vien", metFlag: "met:fox", note: "Nói hôm qua ốm và ngủ cả ngày ở bệnh viện. Nhưng có điều gì đó không khớp…" },
];

/** Các mục tiêu nối tiếp nhau; mục tiêu hiện tại hiện trên đầu cảnh để người chơi không bị lạc. */
export const OBJECTIVES: Objective[] = [
  { id: "talk-owl", sceneId: "phong", text: "Nói chuyện với Cú Thầy ở Phòng của bạn để nhận vụ án.", done: { all: ["met:owl"] } },
  { id: "inspect-room", sceneId: "phong", text: "Xem xét căn phòng: đọc lá thư và tìm manh mối quanh cửa sổ.", when: { all: ["met:owl"] }, done: { all: ["clue:letter", "clue:pen"] } },
  { id: "chef", sceneId: "quan-an", text: "Đến Quán ăn: hỏi Bếp trưởng Gấu ba giờ chiều hôm qua ông ở đâu, rồi xem tờ hóa đơn.", when: { all: ["clue:letter", "clue:pen"] }, done: { all: ["met:chef", "clue:receipt"] } },
  { id: "cat", sceneId: "cho", text: "Ra Chợ: hỏi Cô Mèo bán hàng và tìm tờ giấy ghi giá.", when: { all: ["met:chef", "clue:receipt"] }, done: { all: ["met:cat", "clue:price_note"] } },
  { id: "rabbit", sceneId: "nha-ga", text: "Đến Nhà ga: hỏi Trưởng ga Thỏ và xem sổ ghi vé.", when: { all: ["met:cat", "clue:price_note"] }, done: { all: ["met:rabbit", "clue:ticket_log"] } },
  { id: "fox", sceneId: "benh-vien", text: "Đến Bệnh viện: hỏi Bác sĩ Cáo, xem bảng ký tên và ống bút trên bàn.", when: { all: ["met:rabbit", "clue:ticket_log"] }, done: { all: ["met:fox", "clue:sign_sheet", "clue:pens_jar"] } },
  { id: "witness", sceneId: "cong-vien", text: "Ra Công viên: nghe Ông Rùa kể chuyện hôm qua.", when: { all: ["met:fox", "clue:sign_sheet", "clue:pens_jar"] }, done: { all: ["clue:witness"] } },
  { id: "accuse", sceneId: "phong", text: "Về Phòng của bạn, nói với Cú Thầy bạn biết ai đã lấy hộp gỗ.", when: { all: ["clue:witness"] }, done: { all: ["case:solved"] } },
];
