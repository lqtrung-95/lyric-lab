import { buildInterview } from "../../interview";
import type { StorySceneDef } from "../../story-types";

const rabbit = buildInterview({
  prefix: "rabbit", speaker: "rabbit",
  greeting: { zh: "你好!你想喝点什么?", vi: "Chào bạn! Bạn muốn uống gì?" },
  question: { zh: "昨天下午三点到四点你在哪儿?", vi: "Chiều qua từ 3 đến 4 giờ cô ở đâu?" },
  chatter: [
    { ask: { zh: "你们的奶茶贵吗?", vi: "Trà sữa ở đây có đắt không?" }, reply: { zh: "不贵,十五块一杯。", vi: "Không đắt, mười lăm tệ một ly." } },
    { ask: { zh: "什么味道最好喝?", vi: "Vị nào ngon nhất?" }, reply: { zh: "芒果和草莓都很好喝。", vi: "Xoài và dâu tây đều rất ngon." } },
  ],
  answer: { zh: "昨天下午三点到四点,我一直在奶茶店做奶茶。", vi: "Chiều qua từ 3 đến 4 giờ, tôi pha trà sữa ở quán suốt." },
  check: { vi: "Bé Thỏ nói chiều qua từ 3 đến 4 giờ bạn ấy ở đâu?", right: { zh: "在奶茶店", vi: "Ở quán trà sữa" }, wrong: [{ zh: "在动物园", vi: "Ở sở thú" }, { zh: "在火锅店", vi: "Ở quán lẩu" }], rightAt: 0 },
  clue: "rabbit_alibi", metFlag: "met:rabbit",
  closing: { zh: "订单在桌子上。", vi: "Phiếu đơn ở trên bàn." },
  after: { zh: "还想喝点什么吗?", vi: "Bạn còn muốn uống gì không?" },
});

/** Quán trà sữa: phiếu đơn cho thấy quán vắng khách 45 phút; khi đã có đủ mốc giờ của mọi người, hỏi lại thì Thỏ đổi lời. */
export const BUBBLETEA_STORY: StorySceneDef = {
  sceneId: "bubbletea",
  sceneNpcEntries: [
    { when: { all: ["met:rabbit", "clue:tea_tickets", "clue:last_seen", "clue:route_map", "clue:flower_orders", "clue:zoo_log", "clue:hotpot_log"], none: ["confronted:rabbit"] }, node: "rabbit_conf" },
    ...rabbit.entries,
  ],
  spots: [
    { id: "tea_tickets", clue: "tea_tickets", label: "Phiếu đơn trà sữa", sprite: "note", x: 14, y: 86, w: 5, when: { all: ["met:rabbit"] }, stand: { x: 20, y: 92 } },
  ],
  dialogues: {
    ...rabbit.nodes,
    rabbit_conf: { id: "rabbit_conf", speaker: "player", zh: "工具箱是三点十五分到三点四十五分之间不见的。猫、狐狸和乌龟都来不及去修车店再回来。只有您的店空了四十五分钟,走一趟只要五分钟。", vi: "Hộp biến mất trong khoảng 3 giờ 15 đến 3 giờ 45. Mèo, Cáo và Rùa đều không kịp đến tiệm sửa xe rồi quay về. Chỉ có quán của bạn vắng 45 phút, mà đi một chiều chỉ mất 5 phút.", next: "rabbit_conf2" },
    rabbit_conf2: { id: "rabbit_conf2", speaker: "rabbit", zh: "我……我只是想借用一下,马上就还。", vi: "Tôi... tôi chỉ định mượn một chút rồi trả ngay thôi.", effects: [{ clue: "rabbit_slip" }, { flag: "confronted:rabbit" }], next: "rabbit_conf3" },
    rabbit_conf3: { id: "rabbit_conf3", speaker: "rabbit", zh: "请不要再问了!", vi: "Xin đừng hỏi nữa!", next: null },
  },
};
