import { buildInterview } from "../../interview";
import type { StorySceneDef } from "../../story-types";

const bird = buildInterview({
  prefix: "bird", speaker: "bird",
  greeting: { zh: "你好!有事吗?", vi: "Chào bạn! Có việc gì không?" },
  question: { zh: "昨天晚上八点你在哪儿?", vi: "Tám giờ tối qua cô ở đâu?" },
  chatter: [
    { ask: { zh: "您教什么?", vi: "Cô dạy môn gì?" }, reply: { zh: "我教汉语。", vi: "Tôi dạy tiếng Trung." } },
    { ask: { zh: "学生多不多?", vi: "Có nhiều học sinh không?" }, reply: { zh: "不多,二十个。", vi: "Không nhiều, hai mươi em." } },
  ],
  answer: { zh: "昨天晚上八点,我在学校看作业。", vi: "Tối qua 8 giờ, tôi ở trường xem bài tập." },
  check: { vi: "Cô Chim nói tối qua 8 giờ cô ở đâu?", right: { zh: "在学校", vi: "Ở trường" }, wrong: [{ zh: "在酒店", vi: "Ở khách sạn" }, { zh: "在公园", vi: "Ở công viên" }], rightAt: 2 },
  clue: "bird_alibi", metFlag: "met:bird",
  closing: { zh: "我还要看作业,再见。", vi: "Tôi còn phải xem bài tập, tạm biệt." },
  after: { zh: "还有什么事吗?", vi: "Còn việc gì nữa không?" },
});

/** Trường học: lời khai của cô giáo bị sổ ra vào bác bỏ; hỏi lại khi có sổ thì cô đổi lời (manh mối bird_slip). */
export const SCHOOL_STORY: StorySceneDef = {
  sceneId: "school",
  sceneNpcEntries: [
    { when: { all: ["met:bird", "clue:sign_sheet"], none: ["confronted:bird"] }, node: "bird_conf" },
    ...bird.entries,
  ],
  spots: [{ id: "sign_sheet", clue: "sign_sheet", label: "Sổ ra vào của trường", sprite: "clipboard", x: 56, y: 30, w: 5, when: { all: ["met:bird"] }, stand: { x: 56, y: 46 } }],
  dialogues: {
    ...bird.nodes,
    bird_conf: { id: "bird_conf", speaker: "player", zh: "老师,学校的登记表上写着您七点半就离开了。", vi: "Cô ơi, sổ ra vào của trường ghi cô đã rời trường lúc bảy giờ rưỡi.", next: "bird_conf2" },
    bird_conf2: { id: "bird_conf2", speaker: "bird", zh: "我……我回家拿东西了。", vi: "Tôi... tôi về nhà lấy đồ.", effects: [{ clue: "bird_slip" }, { flag: "confronted:bird" }], next: "bird_conf3" },
    bird_conf3: { id: "bird_conf3", speaker: "bird", zh: "请不要再问了!", vi: "Xin đừng hỏi nữa!", next: null },
  },
};
