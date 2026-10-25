import { buildInterview } from "../../interview";
import type { StorySceneDef } from "../../story-types";

const rabbit = buildInterview({
  prefix: "rabbit", speaker: "rabbit",
  greeting: { zh: "你好!你要买票吗?", vi: "Chào bạn! Bạn muốn mua vé không?" },
  question: { zh: "昨天下午三点你在哪儿?", vi: "Ba giờ chiều hôm qua anh ở đâu?" },
  chatter: [
    { ask: { zh: "火车几点来?", vi: "Mấy giờ tàu đến?" }, reply: { zh: "三点十分。", vi: "Ba giờ mười phút." } },
    { ask: { zh: "去上海要几个小时?", vi: "Đi Thượng Hải mất mấy tiếng?" }, reply: { zh: "要五个小时。", vi: "Mất năm tiếng." } },
  ],
  answer: { zh: "昨天下午三点,我在火车站工作。", vi: "Ba giờ chiều hôm qua, tôi đang làm việc ở ga tàu." },
  check: { vi: "Trưởng ga Thỏ nói ba giờ chiều hôm qua anh ở đâu?", right: { zh: "在火车站", vi: "Ở ga tàu" }, wrong: [{ zh: "在公园", vi: "Ở công viên" }, { zh: "在饭馆", vi: "Ở quán ăn" }], rightAt: 0 },
  clue: "rabbit_alibi", metFlag: "met:rabbit",
  closing: { zh: "我的票本在墙上。你可以看看。", vi: "Sổ vé của tôi ở trên tường. Bạn có thể xem." },
  after: { zh: "票本在墙上。你还要去哪儿?", vi: "Sổ vé ở trên tường. Bạn còn muốn đi đâu?" },
});

/** Nhà ga: Trưởng ga Thỏ khai làm việc ở ga; sổ ghi vé xác nhận anh đang bán vé lúc ba giờ. */
export const STATION_STORY: StorySceneDef = {
  sceneId: "station",
  sceneNpcEntries: rabbit.entries,
  spots: [{ id: "ticket_log", clue: "ticket_log", label: "Sổ ghi vé tàu", sprite: "clipboard", x: 64, y: 29, w: 5, when: { all: ["met:rabbit"] }, stand: { x: 64, y: 42 } }],
  dialogues: rabbit.nodes,
};
