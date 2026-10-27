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

/** Vụ án tính giờ: hộp biến mất trong khoảng 3:15–3:45, đường đi một chiều là 5/10/20/25 phút. Mèo (mốc cách nhau 15 phút), Cáo (40 phút < 50), Rùa (20 phút < 40) không kịp đi về; chỉ Thỏ có khoảng trống 45 phút. */
export const CLUES: ClueDef[] = [
  { id: "letter", title: "Tờ giấy của Chú Hổ", zh: "我的工具箱昨天下午不见了。里面有一把新扳手。", vi: "Hộp dụng cụ của tôi biến mất chiều hôm qua. Bên trong có một cái cờ lê mới.", sceneId: "garage", kind: "document" },
  { id: "last_seen", title: "Sổ sửa xe", zh: "修车记录:三点十五分,老虎还在用工具箱修车。三点四十五分,工具箱不见了。那时老虎在喷漆房,门关着。", vi: "Sổ sửa xe: 3 giờ 15, Hổ còn dùng hộp dụng cụ để sửa xe. 3 giờ 45, hộp biến mất. Lúc đó Hổ ở phòng sơn, cửa đóng.", sceneId: "garage", kind: "document" },
  { id: "route_map", title: "Sơ đồ đường đi", zh: "路线图(单程):从修车店走到奶茶店五分钟,到花店十分钟,到火锅店二十分钟,到动物园二十五分钟。", vi: "Sơ đồ đường (một chiều): từ tiệm sửa xe đến quán trà sữa 5 phút, tiệm hoa 10 phút, quán lẩu 20 phút, sở thú 25 phút.", sceneId: "garage", kind: "document" },
  { id: "cat_alibi", title: "Lời khai của Cô Mèo", zh: "昨天下午三点到四点,我一直在花店里。", vi: "Chiều qua từ 3 đến 4 giờ, tôi ở trong tiệm hoa suốt.", sceneId: "flowershop", kind: "testimony" },
  { id: "flower_orders", title: "Phiếu ký nhận của tiệm hoa", zh: "花店的签收单:三点十分、三点二十五分、三点四十分、三点五十五分,都是小猫亲手签的字。", vi: "Phiếu ký nhận của tiệm hoa: 3 giờ 10, 3 giờ 25, 3 giờ 40, 3 giờ 55, đều do chính Mèo ký.", sceneId: "flowershop", kind: "document" },
  { id: "fox_alibi", title: "Lời khai của Cô Cáo", zh: "昨天下午三点到四点,我一直在动物园工作。", vi: "Chiều qua từ 3 đến 4 giờ, tôi làm việc ở sở thú suốt.", sceneId: "zoo", kind: "testimony" },
  { id: "zoo_log", title: "Sổ cho ăn", zh: "动物园记录:三点零五分狐狸喂海豹,三点四十五分又喂海豹,中间没人见到她。", vi: "Sổ sở thú: 3 giờ 05 Cáo cho hải cẩu ăn, 3 giờ 45 lại cho hải cẩu ăn, ở giữa không ai thấy cô.", sceneId: "zoo", kind: "document" },
  { id: "turtle_alibi", title: "Lời khai của Ông Rùa", zh: "昨天下午三点到四点,我一直在火锅店里忙。", vi: "Chiều qua từ 3 đến 4 giờ, tôi bận ở quán lẩu suốt.", sceneId: "hotpot", kind: "testimony" },
  { id: "hotpot_log", title: "Sổ đơn quán lẩu", zh: "火锅店的订单本:三点二十分和三点四十分,都是乌龟亲自端菜。", vi: "Sổ đơn quán lẩu: lúc 3 giờ 20 và 3 giờ 40 đều do chính Rùa bưng món.", sceneId: "hotpot", kind: "document" },
  { id: "rabbit_alibi", title: "Lời khai của Bé Thỏ", zh: "昨天下午三点到四点,我一直在奶茶店做奶茶。", vi: "Chiều qua từ 3 đến 4 giờ, tôi pha trà sữa ở quán suốt.", sceneId: "bubbletea", kind: "testimony" },
  { id: "tea_tickets", title: "Phiếu đơn trà sữa", zh: "奶茶店的订单:三点十分有一单,然后三点五十五分才有下一单。中间店里没有别的客人。", vi: "Phiếu đơn quán trà sữa: 3 giờ 10 có một đơn, đến 3 giờ 55 mới có đơn kế tiếp. Ở giữa quán không có khách nào khác.", sceneId: "bubbletea", kind: "document" },
  { id: "rabbit_slip", title: "Thỏ đổi lời", zh: "我……我只是想借用一下,马上就还。", vi: "Tôi... tôi chỉ định mượn một chút rồi trả ngay thôi.", sceneId: "bubbletea", kind: "testimony" },
  { id: "d_cat_gap", title: "Suy luận: các mốc giờ của Mèo", zh: "小猫说她一直在店里,签收单上的时间是三点十分、二十五分、四十分、五十五分,每次相隔十五分钟。", vi: "Mèo nói ở tiệm suốt, các mốc ký nhận của cô cách nhau 15 phút (3:10, 3:25, 3:40, 3:55).", sceneId: "garage", kind: "deduction", link: ["cat_alibi", "flower_orders"] },
  { id: "d_fox_gap", title: "Suy luận: các mốc giờ của Cáo", zh: "狐狸说她一直在动物园,可是记录只有三点零五分和三点四十五分,中间四十分钟没人见到她。", vi: "Cáo nói ở sở thú suốt, nhưng sổ chỉ có hai mốc 3:05 và 3:45, ở giữa 40 phút không ai thấy cô.", sceneId: "garage", kind: "deduction", link: ["fox_alibi", "zoo_log"] },
  { id: "d_turtle_gap", title: "Suy luận: các mốc giờ của Rùa", zh: "乌龟说他一直在忙,记录上是三点二十分和三点四十分,中间只隔二十分钟。", vi: "Rùa nói bận suốt, sổ ghi hai mốc 3:20 và 3:40 cách nhau 20 phút.", sceneId: "garage", kind: "deduction", link: ["turtle_alibi", "hotpot_log"] },
  { id: "d_rabbit_gap", title: "Suy luận: các mốc giờ của Thỏ", zh: "兔子说她一直在做奶茶,可是订单只有三点十分和三点五十五分,中间四十五分钟店里没有客人。", vi: "Thỏ nói pha trà suốt, nhưng đơn chỉ có 3:10 và 3:55, ở giữa 45 phút quán không có khách.", sceneId: "garage", kind: "deduction", link: ["rabbit_alibi", "tea_tickets"] },
  { id: "d_cat", title: "Suy luận: Mèo không kịp", zh: "小猫每隔十五分钟签一次字,来回要二十分钟,所以她来不及。", vi: "Mèo ký nhận cách nhau 15 phút mà đi về tiệm sửa xe mất 20 phút, nên Mèo không kịp.", sceneId: "garage", kind: "deduction", link: ["d_cat_gap", "route_map"] },
  { id: "d_fox", title: "Suy luận: Cáo không kịp", zh: "狐狸两次喂食只隔四十分钟,来回要五十分钟,所以她来不及。", vi: "Hai lần cho ăn của Cáo cách nhau 40 phút mà đi về mất 50 phút, nên Cáo không kịp.", sceneId: "garage", kind: "deduction", link: ["d_fox_gap", "route_map"] },
  { id: "d_turtle", title: "Suy luận: Rùa không kịp", zh: "乌龟两次端菜只隔二十分钟,来回要四十分钟,所以他来不及。", vi: "Hai lần bưng món của Rùa cách nhau 20 phút mà đi về mất 40 phút, nên Rùa không kịp.", sceneId: "garage", kind: "deduction", link: ["d_turtle_gap", "route_map"] },
  { id: "d_rabbit", title: "Suy luận: Thỏ có cơ hội", zh: "兔子的店三点十分到三点五十五分没有客人,工具箱就是这段时间不见的。", vi: "Quán của Thỏ vắng khách từ 3:10 đến 3:55, đúng lúc hộp biến mất, và đi về chỉ mất 10 phút.", sceneId: "garage", kind: "deduction", link: ["d_rabbit_gap", "last_seen"] },
];

