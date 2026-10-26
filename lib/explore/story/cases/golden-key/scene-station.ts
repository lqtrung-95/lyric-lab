import { buildInterview } from "../../interview";
import type { StorySceneDef } from "../../story-types";

const rabbit = buildInterview({
  prefix: "rabbit", speaker: "rabbit",
  greeting: { zh: "你好!你要坐火车吗?", vi: "Chào bạn! Bạn muốn đi tàu không?" },
  question: { zh: "昨天晚上八点你在哪儿?", vi: "Tám giờ tối qua anh ở đâu?" },
  chatter: [
    { ask: { zh: "火车几点来?", vi: "Mấy giờ tàu đến?" }, reply: { zh: "八点二十。", vi: "Tám giờ hai mươi." } },
    { ask: { zh: "去上海要几个小时?", vi: "Đi Thượng Hải mất mấy tiếng?" }, reply: { zh: "要五个小时。", vi: "Mất năm tiếng." } },
  ],
  answer: { zh: "昨天晚上八点,我在火车站工作。", vi: "Tối qua 8 giờ, tôi đang làm việc ở ga tàu." },
  check: { vi: "Trưởng ga Thỏ nói tối qua 8 giờ anh ở đâu?", right: { zh: "在火车站", vi: "Ở ga tàu" }, wrong: [{ zh: "在机场", vi: "Ở sân bay" }, { zh: "在公园", vi: "Ở công viên" }], rightAt: 1 },
  clue: "rabbit_alibi", metFlag: "met:rabbit",
  closing: { zh: "我的班表在墙上。", vi: "Bảng ca trực của tôi ở trên tường." },
  after: { zh: "班表在墙上。你还要去哪儿?", vi: "Bảng ca ở trên tường. Bạn còn muốn đi đâu?" },
});

/** Nhà ga: Thỏ có sổ ca trực xác nhận ở ga cả buổi tối (loại trừ). */
export const STATION_STORY: StorySceneDef = {
  sceneId: "station",
  sceneNpcEntries: rabbit.entries,
  spots: [{ id: "rabbit_log", clue: "rabbit_log", label: "Sổ ca trực ở ga", sprite: "clipboard", x: 9, y: 31, w: 5, when: { all: ["met:rabbit"] }, stand: { x: 9, y: 48 } }],
  dialogues: rabbit.nodes,
};
