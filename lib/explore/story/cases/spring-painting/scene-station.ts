import { buildInterview } from "../../interview";
import type { StorySceneDef } from "../../story-types";

const rabbit = buildInterview({
  prefix: "rabbit", speaker: "rabbit",
  greeting: { zh: "你好!你要坐火车吗?", vi: "Chào bạn! Bạn muốn đi tàu không?" },
  question: { zh: "昨天上午九点到九点半你在哪儿?", vi: "Sáng qua từ 9 giờ đến 9 giờ rưỡi bạn ở đâu?" },
  chatter: [
    { ask: { zh: "火车几点来?", vi: "Mấy giờ tàu đến?" }, reply: { zh: "十点十分。", vi: "Mười giờ mười phút." } },
    { ask: { zh: "票多少钱?", vi: "Vé bao nhiêu tiền?" }, reply: { zh: "五十块。", vi: "Năm mươi tệ." } },
  ],
  answer: { zh: "我在火车站卖票。九点零五分,我看见厨师拿着一个大盒子走向博物馆。", vi: "Tôi bán vé ở ga tàu. 9 giờ 5, tôi thấy bếp trưởng cầm một cái hộp lớn đi về phía bảo tàng." },
  check: { vi: "Trưởng ga Thỏ nói lúc 9 giờ 5 anh thấy ai đi về bảo tàng?", right: { zh: "厨师", vi: "Bếp trưởng" }, wrong: [{ zh: "老师", vi: "Cô giáo" }, { zh: "医生", vi: "Bác sĩ" }], rightAt: 1 },
  clue: "rabbit_alibi", metFlag: "met:rabbit",
  closing: { zh: "我的告示在窗口旁边。", vi: "Bảng thông báo của tôi ở cạnh cửa sổ." },
  after: { zh: "你还想问什么?", vi: "Bạn còn muốn hỏi gì?" },
});

/** Nhà ga: lời Thỏ đổ lỗi cho Gấu bị bác bỏ bởi sổ bếp; bảng đóng cửa sổ cho thấy anh không ở quầy; hỏi lại khi có cả hai thì Thỏ đổi lời. */
export const STATION_STORY: StorySceneDef = {
  sceneId: "station",
  sceneNpcEntries: [
    { when: { all: ["met:rabbit", "clue:window_closed", "clue:kitchen_log"], none: ["confronted:rabbit"] }, node: "rabbit_conf" },
    ...rabbit.entries,
  ],
  spots: [
    { id: "window_closed", clue: "window_closed", label: "Bảng ở cửa sổ bán vé", sprite: "clipboard", x: 9, y: 31, w: 5, when: { all: ["met:rabbit"] }, stand: { x: 9, y: 48 } },
  ],
  dialogues: {
    ...rabbit.nodes,
    rabbit_conf: { id: "rabbit_conf", speaker: "player", zh: "您说在卖票,可是窗口那时关门了。厨师也一直在厨房。", vi: "Anh nói đang bán vé, nhưng cửa sổ bán vé lúc đó đã đóng. Bếp trưởng cũng ở trong bếp suốt.", next: "rabbit_conf2" },
    rabbit_conf2: { id: "rabbit_conf2", speaker: "rabbit", zh: "我……我只是想帮朋友。", vi: "Tôi... tôi chỉ muốn giúp một người bạn.", effects: [{ clue: "rabbit_slip" }, { flag: "confronted:rabbit" }], next: "rabbit_conf3" },
    rabbit_conf3: { id: "rabbit_conf3", speaker: "rabbit", zh: "别再问了!", vi: "Đừng hỏi nữa!", next: null },
  },
};