export const SUSPECTS: Suspect[] = [
  { id: "cat", name: "Cô Mèo chủ tiệm hoa", sprite: "cat", sceneId: "flowershop", metFlag: "met:cat", note: "Nói ba đến bốn giờ chiều ở tiệm hoa. Phiếu ký nhận cho thấy cô ký bốn lần, cách nhau 15 phút." },
  { id: "fox", name: "Cô Cáo nhân viên sở thú", sprite: "fox", sceneId: "zoo", metFlag: "met:fox", note: "Nói ba đến bốn giờ chiều ở sở thú. Sổ chỉ có hai mốc cách nhau 40 phút, sở thú cách tiệm sửa xe rất xa." },
  { id: "turtle", name: "Ông Rùa chủ quán", sprite: "turtle", sceneId: "hotpot", metFlag: "met:turtle", note: "Nói ba đến bốn giờ chiều bận ở quán lẩu. Sổ đơn có hai mốc cách nhau 20 phút." },
  { id: "rabbit", name: "Bé Thỏ pha chế", sprite: "rabbit", sceneId: "bubbletea", metFlag: "met:rabbit", note: "Nói ba đến bốn giờ chiều pha trà sữa. Nhưng phiếu đơn cho thấy quán vắng khách suốt 45 phút." },
];

