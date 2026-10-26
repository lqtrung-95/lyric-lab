import type { ClueDef, Objective, Speaker, Suspect } from "../../story-types";

export const SPEAKERS: Record<string, Speaker> = {
  player: { name: "Bạn (thám tử Gấu Trúc)", sprite: "guide" },
  duck: { name: "Chú Vịt cứu hộ", sprite: "duck" },
  dog: { name: "Chú Chó bán hàng", sprite: "dog" },
  pig: { name: "Cô Heo thu ngân", sprite: "pig" },
  bird: { name: "Cô Chim giáo viên", sprite: "bird" },
  cat: { name: "Cô Mèo bán hàng", sprite: "cat" },
  turtle: { name: "Ông Rùa", sprite: "turtle" },
};

/**
 * Manh mối vụ Vừa: dấu chân trên cát chỉ khớp một người sau khi đã xem dấu chân của cả bốn nghi phạm (loại trừ), lời khai của Mèo bị biển nghỉ trưa bác bỏ,
 * và Ông Rùa chỉ kể khi bạn đã có dấu chân.
 */
export const CLUES: ClueDef[] = [
  { id: "kite_string", title: "Đoạn dây đỏ trên cát", zh: "沙滩上有一段红线,风筝不见了。", vi: "Trên cát có một đoạn dây đỏ, con diều biến mất.", sceneId: "beach", kind: "object" },
  { id: "paw_print", title: "Dấu chân trên cát", zh: "沙滩上有小脚印,有四个脚趾,没有爪印。", vi: "Trên cát có dấu chân nhỏ, bốn ngón, không có vết móng.", sceneId: "beach", kind: "object" },
  { id: "dog_alibi", title: "Lời khai của Chú Chó", zh: "昨天中午十二点,我在店里卖衣服。", vi: "Trưa qua mười hai giờ, tôi bán quần áo ở cửa hàng.", sceneId: "clothing-store", kind: "testimony" },
  { id: "dog_print", title: "Dấu chân của Chó", zh: "小狗的脚印有长长的爪印。", vi: "Dấu chân của Chó có vết móng dài.", sceneId: "clothing-store", kind: "object" },
  { id: "pig_alibi", title: "Lời khai của Cô Heo", zh: "昨天中午十二点,我在超市收钱。", vi: "Trưa qua mười hai giờ, tôi thu tiền ở siêu thị.", sceneId: "supermarket", kind: "testimony" },
  { id: "pig_print", title: "Dấu chân của Heo", zh: "小猪的脚印只有两个脚趾。", vi: "Dấu chân của Heo chỉ có hai ngón.", sceneId: "supermarket", kind: "object" },
  { id: "bird_alibi", title: "Lời khai của Cô Chim", zh: "昨天中午十二点,我在学校吃饭。", vi: "Trưa qua mười hai giờ, tôi ăn cơm ở trường.", sceneId: "school", kind: "testimony" },
  { id: "bird_print", title: "Dấu chân của Chim", zh: "小鸟的脚印有三个脚趾。", vi: "Dấu chân của Chim có ba ngón.", sceneId: "school", kind: "object" },
  { id: "cat_alibi", title: "Lời khai của Cô Mèo", zh: "昨天中午十二点,我在市场卖水果。", vi: "Trưa qua mười hai giờ, tôi bán trái cây ở chợ.", sceneId: "market", kind: "testimony" },
  { id: "cat_print", title: "Dấu chân của Mèo", zh: "小猫的脚印有四个脚趾,没有爪印。", vi: "Dấu chân của Mèo có bốn ngón, không có vết móng.", sceneId: "market", kind: "object" },
  { id: "market_sign", title: "Bảng nghỉ trưa của chợ", zh: "市场昨天中午十二点到一点休息。", vi: "Hôm qua chợ nghỉ trưa từ mười hai giờ đến một giờ.", sceneId: "market", kind: "document" },
  { id: "cat_slip", title: "Cô Mèo đổi lời", zh: "我……我去买面条了。", vi: "Tôi... tôi đi mua mì thôi.", sceneId: "market", kind: "testimony" },
  { id: "witness_turtle", title: "Lời khai của Ông Rùa", zh: "昨天十二点半,我看见一只猫拿着红色的风筝跑回市场。", vi: "Mười hai giờ rưỡi hôm qua, tôi thấy một con mèo cầm con diều đỏ chạy về chợ.", sceneId: "park", kind: "testimony" },
];

export const SUSPECTS: Suspect[] = [
  { id: "dog", name: "Chú Chó bán hàng", sprite: "dog", sceneId: "clothing-store", metFlag: "met:dog", note: "Nói trưa qua bán quần áo. Dấu chân của ông có vết móng dài, không giống dấu trên cát." },
  { id: "pig", name: "Cô Heo thu ngân", sprite: "pig", sceneId: "supermarket", metFlag: "met:pig", note: "Nói trưa qua thu tiền ở siêu thị. Dấu chân heo chỉ có hai ngón." },
  { id: "bird", name: "Cô Chim giáo viên", sprite: "bird", sceneId: "school", metFlag: "met:bird", note: "Nói trưa qua ăn cơm ở trường. Dấu chân chim có ba ngón." },
  { id: "cat", name: "Cô Mèo bán hàng", sprite: "cat", sceneId: "market", metFlag: "met:cat", note: "Nói trưa qua bán trái cây ở chợ. Nhưng chợ nghỉ trưa, và dấu chân mèo khớp…" },
];

export const OBJECTIVES: Objective[] = [
  { id: "talk-duck", sceneId: "beach", text: "Nói chuyện với Chú Vịt ở Bãi biển để nhận vụ án.", done: { all: ["met:duck"] } },
  { id: "inspect-beach", sceneId: "beach", text: "Xem xét bãi cát: tìm dây diều và dấu chân.", when: { all: ["met:duck"] }, done: { all: ["clue:kite_string", "clue:paw_print"] } },
  { id: "dog", sceneId: "clothing-store", text: "Đến Cửa hàng quần áo: hỏi Chú Chó và so dấu chân của ông với dấu trên cát.", when: { all: ["clue:kite_string", "clue:paw_print"] }, done: { all: ["met:dog", "clue:dog_print"] } },
  { id: "pig", sceneId: "supermarket", text: "Đến Siêu thị: hỏi Cô Heo và xem dấu chân của cô.", when: { all: ["met:dog", "clue:dog_print"] }, done: { all: ["met:pig", "clue:pig_print"] } },
  { id: "bird", sceneId: "school", text: "Đến Trường học: hỏi Cô Chim và xem dấu chân của cô.", when: { all: ["met:pig", "clue:pig_print"] }, done: { all: ["met:bird", "clue:bird_print"] } },
  { id: "cat", sceneId: "market", text: "Đến Chợ: hỏi Cô Mèo, xem dấu chân và bảng nghỉ trưa, rồi hỏi lại cô khi đã có chứng cứ.", when: { all: ["met:bird", "clue:bird_print"] }, done: { all: ["met:cat", "clue:cat_print", "clue:market_sign", "clue:cat_slip"] } },
  { id: "turtle", sceneId: "park", text: "Ra Công viên: hỏi Ông Rùa xem trưa qua ông có thấy ai cầm diều.", when: { all: ["clue:cat_slip"] }, done: { all: ["clue:witness_turtle"] } },
  { id: "accuse", sceneId: "beach", text: "Về Bãi biển, nói với Chú Vịt bạn biết ai đã lấy con diều.", when: { all: ["clue:witness_turtle"] }, done: { all: ["case:solved"] } },
];
