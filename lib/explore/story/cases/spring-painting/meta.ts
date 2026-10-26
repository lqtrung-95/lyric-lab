import type { ClueDef, Objective, Speaker, Suspect } from "../../story-types";

export const SPEAKERS: Record<string, Speaker> = {
  player: { name: "Bạn (thám tử Gấu Trúc)", sprite: "guide" },
  owl: { name: "Cô Cú giám đốc", sprite: "owl" },
  chef: { name: "Bếp trưởng Gấu", sprite: "chef" },
  rabbit: { name: "Trưởng ga Thỏ", sprite: "rabbit" },
  cat: { name: "Cô Mèo thợ bánh", sprite: "cat" },
  dog: { name: "Chú Chó huấn luyện viên", sprite: "dog" },
};

/**
 * Manh mối vụ Khó. Người làm chứng nói dối (Thỏ) đổ lỗi cho người vô tội (Gấu) để che cho thủ phạm thật (Mèo), nên phải kiểm tra lời Thỏ chứ không tin ngay.
 * Vết kem chỉ về cả Gấu lẫn Mèo (đều làm bánh); phải loại Gấu bằng sổ bếp, chứng minh Thỏ nói dối bằng bảng đóng cửa sổ, và nối Mèo với tạp dề hồng mà Chó thấy
 * (Chó chỉ kể khi đã vạch trần lời Thỏ).
 */
export const CLUES: ClueDef[] = [
  { id: "cream_smear", title: "Vết kem trên tường", zh: "空画框旁边的墙上有一点白色的奶油。", vi: "Trên tường cạnh khung tranh trống có một vệt kem trắng.", sceneId: "museum", kind: "object" },
  { id: "visitor_book", title: "Sổ khách bảo tàng", zh: "昨天上午九点零五分,有人拿着一个大盒子进来。九点十五分出去。", vi: "Sáng qua 9 giờ 5 có người cầm một cái hộp lớn đi vào, 9 giờ 15 đi ra.", sceneId: "museum", kind: "document" },
  { id: "chef_alibi", title: "Lời khai của Bếp trưởng Gấu", zh: "昨天上午九点到九点半,我在厨房做饭。", vi: "Sáng qua từ 9 giờ đến 9 giờ 30, tôi nấu ăn trong bếp.", sceneId: "kitchen", kind: "testimony" },
  { id: "kitchen_log", title: "Sổ trực của nhà bếp", zh: "厨师昨天上午八点到十点一直在厨房。", vi: "Bếp trưởng ở trong bếp suốt từ 8 giờ đến 10 giờ sáng qua.", sceneId: "kitchen", kind: "document" },
  { id: "rabbit_alibi", title: "Lời khai của Trưởng ga Thỏ", zh: "我在火车站卖票。九点零五分,我看见厨师拿着一个大盒子走向博物馆。", vi: "Tôi bán vé ở ga tàu. 9 giờ 5, tôi thấy bếp trưởng cầm một cái hộp lớn đi về phía bảo tàng.", sceneId: "station", kind: "testimony" },
  { id: "window_closed", title: "Bảng ở cửa sổ bán vé", zh: "火车站售票窗口昨天上午八点五十到九点二十关门了。", vi: "Cửa sổ bán vé ở ga tàu sáng qua đóng từ 8 giờ 50 đến 9 giờ 20.", sceneId: "station", kind: "document" },
  { id: "rabbit_slip", title: "Thỏ đổi lời", zh: "我……我只是想帮朋友。", vi: "Tôi... tôi chỉ muốn giúp một người bạn.", sceneId: "station", kind: "testimony" },
  { id: "cat_alibi", title: "Lời khai của Cô Mèo", zh: "昨天上午九点到九点半,我在店里做蛋糕。", vi: "Sáng qua từ 9 giờ đến 9 giờ 30, tôi làm bánh trong tiệm.", sceneId: "bakery", kind: "testimony" },
  { id: "bakery_sign", title: "Biển đóng cửa tiệm bánh", zh: "面包店昨天上午九点到九点四十关门。", vi: "Tiệm bánh sáng qua đóng cửa từ 9 giờ đến 9 giờ 40.", sceneId: "bakery", kind: "document" },
  { id: "apron_color", title: "Màu tạp dề", zh: "猫的围裙是粉红色的,厨师的围裙是白色的。", vi: "Tạp dề của Mèo màu hồng, tạp dề của bếp trưởng màu trắng.", sceneId: "bakery", kind: "object" },
  { id: "dog_alibi", title: "Lời khai của Chú Chó", zh: "昨天上午九点到九点半,我在球场训练。", vi: "Sáng qua từ 9 giờ đến 9 giờ 30, tôi tập luyện ở sân.", sceneId: "stadium", kind: "testimony" },
  { id: "attendance", title: "Sổ điểm danh sân tập", zh: "小狗昨天上午八点半到十点都在球场训练。", vi: "Chó tập ở sân từ 8 giờ 30 đến 10 giờ sáng qua.", sceneId: "stadium", kind: "document" },
  { id: "dog_sighting", title: "Chó thấy người mặc tạp dề hồng", zh: "九点十分,我看见一个穿粉红围裙的人拿着一个大盒子,从博物馆跑回面包店。", vi: "9 giờ 10, tôi thấy một người mặc tạp dề hồng cầm một cái hộp lớn chạy từ bảo tàng về tiệm bánh.", sceneId: "stadium", kind: "testimony" },
];

