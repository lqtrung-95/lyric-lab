import type { ClueDef, Objective, Speaker, Suspect } from "../../story-types";

/** Nhân vật trong vụ án (id → tên hiển thị và sprite). Id người nói trùng id NPC của cảnh. */
export const SPEAKERS: Record<string, Speaker> = {
  player: { name: "Bạn (thám tử Gấu Trúc)", sprite: "guide" },
  fox: { name: "Cô Cáo kiểm lâm", sprite: "fox" },
  dog: { name: "Chú Chó cảnh sát", sprite: "dog" },
  owl: { name: "Cụ Cú nhà khoa học", sprite: "owl" },
  pig: { name: "Anh Heo soát vé", sprite: "pig" },
};

/** Đố vị trí: ba lều (đỏ, xanh dương, xanh lá) xếp một hàng, ba chủ lều là Cú, Chó, Heo. Từ các câu "bên trái", "không ở ngoài cùng bên phải", "cạnh", "không phải màu đỏ", "màu xanh dương", "ở chính giữa" suy ra thứ tự: xanh lá (Cú), đỏ (Chó), xanh dương (Heo). Bản đồ cũ là mồi nhử. */
export const CLUES: ClueDef[] = [
  { id: "letter", title: "Lời báo của Cô Cáo", zh: "昨天晚上,有人从最中间的帐篷里拿走了一块金表。", vi: "Tối qua có người lấy một chiếc đồng hồ vàng từ chiếc lều ở chính giữa.", sceneId: "camping", kind: "testimony" },
  { id: "tent_notice", title: "Bảng thông báo khu trại", zh: "三顶帐篷排成一排:红的、蓝的和绿的。红帐篷在蓝帐篷的左边。", vi: "Ba chiếc lều xếp thành một hàng: đỏ, xanh dương và xanh lá. Lều đỏ ở bên trái lều xanh dương.", sceneId: "camping", kind: "document" },
  { id: "green_note", title: "Tờ ghi chú của kiểm lâm", zh: "绿帐篷不在最右边。", vi: "Lều xanh lá không nằm ở ngoài cùng bên phải.", sceneId: "camping", kind: "document" },
  { id: "old_map", title: "Bản đồ khu trại", zh: "营地地图上,绿帐篷在最右边。", vi: "Trên bản đồ khu trại, lều xanh lá nằm ở ngoài cùng bên phải.", sceneId: "camping", kind: "document" },
  { id: "dog_tent", title: "Lời khai của Chú Chó", zh: "我的帐篷挨着小猪的帐篷。", vi: "Lều của tôi nằm cạnh lều của Heo.", sceneId: "police", kind: "testimony" },
  { id: "police_report", title: "Ghi chép của cảnh sát", zh: "小偷的帐篷在失窃的帐篷左边。", vi: "Lều của kẻ trộm nằm bên trái lều bị mất đồ.", sceneId: "police", kind: "document" },
  { id: "owl_tent", title: "Lời khai của Cụ Cú", zh: "我的帐篷不是红色的。", vi: "Lều của tôi không phải màu đỏ.", sceneId: "lab", kind: "testimony" },
  { id: "footprint", title: "Dấu chân cạnh lều", zh: "帐篷旁边有一个脚印,是四十二码的。", vi: "Cạnh lều có một dấu chân, cỡ giày 42.", sceneId: "lab", kind: "object" },
  { id: "pig_tent", title: "Lời khai của Anh Heo", zh: "我的帐篷是蓝色的。", vi: "Lều của tôi màu xanh dương.", sceneId: "subway", kind: "testimony" },
  { id: "rain_notice", title: "Thông báo của ga", zh: "地铁站的广播说:今晚有雨。", vi: "Loa của ga tàu điện ngầm thông báo: tối nay có mưa.", sceneId: "subway", kind: "document" },
];

export const SUSPECTS: Suspect[] = [
  { id: "dog", name: "Chú Chó cảnh sát (chủ chiếc lều bị mất đồ)", sprite: "dog", sceneId: "police", metFlag: "met:dog", note: "Là người mất đồng hồ vàng. Lều của chú nằm ở đâu trong hàng?" },
  { id: "owl", name: "Cụ Cú nhà khoa học", sprite: "owl", sceneId: "lab", metFlag: "met:owl", note: "Một trong ba người cắm trại. Lều của cụ màu gì?" },
  { id: "pig", name: "Anh Heo soát vé", sprite: "pig", sceneId: "subway", metFlag: "met:pig", note: "Một trong ba người cắm trại. Lều của anh màu gì?" },
];

/** Các mục tiêu nối tiếp nhau; mục tiêu hiện tại hiện trên đầu cảnh để người chơi không bị lạc. */
export const OBJECTIVES: Objective[] = [
  { id: "talk-fox", sceneId: "camping", text: "Nói chuyện với Cô Cáo ở Khu cắm trại để nhận vụ án.", done: { all: ["met:fox"] } },
  { id: "inspect-camp", sceneId: "camping", text: "Xem xét khu trại: đọc lời báo, bảng thông báo, tờ ghi chú và cả bản đồ (bản đồ có đáng tin không?).", when: { all: ["met:fox"] }, done: { all: ["clue:letter", "clue:tent_notice", "clue:green_note", "clue:old_map"] } },
  { id: "dog", sceneId: "police", text: "Đến Đồn cảnh sát: hỏi Chú Chó về lều của chú và đọc ghi chép của cảnh sát.", when: { all: ["clue:letter", "clue:tent_notice", "clue:green_note", "clue:old_map"] }, done: { all: ["met:dog", "clue:police_report"] } },
  { id: "owl", sceneId: "lab", text: "Đến Phòng thí nghiệm: hỏi Cụ Cú về màu lều và xem dấu chân.", when: { all: ["met:dog", "clue:police_report"] }, done: { all: ["met:owl", "clue:footprint"] } },
  { id: "pig", sceneId: "subway", text: "Đến Ga tàu điện ngầm: hỏi Anh Heo về màu lều.", when: { all: ["met:owl", "clue:footprint"] }, done: { all: ["met:pig", "clue:rain_notice"] } },
  { id: "accuse", sceneId: "camping", text: "Về Khu cắm trại, ghép các câu lại để biết ba lều xếp thế nào, rồi nói với Cô Cáo ai đã lấy đồng hồ vàng.", when: { all: ["met:pig", "clue:rain_notice"] }, done: { all: ["case:solved"] } },
];
