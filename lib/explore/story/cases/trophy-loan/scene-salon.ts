import { buildInterview } from "../../interview";
import type { StorySceneDef } from "../../story-types";

const cat = buildInterview({
  prefix: "cat", speaker: "cat",
  greeting: { zh: "你好!要做头发吗?", vi: "Chào bạn! Bạn muốn làm tóc không?" },
  question: { zh: "昨天下午三点你在哪儿?", vi: "Chiều qua lúc 3 giờ cô ở đâu?" },
  chatter: [
    { ask: { zh: "这是什么颜色?", vi: "Đây là màu gì?" }, reply: { zh: "金色,最近很流行。", vi: "Màu vàng, dạo này rất hợp thời." } },
    { ask: { zh: "要染多久?", vi: "Nhuộm mất bao lâu?" }, reply: { zh: "两个小时。", vi: "Hai tiếng." } },
  ],
  answer: { zh: "昨天下午三点,我在店里给客人染头发。", vi: "Chiều qua lúc 3 giờ, tôi nhuộm tóc cho khách trong tiệm." },
  check: { vi: "Cô Mèo nói chiều qua lúc 3 giờ cô làm gì?", right: { zh: "给客人染头发", vi: "Nhuộm tóc cho khách" }, wrong: [{ zh: "在博物馆开会", vi: "Họp ở bảo tàng" }, { zh: "在打球", vi: "Đang chơi bóng" }], rightAt: 0 },
  clue: "cat_alibi", metFlag: "met:cat",
  closing: { zh: "我的预约本在墙上。", vi: "Sổ hẹn của tôi ở trên tường." },
  after: { zh: "还要染发吗?", vi: "Bạn còn muốn nhuộm tóc không?" },
});

/** Hiệu cắt tóc: sổ hẹn xác nhận Mèo ở tiệm; nhũ vàng trên giá cúp là của tiệm cô nhưng không liên quan (mồi nhử). */
export const SALON_STORY: StorySceneDef = {
  sceneId: "salon",
  sceneNpcEntries: cat.entries,
  spots: [
    { id: "appointment", clue: "appointment", label: "Sổ hẹn", sprite: "clipboard", x: 55, y: 30, w: 5, when: { all: ["met:cat"] }, stand: { x: 55, y: 46 } },
  ],
  dialogues: cat.nodes,
};