/** Các mục tiêu nối tiếp nhau; mục tiêu hiện tại hiện trên đầu cảnh để người chơi không bị lạc. */
export const OBJECTIVES: Objective[] = [
  { id: "talk-tiger", sceneId: "garage", text: "Nói chuyện với Chú Hổ ở Tiệm sửa xe để nhận vụ án.", done: { all: ["met:tiger"] } },
  { id: "inspect-garage", sceneId: "garage", text: "Xem xét tiệm: đọc tờ giấy, sổ sửa xe và sơ đồ đường đi.", when: { all: ["met:tiger"] }, done: { all: ["clue:letter", "clue:last_seen", "clue:route_map"] } },
  { id: "cat", sceneId: "flowershop", text: "Đến Tiệm hoa: hỏi Cô Mèo ba đến bốn giờ chiều hôm qua cô ở đâu, rồi xem phiếu ký nhận.", when: { all: ["clue:letter", "clue:last_seen", "clue:route_map"] }, done: { all: ["met:cat", "clue:flower_orders"] } },
  { id: "fox", sceneId: "zoo", text: "Đến Sở thú: hỏi Cô Cáo và xem sổ cho ăn.", when: { all: ["met:cat", "clue:flower_orders"] }, done: { all: ["met:fox", "clue:zoo_log"] } },
  { id: "turtle", sceneId: "hotpot", text: "Đến Quán lẩu: hỏi Ông Rùa và xem sổ đơn.", when: { all: ["met:fox", "clue:zoo_log"] }, done: { all: ["met:turtle", "clue:hotpot_log"] } },
  { id: "rabbit", sceneId: "bubbletea", text: "Đến Quán trà sữa: hỏi Bé Thỏ và xem phiếu đơn.", when: { all: ["met:turtle", "clue:hotpot_log"] }, done: { all: ["met:rabbit", "clue:tea_tickets"] } },
  { id: "confront", sceneId: "bubbletea", text: "Tính giờ đi lại của từng người rồi hỏi lại Bé Thỏ.", when: { all: ["met:rabbit", "clue:tea_tickets"] }, done: { all: ["clue:rabbit_slip"] } },
  { id: "accuse", sceneId: "garage", text: "Về Tiệm sửa xe, nói với Chú Hổ bạn biết ai đã lấy hộp dụng cụ.", when: { all: ["clue:rabbit_slip"] }, done: { all: ["case:solved"] } },
];
