import { buildInterview } from "../../interview";
import type { StorySceneDef } from "../../story-types";

const rabbit = buildInterview({
  prefix: "rabbit", speaker: "rabbit",
  greeting: { zh: "你好!你要寄东西吗?", vi: "Chào bạn! Bạn muốn gửi đồ à?" },
  question: { zh: "昨天晚上七点你在哪儿?", vi: "Bảy giờ tối hôm qua bác ở đâu?" },
  chatter: [
    { ask: { zh: "你每天都送包裹吗?", vi: "Ngày nào bác cũng đi phát bưu kiện à?" }, reply: { zh: "对,天天都送。", vi: "Đúng, ngày nào cũng đi." } },
    { ask: { zh: "你累不累?", vi: "Bác có mệt không?" }, reply: { zh: "有一点儿累。", vi: "Hơi mệt một chút." } },
  ],
  answer: { zh: "昨天晚上七点,我在邮局送包裹。", vi: "Bảy giờ tối hôm qua, tôi đang gửi bưu kiện ở bưu điện." },
  check: { vi: "Bác Thỏ nói bảy giờ tối hôm qua bác làm gì?", right: { zh: "送包裹", vi: "Gửi bưu kiện" }, wrong: [{ zh: "卖手机", vi: "Bán điện thoại" }, { zh: "吃饭", vi: "Ăn cơm" }], rightAt: 1 },
  clue: "rabbit_alibi", metFlag: "met:rabbit",
  closing: { zh: "墙上有一块牌子,地上还有一个邮袋,你可以看看。", vi: "Trên tường có một tấm biển, dưới sàn còn có một cái túi thư, bạn có thể xem." },
  after: { zh: "你看到什么了?还有事吗?", vi: "Bạn thấy gì rồi? Còn việc gì không?" },
});

/** Bưu điện: Bác Thỏ khai đang làm việc; nhưng bưu điện đóng cửa từ 6 giờ rưỡi và túi thư của Thỏ đầy nhãn của hiệu thuốc. */
export const POSTOFFICE_STORY: StorySceneDef = {
  sceneId: "postoffice",
  sceneNpcEntries: rabbit.entries,
  spots: [
    { id: "post_log", clue: "post_log", label: "Bảng giờ của bưu điện", sprite: "note", x: 14, y: 86, w: 5, when: { all: ["met:rabbit"] }, stand: { x: 20, y: 92 } },
    { id: "rabbit_bag", clue: "rabbit_bag", label: "Túi thư của Thỏ", sprite: "mailbag", x: 68, y: 92, w: 6, when: { all: ["met:rabbit"] }, stand: { x: 68, y: 95 } },
  ],
  dialogues: rabbit.nodes,
};
