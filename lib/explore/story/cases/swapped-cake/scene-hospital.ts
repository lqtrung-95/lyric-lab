import { buildInterview } from "../../interview";
import type { StorySceneDef } from "../../story-types";

const fox = buildInterview({
  prefix: "fox", speaker: "fox",
  greeting: { zh: "你好!你哪儿不舒服?", vi: "Chào bạn! Bạn thấy không khỏe ở đâu?" },
  question: { zh: "昨天下午两点到两点半你在哪儿?", vi: "Hai giờ đến hai giờ rưỡi chiều qua ông ở đâu?" },
  chatter: [
    { ask: { zh: "你的病人好了吗?", vi: "Bệnh nhân của ông khỏe chưa?" }, reply: { zh: "好多了。", vi: "Khỏe hơn nhiều rồi." } },
    { ask: { zh: "手术难吗?", vi: "Phẫu thuật có khó không?" }, reply: { zh: "不难,但是很长。", vi: "Không khó nhưng rất lâu." } },
  ],
  answer: { zh: "昨天下午两点到两点半,我在医院做手术。", vi: "Chiều qua từ hai giờ đến hai giờ rưỡi, tôi đang phẫu thuật ở bệnh viện." },
  check: { vi: "Bác sĩ Cáo nói chiều qua lúc 2 giờ đến 2 giờ rưỡi ông đang làm gì?", right: { zh: "在做手术", vi: "Đang phẫu thuật" }, wrong: [{ zh: "在吃饭", vi: "Đang ăn cơm" }, { zh: "在睡觉", vi: "Đang ngủ" }], rightAt: 1 },
  clue: "fox_alibi", metFlag: "met:fox",
  closing: { zh: "手术记录在墙上。", vi: "Sổ phẫu thuật ở trên tường." },
  after: { zh: "记录在墙上。还有事吗?", vi: "Sổ ở trên tường. Còn việc gì nữa không?" },
});

/** Bệnh viện: sổ phẫu thuật cho thấy Cáo không thể ở quán ăn lúc 2 giờ 15 (nên lời Thỏ đổ lỗi là sai). */
export const HOSPITAL_STORY: StorySceneDef = {
  sceneId: "hospital",
  sceneNpcEntries: fox.entries,
  spots: [{ id: "sign_sheet", clue: "sign_sheet", label: "Sổ phẫu thuật", sprite: "clipboard", x: 13, y: 29, w: 5, when: { all: ["met:fox"] }, stand: { x: 13, y: 42 } }],
  dialogues: fox.nodes,
};