export const SUSPECTS: Suspect[] = [
  { id: "chef", name: "Bếp trưởng Gấu", sprite: "chef", sceneId: "kitchen", metFlag: "met:chef", note: "Nói đang nấu trong bếp. Sổ trực xác nhận, nhưng có người nói thấy ông cầm hộp đi bảo tàng." },
  { id: "rabbit", name: "Trưởng ga Thỏ", sprite: "rabbit", sceneId: "station", metFlag: "met:rabbit", note: "Nói thấy bếp trưởng cầm hộp. Cửa sổ bán vé lại đóng đúng lúc đó." },
  { id: "cat", name: "Cô Mèo thợ bánh", sprite: "cat", sceneId: "bakery", metFlag: "met:cat", note: "Nói đang làm bánh trong tiệm. Nhưng tiệm đóng cửa, và tạp dề của cô màu hồng." },
  { id: "dog", name: "Chú Chó huấn luyện viên", sprite: "dog", sceneId: "stadium", metFlag: "met:dog", note: "Nói đang tập ở sân. Sổ điểm danh xác nhận, và ông thấy một người tạp dề hồng." },
];

export const OBJECTIVES: Objective[] = [
  { id: "talk-owl", sceneId: "museum", text: "Nói chuyện với Cô Cú ở Bảo tàng để nhận vụ án.", done: { all: ["met:owl"] } },
  { id: "inspect-museum", sceneId: "museum", text: "Xem xét bảo tàng: vệt trên tường và sổ khách.", when: { all: ["met:owl"] }, done: { all: ["clue:cream_smear", "clue:visitor_book"] } },
  { id: "chef", sceneId: "kitchen", text: "Đến Nhà bếp: hỏi Bếp trưởng Gấu và xem sổ trực.", when: { all: ["clue:cream_smear", "clue:visitor_book"] }, done: { all: ["met:chef", "clue:kitchen_log"] } },
  { id: "rabbit", sceneId: "station", text: "Đến Nhà ga: hỏi Trưởng ga Thỏ, xem bảng ở cửa sổ bán vé, rồi hỏi lại anh khi đã có chứng cứ.", when: { all: ["met:chef", "clue:kitchen_log"] }, done: { all: ["met:rabbit", "clue:window_closed", "clue:rabbit_slip"] } },
  { id: "cat", sceneId: "bakery", text: "Đến Tiệm bánh: hỏi Cô Mèo, xem biển đóng cửa và màu tạp dề.", when: { all: ["clue:rabbit_slip"] }, done: { all: ["met:cat", "clue:bakery_sign", "clue:apron_color"] } },
  { id: "dog", sceneId: "stadium", text: "Đến Sân vận động: hỏi Chú Chó, xem sổ điểm danh, rồi hỏi xem sáng qua ông có thấy ai chạy từ bảo tàng.", when: { all: ["met:cat", "clue:bakery_sign", "clue:apron_color"] }, done: { all: ["met:dog", "clue:attendance", "clue:dog_sighting"] } },
  { id: "accuse", sceneId: "museum", text: "Về Bảo tàng, nói với Cô Cú bạn biết ai đã lấy bức tranh.", when: { all: ["clue:dog_sighting"] }, done: { all: ["case:solved"] } },
];
