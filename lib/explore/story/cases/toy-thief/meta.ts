import type { ClueDef, Objective, Speaker, Suspect } from "../../story-types";

/** Nhân vật trong vụ án (id → tên hiển thị và sprite). Id người nói trùng id NPC của cảnh. */
export const SPEAKERS: Record<string, Speaker> = {
  player: { name: "Bạn (thám tử Gấu Trúc)", sprite: "guide" },
  owl: { name: "Cụ Cú chủ tiệm đồ chơi", sprite: "owl" },
  rabbit: { name: "Bé Thỏ pha chế", sprite: "rabbit" },
  bird: { name: "Cô Chim chủ trại", sprite: "bird" },
  duck: { name: "Chú Vịt thợ giặt", sprite: "duck" },
  tiger: { name: "Chú Hổ thợ máy", sprite: "tiger" },
  dog: { name: "Chú Chó bán vé", sprite: "dog" },
};

/** Vụ án đối chiếu đặc điểm: tên trộm để lại sợi chỉ xanh dương, chữ viết bằng tay trái, dấu giày cỡ 45. Năm nghi phạm, mỗi người có áo khoác, tay thuận, cỡ giày riêng; chỉ Hổ khớp cả ba, mỗi người còn lại khớp hai hoặc ít hơn. */
export const CLUES: ClueDef[] = [
  { id: "report", title: "Lời báo án của Cụ Cú", zh: "昨天晚上八点,我的遥控车不见了。有人进了店。", vi: "Tám giờ tối qua, chiếc xe điều khiển từ xa của tôi biến mất. Có người đã vào tiệm.", sceneId: "toyshop", kind: "testimony" },
  { id: "toy_thread", title: "Sợi chỉ trên cửa", zh: "门上有一根蓝色的线。", vi: "Trên cửa có một sợi chỉ màu xanh dương.", sceneId: "toyshop", kind: "object" },
  { id: "toy_hand", title: "Tờ giấy ghi chú trên kệ", zh: "架子上有一张便条,字是用左手写的。", vi: "Trên kệ có một tờ giấy ghi chú, chữ được viết bằng tay trái.", sceneId: "toyshop", kind: "object" },
  { id: "toy_foot", title: "Dấu chân trên sàn", zh: "地上有一个很大的脚印,是四十五码的鞋。", vi: "Trên sàn có một dấu chân rất lớn, của đôi giày cỡ 45.", sceneId: "toyshop", kind: "object" },
  { id: "rabbit_alibi", title: "Lời khai của Thỏ", zh: "昨天晚上八点,我不在玩具店。", vi: "Tám giờ tối qua, tôi không ở cửa hàng đồ chơi.", sceneId: "bubbletea", kind: "testimony" },
  { id: "rabbit_coat", title: "Áo khoác của Thỏ", zh: "兔子的外套是蓝色的。", vi: "Áo khoác của Thỏ màu xanh dương.", sceneId: "bubbletea", kind: "object" },
  { id: "rabbit_hand", title: "Tay thuận của Thỏ", zh: "兔子用右手写字。", vi: "Thỏ viết bằng tay phải.", sceneId: "bubbletea", kind: "document" },
  { id: "rabbit_shoe", title: "Giày của Thỏ", zh: "兔子的鞋是四十五码的。", vi: "Giày của Thỏ cỡ 45.", sceneId: "bubbletea", kind: "object" },
  { id: "bird_alibi", title: "Lời khai của Chim", zh: "昨天晚上八点,我不在玩具店。", vi: "Tám giờ tối qua, tôi không ở cửa hàng đồ chơi.", sceneId: "farm", kind: "testimony" },
  { id: "bird_coat", title: "Áo khoác của Chim", zh: "小鸟的外套是红色的。", vi: "Áo khoác của Chim màu đỏ.", sceneId: "farm", kind: "object" },
  { id: "bird_hand", title: "Tay thuận của Chim", zh: "小鸟用左手写字。", vi: "Chim viết bằng tay trái.", sceneId: "farm", kind: "document" },
  { id: "bird_shoe", title: "Giày của Chim", zh: "小鸟的鞋是四十五码的。", vi: "Giày của Chim cỡ 45.", sceneId: "farm", kind: "object" },
  { id: "duck_alibi", title: "Lời khai của Vịt", zh: "昨天晚上八点,我不在玩具店。", vi: "Tám giờ tối qua, tôi không ở cửa hàng đồ chơi.", sceneId: "laundry", kind: "testimony" },
  { id: "duck_coat", title: "Áo khoác của Vịt", zh: "鸭子的外套是蓝色的。", vi: "Áo khoác của Vịt màu xanh dương.", sceneId: "laundry", kind: "object" },
  { id: "duck_hand", title: "Tay thuận của Vịt", zh: "鸭子用左手写字。", vi: "Vịt viết bằng tay trái.", sceneId: "laundry", kind: "document" },
  { id: "duck_shoe", title: "Giày của Vịt", zh: "鸭子的鞋是三十八码的。", vi: "Giày của Vịt cỡ 38.", sceneId: "laundry", kind: "object" },
  { id: "tiger_alibi", title: "Lời khai của Hổ", zh: "昨天晚上八点,我不在玩具店。", vi: "Tám giờ tối qua, tôi không ở cửa hàng đồ chơi.", sceneId: "garage", kind: "testimony" },
  { id: "tiger_coat", title: "Áo khoác của Hổ", zh: "老虎的外套是蓝色的。", vi: "Áo khoác của Hổ màu xanh dương.", sceneId: "garage", kind: "object" },
  { id: "tiger_hand", title: "Tay thuận của Hổ", zh: "老虎用左手写字。", vi: "Hổ viết bằng tay trái.", sceneId: "garage", kind: "document" },
  { id: "tiger_shoe", title: "Giày của Hổ", zh: "老虎的鞋是四十五码的。", vi: "Giày của Hổ cỡ 45.", sceneId: "garage", kind: "object" },
  { id: "dog_alibi", title: "Lời khai của Chó", zh: "昨天晚上八点,我不在玩具店。", vi: "Tám giờ tối qua, tôi không ở cửa hàng đồ chơi.", sceneId: "funfair", kind: "testimony" },
  { id: "dog_coat", title: "Áo khoác của Chó", zh: "小狗的外套是绿色的。", vi: "Áo khoác của Chó màu xanh lá.", sceneId: "funfair", kind: "object" },
  { id: "dog_hand", title: "Tay thuận của Chó", zh: "小狗用右手写字。", vi: "Chó viết bằng tay phải.", sceneId: "funfair", kind: "document" },
  { id: "dog_shoe", title: "Giày của Chó", zh: "小狗的鞋是四十五码的。", vi: "Giày của Chó cỡ 45.", sceneId: "funfair", kind: "object" },
];

