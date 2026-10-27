import type { ClueDef, Objective, Speaker, Suspect } from "../../story-types";

/** Nhân vật trong vụ án (id → tên hiển thị và sprite). Id người nói trùng id NPC của cảnh. */
export const SPEAKERS: Record<string, Speaker> = {
  player: { name: "Bạn (thám tử Gấu Trúc)", sprite: "guide" },
  rabbit: { name: "Bác Thỏ bưu tá", sprite: "rabbit" },
  cat: { name: "Cô Mèo thợ tóc", sprite: "cat" },
  dog: { name: "Chú Chó huấn luyện viên", sprite: "dog" },
  duck: { name: "Chú Vịt tiệm giặt", sprite: "duck" },
  pig: { name: "Anh Heo bán máy", sprite: "pig" },
};

/** Vụ bắt buộc đọc tiếng Trung: manh mối chỉ ghi bằng chữ Hán (hướng đông/tây/nam/bắc, khoảng cách, số cây), bản dịch tiếng Việt bị giấu. Hai mảnh giấy của kẻ trộm (nhà ở phía đông, cách bưu điện chưa tới 200 mét) chỉ khớp nhà Chó. */
export const CLUES: ClueDef[] = [
  { id: "note_east", title: "Mảnh giấy thứ nhất", zh: "小偷留下的纸条:我家在邮局的东边。", vi: "Một dòng chữ tiếng Trung, không có bản dịch. Hãy tự đọc kỹ.", sceneId: "postoffice", kind: "document" },
  { id: "note_dist", title: "Mảnh giấy thứ hai", zh: "小偷留下的另一张纸条:我家离邮局不到两百米。", vi: "Một dòng chữ tiếng Trung, không có bản dịch. Hãy tự đọc kỹ.", sceneId: "postoffice", kind: "document" },
  { id: "cat_home_talk", title: "Lời khai của Cô Mèo", zh: "昨天下午我在家里休息。", vi: "Chiều qua tôi nghỉ ở nhà.", sceneId: "salon", kind: "testimony" },
  { id: "home_cat", title: "Biển địa chỉ nhà Mèo", zh: "门牌:小猫的家在邮局西边一百米,门口有两棵树。", vi: "Một dòng chữ tiếng Trung, không có bản dịch. Hãy tự đọc kỹ.", sceneId: "salon", kind: "object" },
  { id: "dog_home_talk", title: "Lời khai của Chú Chó", zh: "昨天下午我在家里休息。", vi: "Chiều qua tôi nghỉ ở nhà.", sceneId: "gym", kind: "testimony" },
  { id: "home_dog", title: "Biển địa chỉ nhà Chó", zh: "门牌:小狗的家在邮局东边一百五十米,门口有三棵树。", vi: "Một dòng chữ tiếng Trung, không có bản dịch. Hãy tự đọc kỹ.", sceneId: "gym", kind: "object" },
  { id: "dog_slip", title: "Chó đổi lời", zh: "我……我只是想看看那个包裹里有什么。", vi: "Tôi... tôi chỉ muốn xem trong bưu kiện có gì thôi.", sceneId: "gym", kind: "testimony" },
  { id: "duck_home_talk", title: "Lời khai của Chú Vịt", zh: "昨天下午我在家里休息。", vi: "Chiều qua tôi nghỉ ở nhà.", sceneId: "laundry", kind: "testimony" },
  { id: "home_duck", title: "Biển địa chỉ nhà Vịt", zh: "门牌:小鸭的家在邮局东边三百米,门口有两棵树。", vi: "Một dòng chữ tiếng Trung, không có bản dịch. Hãy tự đọc kỹ.", sceneId: "laundry", kind: "object" },
  { id: "pig_home_talk", title: "Lời khai của Anh Heo", zh: "昨天下午我在家里休息。", vi: "Chiều qua tôi nghỉ ở nhà.", sceneId: "phoneshop", kind: "testimony" },
  { id: "home_pig", title: "Biển địa chỉ nhà Heo", zh: "门牌:小猪的家在邮局北边一百五十米,门口有三棵树。", vi: "Một dòng chữ tiếng Trung, không có bản dịch. Hãy tự đọc kỹ.", sceneId: "phoneshop", kind: "object" },
  { id: "d_cat", title: "Suy luận: nhà Mèo ở phía tây", zh: "小猫的家在西边,可是纸条说小偷的家在东边,所以不是小猫。", vi: "Nhà Mèo ở phía tây, còn tờ giấy nói nhà kẻ trộm ở phía đông, nên không phải Mèo.", sceneId: "postoffice", kind: "deduction", link: ["note_east", "home_cat"] },
  { id: "d_pig", title: "Suy luận: nhà Heo ở phía bắc", zh: "小猪的家在北边,可是纸条说小偷的家在东边,所以不是小猪。", vi: "Nhà Heo ở phía bắc, còn tờ giấy nói nhà kẻ trộm ở phía đông, nên không phải Heo.", sceneId: "postoffice", kind: "deduction", link: ["note_east", "home_pig"] },
  { id: "d_duck", title: "Suy luận: nhà Vịt quá xa", zh: "小鸭的家离邮局三百米,可是纸条说不到两百米,所以不是小鸭。", vi: "Nhà Vịt cách bưu điện 300 mét, còn tờ giấy nói chưa tới 200 mét, nên không phải Vịt.", sceneId: "postoffice", kind: "deduction", link: ["note_dist", "home_duck"] },
  { id: "d_dog_east", title: "Suy luận: nhà Chó ở phía đông", zh: "小狗的家在邮局东边,和纸条一样。", vi: "Nhà Chó ở phía đông bưu điện, khớp với tờ giấy thứ nhất.", sceneId: "postoffice", kind: "deduction", link: ["note_east", "home_dog"] },
  { id: "d_dog_near", title: "Suy luận: nhà Chó đủ gần", zh: "小狗的家离邮局一百五十米,不到两百米,和纸条一样。", vi: "Nhà Chó cách bưu điện 150 mét, chưa tới 200 mét, khớp với tờ giấy thứ hai.", sceneId: "postoffice", kind: "deduction", link: ["note_dist", "home_dog"] },
];

