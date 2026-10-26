import { buildInterview } from "../../interview";
import type { StorySceneDef } from "../../story-types";

const pig = buildInterview({
  prefix: "pig", speaker: "pig",
  greeting: { zh: "你好!欢迎来机场!", vi: "Chào bạn! Chào mừng đến sân bay!" },
  question: { zh: "昨天晚上八点你在哪儿?", vi: "Tám giờ tối qua cô ở đâu?" },
  chatter: [
    { ask: { zh: "飞机几点起飞?", vi: "Mấy giờ máy bay cất cánh?" }, reply: { zh: "九点。", vi: "Chín giờ." } },
    { ask: { zh: "请问,护照在哪儿办?", vi: "Xin hỏi, làm hộ chiếu ở đâu?" }, reply: { zh: "这里不办护照。", vi: "Ở đây không làm hộ chiếu." } },
  ],
  answer: { zh: "八点下班,八点一刻我经过酒店,看见一个人拿着红伞走进去。", vi: "Hết ca lúc 8 giờ, 8 giờ 15 tôi đi ngang khách sạn, thấy một người cầm ô đỏ đi vào." },
  check: { vi: "Cô Heo thấy gì lúc 8 giờ 15?", right: { zh: "一个人拿着红伞走进酒店", vi: "Một người cầm ô đỏ đi vào khách sạn" }, wrong: [{ zh: "一只狗走进商店", vi: "Một con chó đi vào cửa hàng" }, { zh: "一个人坐飞机", vi: "Một người đi máy bay" }], rightAt: 0 },
  clue: "witness_pig", metFlag: "met:pig",
  closing: { zh: "我的班表在墙上。", vi: "Bảng ca của tôi ở trên tường." },
  after: { zh: "班表在墙上。还有事吗?", vi: "Bảng ca ở trên tường. Còn việc gì không?" },
});

/** Sân bay: Heo hết ca lúc 8 giờ (bảng ca xác nhận) và là người thấy chiếc ô đỏ đi vào khách sạn. */
export const AIRPORT_STORY: StorySceneDef = {
  sceneId: "airport",
  sceneNpcEntries: pig.entries,
  spots: [{ id: "pig_shift", clue: "pig_shift", label: "Bảng ca của sân bay", sprite: "clipboard", x: 9, y: 31, w: 5, when: { all: ["met:pig"] }, stand: { x: 9, y: 52 } }],
  dialogues: pig.nodes,
};