export const SUSPECTS: Suspect[] = [
  { id: "rabbit", name: "Bé Thỏ pha chế", sprite: "rabbit", sceneId: "bubbletea", metFlag: "met:rabbit", note: "Nói tối qua lúc tám giờ không ở cửa hàng đồ chơi. Hãy xem áo khoác, tay thuận và giày." },
  { id: "bird", name: "Cô Chim chủ trại", sprite: "bird", sceneId: "farm", metFlag: "met:bird", note: "Nói tối qua lúc tám giờ không ở cửa hàng đồ chơi. Hãy xem áo khoác, tay thuận và giày." },
  { id: "duck", name: "Chú Vịt thợ giặt", sprite: "duck", sceneId: "laundry", metFlag: "met:duck", note: "Nói tối qua lúc tám giờ không ở cửa hàng đồ chơi. Hãy xem áo khoác, tay thuận và giày." },
  { id: "tiger", name: "Chú Hổ thợ máy", sprite: "tiger", sceneId: "garage", metFlag: "met:tiger", note: "Nói tối qua lúc tám giờ không ở cửa hàng đồ chơi. Hãy xem áo khoác, tay thuận và giày." },
  { id: "dog", name: "Chú Chó bán vé", sprite: "dog", sceneId: "funfair", metFlag: "met:dog", note: "Nói tối qua lúc tám giờ không ở cửa hàng đồ chơi. Hãy xem áo khoác, tay thuận và giày." },
];

/** Các mục tiêu nối tiếp nhau; mục tiêu hiện tại hiện trên đầu cảnh để người chơi không bị lạc. */
export const OBJECTIVES: Objective[] = [
  { id: "talk-owl", sceneId: "toyshop", text: "Nói chuyện với Cụ Cú ở Cửa hàng đồ chơi để nhận vụ án.", done: { all: ["met:owl"] } },
  { id: "inspect-toy", sceneId: "toyshop", text: "Xem xét cửa hàng: đọc lời báo án, tìm manh mối trên cửa, trên kệ và dưới sàn (tên trộm có những đặc điểm gì?).", when: { all: ["met:owl"] }, done: { all: ["clue:report", "clue:toy_thread", "clue:toy_hand", "clue:toy_foot"] } },
  { id: "rabbit", sceneId: "bubbletea", text: "Đến Quán trà sữa: hỏi Thỏ, rồi xem kỹ áo khoác, tay thuận và cỡ giày.", when: { all: ["clue:report", "clue:toy_thread", "clue:toy_hand", "clue:toy_foot"] }, done: { all: ["met:rabbit", "clue:rabbit_coat", "clue:rabbit_hand", "clue:rabbit_shoe"] } },
  { id: "bird", sceneId: "farm", text: "Đến Nông trại: hỏi Chim, rồi xem kỹ áo khoác, tay thuận và cỡ giày.", when: { all: ["met:rabbit", "clue:rabbit_coat", "clue:rabbit_hand", "clue:rabbit_shoe"] }, done: { all: ["met:bird", "clue:bird_coat", "clue:bird_hand", "clue:bird_shoe"] } },
  { id: "duck", sceneId: "laundry", text: "Đến Tiệm giặt là: hỏi Vịt, rồi xem kỹ áo khoác, tay thuận và cỡ giày.", when: { all: ["met:bird", "clue:bird_coat", "clue:bird_hand", "clue:bird_shoe"] }, done: { all: ["met:duck", "clue:duck_coat", "clue:duck_hand", "clue:duck_shoe"] } },
  { id: "tiger", sceneId: "garage", text: "Đến Tiệm sửa xe: hỏi Hổ, rồi xem kỹ áo khoác, tay thuận và cỡ giày.", when: { all: ["met:duck", "clue:duck_coat", "clue:duck_hand", "clue:duck_shoe"] }, done: { all: ["met:tiger", "clue:tiger_coat", "clue:tiger_hand", "clue:tiger_shoe"] } },
  { id: "dog", sceneId: "funfair", text: "Đến Công viên giải trí: hỏi Chó, rồi xem kỹ áo khoác, tay thuận và cỡ giày.", when: { all: ["met:tiger", "clue:tiger_coat", "clue:tiger_hand", "clue:tiger_shoe"] }, done: { all: ["met:dog", "clue:dog_coat", "clue:dog_hand", "clue:dog_shoe"] } },
  { id: "accuse", sceneId: "toyshop", text: "Về Cửa hàng đồ chơi, nói với Cụ Cú bạn biết ai đã lấy xe điều khiển từ xa.", when: { all: ["met:dog", "clue:dog_coat", "clue:dog_hand", "clue:dog_shoe"] }, done: { all: ["case:solved"] } },
];
