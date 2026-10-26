import type { ClueDef, Objective, Speaker, Suspect } from "../../story-types";

/** Nhân vật trong vụ án (id → tên hiển thị và sprite). Id người nói trùng id NPC của cảnh. */
export const SPEAKERS: Record<string, Speaker> = {
  player: { name: "Bạn (thám tử Gấu Trúc)", sprite: "guide" },
  dog: { name: "Chú Chó bán vé", sprite: "dog" },
  fox: { name: "Cô Cáo nhân viên sở thú", sprite: "fox" },
  owl: { name: "Cụ Cú chủ tiệm đồ chơi", sprite: "owl" },
  tiger: { name: "Chú Hổ thợ máy", sprite: "tiger" },
  duck: { name: "Chú Vịt thợ giặt", sprite: "duck" },
  bird: { name: "Cô Chim chủ trại", sprite: "bird" },
};

/** Manh mối đủ loại: giờ giấc, quãng đường (phải tính), sổ ghi, và mồi nhử (cúp đồ chơi, vệt sơn vàng). Sổ cổng chỉ ghi 3 người vào cổng, nhưng hàng rào nông trại có lỗ đi tắt 10 phút tới sau công viên. */
export const CLUES: ClueDef[] = [
  { id: "letter", title: "Lời báo án của Chú Chó", zh: "昨天晚上七点半,金奖杯还在摊位上。七点五十,金奖杯不见了。", vi: "Bảy giờ rưỡi tối qua, chiếc cúp vàng vẫn còn trên gian hàng. Bảy giờ năm mươi, cúp vàng biến mất.", sceneId: "funfair", kind: "testimony" },
  { id: "gate_log", title: "Sổ ghi ở cổng", zh: "昨天晚上进游乐场的客人只有三位:狐狸七点,猫头鹰七点二十,老虎七点四十。后门一直锁着。", vi: "Tối qua chỉ có ba khách vào công viên: Cáo lúc 7 giờ, Cú lúc 7 giờ 20, Hổ lúc 7 giờ 40. Cổng sau luôn khóa.", sceneId: "funfair", kind: "document" },
  { id: "show_sign", title: "Bảng chương trình ở lều xiếc", zh: "小丑的表演从七点半到八点。帐篷里坐满了人,门口有人看着,没有人出来。", vi: "Chú hề biểu diễn từ 7 giờ rưỡi đến 8 giờ. Trong lều chật kín người, cửa có người canh, không ai đi ra.", sceneId: "funfair", kind: "document" },
  { id: "ferris_log", title: "Sổ vòng quay khổng lồ", zh: "老虎七点四十五上了摩天轮,八点才下来。从大门走到摩天轮要五分钟,从大门走到摊位要十分钟。", vi: "Hổ lên vòng quay lúc 7 giờ 45, đến 8 giờ mới xuống. Từ cổng đi tới vòng quay mất 5 phút, từ cổng đi tới gian hàng mất 10 phút.", sceneId: "funfair", kind: "document" },
  { id: "fox_alibi", title: "Lời khai của Cô Cáo", zh: "昨天晚上七点半,我在帐篷里看小丑表演。", vi: "Bảy giờ rưỡi tối qua, tôi đang xem chú hề biểu diễn trong lều.", sceneId: "zoo", kind: "testimony" },
  { id: "owl_alibi", title: "Lời khai của Cụ Cú", zh: "昨天晚上七点半,我已经在去玩具店的路上了。", vi: "Bảy giờ rưỡi tối qua, tôi đã đang trên đường đến cửa hàng đồ chơi.", sceneId: "toyshop", kind: "testimony" },
  { id: "toy_receipt", title: "Hóa đơn cửa hàng đồ chơi", zh: "昨天晚上七点五十,猫头鹰在玩具店付钱。", vi: "Bảy giờ năm mươi tối qua, Cú trả tiền ở cửa hàng đồ chơi.", sceneId: "toyshop", kind: "document" },
  { id: "road_toy", title: "Biển chỉ đường ở cửa hàng", zh: "从游乐场走到玩具店要二十五分钟。", vi: "Từ công viên giải trí đi đến cửa hàng đồ chơi mất 25 phút.", sceneId: "toyshop", kind: "object" },
  { id: "toy_trophy", title: "Chiếc cúp nhỏ trên kệ", zh: "玩具店的架子上有一个金色的小奖杯。", vi: "Trên kệ cửa hàng đồ chơi có một chiếc cúp nhỏ màu vàng.", sceneId: "toyshop", kind: "object" },
  { id: "tiger_alibi", title: "Lời khai của Chú Hổ", zh: "昨天晚上七点四十,我到了游乐场,然后就去坐摩天轮。", vi: "Bảy giờ bốn mươi tối qua, tôi đến công viên rồi đi thẳng lên vòng quay.", sceneId: "garage", kind: "testimony" },
  { id: "tiger_paint", title: "Vệt sơn vàng trên mũ", zh: "老虎的头盔上有一块金色的油漆。", vi: "Trên mũ bảo hiểm của Hổ có một vệt sơn màu vàng.", sceneId: "garage", kind: "object" },
  { id: "duck_alibi", title: "Lời khai của Chú Vịt", zh: "昨天晚上七点半,我在洗衣店工作。", vi: "Bảy giờ rưỡi tối qua, tôi đang làm việc ở tiệm giặt là.", sceneId: "laundry", kind: "testimony" },
  { id: "laundry_receipt", title: "Phiếu nhận đồ của tiệm giặt", zh: "昨天晚上七点三十五分,有一位客人来取衣服。鸭子给他开了门。", vi: "Bảy giờ ba mươi lăm tối qua, có một khách đến lấy đồ. Vịt mở cửa cho khách.", sceneId: "laundry", kind: "document" },
  { id: "road_laundry", title: "Biển chỉ đường ở tiệm giặt", zh: "从洗衣店走到游乐场要四十分钟。", vi: "Từ tiệm giặt là đi đến công viên giải trí mất 40 phút.", sceneId: "laundry", kind: "object" },
  { id: "bird_alibi", title: "Lời khai của Cô Chim", zh: "昨天晚上七点半,我在农场喂鸡。", vi: "Bảy giờ rưỡi tối qua, tôi đang cho gà ăn ở nông trại.", sceneId: "farm", kind: "testimony" },
  { id: "feed_log", title: "Sổ cho gà ăn", zh: "农场的鸡昨天晚上七点就吃完了,七点以后没有人喂鸡。", vi: "Gà ở nông trại tối qua đã ăn xong từ 7 giờ, sau 7 giờ không ai cho gà ăn.", sceneId: "farm", kind: "document" },
  { id: "fence_hole", title: "Cái lỗ trên hàng rào", zh: "农场的篱笆有一个洞。从洞走到游乐场后面,只要十分钟。", vi: "Hàng rào nông trại có một cái lỗ. Từ lỗ đi tới phía sau công viên chỉ mất 10 phút.", sceneId: "farm", kind: "object" },
  { id: "gold_flake", title: "Mảnh vàng ở miệng lỗ", zh: "洞口的地上有一些金色的小片。", vi: "Dưới đất ở miệng lỗ có vài mảnh nhỏ màu vàng.", sceneId: "farm", kind: "object" },
  { id: "farm_road", title: "Biển chỉ đường ở nông trại", zh: "从农场走大路到游乐场要三十分钟。", vi: "Từ nông trại đi đường lớn tới công viên giải trí mất 30 phút.", sceneId: "farm", kind: "object" },
];

