import { buildInterview } from "../../interview";
import type { StorySceneDef } from "../../story-types";

const dog = buildInterview({
  prefix: "dog", speaker: "dog",
  greeting: { zh: "你好!来锻炼吗?", vi: "Chào bạn! Đến tập luyện à?" },
  question: { zh: "昨天下午你在哪儿?", vi: "Chiều qua bạn ở đâu?" },
  chatter: [
    { ask: { zh: "你住在哪儿?", vi: "Bạn sống ở đâu?" }, reply: { zh: "你去看看我家门口的牌子吧。", vi: "Bạn hãy xem tấm biển trước cửa nhà tôi nhé." } },
  ],
  answer: { zh: "昨天下午我在家里休息。", vi: "Chiều qua tôi nghỉ ở nhà." },
  check: { vi: "Chiều qua Chú Chó nói mình ở đâu?", right: { zh: "在家里", vi: "Ở nhà" }, wrong: [{ zh: "在邮局", vi: "Ở bưu điện" }, { zh: "在公园", vi: "Ở công viên" }], rightAt: 0 },
  clue: "dog_home_talk", metFlag: "met:dog",
  closing: { zh: "牌子在门口。", vi: "Tấm biển ở ngay cửa." },
  after: { zh: "还有事吗?", vi: "Còn việc gì không?" },
});

/** Phòng gym: biển địa chỉ nhà Chó (phía đông, 150 mét); hỏi lại phải đưa đúng biển địa chỉ nhà ông. */
export const GYM_STORY: StorySceneDef = {
  sceneId: "gym",
  sceneNpcEntries: [
    { when: { all: ["met:dog", "clue:home_dog", "clue:note_east", "clue:note_dist"], none: ["confronted:dog"] }, node: "dog_conf" },
    ...dog.entries,
  ],
  spots: [
    { id: "home_dog", clue: "home_dog", label: "Biển địa chỉ", sprite: "note", x: 14, y: 86, w: 5, when: { all: ["met:dog"] }, stand: { x: 20, y: 92 } },
  ],
  dialogues: {
    ...dog.nodes,
    dog_conf: {
      id: "dog_conf", speaker: "player", zh: "您的家在邮局东边,离邮局不到两百米。纸条上写的就是您家。", vi: "Nhà ông ở phía đông bưu điện, cách chưa tới 200 mét. Mảnh giấy tả đúng nhà ông.",
      choices: [
        { zh: "我给他看他家的门牌。", vi: "Tôi đưa biển địa chỉ nhà ông ấy cho ông xem.", next: "dog_conf_ok", when: { all: ["clue:home_dog"] }, check: "right" },
        { zh: "我给他看小猫家的门牌。", vi: "Tôi đưa biển địa chỉ nhà Mèo cho ông xem.", next: "dog_conf_bad", when: { all: ["clue:home_cat"] }, check: "wrong" },
        { zh: "我什么也不给他看。", vi: "Tôi không đưa gì ra cả.", next: "dog_conf_bad", check: "wrong" },
      ],
    },
    dog_conf_bad: { id: "dog_conf_bad", speaker: "dog", zh: "这是别人的家,和我没有关系。", vi: "Đây là nhà người khác, không liên quan tới tôi.", next: "dog_conf" },
    dog_conf_ok: { id: "dog_conf_ok", speaker: "dog", zh: "我……我只是想看看那个包裹里有什么。", vi: "Tôi... tôi chỉ muốn xem trong bưu kiện có gì thôi.", effects: [{ clue: "dog_slip" }, { flag: "confronted:dog" }], next: "dog_conf_end" },
    dog_conf_end: { id: "dog_conf_end", speaker: "dog", zh: "请不要再问了!", vi: "Xin đừng hỏi nữa!", next: null },
  },
};
