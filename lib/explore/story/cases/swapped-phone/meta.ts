import type { ClueDef, Objective, Speaker, Suspect } from "../../story-types";

/** Nhân vật trong vụ án (id → tên hiển thị và sprite). Id người nói trùng id NPC của cảnh. */
export const SPEAKERS: Record<string, Speaker> = {
  player: { name: "Bạn (thám tử Gấu Trúc)", sprite: "guide" },
  pig: { name: "Anh Heo bán máy", sprite: "pig" },
  fox: { name: "Cô Cáo dược sĩ", sprite: "fox" },
  cat: { name: "Cô Mèo thợ tóc", sprite: "cat" },
  rabbit: { name: "Bác Thỏ bưu tá", sprite: "rabbit" },
  turtle: { name: "Ông Rùa chủ quán", sprite: "turtle" },
};

/**
 * Manh mối. Bước ngoặt: nhãn thuốc dán trên chiếc điện thoại giả chỉ thẳng vào Cáo, nhưng hóa đơn cho thấy Cáo ở hiệu thuốc suốt; nhãn là đồ bị đem ra gài tội,
 * và nó nằm trong hộp ở cửa mà ai cũng lấy được. Mèo khai ở nhà (không ai làm chứng nhưng hàng xóm nghe tiếng ti vi). Thỏ khai đang giao bưu kiện nhưng bưu điện đóng cửa từ 6 giờ rưỡi.
 */
export const CLUES: ClueDef[] = [
  { id: "report", title: "Lời báo án của Anh Heo", zh: "昨天晚上七点,我在火锅店吃饭。我的新手机被人换成了假手机。", vi: "Bảy giờ tối hôm qua, tôi ăn ở quán lẩu. Điện thoại mới của tôi bị ai đó tráo thành điện thoại giả.", sceneId: "phoneshop", kind: "testimony" },
  { id: "fake_phone", title: "Chiếc điện thoại giả", zh: "假手机的后面贴着一张药店的标签。", vi: "Mặt sau chiếc điện thoại giả có dán một cái nhãn của hiệu thuốc.", sceneId: "phoneshop", kind: "object" },
  { id: "fox_alibi", title: "Lời khai của Cô Cáo", zh: "昨天晚上七点,我在药店卖药。", vi: "Bảy giờ tối hôm qua, tôi đang bán thuốc ở hiệu thuốc.", sceneId: "pharmacy", kind: "testimony" },
  { id: "pharmacy_log", title: "Hóa đơn hiệu thuốc", zh: "昨天晚上七点,很多人来药店买药。狐狸一直在这里。", vi: "Bảy giờ tối hôm qua, nhiều người đến hiệu thuốc mua thuốc. Cáo ở đây suốt.", sceneId: "pharmacy", kind: "document" },
  { id: "label_box", title: "Hộp nhãn ở cửa hiệu thuốc", zh: "药店门口有一个盒子,标签都放在里面,谁都可以拿。昨天晚上六点,兔子来过这里。", vi: "Trước cửa hiệu thuốc có một cái hộp đựng nhãn, ai cũng lấy được. Sáu giờ tối hôm qua, Thỏ đã đến đây.", sceneId: "pharmacy", kind: "object" },
  { id: "cat_alibi", title: "Lời khai của Cô Mèo", zh: "昨天晚上七点,我在家看电视。", vi: "Bảy giờ tối hôm qua, tôi đang xem ti vi ở nhà.", sceneId: "salon", kind: "testimony" },
  { id: "neighbor_note", title: "Lời hàng xóm của Mèo", zh: "昨天晚上七点,小猫家里有电视的声音。", vi: "Bảy giờ tối hôm qua, trong nhà Mèo nhỏ có tiếng ti vi.", sceneId: "salon", kind: "document" },
  { id: "rabbit_alibi", title: "Lời khai của Bác Thỏ", zh: "昨天晚上七点,我在邮局送包裹。", vi: "Bảy giờ tối hôm qua, tôi đang gửi bưu kiện ở bưu điện.", sceneId: "postoffice", kind: "testimony" },
  { id: "post_log", title: "Bảng giờ của bưu điện", zh: "这家邮局昨天晚上六点半就关门了。", vi: "Bưu điện này hôm qua đã đóng cửa từ 6 giờ rưỡi tối.", sceneId: "postoffice", kind: "document" },
  { id: "rabbit_bag", title: "Túi thư của Bác Thỏ", zh: "兔子的邮袋里有很多药店的标签。", vi: "Trong túi thư của Thỏ có rất nhiều nhãn của hiệu thuốc.", sceneId: "postoffice", kind: "object" },
  { id: "witness", title: "Lời khai của Ông Rùa", zh: "昨天晚上七点,我在火锅店看见一只兔子。他在桌子旁边换了一个手机。", vi: "Bảy giờ tối hôm qua, tôi thấy một con thỏ trong quán lẩu. Nó tráo một chiếc điện thoại cạnh cái bàn.", sceneId: "hotpot", kind: "testimony" },
];