export const SUSPECTS: Suspect[] = [
  { id: "cat", name: "Cô Mèo thợ tóc", sprite: "cat", sceneId: "salon", metFlag: "met:cat", note: "Nói chiều qua nghỉ ở nhà. Biển địa chỉ có thông tin về nhà cô." },
  { id: "dog", name: "Chú Chó huấn luyện viên", sprite: "dog", sceneId: "gym", metFlag: "met:dog", note: "Nói chiều qua nghỉ ở nhà. Biển địa chỉ có thông tin về nhà ông." },
  { id: "duck", name: "Chú Vịt tiệm giặt", sprite: "duck", sceneId: "laundry", metFlag: "met:duck", note: "Nói chiều qua nghỉ ở nhà. Biển địa chỉ có thông tin về nhà anh." },
  { id: "pig", name: "Anh Heo bán máy", sprite: "pig", sceneId: "phoneshop", metFlag: "met:pig", note: "Nói chiều qua nghỉ ở nhà. Biển địa chỉ có thông tin về nhà anh." },
];

/** Các mục tiêu nối tiếp nhau; mục tiêu hiện tại hiện trên đầu cảnh để người chơi không bị lạc. */
export const OBJECTIVES: Objective[] = [
  { id: "talk-rabbit", sceneId: "postoffice", text: "Nói chuyện với Bác Thỏ ở Bưu điện để nhận vụ án.", done: { all: ["met:rabbit"] } },
  { id: "cat", sceneId: "salon", text: "Đến Hiệu cắt tóc: hỏi Cô Mèo và đọc biển địa chỉ nhà cô.", when: { all: ["met:rabbit"] }, done: { all: ["met:cat", "clue:home_cat"] } },
  { id: "dog", sceneId: "gym", text: "Đến Phòng gym: hỏi Chú Chó và đọc biển địa chỉ nhà ông.", when: { all: ["met:cat", "clue:home_cat"] }, done: { all: ["met:dog", "clue:home_dog"] } },
  { id: "duck", sceneId: "laundry", text: "Đến Tiệm giặt: hỏi Chú Vịt và đọc biển địa chỉ nhà anh.", when: { all: ["met:dog", "clue:home_dog"] }, done: { all: ["met:duck", "clue:home_duck"] } },
  { id: "pig", sceneId: "phoneshop", text: "Đến Cửa hàng điện thoại: hỏi Anh Heo và đọc biển địa chỉ nhà anh.", when: { all: ["met:duck", "clue:home_duck"] }, done: { all: ["met:pig", "clue:home_pig"] } },
  { id: "confront", sceneId: "gym", text: "Hỏi lại người có nhà khớp cả hai mảnh giấy.", when: { all: ["met:pig", "clue:home_pig"] }, done: { all: ["clue:dog_slip"] } },
  { id: "accuse", sceneId: "postoffice", text: "Về Bưu điện, nói với Bác Thỏ bạn biết ai đã lấy bưu kiện.", when: { all: ["clue:dog_slip"] }, done: { all: ["case:solved"] } },
];
