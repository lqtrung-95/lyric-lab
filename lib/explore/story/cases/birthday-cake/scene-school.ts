import { buildInterview } from "../../interview";
import type { StorySceneDef } from "../../story-types";

const bird = buildInterview({
  prefix: "bird", speaker: "bird",
  greeting: { zh: "同学们好!", vi: "Chào các em!" },
  question: { zh: "今天下午三点半到四点半你在哪儿?", vi: "Chiều nay từ 3 rưỡi đến 4 rưỡi cô ở đâu?" },
  chatter: [
    { ask: { zh: "你教什么课?", vi: "Cô dạy môn gì?" }, reply: { zh: "我教语文。", vi: "Tôi dạy ngữ văn." } },
    { ask: { zh: "学生多吗?", vi: "Học sinh có đông không?" }, reply: { zh: "二十个学生。", vi: "Hai mươi học sinh." } },
  ],
  answer: { zh: "今天下午三点半到四点半,我一直在学校上课。", vi: "Chiều nay từ 3 rưỡi đến 4 rưỡi, tôi dạy ở trường suốt." },
  check: { vi: "Cô Chim nói chiều nay cô đang làm gì?", right: { zh: "在学校上课", vi: "Dạy học ở trường" }, wrong: [{ zh: "在健身房训练", vi: "Tập ở phòng gym" }, { zh: "在公园休息", vi: "Nghỉ ở công viên" }], rightAt: 0 },
  clue: "bird_alibi", metFlag: "met:bird",
  closing: { zh: "课程表和联欢会的通知在黑板旁边。", vi: "Thời khóa biểu và thông báo tiệc lớp ở cạnh bảng đen." },
  after: { zh: "还有问题吗?", vi: "Còn câu hỏi nào không?" },
});

/** Trường học: thời khóa biểu xác nhận Cô Chim dạy suốt; ghi chú cho biết trường không đặt bánh ngoài. */
export const SCHOOL_STORY: StorySceneDef = {
  sceneId: "school",
  sceneNpcEntries: [
    ...bird.entries,
  ],
  spots: [
    { id: "class_roster", clue: "class_roster", label: "Thời khóa biểu", sprite: "clipboard", x: 14, y: 86, w: 5, when: { all: ["met:bird"] }, stand: { x: 20, y: 92 } },
    { id: "party_note", clue: "party_note", label: "Thông báo tiệc lớp", sprite: "note", x: 68, y: 92, w: 5, when: { all: ["met:bird"] }, stand: { x: 68, y: 95 } },
  ],
  dialogues: {
    ...bird.nodes,
  },
};
