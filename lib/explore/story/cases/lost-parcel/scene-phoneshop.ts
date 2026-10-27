import { buildInterview } from "../../interview";
import type { StorySceneDef } from "../../story-types";

const pig = buildInterview({
  prefix: "pig", speaker: "pig",
  greeting: { zh: "你好!要买手机吗?", vi: "Chào bạn! Bạn muốn mua điện thoại à?" },
  question: { zh: "昨天下午六点你在哪儿?", vi: "Sáu giờ chiều hôm qua anh ở đâu?" },
  chatter: [
    { ask: { zh: "这部手机贵吗?", vi: "Chiếc điện thoại này đắt không?" }, reply: { zh: "不贵,两千块。", vi: "Không đắt, hai nghìn tệ." } },
    { ask: { zh: "你们几点开门?", vi: "Cửa hàng mấy giờ mở cửa?" }, reply: { zh: "早上十点开门。", vi: "Mười giờ sáng mở cửa." } },
  ],
  answer: { zh: "昨天下午六点,我在手机店工作。", vi: "Sáu giờ chiều hôm qua, tôi đang làm việc ở cửa hàng điện thoại." },
  check: { vi: "Anh Heo nói sáu giờ chiều hôm qua anh đang làm gì?", right: { zh: "在手机店工作", vi: "Làm việc ở cửa hàng điện thoại" }, wrong: [{ zh: "在药店卖药", vi: "Bán thuốc ở hiệu thuốc" }, { zh: "在火锅店吃饭", vi: "Ăn cơm ở quán lẩu" }], rightAt: 0 },
  clue: "pig_alibi", metFlag: "met:pig",
  closing: { zh: "门口有一块牌子。", vi: "Ở cửa có một tấm biển." },
  after: { zh: "还想看看手机吗?", vi: "Bạn còn muốn xem điện thoại không?" },
});

/** Cửa hàng điện thoại: bảng giờ cho thấy tiệm đóng cửa từ 5 rưỡi; khi đã có mảnh giấy, danh sách người thấy hộp đỏ và hai chứng cứ ngoại phạm thật (Cáo, Rùa), hỏi lại thì Heo đổi lời. */
export const PHONESHOP_STORY: StorySceneDef = {
  sceneId: "phoneshop",
  sceneNpcEntries: [
    { when: { all: ["met:pig", "clue:closing_sign", "clue:thief_note", "clue:rabbit_list", "clue:pharmacy_receipt", "clue:kitchen_log"], none: ["confronted:pig"] }, node: "pig_conf" },
    ...pig.entries,
  ],
  spots: [
    { id: "closing_sign", clue: "closing_sign", label: "Bảng giờ đóng cửa", sprite: "note", x: 14, y: 86, w: 5, when: { all: ["met:pig"] }, stand: { x: 20, y: 92 } },
  ],
  dialogues: {
    ...pig.nodes,
    pig_conf: { id: "pig_conf", speaker: "player", zh: "纸条上写着“红盒子”,只有您、狐狸和乌龟看过红盒子。狐狸和乌龟六点都有人作证,而您的店五点半就关门了。", vi: "Mảnh giấy nhắc “hộp đỏ”, mà chỉ có anh, Cáo và Rùa từng thấy hộp đỏ. Cáo và Rùa lúc sáu giờ đều có người làm chứng, còn tiệm anh đóng cửa từ 5 giờ rưỡi.", next: "pig_conf2" },
    pig_conf2: { id: "pig_conf2", speaker: "pig", zh: "我……我只是想再看一眼那块表,明天就还。", vi: "Tôi... tôi chỉ muốn ngắm lại chiếc đồng hồ đó, mai tôi trả thôi.", effects: [{ clue: "pig_slip" }, { flag: "confronted:pig" }], next: "pig_conf3" },
    pig_conf3: { id: "pig_conf3", speaker: "pig", zh: "请不要再问了!", vi: "Xin đừng hỏi nữa!", next: null },
  },
};
