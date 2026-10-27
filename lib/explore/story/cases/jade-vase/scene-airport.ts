import { buildInterview } from "../../interview";
import type { StorySceneDef } from "../../story-types";

const pig = buildInterview({
  prefix: "pig", speaker: "pig",
  greeting: { zh: "您好!请出示机票。", vi: "Chào bạn! Xin xuất trình vé máy bay." },
  question: { zh: "今天下午三点到三点半你在哪儿?", vi: "Chiều nay từ 3 đến 3 rưỡi anh ở đâu?" },
  chatter: [
    { ask: { zh: "飞机几点起飞?", vi: "Máy bay mấy giờ cất cánh?" }, reply: { zh: "三点二十分起飞。", vi: "3 giờ 20 cất cánh." } },
    { ask: { zh: "你喜欢坐飞机吗?", vi: "Anh có thích đi máy bay không?" }, reply: { zh: "喜欢,可是我怕高。", vi: "Thích, nhưng tôi sợ độ cao." } },
  ],
  answer: { zh: "三点到三点半,我在机场检票。", vi: "Từ 3 đến 3 rưỡi, tôi soát vé ở sân bay." },
  check: { vi: "Anh Heo nói lúc 3 giờ anh làm gì?", right: { zh: "在机场检票", vi: "Soát vé ở sân bay" }, wrong: [{ zh: "在银行上班", vi: "Làm việc ở ngân hàng" }, { zh: "在洗衣店洗衣服", vi: "Giặt đồ ở tiệm giặt" }], rightAt: 0 },
  clue: "pig_alibi", metFlag: "met:pig",
  closing: { zh: "航班记录在墙上。", vi: "Sổ chuyến bay ở trên tường." },
  after: { zh: "祝您旅途愉快!", vi: "Chúc bạn thượng lộ bình an!" },
});

/** Sân bay: sổ chuyến bay cho thấy Heo ở cổng soát vé suốt nên có chứng cứ ngoại phạm thật. */
export const AIRPORT_STORY: StorySceneDef = {
  sceneId: "airport",
  sceneNpcEntries: [
    ...pig.entries,
  ],
  spots: [
    { id: "flight_log", clue: "flight_log", label: "Sổ chuyến bay", sprite: "clipboard", x: 14, y: 86, w: 5, when: { all: ["met:pig"] }, stand: { x: 20, y: 92 } },
  ],
  dialogues: {
    ...pig.nodes,
  },
};