export const SUSPECTS: Suspect[] = [
  { id: "fox", name: "Cô Cáo nhân viên sở thú", sprite: "fox", sceneId: "zoo", metFlag: "met:fox", note: "Nói bảy giờ rưỡi đang xem hề biểu diễn trong lều. Có ai xác nhận không?" },
  { id: "owl", name: "Cụ Cú chủ tiệm đồ chơi", sprite: "owl", sceneId: "toyshop", metFlag: "met:owl", note: "Nói bảy giờ rưỡi đã trên đường về cửa hàng. Hóa đơn và quãng đường nói gì?" },
  { id: "tiger", name: "Chú Hổ thợ máy", sprite: "tiger", sceneId: "garage", metFlag: "met:tiger", note: "Nói bảy giờ bốn mươi vào công viên rồi lên vòng quay. Trên mũ có vệt sơn vàng…" },
  { id: "duck", name: "Chú Vịt thợ giặt", sprite: "duck", sceneId: "laundry", metFlag: "met:duck", note: "Nói bảy giờ rưỡi đang làm ở tiệm giặt. Có khách đến lúc bảy giờ ba mươi lăm." },
  { id: "bird", name: "Cô Chim chủ trại", sprite: "bird", sceneId: "farm", metFlag: "met:bird", note: "Nói bảy giờ rưỡi đang cho gà ăn ở nông trại. Không có tên trong sổ cổng." },
];

