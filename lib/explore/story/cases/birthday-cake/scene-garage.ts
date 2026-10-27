import { buildInterview } from "../../interview";
import type { StorySceneDef } from "../../story-types";

const tiger = buildInterview({
  prefix: "tiger", speaker: "tiger",
  greeting: { zh: "你好!你的车有问题吗?", vi: "Chào bạn! Xe bạn có vấn đề gì không?" },
  question: { zh: "今天下午三点半到四点半你在哪儿?", vi: "Chiều nay từ 3 rưỡi đến 4 rưỡi ông ở đâu?" },
  chatter: [
    { ask: { zh: "你会修什么车?", vi: "Ông sửa được loại xe nào?" }, reply: { zh: "卡车、汽车、自行车都会。", vi: "Xe tải, ô tô, xe đạp đều sửa được." } },
    { ask: { zh: "你的店几点关门?", vi: "Tiệm ông mấy giờ đóng cửa?" }, reply: { zh: "晚上六点关门。", vi: "Sáu giờ tối đóng cửa." } },
  ],
  answer: { zh: "今天下午三点半到四点半,我一直在修车店修车。", vi: "Chiều nay từ 3 rưỡi đến 4 rưỡi, tôi sửa xe ở tiệm suốt." },
  check: { vi: "Chú Hổ nói chiều nay ông đang làm gì?", right: { zh: "在修车店修车", vi: "Sửa xe ở tiệm" }, wrong: [{ zh: "在学校上课", vi: "Dạy học ở trường" }, { zh: "在公园散步", vi: "Đi dạo ở công viên" }], rightAt: 0 },
  clue: "tiger_alibi", metFlag: "met:tiger",
  closing: { zh: "修车记录在墙上。", vi: "Sổ sửa xe ở trên tường." },
  after: { zh: "还有事吗?", vi: "Còn việc gì không?" },
});

/** Tiệm sửa xe: sổ cho thấy Hổ sửa xe tải suốt buổi chiều. */
export const GARAGE_STORY: StorySceneDef = {
  sceneId: "garage",
  sceneNpcEntries: [
    ...tiger.entries,
  ],
  spots: [
    { id: "tiger_log", clue: "tiger_log", label: "Sổ sửa xe", sprite: "clipboard", x: 14, y: 86, w: 5, when: { all: ["met:tiger"] }, stand: { x: 20, y: 92 } },
  ],
  dialogues: {
    ...tiger.nodes,
  },
};
