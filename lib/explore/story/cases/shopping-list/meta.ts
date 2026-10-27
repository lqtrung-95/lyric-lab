import type { ClueDef, Objective, Speaker, Suspect } from "../../story-types";

/** Nhân vật trong vụ án (id → tên hiển thị và sprite). Id người nói trùng id NPC của cảnh. */
export const SPEAKERS: Record<string, Speaker> = {
  player: { name: "Bạn (thám tử Gấu Trúc)", sprite: "guide" },
  fox: { name: "Cô Cáo nhân viên ngân hàng", sprite: "fox" },
  cat: { name: "Cô Mèo bán hàng", sprite: "cat" },
  dog: { name: "Chú Chó chủ cửa hàng", sprite: "dog" },
  duck: { name: "Chú Vịt khách sạn", sprite: "duck" },
  pig: { name: "Anh Heo thu ngân", sprite: "pig" },
};

/** Vụ bắt buộc đọc số và lượng từ: danh sách mua sắm của kẻ trộm (3 chai sữa, 2 cân táo, 1 con cá) chỉ khớp túi đồ của Heo; ba người còn lại sai một chi tiết (loại hàng, lượng từ, số lượng). */
export const CLUES: ClueDef[] = [
  { id: "shopping_list", title: "Danh sách mua sắm rơi lại", zh: "柜台上有一张购物清单:三瓶牛奶、两斤苹果、一条鱼。", vi: "Trên quầy có một danh sách mua sắm: ba chai sữa, hai cân táo, một con cá.", sceneId: "bank", kind: "document" },
  { id: "cat_talk", title: "Lời khai của Cô Mèo", zh: "昨天下午我去买东西了。", vi: "Chiều qua tôi đi mua đồ.", sceneId: "market", kind: "testimony" },
  { id: "bag_cat", title: "Túi đồ của Mèo", zh: "小猫的购物袋里有:三瓶果汁、两斤苹果、一条鱼。", vi: "Trong túi đồ của Mèo có: ba chai nước ép, hai cân táo, một con cá.", sceneId: "market", kind: "object" },
  { id: "dog_talk", title: "Lời khai của Chú Chó", zh: "昨天下午我去买东西了。", vi: "Chiều qua tôi đi mua đồ.", sceneId: "clothing-store", kind: "testimony" },
  { id: "bag_dog", title: "Túi đồ của Chó", zh: "小狗的购物袋里有:三盒牛奶、两斤苹果、一条鱼。", vi: "Trong túi đồ của Chó có: ba hộp sữa, hai cân táo, một con cá.", sceneId: "clothing-store", kind: "object" },
  { id: "duck_talk", title: "Lời khai của Chú Vịt", zh: "昨天下午我去买东西了。", vi: "Chiều qua tôi đi mua đồ.", sceneId: "hotel", kind: "testimony" },
  { id: "bag_duck", title: "Túi đồ của Vịt", zh: "小鸭的购物袋里有:三瓶牛奶、两斤苹果、两条鱼。", vi: "Trong túi đồ của Vịt có: ba chai sữa, hai cân táo, hai con cá.", sceneId: "hotel", kind: "object" },
  { id: "pig_talk", title: "Lời khai của Anh Heo", zh: "昨天下午我去买东西了。", vi: "Chiều qua tôi đi mua đồ.", sceneId: "supermarket", kind: "testimony" },
  { id: "bag_pig", title: "Túi đồ của Heo", zh: "小猪的购物袋里有:三瓶牛奶、两斤苹果、一条鱼。", vi: "Trong túi đồ của Heo có: ba chai sữa, hai cân táo, một con cá.", sceneId: "supermarket", kind: "object" },
  { id: "pig_slip", title: "Heo đổi lời", zh: "我……我只是想买点好吃的。", vi: "Tôi... tôi chỉ muốn mua ít đồ ngon thôi.", sceneId: "supermarket", kind: "testimony" },
  { id: "d_cat", title: "Mèo mua nước ép", zh: "小猫买的是果汁,不是牛奶,和清单不一样。", vi: "Mèo mua nước ép chứ không phải sữa, khác với danh sách.", sceneId: "bank", kind: "deduction", link: ["shopping_list", "bag_cat"] },
  { id: "d_dog", title: "Chó mua hộp, không phải chai", zh: "小狗买的是三盒牛奶,清单上是三瓶牛奶,量词不一样。", vi: "Chó mua ba hộp sữa, danh sách ghi ba chai sữa: lượng từ khác nhau.", sceneId: "bank", kind: "deduction", link: ["shopping_list", "bag_dog"] },
  { id: "d_duck", title: "Vịt mua hai con cá", zh: "小鸭买了两条鱼,清单上是一条鱼,数量不一样。", vi: "Vịt mua hai con cá, danh sách chỉ có một con: số lượng khác nhau.", sceneId: "bank", kind: "deduction", link: ["shopping_list", "bag_duck"] },
  { id: "d_pig", title: "Heo khớp hoàn toàn", zh: "小猪买的东西和清单一模一样:三瓶牛奶、两斤苹果、一条鱼。", vi: "Đồ Heo mua giống hệt danh sách: ba chai sữa, hai cân táo, một con cá.", sceneId: "bank", kind: "deduction", link: ["shopping_list", "bag_pig"] },
];

