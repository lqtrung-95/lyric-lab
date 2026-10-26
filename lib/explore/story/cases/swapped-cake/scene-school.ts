import { buildInterview } from "../../interview";
import type { StorySceneDef } from "../../story-types";

const bird = buildInterview({
  prefix: "bird", speaker: "bird",
  greeting: { zh: "你好!有事吗?", vi: "Chào bạn! Có việc gì không?" },
  question: { zh: "昨天下午两点到两点半你在哪儿?", vi: "Hai giờ đến hai giờ rưỡi chiều qua cô ở đâu?" },
  chatter: [
    { ask: { zh: "您衣服上有白色的粉。", vi: "Áo cô dính bột trắng kìa." }, reply: { zh: "那是面粉!我们在上做蛋糕课。", vi: "Đó là bột mì! Chúng tôi đang có tiết làm bánh." } },
    { ask: { zh: "学生多不多?", vi: "Có nhiều học sinh không?" }, reply: { zh: "不多,二十个。", vi: "Không nhiều, hai mươi em." } },
  ],
  answer: { zh: "昨天下午两点到两点半,我在学校上课。", vi: "Chiều qua từ hai giờ đến hai giờ rưỡi, tôi đang dạy ở trường." },
  check: { vi: "Cô Chim nói chiều qua lúc 2 giờ đến 2 giờ rưỡi cô làm gì?", right: { zh: "在学校上课", vi: "Dạy ở trường" }, wrong: [{ zh: "在市场买盐", vi: "Mua muối ở chợ" }, { zh: "在公园休息", vi: "Nghỉ ở công viên" }], rightAt: 0 },
  clue: "bird_alibi", metFlag: "met:bird",
  closing: { zh: "课程表在墙上。", vi: "Thời khóa biểu ở trên tường." },
  after: { zh: "课程表在墙上。还有事吗?", vi: "Thời khóa biểu ở trên tường. Còn việc gì không?" },
});

/** Trường học: bột mì dính áo là mồi nhử; thời khóa biểu cho thấy lớp học làm bánh nên cô ở trong lớp suốt. */
export const SCHOOL_STORY: StorySceneDef = {
  sceneId: "school",
  sceneNpcEntries: bird.entries,
  spots: [{ id: "class_schedule", clue: "class_schedule", label: "Thời khóa biểu", sprite: "clipboard", x: 56, y: 30, w: 5, when: { all: ["met:bird"] }, stand: { x: 56, y: 46 } }],
  dialogues: bird.nodes,
};