export const SUSPECTS: Suspect[] = [
  { id: "fox", name: "Cô Cáo dược sĩ", sprite: "fox", sceneId: "pharmacy", metFlag: "met:fox", note: "Nhãn trên điện thoại giả là của hiệu thuốc, nên ai cũng nghi cô. Nhưng hóa đơn nói gì?" },
  { id: "cat", name: "Cô Mèo thợ tóc", sprite: "cat", sceneId: "salon", metFlag: "met:cat", note: "Nói bảy giờ tối ở nhà xem ti vi, không có ai ở cùng." },
  { id: "rabbit", name: "Bác Thỏ bưu tá", sprite: "rabbit", sceneId: "postoffice", metFlag: "met:rabbit", note: "Nói bảy giờ tối đang gửi bưu kiện ở bưu điện. Nhưng bưu điện mở đến mấy giờ?" },
];

/** Các mục tiêu nối tiếp nhau. Cáo bị nghi trước; chỉ khi đã xóa nghi cho Cáo thì mới hỏi tiếp Mèo, rồi Thỏ, rồi nhân chứng. */
export const OBJECTIVES: Objective[] = [
  { id: "talk-pig", sceneId: "phoneshop", text: "Nói chuyện với Anh Heo ở Cửa hàng điện thoại để nhận vụ án.", done: { all: ["met:pig"] } },
  { id: "inspect-shop", sceneId: "phoneshop", text: "Xem xét cửa hàng: đọc lời báo án và xem kỹ chiếc điện thoại giả.", when: { all: ["met:pig"] }, done: { all: ["clue:report", "clue:fake_phone"] } },
  { id: "fox", sceneId: "pharmacy", text: "Đến Hiệu thuốc: hỏi Cô Cáo, xem hóa đơn, rồi tìm cái hộp nhãn trước cửa.", when: { all: ["clue:report", "clue:fake_phone"] }, done: { all: ["met:fox", "clue:pharmacy_log", "clue:label_box"] } },
  { id: "cat", sceneId: "salon", text: "Đến Hiệu cắt tóc: hỏi Cô Mèo và nghe lời hàng xóm.", when: { all: ["met:fox", "clue:pharmacy_log", "clue:label_box"] }, done: { all: ["met:cat", "clue:neighbor_note"] } },
  { id: "rabbit", sceneId: "postoffice", text: "Đến Bưu điện: hỏi Bác Thỏ, xem bảng giờ và cái túi thư.", when: { all: ["met:cat", "clue:neighbor_note"] }, done: { all: ["met:rabbit", "clue:post_log", "clue:rabbit_bag"] } },
  { id: "witness", sceneId: "hotpot", text: "Đến Quán lẩu: nghe Ông Rùa kể chuyện tối qua.", when: { all: ["met:rabbit", "clue:post_log", "clue:rabbit_bag"] }, done: { all: ["clue:witness"] } },
  { id: "accuse", sceneId: "phoneshop", text: "Về Cửa hàng điện thoại, nói với Anh Heo bạn biết ai đã tráo điện thoại.", when: { all: ["clue:witness"] }, done: { all: ["case:solved"] } },
];