export const SUSPECTS: Suspect[] = [
  { id: "cat", name: "Cô Mèo bán hàng", sprite: "cat", sceneId: "market", metFlag: "met:cat", note: "Nói chiều qua đi mua đồ. Túi đồ của cô có thông tin về những gì đã mua." },
  { id: "dog", name: "Chú Chó chủ cửa hàng", sprite: "dog", sceneId: "clothing-store", metFlag: "met:dog", note: "Nói chiều qua đi mua đồ. Túi đồ của ông có thông tin về những gì đã mua." },
  { id: "duck", name: "Chú Vịt khách sạn", sprite: "duck", sceneId: "hotel", metFlag: "met:duck", note: "Nói chiều qua đi mua đồ. Túi đồ của anh có thông tin về những gì đã mua." },
  { id: "pig", name: "Anh Heo thu ngân", sprite: "pig", sceneId: "supermarket", metFlag: "met:pig", note: "Nói chiều qua đi mua đồ. Túi đồ của anh có thông tin về những gì đã mua." },
];

/** Các mục tiêu nối tiếp nhau; mục tiêu hiện tại hiện trên đầu cảnh để người chơi không bị lạc. */
export const OBJECTIVES: Objective[] = [
  { id: "talk-fox", sceneId: "bank", text: "Nói chuyện với Cô Cáo ở Ngân hàng để nhận vụ án.", done: { all: ["met:fox"] } },
  { id: "cat", sceneId: "market", text: "Đến Chợ: hỏi Cô Mèo và đọc túi đồ của cô.", when: { all: ["met:fox", "clue:shopping_list"] }, done: { all: ["met:cat", "clue:bag_cat"] } },
  { id: "dog", sceneId: "clothing-store", text: "Đến Cửa hàng: hỏi Chú Chó và đọc túi đồ của ông.", when: { all: ["met:cat", "clue:bag_cat"] }, done: { all: ["met:dog", "clue:bag_dog"] } },
  { id: "duck", sceneId: "hotel", text: "Đến Khách sạn: hỏi Chú Vịt và đọc túi đồ của anh.", when: { all: ["met:dog", "clue:bag_dog"] }, done: { all: ["met:duck", "clue:bag_duck"] } },
  { id: "pig", sceneId: "supermarket", text: "Đến Siêu thị: hỏi Anh Heo và đọc túi đồ của anh.", when: { all: ["met:duck", "clue:bag_duck"] }, done: { all: ["met:pig", "clue:bag_pig"] } },
  { id: "confront", sceneId: "supermarket", text: "Hỏi lại người có túi đồ khớp danh sách.", when: { all: ["met:pig", "clue:bag_pig"] }, done: { all: ["clue:pig_slip"] } },
  { id: "accuse", sceneId: "bank", text: "Về Ngân hàng, nói với Cô Cáo bạn biết ai đã lấy tiền.", when: { all: ["clue:pig_slip"] }, done: { all: ["case:solved"] } },
];
