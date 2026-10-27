import { buildInterview } from "../../interview";
import type { StorySceneDef } from "../../story-types";

const pig = buildInterview({
  prefix: "pig", speaker: "pig",
  greeting: { zh: "你好!欢迎来超市!", vi: "Chào bạn! Chào mừng đến siêu thị!" },
  question: { zh: "昨天下午你去买东西了吗?", vi: "Chiều qua bạn có đi mua đồ không?" },
  chatter: [
    { ask: { zh: "你买了什么?", vi: "Bạn mua gì thế?" }, reply: { zh: "你自己看看我的购物袋吧。", vi: "Bạn tự xem túi đồ của tôi đi." } },
  ],
  answer: { zh: "昨天下午我去买东西了。", vi: "Chiều qua tôi đi mua đồ." },
  check: { vi: "Anh Heo nói chiều qua mình đã làm gì?", right: { zh: "去买东西", vi: "Đi mua đồ" }, wrong: [{ zh: "去看电影", vi: "Đi xem phim" }, { zh: "去修车", vi: "Đi sửa xe" }], rightAt: 0 },
  clue: "pig_talk", metFlag: "met:pig",
  closing: { zh: "购物袋在桌上。", vi: "Túi đồ ở trên bàn." },
  after: { zh: "还想看什么?", vi: "Bạn còn muốn xem gì không?" },
});

/** Siêu thị: túi đồ của Heo khớp hoàn toàn với danh sách; hỏi lại phải đưa đúng túi đồ của anh. */
export const SUPERMARKET_STORY: StorySceneDef = {
  sceneId: "supermarket",
  sceneNpcEntries: [
    { when: { all: ["met:pig", "clue:bag_pig", "clue:shopping_list"], none: ["confronted:pig"] }, node: "pig_conf" },
    ...pig.entries,
  ],
  spots: [
    { id: "bag_pig", clue: "bag_pig", label: "Túi đồ của Heo", sprite: "bag", x: 14, y: 86, w: 5, when: { all: ["met:pig"] }, stand: { x: 20, y: 92 } },
  ],
  dialogues: {
    ...pig.nodes,
    pig_conf: {
      id: "pig_conf", speaker: "player", zh: "您买的东西和购物清单一模一样。", vi: "Đồ anh mua giống hệt danh sách mua sắm.",
      choices: [
        { zh: "我给他看他的购物袋。", vi: "Tôi đưa túi đồ của anh ấy cho anh ấy xem.", next: "pig_conf_ok", when: { all: ["clue:bag_pig"] }, check: "right" },
        { zh: "我给他看小狗的购物袋。", vi: "Tôi đưa túi đồ của Chó cho anh ấy xem.", next: "pig_conf_bad", when: { all: ["clue:bag_dog"] }, check: "wrong" },
        { zh: "我什么也不给他看。", vi: "Tôi không đưa gì ra cả.", next: "pig_conf_bad", check: "wrong" },
      ],
    },
    pig_conf_bad: { id: "pig_conf_bad", speaker: "pig", zh: "这些东西很普通,谁都可以买。", vi: "Những thứ này rất bình thường, ai cũng mua được.", next: "pig_conf" },
    pig_conf_ok: { id: "pig_conf_ok", speaker: "pig", zh: "我……我只是想买点好吃的。", vi: "Tôi... tôi chỉ muốn mua ít đồ ngon thôi.", effects: [{ clue: "pig_slip" }, { flag: "confronted:pig" }], next: "pig_conf_end" },
    pig_conf_end: { id: "pig_conf_end", speaker: "pig", zh: "请不要再问了!", vi: "Xin đừng hỏi nữa!", next: null },
  },
};
