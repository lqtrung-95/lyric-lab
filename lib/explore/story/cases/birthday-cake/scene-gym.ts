import { buildInterview } from "../../interview";
import type { StorySceneDef } from "../../story-types";

const dog = buildInterview({
  prefix: "dog", speaker: "dog",
  greeting: { zh: "你好!来锻炼吗?", vi: "Chào bạn! Đến tập luyện à?" },
  question: { zh: "今天下午三点半到四点半你在哪儿?", vi: "Chiều nay từ 3 rưỡi đến 4 rưỡi ông ở đâu?" },
  chatter: [
    { ask: { zh: "你每天都训练吗?", vi: "Ông tập mỗi ngày không?" }, reply: { zh: "是的,每天一小时。", vi: "Ừ, mỗi ngày một tiếng." } },
    { ask: { zh: "你喜欢吃蛋糕吗?", vi: "Ông có thích ăn bánh không?" }, reply: { zh: "喜欢,但是我要保持身材。", vi: "Thích, nhưng tôi phải giữ dáng." } },
  ],
  answer: { zh: "今天下午三点半到四点半,我一直在健身房训练。", vi: "Chiều nay từ 3 rưỡi đến 4 rưỡi, tôi tập ở phòng gym suốt." },
  check: { vi: "Chú Chó nói chiều nay ông ở đâu?", right: { zh: "在健身房", vi: "Ở phòng gym" }, wrong: [{ zh: "在学校", vi: "Ở trường" }, { zh: "在修车店", vi: "Ở tiệm sửa xe" }], rightAt: 0 },
  clue: "dog_alibi", metFlag: "met:dog",
  closing: { zh: "签名本在墙上。", vi: "Sổ ký tên ở trên tường." },
  after: { zh: "还想锻炼吗?", vi: "Bạn còn muốn tập không?" },
});

/** Phòng gym: sổ ký tên cho thấy Chó rời lúc 3:30; hỏi lại phải đưa đúng sổ đơn của tiệm bánh thì Chó mới nói thật. */
export const GYM_STORY: StorySceneDef = {
  sceneId: "gym",
  sceneNpcEntries: [
    { when: { all: ["met:dog", "clue:gym_signout", "clue:witness_turtle"], none: ["confronted:dog"] }, node: "dog_conf" },
    ...dog.entries,
  ],
  spots: [
    { id: "gym_signout", clue: "gym_signout", label: "Sổ ký tên", sprite: "clipboard", x: 14, y: 86, w: 5, when: { all: ["met:dog"] }, stand: { x: 20, y: 92 } },
  ],
  dialogues: {
    ...dog.nodes,
    dog_conf: {
      id: "dog_conf", speaker: "player", zh: "你说你在健身房,可是签名本上写着你三点半就走了。你去哪儿了?", vi: "Ông nói ở phòng gym, nhưng sổ ký tên ghi ông đi từ 3:30. Ông đã đi đâu?",
      choices: [
        { zh: "我给他看蛋糕店的订单本。", vi: "Tôi đưa sổ đơn của tiệm bánh cho ông xem.", next: "dog_conf_ok", when: { all: ["clue:order_book"] }, check: "right" },
        { zh: "我给他看学校的课程表。", vi: "Tôi đưa thời khóa biểu của trường cho ông xem.", next: "dog_conf_bad", when: { all: ["clue:class_roster"] }, check: "wrong" },
        { zh: "我什么也不给他看。", vi: "Tôi không đưa gì ra cả.", next: "dog_conf_bad", check: "wrong" },
      ],
    },
    dog_conf_bad: { id: "dog_conf_bad", speaker: "dog", zh: "我只是出去买饮料,没有别的事。", vi: "Tôi chỉ ra ngoài mua đồ uống thôi, không có gì khác.", next: "dog_conf" },
    dog_conf_ok: { id: "dog_conf_ok", speaker: "dog", zh: "我……我想给小猫一个惊喜!", vi: "Tôi... tôi muốn tạo bất ngờ cho Mèo!", effects: [{ clue: "dog_slip" }, { flag: "confronted:dog" }], next: "dog_conf_end" },
    dog_conf_end: { id: "dog_conf_end", speaker: "dog", zh: "请不要再问了!", vi: "Xin đừng hỏi nữa!", next: null },
  },
};