/** Các mục tiêu nối tiếp nhau; mục tiêu hiện tại hiện trên đầu cảnh để người chơi không bị lạc. */
export const OBJECTIVES: Objective[] = [
  { id: "talk-dog", sceneId: "funfair", text: "Nói chuyện với Chú Chó ở Công viên giải trí để nhận vụ án.", done: { all: ["met:dog"] } },
  { id: "inspect-fair", sceneId: "funfair", text: "Xem xét công viên: đọc lời báo án, sổ ở cổng, bảng chương trình của lều xiếc và sổ vòng quay.", when: { all: ["met:dog"] }, done: { all: ["clue:letter", "clue:gate_log", "clue:show_sign", "clue:ferris_log"] } },
  { id: "fox", sceneId: "zoo", text: "Đến Sở thú: hỏi Cô Cáo bảy giờ rưỡi tối qua cô ở đâu.", when: { all: ["clue:letter", "clue:gate_log", "clue:show_sign", "clue:ferris_log"] }, done: { all: ["met:fox"] } },
  { id: "owl", sceneId: "toyshop", text: "Đến Cửa hàng đồ chơi: hỏi Cụ Cú, xem hóa đơn, biển chỉ đường và các món trên kệ.", when: { all: ["met:fox"] }, done: { all: ["met:owl", "clue:toy_receipt", "clue:road_toy", "clue:toy_trophy"] } },
  { id: "tiger", sceneId: "garage", text: "Đến Tiệm sửa xe: hỏi Chú Hổ và xem cái mũ bảo hiểm.", when: { all: ["met:owl", "clue:toy_receipt", "clue:road_toy", "clue:toy_trophy"] }, done: { all: ["met:tiger", "clue:tiger_paint"] } },
  { id: "duck", sceneId: "laundry", text: "Đến Tiệm giặt là: hỏi Chú Vịt, xem phiếu nhận đồ và biển chỉ đường.", when: { all: ["met:tiger", "clue:tiger_paint"] }, done: { all: ["met:duck", "clue:laundry_receipt", "clue:road_laundry"] } },
  { id: "bird", sceneId: "farm", text: "Đến Nông trại: hỏi Cô Chim rồi xem kỹ sổ cho gà ăn, hàng rào và con đường.", when: { all: ["met:duck", "clue:laundry_receipt", "clue:road_laundry"] }, done: { all: ["met:bird", "clue:feed_log", "clue:fence_hole", "clue:gold_flake", "clue:farm_road"] } },
  { id: "accuse", sceneId: "funfair", text: "Về Công viên giải trí, nói với Chú Chó bạn biết ai đã lấy cúp vàng.", when: { all: ["clue:farm_road", "clue:gold_flake"] }, done: { all: ["case:solved"] } },
];
